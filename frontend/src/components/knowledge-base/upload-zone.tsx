"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface UploadZoneProps {
  collectionId: string;
  onUploadComplete?: () => void;
}

export function UploadZone({ collectionId, onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append("collection_id", collectionId);
    formData.append("file", uploadFile.file);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Upload failed");
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success" as const, progress: 100 } : f))
      );
      onUploadComplete?.();
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Upload failed" }
            : f
        )
      );
    }
  };

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
    [collectionId, onUploadComplete]
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
    [collectionId, onUploadComplete]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? "border-[#7C3AED] bg-[#7C3AED]/10"
            : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[#7C3AED]/50 hover:bg-[rgba(255,255,255,0.05)]"
        }`}
      >
        <div className="mb-4 rounded-2xl bg-[#7C3AED]/10 p-4">
          <Upload className="h-8 w-8 text-[#7C3AED]" />
        </div>
        <p className="mb-2 text-sm font-medium">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-[#94A3B8]">
          PDF, DOCX, Markdown, CSV, JSON, PNG, JPG
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

      <AnimatePresence>
        {files.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3"
          >
            <FileText className="h-4 w-4 shrink-0 text-[#94A3B8]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{f.file.name}</p>
              <p className="text-xs text-[#94A3B8]">
                {(f.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {f.status === "uploading" && (
              <Loader2 className="h-4 w-4 animate-spin text-[#7C3AED]" />
            )}
            {f.status === "success" && (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            )}
            {f.status === "error" && (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <button
              onClick={() => removeFile(f.id)}
              className="rounded-lg p-1 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
