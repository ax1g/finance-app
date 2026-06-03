import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { fetchCategories } from "@/api/categories"
import type { CategoryRead } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useModal } from "@/context/ModalContext"
import QuickCategoryModal from "@/components/QuickCategoryModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Loader2, Plus } from "lucide-react"

const CATEGORY_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
]

export default function CategoryList() {
  const { openModal } = useModal()
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const loadCategories = useCallback(() => {
    setLoading(true)
    setError("")
    fetchCategories(typeFilter !== "all" ? typeFilter : undefined)
      .then((data) => setCategories(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [typeFilter])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const openCreateModal = () => {
    openModal(
      "new-category-list",
      <QuickCategoryModal
        onCreated={() => {
          loadCategories()
        }}
      />,
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Categories</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateModal}
          >
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </div>
        )}
        {error && (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && categories.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No categories yet.{" "}
            <button
              onClick={openCreateModal}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one
            </button>
          </p>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/categories/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      c.type === "expense"
                        ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                        : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
                    }`}
                  >
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{c.name}</p>
                    {c.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  className={
                    c.type === "expense"
                      ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                      : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
                  }
                >
                  {c.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
