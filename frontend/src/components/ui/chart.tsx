/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
>

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={id}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={id} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id?: string; config: ChartConfig }) {
  const colorKeys = Object.entries(config)
    .filter(([, v]) => v.color)
    .map(([k, v]) => ({ key: k, ...v }))

  if (!colorKeys.length || !id) return null

  const css = colorKeys
    .map(
      (entry) =>
        `#${id} {--color-${entry.key}: ${entry.color}};`
    )
    .join("\n")

  return <style>{css}</style>
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  indicator?: "dot" | "line" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: string
  labelFormatter?: (value: string) => string
  formatter?: (value: number) => string
  color?: string
  nameKey?: string
  labelKey?: string
}) {
  const { config } = useChart()

  return (
    <RechartsPrimitive.DefaultTooltipContent
      className={cn(
        "rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md",
        className
      )}
    />
  )
}

function ChartLegend({ className, ...props }: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
  return (
    <RechartsPrimitive.Legend
      data-slot="chart-legend"
      className={cn("flex flex-wrap gap-4 [&>*]:flex [&>*]:items-center [&>*]:gap-1", className)}
      {...props}
    />
  )
}

const ChartLegendContent = RechartsPrimitive.Legend

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
}
