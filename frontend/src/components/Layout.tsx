import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import ErrorBoundary from "./ErrorBoundary"
import Sidebar from "./Sidebar"

export default function Layout() {
  const { isAuth } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
