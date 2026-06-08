import { useState } from "react"
import { useModal } from "@/context/ModalContext"
import QuickAccountModal from "@/components/QuickAccountModal"
import { Button } from "@/components/ui/button"
import {
  Snowflake,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Landmark,
  PiggyBank,
  Check,
  Plus,
} from "lucide-react"

const STORAGE_KEY = "neco_onboarding_done"

export function isOnboardingDone(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true"
}

function markOnboardingDone() {
  localStorage.setItem(STORAGE_KEY, "true")
}

interface Props {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(1)
  const { openModal } = useModal()

  const totalSteps = 3

  const handleDone = () => {
    markOnboardingDone()
    onClose()
  }

  const handleCreateAccount = () => {
    markOnboardingDone()
    onClose()
    openModal("onboarding-create-account", <QuickAccountModal onCreated={() => {}} />)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl animate-fade-in">
        {/* Close skip */}
        <button
          onClick={handleDone}
          className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>

        {/* Content */}
        <div className="px-6 pt-10 pb-4">
          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Snowflake className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome to Neco</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Your personal finance tracker. Add your accounts to see your net worth, track spending, and stay on top of your money.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold">How Transactions Work</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record what you earn and spend. Your balances update automatically.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-income)]/10">
                      <ArrowUpRight className="h-4 w-4 text-[var(--color-income)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Salary</p>
                      <p className="text-xs text-muted-foreground">Apr 01 &middot; Bank Account</p>
                    </div>
                  </div>
                  <span className="font-number text-sm font-semibold text-[var(--color-income)]">
                    +$3,500.00
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-expense)]/10">
                      <ArrowDownRight className="h-4 w-4 text-[var(--color-expense)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Coffee Shop</p>
                      <p className="text-xs text-muted-foreground">Apr 02 &middot; Cash</p>
                    </div>
                  </div>
                  <span className="font-number text-sm font-semibold text-[var(--color-expense)]">
                    -$4.50
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Categorize every transaction and see where your money goes.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Your First Account</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Start tracking. Add your cash-in-hand, bank accounts, or investments.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Banknote className="h-3.5 w-3.5" /> Cash
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Landmark className="h-3.5 w-3.5" /> Bank
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                  <PiggyBank className="h-3.5 w-3.5" /> Investments
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Tip {step} of {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          {step < totalSteps ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleCreateAccount}>
              Create Account <Check className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
