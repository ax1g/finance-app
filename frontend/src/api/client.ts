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

  const data = await res.json()

  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail)
    throw new Error(detail || `Request failed: ${res.status}`)
  }

  return data as T
}
