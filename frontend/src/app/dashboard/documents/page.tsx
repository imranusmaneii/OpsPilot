"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { PdfViewer } from "@/components/documents/pdf-viewer";
import { CitationOverlay } from "@/components/documents/citation-overlay";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { api } from "@/lib/api-client";
import type { Document, DocumentChunk } from "@/types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);

  const fetchDocuments = async () => {
    const res = await api.get<{ documents: Document[]; total: number }>("/documents");
    if (res.data) setDocuments(res.data.documents);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelect = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setSelectedDoc(doc);
      const res = await api.get<DocumentChunk[]>(`/documents/${docId}/chunks`);
      if (res.data) setChunks(res.data);
    }
  };

  const handleDelete = async (docId: string) => {
    const res = await api.delete(`/documents/${docId}`);
    if (!res.error) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) setSelectedDoc(null);
    }
  };

  if (selectedDoc) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDoc(null)}
            className="rounded-lg border border-[rgba(255,255,255,0.08)] p-2 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{selectedDoc.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-[#94A3B8]">{selectedDoc.file_name}</p>
              <ConfidenceBadge
                score={selectedDoc.status === "indexed" ? 0.95 : 0.5}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PdfViewer
              fileUrl={`/api/v1/documents/${selectedDoc.id}/file`}
              fileName={selectedDoc.file_name}
            />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h4 className="mb-3 text-sm font-semibold">Document Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Status</span>
                  <span className="capitalize">{selectedDoc.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Chunks</span>
                  <span>{selectedDoc.chunk_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Embedding Model</span>
                  <span className="text-xs">{selectedDoc.embedding_model || "N/A"}</span>
                </div>
              </div>
            </div>

            {chunks.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <h4 className="mb-3 text-sm font-semibold">Chunks ({chunks.length})</h4>
                <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-thin">
                  {chunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-[#94A3B8]">
                          Chunk {chunk.chunk_index + 1}
                          {chunk.page_number && ` · Page ${chunk.page_number}`}
                        </span>
                        {chunk.token_count && (
                          <span className="text-[10px] text-[#94A3B8]">
                            {chunk.token_count} tokens
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] line-clamp-3">{chunk.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-sm text-[#94A3B8]">View and manage your indexed documents</p>
      </div>
      <DocumentList documents={documents} onSelect={handleSelect} onDelete={handleDelete} />
    </div>
  );
}
