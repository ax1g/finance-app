import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import ErrorBoundary from "./ErrorBoundary"
import Sidebar from "./Sidebar"
import MobileNav from "./MobileNav"

export default function Layout() {
  const { isAuth } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background md:h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <MobileNav />
    </div>
  )
}
