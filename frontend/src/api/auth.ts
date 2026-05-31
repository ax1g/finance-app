import type { AuthTokens, LoginRequest, SignupRequest, UserRead } from "../types"
import { apiFetch, setTokens } from "./client"

export async function login(data: LoginRequest): Promise<AuthTokens> {
  const body = new URLSearchParams()
  body.set("username", data.username)
  body.set("password", data.password)

  const tokens = await apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  setTokens(tokens)
  return tokens
}

export async function signup(data: SignupRequest): Promise<UserRead> {
  return apiFetch<UserRead>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
