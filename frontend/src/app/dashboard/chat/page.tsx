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
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ChatSparkle3DDynamic = dynamic(
  () => import("@/components/shared/chat-sparkle-3d").then((m) => m.ChatSparkle3D),
  { ssr: false }
);

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

  const pdfjsLib = (window as unknown as Record<string, unknown>)["pdfjsLib"] as {
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

  if (ext === "pdf") {
    return extractPdfText(file);
  }

  if (ext === "docx") {
    return extractDocxText(file);
  }

  return file.text();
}

function extractKeyEntities(text: string): {
  names: string[];
  dates: string[];
  organizations: string[];
  numbers: string[];
  titles: string[];
} {
  const names: string[] = [];
  const dates: string[] = [];
  const organizations: string[] = [];
  const numbers: string[] = [];
  const titles: string[] = [];

  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\w+ \d{1,2},? \d{4})/g,
    /(\d{1,2}\s+\w+\s+\d{4})/g,
  ];
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) dates.push(...matches.slice(0, 10));
  }

  const orgPatterns = [
    /(?:issued by|from|organization|institution|company|university|academy|institute|council|association|board|department|ministry|bureau|corporation|foundation)\s*[:\-]?\s*([A-Z][A-Za-z\s&,\.]+?)(?:\n|\.|,|$)/gi,
    /([A-Z][A-Za-z]+(?:\s+(?:University|College|Institute|Academy|Corporation|Foundation|Council|Association|Board|Department|Ministry|Bureau|Company|Inc|Ltd|LLC|Corp)))/g,
  ];
  for (const pattern of orgPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      organizations.push(match[1]?.trim() || match[0]?.trim());
    }
  }

  const namePatterns = [
    /(?:presented to|awarded to|certif(?:y|ies) that|this is to certify that|name)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /(?:recipient|winner|participant|student|candidate|employee|member)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
  ];
  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      names.push(match[1]?.trim());
    }
  }

  const titlePatterns = [
    /(?:title|subject|course|program|training|certificate|diploma|degree)\s*[:\-]?\s*(.{5,80}?)(?:\n|\.|$)/gi,
    /(?:re:|regarding:|about:)\s*(.{5,80}?)(?:\n|\.|$)/gi,
  ];
  for (const pattern of titlePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      titles.push(match[1]?.trim());
    }
  }

  const numMatches = text.match(
    /\b\d+(?:\.\d+)?(?:\s*%|\s*(?:USD|EUR|GBP|\$|€|£)|\s*(?:million|billion|thousand))\b/g
  );
  if (numMatches) numbers.push(...numMatches.slice(0, 15));

  return {
    names: [...new Set(names)].slice(0, 10),
    dates: [...new Set(dates)].slice(0, 10),
    organizations: [...new Set(organizations)].slice(0, 10),
    numbers: [...new Set(numbers)].slice(0, 10),
    titles: [...new Set(titles)].slice(0, 10),
  };
}

function findRelevantSections(
  query: string,
  docs: UploadedDoc[],
  maxSections: number = 15
): { text: string; doc: string; score: number }[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter(
      (w) =>
        ![
          "the",
          "and",
          "for",
          "what",
          "who",
          "how",
          "when",
          "where",
          "why",
          "this",
          "that",
          "with",
          "from",
          "about",
          "tell",
          "give",
          "show",
          "list",
          "describe",
          "explain",
          "summarize",
          "which",
          "were",
          "was",
          "are",
          "does",
          "have",
          "has",
          "can",
          "could",
          "would",
          "should",
          "does",
          "don't",
          "is",
          "it",
        ].includes(w)
    );

  const allSections: { text: string; doc: string; score: number }[] = [];

  docs.forEach((doc) => {
    const paragraphs = doc.text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 10);

    paragraphs.forEach((para) => {
      const paraLower = para.toLowerCase();
      let score = 0;

      queryWords.forEach((word) => {
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
        const matches = paraLower.match(regex);
        if (matches) {
          score += matches.length * 2;
        }
      });

      const queryPhrase = queryLower.replace(/[?!.]/g, "").trim();
      if (paraLower.includes(queryPhrase)) {
        score += 10;
      }

      const importantPatterns = [
        /certif/i,
        /award/i,
        /presented/i,
        /issued/i,
        /name\s*:/i,
        /title\s*:/i,
        /date\s*:/i,
        /authoriz/i,
        /sign/i,
        /complet/i,
      ];
      importantPatterns.forEach((pattern) => {
        if (pattern.test(query) && pattern.test(para)) {
          score += 3;
        }
      });

      if (score > 0) {
        allSections.push({
          text: para.trim().slice(0, 1500),
          doc: doc.name,
          score,
        });
      }
    });
  });

  allSections.sort((a, b) => b.score - a.score);
  return allSections.slice(0, maxSections);
}

function detectDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("certificate") ||
    lower.includes("certify that") ||
    lower.includes("this is to certify") ||
    lower.includes("has successfully completed")
  )
    return "certificate";
  if (lower.includes("invoice") || lower.includes("bill to") || lower.includes("amount due"))
    return "invoice";
  if (
    lower.includes("resume") ||
    lower.includes("curriculum vitae") ||
    lower.includes("work experience") ||
    lower.includes("education")
  )
    return "resume";
  if (
    lower.includes("contract") ||
    lower.includes("agreement") ||
    lower.includes("terms and conditions") ||
    lower.includes("party a") ||
    lower.includes("party b")
  )
    return "contract";
  if (
    lower.includes("report") ||
    lower.includes("findings") ||
    lower.includes("executive summary") ||
    lower.includes("methodology")
  )
    return "report";
  if (
    lower.includes("research") ||
    lower.includes("abstract") ||
    lower.includes("hypothesis") ||
    lower.includes("conclusion")
  )
    return "research paper";
  if (lower.includes("manual") || lower.includes("instructions") || lower.includes("procedure"))
    return "manual";
  return "document";
}

function generateDocResponse(
  query: string,
  docs: UploadedDoc[]
): { content: string; sources: Source[] } {
  const queryLower = query.toLowerCase().replace(/[?!.]/g, "").trim();
  const relevantSections = findRelevantSections(query, docs);
  const allEntities = docs.reduce(
    (acc, doc) => {
      const e = extractKeyEntities(doc.text);
      return {
        names: [...acc.names, ...e.names],
        dates: [...acc.dates, ...e.dates],
        organizations: [...acc.organizations, ...e.organizations],
        numbers: [...acc.numbers, ...e.numbers],
        titles: [...acc.titles, ...e.titles],
      };
    },
    {
      names: [] as string[],
      dates: [] as string[],
      organizations: [] as string[],
      numbers: [] as string[],
      titles: [] as string[],
    }
  );

  const docType = detectDocumentType(docs.map((d) => d.text).join("\n"));
  const fileList = docs
    .map(
      (d) =>
        `• **${d.name}** (${(d.size / 1024).toFixed(1)} KB, ~${d.text.split(/\s+/).length.toLocaleString()} words)`
    )
    .join("\n");

  const sources: Source[] = relevantSections.slice(0, 3).map((s) => ({
    title: s.doc,
    page: null,
    content: s.text.slice(0, 200),
    score: Math.min(0.99, 0.7 + s.score * 0.03),
  }));

  let response = "";

  if (queryLower.includes("what") || queryLower.includes("tell") || queryLower.includes("describe") || queryLower.includes("about")) {
    const fullDocText = docs.map((d) => d.text).join("\n\n");
    const firstChunk = fullDocText.slice(0, 3000);

    if (relevantSections.length > 0) {
      const sectionsText = relevantSections
        .map((s, i) => `${i + 1}. **From ${s.doc}:**\n${s.text}`)
        .join("\n\n");

      response = `Based on your documents, here's what I found:\n\n${sectionsText}`;

      if (allEntities.dates.length > 0) {
        response += `\n\n**Dates mentioned:** ${allEntities.dates.slice(0, 5).join(", ")}`;
      }
      if (allEntities.organizations.length > 0) {
        response += `\n**Organizations:** ${allEntities.organizations.slice(0, 5).join(", ")}`;
      }
      if (allEntities.names.length > 0) {
        response += `\n**People:** ${allEntities.names.slice(0, 5).join(", ")}`;
      }
    } else {
      const summary = firstChunk
        .split(/[.!?\n]+/)
        .filter((s) => s.trim().length > 20)
        .slice(0, 6)
        .map((s, i) => `${i + 1}. ${s.trim()}`)
        .join("\n");

      response = `Here's a summary of the document (${docType}):\n\n${summary || firstChunk.slice(0, 1000)}`;
    }

    response += `\n\n---\n\n**Documents analyzed:**\n${fileList}\n\n*Ask me anything more specific — I can extract names, dates, organizations, key points, or answer any question about these documents.*`;
  } else if (queryLower.includes("who")) {
    if (relevantSections.length > 0) {
      const whoText = relevantSections
        .map((s) => s.text)
        .join("\n\n");
      const nameMatches = whoText.match(
        /(?:presented to|awarded to|certif[^.]*?that|name|recipient|winner|signed by|authorized by|issued to)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})/gi
      );
      if (nameMatches && nameMatches.length > 0) {
        response = `Here are the people mentioned in the documents:\n\n${nameMatches.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;
      } else if (allEntities.names.length > 0) {
        response = `People mentioned in the documents:\n\n${allEntities.names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
      } else {
        response = `From the document content:\n\n${relevantSections.map((s, i) => `${i + 1}. ${s.text.slice(0, 300)}`).join("\n\n")}`;
      }
    } else if (allEntities.names.length > 0) {
      response = `People mentioned in the documents:\n\n${allEntities.names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
    } else {
      response = `I couldn't find specific people mentioned in the documents. The documents may not contain named individuals, or the text extraction may have limitations. Try asking about the document content more generally.`;
    }
    response += `\n\n---\n**Source:** ${fileList}`;
  } else if (queryLower.includes("when") || queryLower.includes("date") || queryLower.includes("time")) {
    if (allEntities.dates.length > 0) {
      response = `Dates found in the documents:\n\n${allEntities.dates.map((d, i) => `${i + 1}. ${d}`).join("\n")}`;
      if (relevantSections.length > 0) {
        response += `\n\n**Context:**\n${relevantSections
          .slice(0, 3)
          .map((s) => s.text.slice(0, 300))
          .join("\n\n")}`;
      }
    } else {
      response = `I couldn't find specific dates in the documents. The documents may contain dates in an unusual format, or dates may not be present.`;
    }
    response += `\n\n---\n**Source:** ${fileList}`;
  } else if (queryLower.includes("where") || queryLower.includes("location") || queryLower.includes("place")) {
    if (relevantSections.length > 0) {
      response = `Location-related information from the documents:\n\n${relevantSections
        .map((s, i) => `${i + 1}. ${s.text}`)
        .join("\n\n")}`;
    } else {
      response = `I couldn't find specific location information in the documents.`;
    }
    response += `\n\n---\n**Source:** ${fileList}`;
  } else if (queryLower.includes("summarize") || queryLower.includes("summary") || queryLower.includes("overview")) {
    const fullText = docs.map((d) => d.text).join("\n\n");
    const sentences = fullText
      .split(/[.!?\n]+/)
      .filter((s) => s.trim().length > 20);
    const importantSentences = sentences.slice(0, 10);

    response = `**Document Summary** (${docType})\n\n${importantSentences.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n\n")}`;
    if (allEntities.dates.length > 0) {
      response += `\n\n**Key dates:** ${allEntities.dates.slice(0, 3).join(", ")}`;
    }
    if (allEntities.organizations.length > 0) {
      response += `\n**Organizations:** ${allEntities.organizations.slice(0, 3).join(", ")}`;
    }
    response += `\n\n---\n**Source:** ${fileList}`;
  } else if (relevantSections.length > 0) {
    response = `Here's what I found related to your question:\n\n${relevantSections
      .map((s, i) => `${i + 1}. **From ${s.doc}:**\n${s.text}`)
      .join("\n\n")}`;
    response += `\n\n---\n**Source:** ${fileList}`;
  } else {
    const fullText = docs.map((d) => d.text).join("\n");
    const sentences = fullText
      .split(/[.!?\n]+/)
      .filter((s) => s.trim().length > 20)
      .slice(0, 5);

    if (sentences.length > 0) {
      response = `I've read your documents (type: **${docType}**). Here are some key excerpts:\n\n${sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n\n")}`;
    } else {
      const wordCount = docs.reduce((s, d) => s + d.text.split(/\s+/).length, 0);
      response = `I've loaded your documents (${wordCount.toLocaleString()} words total). I can answer questions about:\n\n• **Who** is involved — names, roles, parties\n• **What** happened — events, actions, descriptions\n• **When** — dates, timelines, deadlines\n• **Where** — locations, addresses, venues\n• **Key details** — amounts, percentages, specifications\n\nTry asking something like:\n- "What is this document about?"\n- "Who is mentioned in this document?"\n- "What are the key dates?"\n- "Summarize the main points"`;
    }
    response += `\n\n---\n**Source:** ${fileList}`;
  }

  return { content: response, sources };
}

