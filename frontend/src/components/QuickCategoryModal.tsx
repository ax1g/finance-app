import { useState } from "react"
import { createCategory, updateCategory } from "@/api/categories"
import { useModal } from "@/context/ModalContext"
import { useToast } from "@/context/ToastContext"
import { useDataRefresh } from "@/context/DataRefreshContext"
import type { CategoryRead, CategoryType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Props {
  onCreated?: (category: CategoryRead) => void
  category?: CategoryRead | null
}

export default function QuickCategoryModal({ onCreated, category }: Props) {
  const { closeTopModal } = useModal()
  const { toast } = useToast()
  const { signal } = useDataRefresh()
  const isEditing = !!category
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: category?.name ?? "",
    type: (category?.type ?? "") as CategoryType | "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.type) {
      toast({ title: "Error", description: "Name and type are required", variant: "destructive" })
      return
    }
    setSubmitting(true)

    try {
      if (isEditing && category) {
        const updated = await updateCategory(category.id, {
          name: form.name,
          type: form.type as CategoryType,
          description: form.description || null,
          icon: form.icon || null,
        })
        signal("categories")
        toast({ title: "Category updated", variant: "success" })
        onCreated?.(updated)
      } else {
        const created = await createCategory({
          name: form.name,
          type: form.type as CategoryType,
          description: form.description || null,
          icon: form.icon || null,
        })
        signal("categories")
        toast({ title: "Category created", variant: "success" })
        onCreated?.(created)
      }
      closeTopModal()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save category"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-base font-semibold mb-1">
        {isEditing ? "Edit Category" : "New Category"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isEditing ? "Update this category" : "Create a new category on the fly"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="quick-cat-name">Name</Label>
          <Input
            id="quick-cat-name"
            placeholder="e.g. Groceries"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-cat-type">Type</Label>
          <Select
            value={form.type}
            onValueChange={(value) => setForm({ ...form, type: value as CategoryType })}
          >
            <SelectTrigger id="quick-cat-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-cat-desc">Description</Label>
          <Input
            id="quick-cat-desc"
            placeholder="Optional description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-cat-icon">Icon</Label>
          <div className="flex items-center gap-2">
            <Input
              id="quick-cat-icon"
              placeholder="Type or paste any emoji"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="flex-1"
            />
            {form.icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-lg">
                {form.icon}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={closeTopModal}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? "Save Changes" : "Create"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
