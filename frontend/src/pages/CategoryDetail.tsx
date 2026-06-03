import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  fetchCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories"
import type { CategoryRead, CategoryType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tag,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"

export default function CategoryDetail() {
  const { category_id } = useParams<{ category_id: string }>()
  const navigate = useNavigate()

  const [category, setCategory] = useState<CategoryRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    type: "" as CategoryType | "",
    description: "",
  })

  useEffect(() => {
    if (!category_id) return
    let cancelled = false

    fetchCategory(category_id)
      .then((data) => {
        if (cancelled) return
        setCategory(data)
        setEditForm({
          name: data.name,
          type: data.type,
          description: data.description || "",
        })
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
  }, [category_id])

  const handleDelete = async () => {
    if (!category_id || !window.confirm("Delete this category?")) return
    setDeleting(true)
    try {
      await deleteCategory(category_id)
      navigate("/categories", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!category_id || !editForm.name || !editForm.type) return
    setSaving(true)
    setError("")
    try {
      const updated = await updateCategory(category_id, {
        name: editForm.name,
        type: editForm.type as CategoryType,
        description: editForm.description || null,
      })
      setCategory(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    )
  }
  if (error && !category)
    return (
      <p className="py-8 text-center text-sm text-destructive">{error}</p>
    )
  if (!category)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Category not found.
      </p>
    )

  if (editing) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Edit Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      type: value as CategoryType,
                    })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{category.name}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-4 w-4" />
                )}
                {deleting ? "" : "Delete"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                category.type === "expense"
                  ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                  : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
              }`}
            >
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <Badge
                className={`mb-1 capitalize ${
                  category.type === "expense"
                    ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                    : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
                }`}
              >
                {category.type}
              </Badge>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
