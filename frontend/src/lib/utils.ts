import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | string, currency?: string): string {
  const v = typeof n === "string" ? parseFloat(n) : n
  const cur = currency || localStorage.getItem("currency") || "USD"
  const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(v)
  const customSymbol = localStorage.getItem("currency_custom_symbol")
  if (customSymbol) {
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).formatToParts(v)
    const stdSymbol = parts.find((p) => p.type === "currency")?.value
    if (stdSymbol) {
      return formatted.replace(stdSymbol, customSymbol)
    }
  }
  return formatted
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = String(h % 12 || 12).padStart(2, "0")
  return `${y}-${m}-${day} ${h12}:${min} ${ampm}`
}
