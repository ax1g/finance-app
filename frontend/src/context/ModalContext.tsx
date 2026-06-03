import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface ModalInstance {
  id: string
  component: ReactNode
}

interface ModalContextValue {
  openModal: (id: string, component: ReactNode) => void
  closeModal: (id: string) => void
  closeTopModal: () => void
  stack: ModalInstance[]
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalInstance[]>([])

  const openModal = useCallback((id: string, component: ReactNode) => {
    setStack((prev) => [...prev, { id, component }])
  }, [])

  const closeModal = useCallback((id: string) => {
    setStack((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const closeTopModal = useCallback(() => {
    setStack((prev) => prev.slice(0, -1))
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeTopModal, stack }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("useModal must be used within ModalProvider")
  return ctx
}
