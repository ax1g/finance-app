import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type EntityType = "transactions" | "accounts" | "categories"

interface DataRefreshContextValue {
  signal: (entity: EntityType) => void
  version: Record<EntityType, number>
}

const DataRefreshContext = createContext<DataRefreshContextValue | null>(null)

export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const [txnRev, setTxnRev] = useState(0)
  const [acctRev, setAcctRev] = useState(0)
  const [catRev, setCatRev] = useState(0)

  const signal = useCallback((entity: EntityType) => {
    if (entity === "transactions") setTxnRev((v) => v + 1)
    else if (entity === "accounts") setAcctRev((v) => v + 1)
    else setCatRev((v) => v + 1)
  }, [])

  const version: Record<EntityType, number> = {
    transactions: txnRev,
    accounts: acctRev,
    categories: catRev,
  }

  return (
    <DataRefreshContext.Provider value={{ signal, version }}>
      {children}
    </DataRefreshContext.Provider>
  )
}

export function useDataRefresh(): DataRefreshContextValue {
  const ctx = useContext(DataRefreshContext)
  if (!ctx) throw new Error("useDataRefresh must be used within DataRefreshProvider")
  return ctx
}
