import type { AuthTokens, ChangePasswordRequest, ForgotPasswordResponse, LoginRequest, ResetPasswordRequest, SignupRequest, UserRead, UserUpdate } from "../types"
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

export async function fetchCurrentUser(): Promise<UserRead> {
  return apiFetch<UserRead>("/user/me")
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  return apiFetch<void>("/user/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  return apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateUser(data: UserUpdate): Promise<UserRead> {
  return apiFetch<UserRead>("/user/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
