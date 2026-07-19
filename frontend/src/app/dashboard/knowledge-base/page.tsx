"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Database, Search, Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Trash2, Folder } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  document_count: number;
  created_at: string;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

const DEMO_COLLECTIONS: Collection[] = [
  { id: "col-1", name: "Product Documentation", description: "API docs, guides, and technical references", document_count: 24, created_at: "2025-01-15T10:00:00Z" },
  { id: "col-2", name: "Engineering RFCs", description: "Architecture decision records and design docs", document_count: 12, created_at: "2025-02-01T10:00:00Z" },
  { id: "col-3", name: "Incident Reports", description: "Post-mortems and incident analysis documents", document_count: 8, created_at: "2025-02-15T10:00:00Z" },
  { id: "col-4", name: "Security Policies", description: "Compliance docs, security guidelines, and audit reports", document_count: 15, created_at: "2025-03-01T10:00:00Z" },
];

export default function KnowledgeBasePage() {
  const [collections, setCollections] = useState<Collection[]>(DEMO_COLLECTIONS);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 500));

    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name: newName,
      description: newDescription || null,
      document_count: 0,
      created_at: new Date().toISOString(),
    };

    setCollections((prev) => [newCollection, ...prev]);
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollection === id) setSelectedCollection(null);
  };

  const uploadFile = useCallback(
    async (uf: UploadFile) => {
      // Simulate upload
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setFiles((prev) =>
          prev.map((f) => (f.id === uf.id ? { ...f, progress } : f))
        );
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uf.id ? { ...f, status: "success" as const, progress: 100 } : f
        )
      );

      // Update collection document count
      if (selectedCollection) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === selectedCollection
              ? { ...c, document_count: c.document_count + 1 }
              : c
          )
        );
      }
    },
    [selectedCollection]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: UploadFile[] = droppedFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const newFiles: UploadFile[] = selectedFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(uploadFile);
      if (inputRef.current) inputRef.current.value = "";
    },
    [uploadFile]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const selectedCollectionData = collections.find((c) => c.id === selectedCollection);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-[#94A3B8]">Manage your collections and documents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED]/90"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </div>

      {selectedCollection ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedCollection(null); setFiles([]); }}
              className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-sm text-[#94A3B8] transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              ← Back to Collections
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedCollectionData?.name}</h2>
              <p className="text-xs text-[#475569]">{selectedCollectionData?.document_count} documents</p>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
              isDragging
                ? "border-[#7C3AED] bg-[#7C3AED]/10"
                : "border-white/[0.1] bg-white/[0.02] hover:border-[#7C3AED]/50 hover:bg-white/[0.04]"
            }`}
          >
            <div className="mb-4 rounded-2xl bg-[#7C3AED]/10 p-4">
              <Upload className="h-8 w-8 text-[#7C3AED]" />
            </div>
            <p className="mb-1 text-sm font-medium text-white">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-[#94A3B8]">
              or click to browse · PDF, DOCX, Markdown, CSV, JSON, PNG, JPG
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.md,.csv,.json,.png,.jpg,.jpeg,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <FileText className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{f.file.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          f.status === "success"
                            ? "bg-emerald-400"
                            : f.status === "error"
                            ? "bg-red-400"
                            : "bg-[#7C3AED]"
                        }`}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#475569]">
                      {f.status === "success" ? "Done" : f.status === "error" ? "Failed" : `${f.progress}%`}
                    </span>
                  </div>
                </div>
                {f.status === "success" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                {f.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                <button
                  onClick={() => removeFile(f.id)}
                  className="rounded-lg p-1 text-[#94A3B8] hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40"
            />
          </div>

          {/* Collection Grid */}
          {filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05]">
                <Database className="h-8 w-8 text-[#94A3B8]" />
              </div>
              <p className="text-sm text-[#94A3B8]">No collections yet</p>
              <p className="text-xs text-[#475569]">Create a collection to start organizing your documents</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCollections.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedCollection(collection.id)}
                  className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-[#7C3AED]/10 p-2.5">
                      <Folder className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(collection.id);
                      }}
                      className="rounded-lg p-1.5 text-[#475569] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{collection.name}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-[#94A3B8]">
                    {collection.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <FileText className="h-3 w-3" />
                    <span>{collection.document_count} documents</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E] p-6 shadow-2xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Create Collection</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-[#94A3B8]">Name</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My Collection"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#7C3AED]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-[#94A3B8]">Description</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Optional description"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#7C3AED]/50"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-xl px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7C3AED]/90 disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
