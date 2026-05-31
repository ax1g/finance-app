import type { CategoryRead, CategoryCreate, CategoryUpdate } from "../types"
import { apiFetch } from "./client"

export async function fetchCategories(
  categoryType?: string,
): Promise<CategoryRead[]> {
  const params = categoryType ? `?category_type=${categoryType}` : ""
  return apiFetch<CategoryRead[]>(`/categories/${params}`)
}

export async function fetchCategory(id: string): Promise<CategoryRead> {
  return apiFetch<CategoryRead>(`/categories/${id}`)
}

export async function createCategory(
  data: CategoryCreate,
): Promise<CategoryRead> {
  return apiFetch<CategoryRead>("/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCategory(
  id: string,
  data: CategoryUpdate,
): Promise<CategoryRead> {
  return apiFetch<CategoryRead>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(`/categories/${id}`, { method: "DELETE" })
}
