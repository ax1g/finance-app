import { Component, type ReactNode, type ErrorInfo } from "react"
import { Button } from "./ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear()
              window.location.href = "/"
            }}
          >
            Reset & Reload
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
