import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(): string {
  const customSymbol = localStorage.getItem("currency_custom_symbol")
  if (customSymbol) return customSymbol
  const currency = localStorage.getItem("currency") || "USD"
  const parts = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).formatToParts(0)
  return parts.find((p) => p.type === "currency")?.value || currency
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatDate(iso: string): string {
  const d = new Date(iso)
  const mon = MONTHS[d.getMonth()]
  const day = String(d.getDate()).padStart(2, "0")
  const y = d.getFullYear()
  const h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = String(h % 12 || 12).padStart(2, "0")
  return `${mon} ${day}, ${y} ${h12}:${min} ${ampm}`
}

export function toLocalDatetime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${d} ${h}:${min}`
}

export function parseLocalDatetime(str: string): string {
  const d = new Date(str)
  return d.toISOString()
}
