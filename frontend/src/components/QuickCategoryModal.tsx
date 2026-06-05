import { useState } from "react"
import { createCategory } from "@/api/categories"
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
  onCreated: (category: CategoryRead) => void
}

export default function QuickCategoryModal({ onCreated }: Props) {
  const { closeTopModal } = useModal()
  const { toast } = useToast()
  const { signal } = useDataRefresh()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    type: "" as CategoryType | "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.type) {
      setError("Name and type are required")
      return
    }
    setSubmitting(true)
    setError("")

    try {
      const created = await createCategory({
        name: form.name,
        type: form.type as CategoryType,
        description: form.description || null,
      })
      signal("categories")
      toast({ title: "Category created", variant: "success" })
      onCreated(created)
      closeTopModal()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create category"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-base font-semibold mb-1">New Category</h3>
      <p className="text-sm text-muted-foreground mb-4">Create a new category on the fly</p>
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
        {error && <p className="text-sm text-destructive">{error}</p>}
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
              "Create"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
