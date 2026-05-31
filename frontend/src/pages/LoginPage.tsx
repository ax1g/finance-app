import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const { login, signup, isAuth } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (isAuth) {
    navigate("/transactions", { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (mode === "signup") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match")
          return
        }
        await signup({
          username: form.username,
          email: form.email,
          password: form.password,
        })
        setMode("login")
        setForm({ username: form.username, email: "", password: "", confirmPassword: "" })
      } else {
        await login({ username: form.username, password: form.password })
        navigate("/transactions", { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h2>{mode === "login" ? "Sign In" : "Create Account"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}
      >
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 16 }}
        />
        {mode === "signup" && (
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 16 }}
          />
        )}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 16 }}
        />
        {mode === "signup" && (
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 16 }}
          />
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {error && (
          <p style={{ color: "#e53e3e", fontSize: 14, margin: 0 }}>{error}</p>
        )}
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => { setMode("signup"); setError("") }}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 14, textDecoration: "underline" }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => { setMode("login"); setError("") }}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 14, textDecoration: "underline" }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
