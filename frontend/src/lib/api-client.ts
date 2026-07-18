import { type ApiResponse, type ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/v1${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: { detail: err instanceof Error ? err.message : "Network error" },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${BASE_URL}/api/v1${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}`,
        }));
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: { detail: err instanceof Error ? err.message : "Upload failed" },
      };
    }
  }

  async stream(
    endpoint: string,
    body?: unknown,
    onChunk?: (chunk: string) => void
  ): Promise<ReadableStream | null> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(`${BASE_URL}/api/v1${endpoint}`, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) return null;
      return response.body;
    } catch {
      return null;
    }
  }
}

export const api = new ApiClient();
export const apiClient = api;
