import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "./Sidebar"

export default function Layout() {
  const { isAuth } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
