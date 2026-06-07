import type { AuthTokens } from "../types"

const API_BASE = "/api/v1"

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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
    return undefined as T
  }

  if (res.status === 401) {
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

  return data as T
}
