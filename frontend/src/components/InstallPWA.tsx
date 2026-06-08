import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

let deferredPrompt: Event | null = null

export default function InstallPWA() {
  const [installable, setInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      setInstallable(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as any).prompt()
    await (deferredPrompt as any).userChoice
    deferredPrompt = null
    setInstallable(false)
  }

  if (!installable) return null

  return (
    <Button variant="outline" onClick={handleInstall} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Install Neco
    </Button>
  )
}
