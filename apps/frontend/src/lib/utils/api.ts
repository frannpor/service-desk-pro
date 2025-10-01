import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`
  }

  return headers
}

interface FetchConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

export async function fetchWithConfig(url: string, config: FetchConfig = {}): Promise<Response> {
  const { timeout = 30000, retries = 3, retryDelay = 1000, ...fetchOptions } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error as Error

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  clearTimeout(timeoutId)
  throw lastError || new Error("Request failed after retries")
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.message || `API Error: ${response.statusText}`, response.status, errorData)
  }

  return response.json()
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = await getAuthHeaders()

  const response = await fetchWithConfig(url, {
    headers: {
      ...headers,
      ...options.headers,
    },
    ...options,
  })

  return handleApiResponse<T>(response)
}
