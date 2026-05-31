import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n
  return v.toLocaleString("en-US", { minimumFractionDigits: 2 })
}
