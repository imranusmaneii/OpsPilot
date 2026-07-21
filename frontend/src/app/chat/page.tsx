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
  Plus,
  X,
  Upload,
  PanelLeftOpen,
  LogIn,
  MessageSquare,
  Trash2,
  ChevronLeft,
  Image,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

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

const FREE_MESSAGE_LIMIT = 5;

function getFreeMessageCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("opspilot_free_messages") || "0", 10);
}

function incrementFreeMessageCount(): number {
  const count = getFreeMessageCount() + 1;
  localStorage.setItem("opspilot_free_messages", String(count));
  return count;
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
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
  );
  const pdfjsLib = (window as unknown as Record<string, unknown>)[
    "pdfjsLib"
  ] as {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (data: Uint8Array) => {
      promise: Promise<{
        numPages: number;
        getPage: (
          n: number
        ) => Promise<{
          getTextContent: () => Promise<{
            items: Array<{ str: string }>;
          }>;
        }>;
      }>;
    };
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
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
  );
  const mammoth = (window as unknown as Record<string, unknown>)[
    "mammoth"
  ] as {
    extractRawText: (input: {
      arrayBuffer: ArrayBuffer;
    }) => Promise<{ value: string }>;
  };
  if (!mammoth) throw new Error("Mammoth failed to load");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return extractPdfText(file);
  if (ext === "docx") return extractDocxText(file);
  return file.text();
}

function extractKeyEntities(text: string) {
  const dates: string[] = [];
  const organizations: string[] = [];
  const names: string[] = [];

  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\w+ \d{1,2},? \d{4})/g,
    /(\d{1,2}\s+\w+\s+\d{4})/g,
  ];
  for (const p of datePatterns) {
    const m = text.match(p);
    if (m) dates.push(...m.slice(0, 10));
  }
  const orgPatterns = [
    /(?:issued by|from|organization|institution|company|university)\s*[:\-]?\s*([A-Z][A-Za-z\s&,\.]+?)(?:\n|\.|,|$)/gi,
    /([A-Z][A-Za-z]+(?:\s+(?:University|College|Institute|Academy|Corporation|Foundation|Council|Association|Board|Company|Inc|Ltd)))/g,
  ];
  for (const p of orgPatterns) {
    let m;
    while ((m = p.exec(text)) !== null) organizations.push(m[1]?.trim() || m[0]?.trim());
  }
  const namePatterns = [
    /(?:presented to|awarded to|certif[^.]*?that|name)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
  ];
  for (const p of namePatterns) {
    let m;
    while ((m = p.exec(text)) !== null) names.push(m[1]?.trim());
  }

  return {
    names: [...new Set(names)].slice(0, 10),
    dates: [...new Set(dates)].slice(0, 10),
    organizations: [...new Set(organizations)].slice(0, 10),
  };
}

function findRelevantSections(query: string, docs: UploadedDoc[]) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter(
      (w) =>
        !["the","and","for","what","who","how","when","where","why","this","that","with","from","about","tell","give","show","list","describe","explain","summarize","which","were","was","are","does","have","has","can","could","would","should","is","it","a","an","in","on","of","to","my","me","i"].includes(w)
    );

  const allSections: { text: string; doc: string; score: number }[] = [];

  docs.forEach((doc) => {
    doc.text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 10)
      .forEach((para) => {
        const paraLower = para.toLowerCase();
        let score = 0;
        queryWords.forEach((word) => {
          const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
          const matches = paraLower.match(regex);
          if (matches) score += matches.length * 2;
        });
        if (paraLower.includes(queryLower.replace(/[?!.]/g, "").trim())) score += 10;
        if (score > 0) allSections.push({ text: para.trim().slice(0, 1500), doc: doc.name, score });
      });
  });

  allSections.sort((a, b) => b.score - a.score);
  return allSections.slice(0, 10);
}