function getDemoResponse(
  query: string,
  docs: UploadedDoc[]
): { content: string; sources: Source[] } {
  if (docs.length > 0) {
    return generateDocResponse(query, docs);
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
    const apiAvailable = !!token;

    if (apiAvailable) {
      try {
        const response = await fetch("/api/v1/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversation_id: conversationId,
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

        setIsStreaming(false);
        return;
      } catch {
        // Backend not available, fall through to client-side
      }
    }

    const demo = getDemoResponse(userMessage.content, uploadedDocs);
    const words = demo.content.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      accumulated += (i === 0 ? "" : " ") + words[i];
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, content: accumulated } : m
        )
      );
      await new Promise((r) => setTimeout(r, 12));
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMessage.id
          ? {
              ...m,
              sources: demo.sources,
              latency_ms: Math.random() * 400 + 50,
              token_count: words.length,
              model: "client-side AI",
            }
          : m
      )
    );

    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions =
    uploadedDocs.length > 0
      ? [
          `What is this ${detectDocumentType(uploadedDocs.map((d) => d.text).join("\n"))}?`,
          "Who is mentioned in the document?",
          "What are the key dates?",
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
                <div className="mb-6">
                  <ChatSparkle3DDynamic size={96} />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Ask OpsPilot AI
                </h2>
                <p className="mb-4 max-w-md text-center text-sm text-[#94A3B8]">
                  Upload documents and ask questions — I&apos;ll answer based
                  on their content.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-6 flex items-center gap-2 rounded-xl border border-dashed border-[#DC2626]/40 bg-[#DC2626]/5 px-5 py-3 text-sm text-[#FCA5A5] transition-all hover:border-[#DC2626]/60 hover:bg-[#DC2626]/10"
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
                      className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[#94A3B8] transition-all hover:border-[#DC2626]/30 hover:bg-[#DC2626]/5 hover:text-white"
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
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DC2626]/20">
                          <Bot className="h-4 w-4 text-[#DC2626]" />
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
                              ? "bg-[#DC2626]/20 text-white"
                              : "glass"
                          }`}
                        >
                          {message.role === "assistant" &&
                          !message.content &&
                          isStreaming ? (
                            <div className="flex items-center gap-2 text-[#94A3B8]">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                              <div
                                className="whitespace-pre-wrap text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: message.content
                                    .replace(
                                      /\*\*(.*?)\*\*/g,
                                      "<strong>$1</strong>"
                                    )
                                    .replace(
                                      /\*(.*?)\*/g,
                                      "<em>$1</em>"
                                    )
                                    .replace(
                                      /`(.*?)`/g,
                                      '<code class="rounded bg-white/5 px-1 py-0.5">$1</code>'
                                    )
                                    .replace(
                                      /^• (.+)$/gm,
                                      '<li class="ml-4 list-disc">$1</li>'
                                    )
                                    .replace(
                                      /^(\d+)\. (.+)$/gm,
                                      '<li class="ml-4 list-decimal">$2</li>'
                                    ),
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {message.role === "assistant" &&
                          message.sources &&
                          message.sources.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-[#94A3B8]">
                                Sources
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {message.sources.map((source, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1.5"
                                  >
                                    <FileText className="h-3 w-3 text-[#DC2626]" />
                                    <span className="text-xs text-[#94A3B8]">
                                      {source.title}
                                      {source.page &&
                                        ` (p.${source.page})`}
                                    </span>
                                    {source.score && (
                                      <span className="rounded bg-[#DC2626]/10 px-1 py-0.5 text-[10px] text-[#DC2626]">
                                        {Math.round(source.score * 100)}%
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {message.role === "assistant" &&
                          message.latency_ms && (
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

          <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
            {uploadedDocs.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedDocs.map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 px-2.5 py-1.5"
                  >
                    <FileText className="h-3 w-3 text-[#FCA5A5]" />
                    <span className="max-w-[150px] truncate text-xs text-[#FCA5A5]">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-[#475569]">
                      {(doc.size / 1024).toFixed(0)}KB
                    </span>
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
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  disabled={isParsing}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] transition-all hover:border-[#DC2626]/40 hover:bg-[#DC2626]/10 hover:text-[#FCA5A5]"
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

                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DC2626] text-white transition-all hover:bg-[#DC2626]/90 disabled:opacity-50"
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
