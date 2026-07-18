export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  KNOWLEDGE_BASE: "/dashboard/knowledge-base",
  DOCUMENTS: "/dashboard/documents",
  CHAT: "/dashboard/chat",
  AGENTS: "/dashboard/agents",
  EVALUATION: "/dashboard/evaluation",
  ANALYTICS: "/dashboard/analytics",
  INTEGRATIONS: "/dashboard/integrations",
  SETTINGS: "/dashboard/settings",
} as const;

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  DOCUMENTS: {
    LIST: "/documents",
    UPLOAD: "/documents",
    GET: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  COLLECTIONS: {
    LIST: "/knowledge-base",
    CREATE: "/knowledge-base",
    GET: (id: string) => `/knowledge-base/${id}`,
  },
  CHAT: {
    SEND: "/chat",
    CONVERSATIONS: "/chat/conversations",
    CONVERSATION: (id: string) => `/chat/conversations/${id}`,
  },
  AGENTS: {
    LIST: "/agents",
    STATUS: (id: string) => `/agents/${id}/status`,
    WORKFLOW: "/agents/workflow",
  },
  EVALUATION: {
    LIST: "/evaluation",
    CREATE: "/evaluation",
    GET: (id: string) => `/evaluation/${id}`,
    RUN: (id: string) => `/evaluation/${id}/run`,
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    USAGE: "/analytics/usage",
    COST: "/analytics/cost",
    LATENCY: "/analytics/latency",
  },
  INTEGRATIONS: {
    LIST: "/integrations",
    CREATE: "/integrations",
    SYNC: (id: string) => `/integrations/${id}/sync`,
  },
} as const;

export const APP_CONFIG = {
  NAME: "OpsPilot AI",
  VERSION: "0.1.0",
  MAX_UPLOAD_SIZE_MB: 50,
  SUPPORTED_FILE_TYPES: [".pdf", ".docx", ".md", ".csv", ".json", ".png", ".jpg", ".jpeg"],
} as const;
