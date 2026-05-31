import type { CategoryRead } from "../types"
import { apiFetch } from "./client"

export async function fetchCategories(): Promise<CategoryRead[]> {
  return apiFetch<CategoryRead[]>("/categories/")
}
