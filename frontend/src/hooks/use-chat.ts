"use client";

import { useEffect, useRef } from "react";

interface UseStreamingChatOptions {
  onChunk?: (chunk: string) => void;
  onSources?: (sources: unknown[]) => void;
  onMetadata?: (metadata: Record<string, unknown>) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = async (message: string, conversationId?: string) => {
    abortRef.current = new AbortController();

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, conversation_id: conversationId }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content") options.onChunk?.(parsed.content);
            if (parsed.type === "sources") options.onSources?.(parsed.sources);
            if (parsed.type === "metadata") options.onMetadata?.(parsed);
          } catch {}
        }
      }

      options.onDone?.();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      options.onError?.(err instanceof Error ? err : new Error("Unknown error"));
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  return { sendMessage, stop };
}
