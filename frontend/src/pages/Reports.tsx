import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function Reports() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Income vs Expense Statement
          </CardTitle>
          <CardDescription>
            Summary of income and expenses over a period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Reports are not yet implemented — the backend endpoint needs to be
              built first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
