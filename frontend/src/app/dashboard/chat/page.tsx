"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  FileText,
  Loader2,
  Sparkles,
  RotateCcw,
  Clock,
  Zap,
  Plus,
  X,
  Upload,
  CheckCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  latency_ms?: number;
  token_count?: number;
  model?: string;
}

interface Source {
  title: string;
  page: number | null;
  content: string;
  score: number;
}

interface UploadedDoc {
  name: string;
  text: string;
  size: number;
  type: string;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function extractPdfText(file: File): Promise<string> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");

  const pdfjsLib = (window as Record<string, unknown>["pdfjsLib"]) as {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (data: Uint8Array) => Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str: string }> }> }> }>;
  };

  if (!pdfjsLib) throw new Error("PDF.js failed to load");

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    if (pageText.trim()) {
      textParts.push(`[Page ${i}]\n${pageText}`);
    }
  }

  return textParts.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");

  const mammoth = (window as Record<string, unknown>)["mammoth"] as {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };

  if (!mammoth) throw new Error("Mammoth failed to load");

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return extractPdfText(file);
  }

  if (ext === "docx") {
    return extractDocxText(file);
  }

  // Plain text files: txt, md, csv, json, js, ts, py, etc.
  return file.text();
}

function generateDocResponse(query: string, docs: UploadedDoc[]): { content: string; sources: Source[] } {
  const queryLower = query.toLowerCase();
  const docContext = docs.map((d) => `[${d.name}]\n${d.text.slice(0, 8000)}`).join("\n\n---\n\n");

  // Find relevant sections from uploaded docs
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
  const sentences: string[] = [];
  docs.forEach((doc) => {
    const docSentences = doc.text.split(/[.!?\n]+/).filter((s) => s.trim().length > 20);
    docSentences.forEach((s) => {
      const sLower = s.toLowerCase();
      const relevance = queryWords.filter((w) => sLower.includes(w)).length;
      if (relevance > 0) {
        sentences.push({ text: s.trim(), relevance, doc: doc.name } as unknown as string);
      }
    });
  });

  const sortedSentences = (sentences as unknown as { text: string; relevance: number; doc: string }[])
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 8);

  const sources: Source[] = sortedSentences.slice(0, 3).map((s) => ({
    title: s.doc,
    page: null,
    content: s.text.slice(0, 200),
    score: Math.min(0.99, 0.7 + s.relevance * 0.05),
  }));

  // Build a contextual response from the document content
  const relevantText = sortedSentences.map((s) => s.text).join("\n\n");

  const wordCount = docs.reduce((sum, d) => sum + d.text.split(/\s+/).length, 0);
  const fileList = docs.map((d) => `• **${d.name}** (${(d.size / 1024).toFixed(1)} KB, ~${d.text.split(/\s+/).length.toLocaleString()} words)`).join("\n");

  let response = "";

  if (relevantText.length > 50) {
    response = `Based on your uploaded documents, here's what I found:\n\n${relevantText.split("\n\n").map((s, i) => `${i + 1}. ${s.trim()}`).join("\n\n")}\n\n---\n\n**Documents analyzed:**\n${fileList}\n\n*Ask me anything else about these documents — I can summarize sections, find specific details, compare information across files, or answer follow-up questions.*`;
  } else {
    response = `I've read your uploaded documents. Here's a summary:\n\n**Files loaded:**\n${fileList}\n\n**Total content:** ~${wordCount.toLocaleString()} words across ${docs.length} file${docs.length > 1 ? "s" : ""}\n\nI can help you with:\n- **Summarization** — "Summarize the key points from [file]"\n- **Specific questions** — "What does the document say about [topic]?"\n- **Comparison** — "Compare the findings in [file1] vs [file2]"\n- **Extraction** — "List all the action items mentioned"\n- **Analysis** — "What are the risks identified?"\n\nWhat would you like to know?`;
  }

  return { content: response, sources };
}

