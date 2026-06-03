import { useState } from "react"
import { createAccount } from "@/api/accounts"
import { useModal } from "@/context/ModalContext"
import type { AccountRead, AccountType } from "@/types"
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

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "investment", label: "Investment" },
  { value: "receivables", label: "Receivables" },
  { value: "payables", label: "Payables" },
]

interface Props {
  onCreated: (account: AccountRead) => void
}

export default function QuickAccountModal({ onCreated }: Props) {
  const { closeTopModal } = useModal()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    type: "" as AccountType | "",
    opening_balance: "",
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
      const created = await createAccount({
        name: form.name,
        type: form.type as AccountType,
        opening_balance: form.opening_balance || "0",
      })
      onCreated(created)
      closeTopModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-base font-semibold mb-1">New Account</h3>
      <p className="text-sm text-muted-foreground mb-4">Add a new account on the fly</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="quick-acct-name">Name</Label>
          <Input
            id="quick-acct-name"
            placeholder="e.g. Checking Account"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-acct-type">Type</Label>
          <Select
            value={form.type}
            onValueChange={(value) => setForm({ ...form, type: value as AccountType })}
          >
            <SelectTrigger id="quick-acct-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-acct-balance">Opening Balance</Label>
          <Input
            id="quick-acct-balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.opening_balance}
            onChange={(e) => setForm({ ...form, opening_balance: e.target.value })}
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
