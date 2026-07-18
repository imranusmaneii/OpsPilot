export interface Document {
  id: string;
  collection_id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: "pending" | "processing" | "indexed" | "failed";
  chunk_count: number;
  embedding_model: string | null;
  error_message: string | null;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  chunk_index: number;
  page_number: number | null;
  token_count: number | null;
  metadata_: Record<string, unknown> | null;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  document_count: number;
  created_at: string;
}
