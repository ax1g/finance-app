import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchCategories } from "@/api/categories"
import { useDataRefresh } from "@/context/DataRefreshContext"
import type { CategoryRead } from "@/types"
import { Button } from "@/components/ui/button"
import { useModal } from "@/context/ModalContext"
import QuickCategoryModal from "@/components/QuickCategoryModal"
import { Loader2, Plus, LayoutGrid, List } from "lucide-react"

const TYPE_META: Record<string, { label: string; color: string }> = {
  income: {
    label: "Income",
    color: "bg-[var(--color-income)]/10 text-[var(--color-income)]",
  },
  expense: {
    label: "Expense",
    color: "bg-[var(--color-expense)]/10 text-[var(--color-expense)]",
  },
}

function CategoryCard({ category }: { category: CategoryRead }) {
  const meta = TYPE_META[category.type]
  return (
    <Link
      to={`/categories/${category.id}`}
      className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-accent/50"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.color}`}
      >
        <span className="text-base">{category.icon || "📦"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none">{category.name}</p>
        {category.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  )
}

function CategorySection({
  title,
  categories,
}: {
  title: string
  categories: CategoryRead[]
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {categories.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No {title.toLowerCase()} categories yet.
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionGrid({
  title,
  categories,
}: {
  title: string
  categories: CategoryRead[]
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {categories.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No {title.toLowerCase()} categories yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryList() {
  const { openModal } = useModal()
  const { version } = useDataRefresh()
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError("")
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [version.categories])

  const openCreateModal = () => {
    openModal(
      "new-category-list",
      <QuickCategoryModal
        onCreated={(_category) => {}}
      />,
    )
  }

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-l-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-r-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

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
        <div className="space-y-6">
          {viewMode === "grid" ? (
            <>
              <SectionGrid
                title="Income"
                categories={incomeCategories}
              />
              <SectionGrid
                title="Expense"
                categories={expenseCategories}
              />
            </>
          ) : (
            <>
              <CategorySection
                title="Income"
                categories={incomeCategories}
              />
              <CategorySection
                title="Expense"
                categories={expenseCategories}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
