import { useToast, type ToastInfo } from "@/context/ToastContext"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast"
import { useState, useCallback, useEffect } from "react"

const STYLE_ID = "__toaster_keyframes"
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    @keyframes toast-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes toast-out {
      from { transform: translateX(0); opacity: 1; }
      to   { transform: translateX(100%); opacity: 0; }
    }
  `
  document.head.appendChild(style)
}

function ToastItem({ info }: { info: ToastInfo }) {
  const { dismiss } = useToast()
  const [open, setOpen] = useState(true)
  const [removing, setRemoving] = useState(false)

  const handleClose = useCallback(() => {
    setOpen(false)
    setRemoving(true)
    setTimeout(() => dismiss(info.id), 200)
  }, [info.id, dismiss])

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false)
      setRemoving(true)
      setTimeout(() => dismiss(info.id), 200)
    }, 5000)
    return () => clearTimeout(timer)
  }, [info.id, dismiss])

  return (
    <div
      style={{
        animation: removing
          ? "toast-out 0.2s ease-in forwards"
          : "toast-in 0.3s ease-out",
      }}
    >
      <Toast
        variant={info.variant}
        open={open}
        onOpenChange={(o) => {
          if (!o) handleClose()
        }}
      >
        <div className="grid gap-1">
          {info.title && <ToastTitle>{info.title}</ToastTitle>}
          {info.description && (
            <ToastDescription>{info.description}</ToastDescription>
          )}
        </div>
        <ToastClose />
      </Toast>
    </div>
  )
}

export default function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <ToastItem key={t.id} info={t} />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
