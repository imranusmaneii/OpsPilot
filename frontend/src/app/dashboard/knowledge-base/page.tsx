"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Database, Search } from "lucide-react";
import { CollectionGrid } from "@/components/knowledge-base/collection-grid";
import { UploadZone } from "@/components/knowledge-base/upload-zone";
import { api } from "@/lib/api-client";
import type { Collection } from "@/types/document";

export default function KnowledgeBasePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = async () => {
    const res = await api.get<{ collections: Collection[]; total: number }>("/knowledge-base");
    if (res.data) setCollections(res.data.collections);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await api.post<Collection>("/knowledge-base", {
      name: newName,
      description: newDescription,
    });
    if (res.data) {
      setCollections((prev) => [res.data!, ...prev]);
      setShowCreateModal(false);
      setNewName("");
      setNewDescription("");
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    const res = await api.delete(`/knowledge-base/${id}`);
    if (!res.error) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }
  };

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
              onClick={() => setSelectedCollection(null)}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-sm text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
            >
              Back to Collections
            </button>
            <h2 className="text-lg font-semibold">
              {collections.find((c) => c.id === selectedCollection)?.name}
            </h2>
          </div>

          <UploadZone
            collectionId={selectedCollection}
            onUploadComplete={fetchCollections}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CollectionGrid
            collections={collections}
            onSelect={setSelectedCollection}
            onDelete={handleDelete}
          />
        </motion.div>
      )}

      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-semibold">Create Collection</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-[#94A3B8]">Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="My Collection"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#7C3AED]/50"
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
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#7C3AED]/50 resize-none"
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
    </div>
  );
}
