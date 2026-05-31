import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ErrorBoundary from "./components/ErrorBoundary"
import Layout from "./components/Layout"
import LoginPage from "./pages/LoginPage"
import TransactionList from "./pages/TransactionList"
import TransactionCreate from "./pages/TransactionCreate"
import TransactionDetail from "./pages/TransactionDetail"
import AccountList from "./pages/AccountList"
import AccountCreate from "./pages/AccountCreate"
import AccountDetail from "./pages/AccountDetail"

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/transactions" replace />} />
              <Route path="transactions" element={<TransactionList />} />
              <Route path="transactions/new" element={<TransactionCreate />} />
              <Route path="transactions/:txn_id" element={<TransactionDetail />} />
              <Route path="accounts" element={<AccountList />} />
              <Route path="accounts/new" element={<AccountCreate />} />
              <Route path="accounts/:account_id" element={<AccountDetail />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
