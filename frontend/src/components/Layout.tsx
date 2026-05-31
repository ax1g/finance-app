import { NavLink, Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Layout() {
  const { isAuth, logout } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <nav style={{ display: "flex", gap: 16 }}>
          <NavLink
            to="/transactions"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-h)",
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
            })}
          >
            Transactions
          </NavLink>
          <NavLink
            to="/transactions/new"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-h)",
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
            })}
          >
            + New
          </NavLink>
        </nav>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "6px 14px",
            cursor: "pointer",
            color: "var(--text-h)",
            fontSize: 14,
          }}
        >
          Logout
        </button>
      </header>
      <main style={{ padding: "24px 0" }}>
        <Outlet />
      </main>
    </div>
  )
}
