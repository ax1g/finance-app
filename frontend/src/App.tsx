import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ModalProvider } from "./context/ModalContext"
import { ToastProvider } from "./context/ToastContext"
import { DataRefreshProvider } from "./context/DataRefreshContext"
import ErrorBoundary from "./components/ErrorBoundary"
import ModalRenderer from "./components/ModalRenderer"
import Toaster from "./components/ui/toaster"
import Layout from "./components/Layout"
import StartupScreen from "./components/StartupScreen"
import { Loader2 } from "lucide-react"
import { checkHealth } from "./api/health"

const LoginPage = lazy(() => import("./pages/LoginPage"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const TransactionList = lazy(() => import("./pages/TransactionList"))
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"))
const AccountList = lazy(() => import("./pages/AccountList"))
const AccountCreate = lazy(() => import("./pages/AccountCreate"))
const AccountDetail = lazy(() => import("./pages/AccountDetail"))
const CategoryList = lazy(() => import("./pages/CategoryList"))
const CategoryCreate = lazy(() => import("./pages/CategoryCreate"))
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"))
const Reports = lazy(() => import("./pages/Reports"))
const CalendarView = lazy(() => import("./pages/CalendarView"))
const Settings = lazy(() => import("./pages/Settings"))
const NotFound = lazy(() => import("./pages/NotFound"))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

function BackendGate({ children }: { children: ReactNode }) {
  const { isAuth } = useAuth()
  const readyRef = useRef(false)
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    if (!isAuth) {
      setShowGate(false)
      return
    }
    if (readyRef.current) {
      setShowGate(false)
      return
    }
    setShowGate(true)
    let cancelled = false
    const poll = async () => {
      while (!cancelled) {
        const ok = await checkHealth()
        if (ok) {
          if (!cancelled) {
            readyRef.current = true
            setShowGate(false)
          }
          return
        }
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    poll()
    return () => { cancelled = true }
  }, [isAuth])

  if (showGate) return <StartupScreen />
  return <>{children}</>
}

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
        <AuthProvider>
          <BackendGate>
          <ModalProvider>
            <DataRefreshProvider>
              <ToastProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<TransactionList />} />
                    <Route path="transactions/:txn_id" element={<TransactionDetail />} />
                    <Route path="accounts" element={<AccountList />} />
                    <Route path="accounts/new" element={<AccountCreate />} />
                    <Route path="accounts/:account_id" element={<AccountDetail />} />
                    <Route path="categories" element={<CategoryList />} />
                    <Route path="categories/new" element={<CategoryCreate />} />
                    <Route path="categories/:category_id" element={<CategoryDetail />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
              <ModalRenderer />
              <Toaster />
            </ToastProvider>
            </DataRefreshProvider>
          </ModalProvider>
          </BackendGate>
        </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
