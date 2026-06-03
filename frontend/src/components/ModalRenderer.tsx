import { useState, useRef, useCallback, type MouseEvent } from "react"
import { useModal } from "@/context/ModalContext"
import { GripHorizontal, X } from "lucide-react"

const modalStyleId = "__modal_keyframes"
if (typeof document !== "undefined" && !document.getElementById(modalStyleId)) {
  const style = document.createElement("style")
  style.id = modalStyleId
  style.textContent = `
    @keyframes fm-modal-in {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fm-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

interface Point {
  x: number
  y: number
}

export default function ModalRenderer() {
  const { stack, closeModal } = useModal()
  const offsets = useRef<Map<string, Point>>(new Map())
  const dragging = useRef<{
    id: string
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const [, forceRender] = useState(0)

  const onMouseDown = useCallback((e: MouseEvent, id: string) => {
    e.preventDefault()
    const current = offsets.current.get(id) ?? { x: 0, y: 0 }
    dragging.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: current.x,
      offsetY: current.y,
    }
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const d = dragging.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    offsets.current.set(d.id, { x: d.offsetX + dx, y: d.offsetY + dy })
    forceRender((n) => n + 1)
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = null
  }, [])

  if (stack.length === 0) return null

  return (
    <div onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {stack.map((modal, index) => {
        const offset = offsets.current.get(modal.id) ?? { x: 0, y: 0 }

        return (
          <div key={modal.id}>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              style={{ animation: "fm-backdrop-in 0.15s ease-out" }}
              onClick={() => closeModal(modal.id)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
                style={{
                  zIndex: 50 + index,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              >
                <div
                  onMouseDown={(e) => onMouseDown(e, modal.id)}
                  className="flex items-center justify-center h-9 border-b border-border cursor-grab active:cursor-grabbing select-none rounded-t-xl bg-muted/30"
                >
                  <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeModal(modal.id)
                  }}
                  className="absolute right-3 top-[10px] rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                {modal.component}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
