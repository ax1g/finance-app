import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

type ThemeMode = "light" | "dark" | "system"

interface ThemeColors {
  income: string
  expense: string
}

interface ThemeContextValue {
  mode: ThemeMode
  resolved: "light" | "dark"
  colors: ThemeColors
  setMode: (mode: ThemeMode) => void
  setColors: (colors: Partial<ThemeColors>) => void
}

const STORAGE_KEY = "fm_theme_mode"
const COLOR_KEY = "fm_theme_colors"

function getStoredMode(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "light" || v === "dark" || v === "system") return v
  } catch {}
  return "system"
}

function getStoredColors(): ThemeColors {
  try {
    const raw = localStorage.getItem(COLOR_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        income: parsed.income || "#16a34a",
        expense: parsed.expense || "#dc2626",
      }
    }
  } catch {}
  return { income: "#16a34a", expense: "#dc2626" }
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return mode
}

function applyTheme(resolved: "light" | "dark", colors: ThemeColors) {
  const root = document.documentElement
  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  root.style.setProperty("--color-income", colors.income)
  root.style.setProperty("--color-expense", colors.expense)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#1a1a1a" : "#fafafa")
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode)
  const [colors, setColorsState] = useState<ThemeColors>(getStoredColors)
  const [resolved, setResolved] = useState<"light" | "dark">(() => resolveMode(getStoredMode()))

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem(STORAGE_KEY, newMode)
    } catch {}
  }, [])

  const setColors = useCallback((partial: Partial<ThemeColors>) => {
    setColorsState((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem(COLOR_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  // Apply theme whenever mode or colors change
  useEffect(() => {
    const r = resolveMode(mode)
    setResolved(r)
    applyTheme(r, colors)
  }, [mode, colors])

  // Listen for OS preference changes in system mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (mode === "system") {
        const r = resolveMode(mode)
        setResolved(r)
        applyTheme(r, colors)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [mode, colors])

  return (
    <ThemeContext.Provider value={{ mode, resolved, colors, setMode, setColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
