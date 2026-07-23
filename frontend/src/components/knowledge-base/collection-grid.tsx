"use client";

import { motion } from "framer-motion";
import { Database, FileText, MoreVertical, Trash2 } from "lucide-react";
import type { Collection } from "@/types/document";

interface CollectionGridProps {
  collections: Collection[];
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CollectionGrid({ collections, onSelect, onDelete }: CollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)]">
          <Database className="h-8 w-8 text-[#94A3B8]" />
        </div>
        <p className="text-sm text-[#94A3B8]">No collections yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection, i) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect?.(collection.id)}
          className="glass glass-hover group cursor-pointer rounded-2xl p-5 transition-all"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
              <Database className="h-5 w-5 text-[#DC2626]" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(collection.id);
              }}
              className="rounded-lg p-1.5 text-[#94A3B8] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mb-1 font-semibold">{collection.name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-[#94A3B8]">
            {collection.description || "No description"}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <FileText className="h-3 w-3" />
            <span>{collection.document_count} documents</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