function detectDocumentType(text: string): string {
  const l = text.toLowerCase();
  if (l.includes("certificate") || l.includes("certify that") || l.includes("has successfully completed")) return "certificate";
  if (l.includes("invoice") || l.includes("bill to")) return "invoice";
  if (l.includes("resume") || l.includes("work experience")) return "resume";
  if (l.includes("contract") || l.includes("agreement")) return "contract";
  if (l.includes("report") || l.includes("executive summary")) return "report";
  return "document";
}

function generateDocResponse(query: string, docs: UploadedDoc[]): { content: string; sources: Source[] } {
  const queryLower = query.toLowerCase().replace(/[?!.]/g, "").trim();
  const relevantSections = findRelevantSections(query, docs);
  const entities = docs.reduce(
    (acc, doc) => {
      const e = extractKeyEntities(doc.text);
      return { names: [...acc.names, ...e.names], dates: [...acc.dates, ...e.dates], organizations: [...acc.organizations, ...e.organizations] };
    },
    { names: [] as string[], dates: [] as string[], organizations: [] as string[] }
  );

  const docType = detectDocumentType(docs.map((d) => d.text).join("\n"));
  const fileList = docs.map((d) => `**${d.name}** (${(d.size / 1024).toFixed(1)} KB)`).join(", ");

  const sources: Source[] = relevantSections.slice(0, 3).map((s) => ({
    title: s.doc, page: null, content: s.text.slice(0, 200), score: Math.min(0.99, 0.7 + s.score * 0.03),
  }));

  let response = "";

  if (queryLower.includes("what") || queryLower.includes("tell") || queryLower.includes("describe") || queryLower.includes("about")) {
    if (relevantSections.length > 0) {
      response = `Based on your documents, here's what I found:\n\n${relevantSections.map((s, i) => `${i + 1}. **From ${s.doc}:**\n${s.text}`).join("\n\n")}`;
    } else {
      const fullText = docs.map((d) => d.text).join("\n\n").slice(0, 3000);
      const sentences = fullText.split(/[.!?\n]+/).filter((s) => s.trim().length > 20).slice(0, 8);
      response = `Here's what this ${docType} contains:\n\n${sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n")}`;
    }
    if (entities.dates.length) response += `\n\n**Dates:** ${entities.dates.slice(0, 5).join(", ")}`;
    if (entities.organizations.length) response += `\n**Organizations:** ${entities.organizations.slice(0, 5).join(", ")}`;
  } else if (queryLower.includes("who")) {
    if (entities.names.length) {
      response = `People mentioned:\n\n${entities.names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
    } else if (relevantSections.length) {
      response = relevantSections.map((s, i) => `${i + 1}. ${s.text.slice(0, 400)}`).join("\n\n");
    } else {
      response = "I couldn't find specific people mentioned in the documents.";
    }
  } else if (queryLower.includes("when") || queryLower.includes("date")) {
    if (entities.dates.length) {
      response = `Dates found:\n\n${entities.dates.map((d, i) => `${i + 1}. ${d}`).join("\n")}`;
    } else {
      response = "I couldn't find specific dates in the documents.";
    }
  } else if (queryLower.includes("summarize") || queryLower.includes("summary")) {
    const sentences = docs.map((d) => d.text).join("\n").split(/[.!?\n]+/).filter((s) => s.trim().length > 20).slice(0, 10);
    response = `**Summary** (${docType}):\n\n${sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n")}`;
  } else if (relevantSections.length > 0) {
    response = `Here's what I found:\n\n${relevantSections.map((s, i) => `${i + 1}. **From ${s.doc}:**\n${s.text}`).join("\n\n")}`;
  } else {
    const sentences = docs.map((d) => d.text).join("\n").split(/[.!?\n]+/).filter((s) => s.trim().length > 20).slice(0, 5);
    response = sentences.length > 0
      ? `Here are key excerpts from your documents:\n\n${sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n")}`
      : `I've loaded your documents. Try asking:\n- "What is this document about?"\n- "Who is mentioned?"\n- "What are the key dates?"\n- "Summarize the main points"`;
  }

  response += `\n\n---\n*From: ${fileList}*`;
  return { content: response, sources };
}

function getDemoResponse(query: string, docs: UploadedDoc[]) {
  if (docs.length > 0) return generateDocResponse(query, docs);
  return {
    content: `I'm OpsPilot AI. I can help you with:\n\n- **Document Analysis** — Upload PDFs, DOCX, or text files\n- **Code Review** — Analyze code quality\n- **Incident Triage** — Classify operational incidents\n- **API Research** — Find API integrations\n\nClick the **+** button to upload a document, then ask anything!`,
    sources: [],
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
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
        newDocs.push({ name: file.name, text, size: file.size, type: file.type || file.name.split(".").pop() || "unknown" });
      } catch (err) {
        console.error(`Failed to parse ${file.name}:`, err);
        newDocs.push({ name: file.name, text: `[Error parsing ${file.name}]`, size: file.size, type: "error" });
      }
    }
    setUploadedDocs((prev) => [...prev, ...newDocs]);
    setIsParsing(false);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    if (!isAuthenticated) {
      const count = incrementFreeMessageCount();
      if (count > FREE_MESSAGE_LIMIT) {
        setShowLimitBanner(true);
        return;
      }
    }

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    const token = localStorage.getItem("access_token");

    if (token && token !== "demo-token" && token !== "demo-token-google") {
      try {
        const response = await fetch("/api/v1/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: userMessage.content, document_context: uploadedDocs.length > 0 ? uploadedDocs.map((d) => `[${d.name}]\n${d.text.slice(0, 10000)}`).join("\n\n---\n\n") : undefined }),
        });
        if (response.ok) {
          const reader = response.body?.getReader();
          if (reader) {
            const decoder = new TextDecoder();
            let fullContent = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              for (const line of chunk.split("\n")) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === "content") {
                      fullContent += parsed.content;
                      setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, content: fullContent } : m));
                    } else if (parsed.type === "sources") {
                      setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, sources: parsed.sources } : m));
                    } else if (parsed.type === "metadata") {
                      setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, latency_ms: parsed.latency_ms, token_count: parsed.token_count, model: parsed.model } : m));
                    }
                  } catch {}
                }
              }
            }
            setIsStreaming(false);
            return;
          }
        }
      } catch {}
    }

    // Client-side fallback
    const demo = getDemoResponse(userMessage.content, uploadedDocs);
    const words = demo.content.split(" ");
    let accumulated = "";
    for (let i = 0; i < words.length; i++) {
      accumulated += (i === 0 ? "" : " ") + words[i];
      setMessages((prev) => prev.map((m) => m.id === assistantMessage.id ? { ...m, content: accumulated } : m));
      await new Promise((r) => setTimeout(r, 10));
    }
    setMessages((prev) =>
      prev.map((m) => m.id === assistantMessage.id ? { ...m, sources: demo.sources, latency_ms: Math.random() * 400 + 50, token_count: words.length, model: "client-side AI" } : m)
    );
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const freeRemaining = FREE_MESSAGE_LIMIT - getFreeMessageCount();

  return (
    <div className="flex h-screen bg-[#0D0F17] text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#0D0F17]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">OpsPilot</span>
                </div>
                <button onClick={() => setShowSidebar(false)} className="rounded-lg p-1.5 text-[#475569] hover:bg-white/[0.06] hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <button
                  onClick={() => { setMessages([]); setShowWelcome(true); setShowSidebar(false); }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <Plus className="h-4 w-4" /> New Chat
                </button>
              </div>

              <div className="border-t border-white/[0.06] p-3">
                <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]">
                  <PanelLeftOpen className="h-3.5 w-3.5" /> Back to Dashboard
                </Link>
                {!isAuthenticated && (
                  <Link href="/login" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]">
                    <LogIn className="h-3.5 w-3.5" /> Sign In
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-12 items-center border-b border-white/[0.06] px-4">
          <button onClick={() => setShowSidebar(true)} className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-white">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <span className="ml-2 text-sm text-[#64748B]">OpsPilot AI</span>
          {uploadedDocs.length > 0 && (
            <span className="ml-3 rounded-md bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] text-[#A78BFA]">
              {uploadedDocs.length} doc{uploadedDocs.length > 1 ? "s" : ""}
            </span>
          )}
        </header>

        {/* Messages or Welcome */}
        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex h-full flex-col items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-xl shadow-[#7C3AED]/20"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mb-2 text-3xl font-bold"
              >
                How can I help you?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="mb-8 max-w-md text-center text-sm text-[#64748B]"
              >
                Upload documents and ask questions — I&apos;ll answer based on their content.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="grid w-full max-w-lg grid-cols-2 gap-3"
              >
                {[
                  "What is this document about?",
                  "Who is mentioned in it?",
                  "Summarize the key points",
                  "What are the important dates?",
                ].map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left text-sm text-[#94A3B8] transition-all hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 hover:text-white"
                  >
                    {q}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-6 flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/20">
                        <Bot className="h-4 w-4 text-[#A78BFA]" />
                      </div>
                    )}

                    <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div className={`rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-[#7C3AED]/20 text-white" : "bg-white/[0.04]"}`}>
                        {message.role === "assistant" && !message.content && isStreaming ? (
                          <div className="flex items-center gap-2 text-[#64748B]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/`(.*?)`/g, '<code class="rounded bg-white/5 px-1 py-0.5 text-[#A78BFA]">$1</code>'),
                          }} />
                        )}
                      </div>

                      {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.sources.map((source, i) => (
                            <div key={i} className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1">
                              <FileText className="h-3 w-3 text-[#7C3AED]" />
                              <span className="text-[10px] text-[#64748B]">{source.title}</span>
                              {source.score && <span className="rounded bg-[#7C3AED]/10 px-1 text-[9px] text-[#A78BFA]">{Math.round(source.score * 100)}%</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {message.role === "assistant" && message.latency_ms && (
                        <div className="mt-1 text-[10px] text-[#475569]">
                          {message.latency_ms.toFixed(0)}ms · {message.model}
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
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

        {/* Limit banner */}
        <AnimatePresence>
          {showLimitBanner && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-auto mb-2 max-w-3xl rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-3"
            >
              <p className="text-sm text-white">Free message limit reached.</p>
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="rounded-lg bg-[#7C3AED] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#6D28D9]">Sign In</Link>
                <Link href="/register" className="rounded-lg border border-[#7C3AED]/30 px-4 py-1.5 text-xs font-medium text-[#A78BFA] hover:bg-[#7C3AED]/10">Create Account</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded docs chips */}
        {uploadedDocs.length > 0 && (
          <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-4 pb-2">
            {uploadedDocs.map((doc, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-2.5 py-1"
              >
                <FileText className="h-3 w-3 text-[#A78BFA]" />
                <span className="max-w-[120px] truncate text-xs text-[#A78BFA]">{doc.name}</span>
                <button onClick={() => setUploadedDocs((prev) => prev.filter((_, idx) => idx !== i))} className="rounded p-0.5 text-[#475569] hover:text-[#EF4444]">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-end rounded-2xl border border-white/[0.08] bg-white/[0.04] transition-colors focus-within:border-[#7C3AED]/40">
              {/* Upload button */}
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  disabled={isParsing}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#A78BFA]"
                >
                  {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {showUploadMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute bottom-12 left-0 z-50 w-48 rounded-xl border border-white/[0.08] bg-[#1A1D2E] p-1.5 shadow-2xl"
                    >
                      <button onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
                      >
                        <Upload className="h-4 w-4" /> Upload files
                      </button>
                      <button onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
                      >
                        <Image className="h-4 w-4" aria-hidden="true" /> Image (coming soon)
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
                placeholder="Message OpsPilot..."
                rows={1}
                disabled={showLimitBanner}
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white placeholder-[#475569] outline-none disabled:opacity-50"
                style={{ lineHeight: "1.5" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 128) + "px";
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming || showLimitBanner}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-white transition-all hover:bg-[#6D28D9] disabled:opacity-30 disabled:hover:bg-[#7C3AED]"
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-[#475569]">
              OpsPilot can make mistakes. Check important information.
            </p>
          </div>
        </div>
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
  );
}
