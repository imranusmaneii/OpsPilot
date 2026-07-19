"use client";

import { useState, useRef, useEffect } from "react";
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
  AlertTriangle,
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

const DEMO_RESPONSES: Record<string, { content: string; sources: Source[] }> = {
  default: {
    content: `I'm OpsPilot AI, your enterprise operations assistant. I can help you with:\n\n- **Document Analysis** — Query and extract insights from your knowledge base\n- **Code Review** — Analyze code quality and suggest improvements\n- **Incident Triage** — Classify and route operational incidents\n- **API Research** — Find and recommend API integrations\n\nTo get started, upload documents to your Knowledge Base and I'll be able to answer questions based on your content.`,
    sources: [],
  },
  report: {
    content: `Based on the analysis of the available data, here are the key findings:\n\n1. **Performance Metrics** — System uptime maintained at 99.97% over the past quarter, exceeding the SLA target of 99.9%.\n\n2. **Cost Optimization** — Infrastructure costs reduced by 23% through auto-scaling improvements and reserved instance utilization.\n\n3. **Security Posture** — Zero critical vulnerabilities detected. All dependencies updated to latest patched versions.\n\n4. **User Engagement** — Daily active users increased 18% month-over-month, with average session duration up 12%.\n\n**Recommendations:**\n- Continue monitoring the auto-scaling policies for peak hours\n- Schedule quarterly security audits\n- Expand the knowledge base with updated API documentation`,
    sources: [
      { title: "Q4 Operations Report", page: 1, content: "System uptime analysis and SLA compliance metrics...", score: 0.94 },
      { title: "Infrastructure Audit", page: 3, content: "Cost optimization strategies and resource utilization...", score: 0.87 },
    ],
  },
  api: {
    content: `Here's a summary of the available API documentation:\n\n**Base URL:** \`https://api.opspilot.ai/v1\`\n\n**Authentication:** Bearer token via \`Authorization\` header\n\n**Key Endpoints:**\n- \`POST /chat/stream\` — Streaming chat with RAG\n- \`GET /documents\` — List indexed documents\n- \`POST /documents/upload\` — Upload and index documents\n- \`GET /agents\` — List available agents\n- \`POST /evaluation\` — Run model evaluations\n\n**Rate Limits:**\n- Free tier: 100 requests/day\n- Pro tier: 10,000 requests/day\n- Enterprise: Unlimited`,
    sources: [
      { title: "OpsPilot API Reference", page: 1, content: "Complete API documentation with examples...", score: 0.96 },
    ],
  },
  risk: {
    content: `Here are the main risks identified in the current system:\n\n**High Priority:**\n1. **Single Point of Failure** — The vector database has no failover configuration. Recommend setting up replication.\n2. **API Key Exposure** — 3 API keys were found in environment files. Rotate immediately and implement secrets management.\n\n**Medium Priority:**\n3. **Dependency Vulnerabilities** — 2 packages have known CVEs. Schedule upgrades within 2 weeks.\n4. **Missing Rate Limiting** — The public API endpoints lack rate limiting, exposing the system to abuse.\n\n**Low Priority:**\n5. **Logging Gaps** — Authentication failures are not being logged. Add audit logging for compliance.\n\n**Mitigation Plan:** I recommend creating a security sprint to address high-priority items first, followed by a maintenance window for the medium-priority upgrades.`,
    sources: [
      { title: "Security Assessment", page: 2, content: "Vulnerability analysis and risk matrix...", score: 0.91 },
      { title: "Architecture Review", page: 5, content: "Infrastructure resilience and failover analysis...", score: 0.85 },
    ],
  },
};

function getDemoResponse(query: string): { content: string; sources: Source[] } {
  const lower = query.toLowerCase();
  if (lower.includes("report") || lower.includes("finding") || lower.includes("summary")) {
    return DEMO_RESPONSES.report;
  }
  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("documentation")) {
    return DEMO_RESPONSES.api;
  }
  if (lower.includes("risk") || lower.includes("security") || lower.includes("vulnerability")) {
    return DEMO_RESPONSES.risk;
  }
  return DEMO_RESPONSES.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Fallback to demo mode when backend is unavailable
      const demo = getDemoResponse(userMessage.content);
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
        await new Promise((r) => setTimeout(r, 20));
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

  const suggestedQuestions = [
    "What are the key findings in the latest report?",
    "Summarize the API documentation",
    "What are the main risks identified?",
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat</h1>
          <p className="text-sm text-[#94A3B8]">Ask questions about your documents</p>
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
                <p className="mb-8 max-w-md text-center text-sm text-[#94A3B8]">
                  Ask questions and get AI-powered answers grounded in your documents.
                </p>
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

          <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
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
          </div>
        </div>
      </div>
    </div>
  );
}
