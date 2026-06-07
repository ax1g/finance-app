/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
>

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
  active,
  payload,
}: {
  active?: boolean
  payload?: { color?: string; value?: string | number; name?: string }[]
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          {entry.color && (
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          )}
          <span className="font-number font-medium">{entry.value as number}</span>
        </div>
      ))}
    </div>
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
