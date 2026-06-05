import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ModalProvider } from "./context/ModalContext"
import { ToastProvider } from "./context/ToastContext"
import ErrorBoundary from "./components/ErrorBoundary"
import ModalRenderer from "./components/ModalRenderer"
import Toaster from "./components/ui/toaster"
import Layout from "./components/Layout"
import { Loader2 } from "lucide-react"

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

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
        <AuthProvider>
          <ModalProvider>
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
                  </Route>
                </Routes>
              </Suspense>
              <ModalRenderer />
              <Toaster />
            </ToastProvider>
          </ModalProvider>
        </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
