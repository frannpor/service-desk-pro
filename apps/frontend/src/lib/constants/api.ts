// API Endpoints configuration for ServiceDesk Pro
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  // Tickets
  TICKETS: {
    LIST: "/tickets",
    CREATE: "/tickets",
    DETAIL: (id: string) => `/tickets/${id}`,
    UPDATE: (id: string) => `/tickets/${id}`,
    COMMENT: (id: string) => `/tickets/${id}/comments`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
    CREATE: "/categories",
    DETAIL: (id: string) => `/categories/${id}`,
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    METRICS: "/dashboard/metrics",
    TRENDS: "/dashboard/trends",
    CATEGORIES: "/dashboard/categories",
    AGENTS: "/dashboard/agents",
  },

  // Users
  USERS: {
    LIST: "/users",
  },
} as const

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  TIMEOUT: 30000,
  RETRIES: 3,
  RETRY_DELAY: 1000,
} as const

export const QUERY_STALE_TIME = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const

export const QUERY_GC_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 10 * 60 * 1000, // 10 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const
