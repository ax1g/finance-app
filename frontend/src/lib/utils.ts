import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n
  return v.toLocaleString("en-US", { minimumFractionDigits: 2 })
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
