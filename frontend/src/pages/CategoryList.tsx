import { useEffect, useState } from "react"
import { fetchCategories, deleteCategory } from "@/api/categories"
import { useDataRefresh } from "@/context/DataRefreshContext"
import { useToast } from "@/context/ToastContext"
import type { CategoryRead } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useModal } from "@/context/ModalContext"
import QuickCategoryModal from "@/components/QuickCategoryModal"
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react"

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

function CategoryCard({
  category,
  editing,
  selected,
  onToggle,
  onEdit,
}: {
  category: CategoryRead
  editing: boolean
  selected: boolean
  onToggle: (id: string) => void
  onEdit: (cat: CategoryRead) => void
}) {
  const meta = TYPE_META[category.type]
  return (
    <div
      className={`relative flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        editing ? "cursor-default" : "hover:bg-accent/50"
      } ${selected ? "border-primary ring-1 ring-primary" : "border-border"}`}
    >
      {editing && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(category.id)}
          className="shrink-0"
        />
      )}
      <button
        type="button"
        onClick={() => editing && onEdit(category)}
        className="flex items-center gap-3 min-w-0 flex-1 text-left"
      >
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${meta.color}`}
        >
          <span className="text-base">{category.icon || "📦"}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{category.name}</p>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>
      </button>
      {editing && (
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function Section({
  title,
  type,
  cats,
  editMode,
  selected,
  deleting,
  onToggleEdit,
  onDelete,
  onToggle,
  onEdit,
}: {
  title: string
  type: "income" | "expense"
  cats: CategoryRead[]
  editMode: "income" | "expense" | null
  selected: Set<string>
  deleting: boolean
  onToggleEdit: (type: "income" | "expense") => void
  onDelete: () => void
  onToggle: (id: string) => void
  onEdit: (cat: CategoryRead) => void
}) {
  const isEditing = editMode === type
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {isEditing && selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-3.5 w-3.5" />
              )}
              Delete {selected.size}
            </Button>
          )}
          <button
            type="button"
            onClick={() => onToggleEdit(type)}
            className={`rounded-md p-1.5 transition-colors ${
              isEditing
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {cats.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No {title.toLowerCase()} categories yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cats.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              editing={isEditing}
              selected={selected.has(c.id)}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryList() {
  const { openModal } = useModal()
  const { version } = useDataRefresh()
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState<"income" | "expense" | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [version.categories, toast])

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  const openCreateModal = () => {
    openModal(
      "new-category-list",
      <QuickCategoryModal onCreated={() => {}} />,
    )
  }

  const openEditModal = (category: CategoryRead) => {
    openModal(
      "edit-category",
      <QuickCategoryModal category={category} onCreated={() => {}} />,
    )
  }

  const toggleEditMode = (type: "income" | "expense") => {
    if (editMode === type) {
      setEditMode(null)
      setSelected(new Set())
    } else {
      setEditMode(type)
      setSelected(new Set())
    }
  }

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    if (!window.confirm(`Delete ${selected.size} categor${selected.size === 1 ? "y" : "ies"}?`)) return
    setDeleting(true)
    const errors: string[] = []
    for (const id of selected) {
      try {
        await deleteCategory(id)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        errors.push(msg)
      }
    }
    setDeleting(false)
    setSelected(new Set())
    setEditMode(null)
    signal("categories")
    if (errors.length > 0) {
      toast({ title: "Error", description: `Failed to delete ${errors.length} categor${errors.length === 1 ? "y" : "ies"}: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ""}`, variant: "destructive" })
    } else {
      toast({ title: `Deleted ${selected.size} categor${selected.size === 1 ? "y" : "ies"}`, variant: "success" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      )}
      {!loading && categories.length === 0 && (
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
      {!loading && categories.length > 0 && (
        <div className="space-y-6">
          <Section
            title="Income"
            type="income"
            cats={incomeCategories}
            editMode={editMode}
            selected={selected}
            deleting={deleting}
            onToggleEdit={toggleEditMode}
            onDelete={handleDeleteSelected}
            onToggle={toggleSelected}
            onEdit={openEditModal}
          />
          <Section
            title="Expense"
            type="expense"
            cats={expenseCategories}
            editMode={editMode}
            selected={selected}
            deleting={deleting}
            onToggleEdit={toggleEditMode}
            onDelete={handleDeleteSelected}
            onToggle={toggleSelected}
            onEdit={openEditModal}
          />
        </div>
      )}
    </div>
  )
}
