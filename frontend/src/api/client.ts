import type { AuthTokens } from "../types"

const API_BASE = "/api/v1"

const responseCache = new Map<string, unknown>()

function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem("auth_tokens")
    if (!raw) return null
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem("auth_tokens")
}

export function isAuthenticated(): boolean {
  return !!getTokens()
}

function cacheKey(path: string, options: RequestInit): string {
  return `${options.method || "GET"}:${path}`
}

function clearCache(): void {
  responseCache.clear()
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const key = cacheKey(path, options)
  const isMutation = options.method && options.method !== "GET"
  if (isMutation) {
    responseCache.delete(key)
    responseCache.delete(`GET:${path}`)
  }

  const tokens = getTokens()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }

  if (tokens?.access_token) {
    headers["Authorization"] = `Bearer ${tokens.access_token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 204) {
    responseCache.delete(key)
    return undefined as T
  }

  if (res.status === 304) {
    const cached = responseCache.get(key)
    if (cached !== undefined) {
      return cached as T
    }
    const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" })
    return processResponse<T>(retryRes, key)
  }

  if (res.status === 401) {
    responseCache.clear()
    clearTokens()
    window.dispatchEvent(new CustomEvent("auth:unauthorized"))
    try {
      const body = await res.json()
      const detail =
        typeof body?.detail === "string"
          ? body.detail
          : "Session expired. Please log in again."
      throw new Error(detail)
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error("Session expired. Please log in again.")
      }
      throw e
    }
  }

  return processResponse<T>(res, key)
}

async function processResponse<T>(res: Response, key: string): Promise<T> {
  const text = await res.text()
  if (!text) {
    throw new Error(`Request failed: ${res.status}`)
  }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Request failed: ${res.status}`)
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? typeof (data as Record<string, unknown>).detail === "string"
          ? (data as Record<string, unknown>).detail as string
          : JSON.stringify((data as Record<string, unknown>).detail)
        : `Request failed: ${res.status}`
    throw new Error(detail)
  }

  responseCache.set(key, data)
  return data as T
}