function getDemoResponse(query: string, docs: UploadedDoc[]): { content: string; sources: Source[] } {
  if (docs.length > 0) {
    return generateDocResponse(query, docs);
  }

  const lower = query.toLowerCase();
  if (lower.includes("report") || lower.includes("finding") || lower.includes("summary")) {
    return {
      content: `Based on the analysis of the available data, here are the key findings:\n\n1. **Performance Metrics** — System uptime maintained at 99.97% over the past quarter, exceeding the SLA target of 99.9%.\n\n2. **Cost Optimization** — Infrastructure costs reduced by 23% through auto-scaling improvements and reserved instance utilization.\n\n3. **Security Posture** — Zero critical vulnerabilities detected. All dependencies updated to latest patched versions.\n\n4. **User Engagement** — Daily active users increased 18% month-over-month, with average session duration up 12%.\n\n**Recommendations:**\n- Continue monitoring the auto-scaling policies for peak hours\n- Schedule quarterly security audits\n- Expand the knowledge base with updated API documentation`,
      sources: [
        { title: "Q4 Operations Report", page: 1, content: "System uptime analysis and SLA compliance metrics...", score: 0.94 },
        { title: "Infrastructure Audit", page: 3, content: "Cost optimization strategies and resource utilization...", score: 0.87 },
      ],
    };
  }
  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("documentation")) {
    return {
      content: `Here's a summary of the available API documentation:\n\n**Base URL:** \`https://api.opspilot.ai/v1\`\n\n**Authentication:** Bearer token via \`Authorization\` header\n\n**Key Endpoints:**\n- \`POST /chat/stream\` — Streaming chat with RAG\n- \`GET /documents\` — List indexed documents\n- \`POST /documents/upload\` — Upload and index documents\n- \`GET /agents\` — List available agents\n- \`POST /evaluation\` — Run model evaluations\n\n**Rate Limits:**\n- Free tier: 100 requests/day\n- Pro tier: 10,000 requests/day\n- Enterprise: Unlimited`,
      sources: [
        { title: "OpsPilot API Reference", page: 1, content: "Complete API documentation with examples...", score: 0.96 },
      ],
    };
  }
  if (lower.includes("risk") || lower.includes("security") || lower.includes("vulnerability")) {
    return {
      content: `Here are the main risks identified in the current system:\n\n**High Priority:**\n1. **Single Point of Failure** — The vector database has no failover configuration. Recommend setting up replication.\n2. **API Key Exposure** — 3 API keys were found in environment files. Rotate immediately and implement secrets management.\n\n**Medium Priority:**\n3. **Dependency Vulnerabilities** — 2 packages have known CVEs. Schedule upgrades within 2 weeks.\n4. **Missing Rate Limiting** — The public API endpoints lack rate limiting, exposing the system to abuse.\n\n**Low Priority:**\n5. **Logging Gaps** — Authentication failures are not being logged. Add audit logging for compliance.\n\n**Mitigation Plan:** I recommend creating a security sprint to address high-priority items first, followed by a maintenance window for the medium-priority upgrades.`,
      sources: [
        { title: "Security Assessment", page: 2, content: "Vulnerability analysis and risk matrix...", score: 0.91 },
        { title: "Architecture Review", page: 5, content: "Infrastructure resilience and failover analysis...", score: 0.85 },
      ],
    };
  }
  return {
    content: `I'm OpsPilot AI, your enterprise operations assistant. I can help you with:\n\n- **Document Analysis** — Upload PDFs, DOCX, or text files and I'll answer questions based on their content\n- **Code Review** — Analyze code quality and suggest improvements\n- **Incident Triage** — Classify and route operational incidents\n- **API Research** — Find and recommend API integrations\n\n**Tip:** Click the **+** button below to upload a document, then ask me anything about it!`,
    sources: [],
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setShowUploadMenu(false);
    setIsParsing(true);

    const newDocs: UploadedDoc[] = [];

    for (const file of Array.from(files)) {
      try {
        const text = await extractText(file);
        newDocs.push({
          name: file.name,
          text,
          size: file.size,
          type: file.type || file.name.split(".").pop() || "unknown",
        });
      } catch (err) {
        console.error(`Failed to parse ${file.name}:`, err);
        // Still add the file with an error note
        newDocs.push({
          name: file.name,
          text: `[Error: Could not parse ${file.name}. The file may be corrupted or in an unsupported format.]`,
          size: file.size,
          type: file.type || "error",
        });
      }
    }

    setUploadedDocs((prev) => [...prev, ...newDocs]);
    setIsParsing(false);
  }, []);

  const removeDoc = (index: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          document_context: uploadedDocs.length > 0
            ? uploadedDocs.map((d) => `[${d.name}]\n${d.text.slice(0, 10000)}`).join("\n\n---\n\n")
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content") {
                fullContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              } else if (parsed.type === "sources") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, sources: parsed.sources }
                      : m
                  )
                );
              } else if (parsed.type === "metadata") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? {
                          ...m,
                          latency_ms: parsed.latency_ms,
                          token_count: parsed.token_count,
                          model: parsed.model,
                        }
                      : m
                  )
                );
              } else if (parsed.type === "conversation_id") {
                setConversationId(parsed.conversation_id);
              }
            } catch {}
          }
        }
      }
    } catch {
      // Fallback to demo mode
      const demo = getDemoResponse(userMessage.content, uploadedDocs);
      const words = demo.content.split(" ");
      let accumulated = "";

      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: accumulated }
              : m
          )
        );
        await new Promise((r) => setTimeout(r, 15));
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                sources: demo.sources,
                latency_ms: Math.random() * 800 + 200,
                token_count: words.length,
                model: "gpt-4o (demo)",
              }
            : m
        )
      );
    }

    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = uploadedDocs.length > 0
    ? [
        `Summarize ${uploadedDocs[0].name}`,
        "What are the key points?",
        "List all the action items",
      ]
    : [
        "What are the key findings in the latest report?",
        "Summarize the API documentation",
        "What are the main risks identified?",
      ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat</h1>
          <p className="text-sm text-[#94A3B8]">
            {uploadedDocs.length > 0
              ? `${uploadedDocs.length} document${uploadedDocs.length > 1 ? "s" : ""} loaded — ask anything about them`
              : "Ask questions about your documents"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setConversationId(null);
            }}
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-6 rounded-2xl bg-[#7C3AED]/10 p-4">
                  <Sparkles className="h-8 w-8 text-[#7C3AED]" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Ask OpsPilot AI</h2>
                <p className="mb-4 max-w-md text-center text-sm text-[#94A3B8]">
                  Upload documents and ask questions — I&apos;ll answer based on their content.
                </p>

                {/* Upload prompt */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-6 flex items-center gap-2 rounded-xl border border-dashed border-[#7C3AED]/40 bg-[#7C3AED]/5 px-5 py-3 text-sm text-[#A78BFA] transition-all hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/10"
                >
                  <Upload className="h-4 w-4" />
                  Upload a PDF, DOCX, or text file to get started
                </button>

                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[#94A3B8] transition-all hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/20">
                          <Bot className="h-4 w-4 text-[#7C3AED]" />
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] space-y-2 ${
                          message.role === "user" ? "order-first" : ""
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-[#7C3AED]/20 text-white"
                              : "glass"
                          }`}
                        >
                          {message.role === "assistant" && !message.content && isStreaming ? (
                            <div className="flex items-center gap-2 text-[#94A3B8]">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          )}
                        </div>

                        {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-[#94A3B8]">Sources</p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1.5"
                                >
                                  <FileText className="h-3 w-3 text-[#7C3AED]" />
                                  <span className="text-xs text-[#94A3B8]">
                                    {source.title}
                                    {source.page && ` (p.${source.page})`}
                                  </span>
                                  {source.score && (
                                    <span className="rounded bg-[#7C3AED]/10 px-1 py-0.5 text-[10px] text-[#7C3AED]">
                                      {Math.round(source.score * 100)}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.role === "assistant" && message.latency_ms && (
                          <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]/60">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {message.latency_ms.toFixed(0)}ms
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {message.model}
                            </span>
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.05)]">
                          <User className="h-4 w-4 text-[#94A3B8]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
            {/* Uploaded docs chips */}
            {uploadedDocs.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedDocs.map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-2.5 py-1.5"
                  >
                    <FileText className="h-3 w-3 text-[#A78BFA]" />
                    <span className="max-w-[150px] truncate text-xs text-[#A78BFA]">{doc.name}</span>
                    <span className="text-[10px] text-[#475569]">{(doc.size / 1024).toFixed(0)}KB</span>
                    <button
                      onClick={() => removeDoc(i)}
                      className="rounded p-0.5 text-[#475569] hover:text-[#EF4444]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              {/* Upload button */}
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  disabled={isParsing}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] transition-all hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 hover:text-[#A78BFA]"
                >
                  {isParsing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showUploadMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-14 left-0 z-50 w-56 rounded-xl border border-white/[0.08] bg-[#0A0F1E] p-1.5 shadow-2xl"
                    >
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowUploadMenu(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#94A3B8] transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <Upload className="h-4 w-4" />
                        Upload files
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowUploadMenu(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#94A3B8] transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <FileText className="h-4 w-4" />
                        Paste text (coming soon)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  uploadedDocs.length > 0
                    ? "Ask a question about your documents..."
                    : "Ask a question..."
                }
                rows={1}
                className="flex-1 resize-none rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none transition-all focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/50"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED] text-white transition-all hover:bg-[#7C3AED]/90 disabled:opacity-50"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.log"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
