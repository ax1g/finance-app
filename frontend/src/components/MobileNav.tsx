import { NavLink } from "react-router-dom"
import { useModal } from "@/context/ModalContext"
import TransactionFormModal from "@/components/TransactionFormModal"
import {
  LayoutGrid,
  History,
  Plus,
  BarChart3,
  Ellipsis,
  Landmark,
  Tag,
  Calendar,
  Settings as SettingsIcon,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
    isActive
      ? "text-foreground"
      : "text-muted-foreground"
  }`

const links = [
  { to: "/", icon: LayoutGrid, label: "Home", end: true },
  { to: "/accounts", icon: Landmark, label: "Accounts", end: true },
  { to: "/reports", icon: BarChart3, label: "Reports", end: true },
]

const moreItems = [
  { to: "/transactions", icon: History, label: "Transactions" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
]

export default function MobileNav() {
  const { openModal } = useModal()
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [moreOpen])

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 items-center border-t border-border bg-card pb-safe md:hidden">
        {links.slice(0, 2).map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-0.5 ${isActive ? "text-foreground" : ""}`}>
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => openModal("new-transaction", <TransactionFormModal />)}
          className="flex size-11 items-center justify-center justify-self-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground shadow-lg shadow-primary/40 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>

        {links.slice(2).map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-0.5 ${isActive ? "text-foreground" : ""}`}>
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        <div ref={menuRef} className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              moreOpen ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Ellipsis className="h-5 w-5" />
            <span>More</span>
          </button>

          {moreOpen && (
            <div className="absolute bottom-full right-0 mb-3 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl">
              {moreItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
