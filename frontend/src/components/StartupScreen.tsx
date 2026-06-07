import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function StartupScreen() {
  useEffect(() => {
    document.title = "Neco — Starting up"
    return () => { document.title = "Neco" }
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">Neco</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Starting up…</span>
      </div>
    </div>
  )
}
