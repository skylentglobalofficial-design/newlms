import type { LabChartSpec } from "../../lib/labs-api"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function shortLabel(label: string): string {
  const match = label.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) return label
  const month = MONTHS[Number(match[2]) - 1]
  if (!month) return label
  return match[3] ? `${Number(match[3])} ${month}` : month
}

function formatAxis(value: number, currency: boolean): string {
  const prefix = currency ? "₹" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const scaled = value / 1_000_000
    return `${prefix}${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}M`
  }
  if (abs >= 1000) {
    const scaled = value / 1000
    return `${prefix}${Number.isInteger(scaled) ? scaled : scaled.toFixed(0)}k`
  }
  return `${prefix}${value.toLocaleString("en-US")}`
}

function BarChart({ chart }: { chart: LabChartSpec }) {
  return (
    <div className="lab-bars" role="img" aria-hidden="true">
      {chart.series.map((point) => {
        const width = chart.axisMax > 0 ? Math.max(0, Math.min(100, (point.y / chart.axisMax) * 100)) : 0
        return (
          <div className="lab-bar-row" key={point.label}>
            <span className="lab-bar-label">{point.label}</span>
            <div className="lab-bar-track">
              <div className="lab-bar-fill" style={{ width: `${width}%` }} />
            </div>
            <span className="lab-bar-value">{point.formatted}</span>
          </div>
        )
      })}
      <div className="lab-bar-axis">
        <span>{formatAxis(0, chart.yIsCurrency)}</span>
        <span>{formatAxis(chart.axisMax, chart.yIsCurrency)}</span>
      </div>
    </div>
  )
}

function PlotChart({ chart }: { chart: LabChartSpec }) {
  const width = 320
  const height = 180
  const padL = 44
  const padR = 12
  const padT = 10
  const padB = 28
  const plotW = width - padL - padR
  const plotH = height - padT - padB
  const xMax = chart.xAxisMax || 1
  const yMax = chart.axisMax || 1
  const xOf = (x: number) => padL + (x / xMax) * plotW
  const yOf = (y: number) => padT + plotH - (y / yMax) * plotH
  const points = chart.series.map((point) => `${xOf(point.x).toFixed(1)},${yOf(point.y).toFixed(1)}`).join(" ")
  const yTicks = [0, yMax / 2, yMax]

  return (
    <svg className="lab-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      {yTicks.map((tick) => {
        const y = yOf(tick)
        return (
          <g key={tick}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} className="lab-plot-grid" />
            <text x={padL - 6} y={y + 3} className="lab-plot-axis" textAnchor="end">
              {formatAxis(tick, chart.yIsCurrency)}
            </text>
          </g>
        )
      })}
      <line x1={padL} x2={padL} y1={padT} y2={height - padB} className="lab-plot-spine" />
      <line x1={padL} x2={width - padR} y1={height - padB} y2={height - padB} className="lab-plot-spine" />
      {chart.type === "line" ? <polyline fill="none" points={points} className="lab-plot-line" /> : null}
      {chart.series.map((point, index) => (
        <circle
          key={`${point.label}-${index}`}
          cx={xOf(point.x)}
          cy={yOf(point.y)}
          r={chart.type === "scatter" ? 3.5 : 2.75}
          className="lab-plot-dot"
        />
      ))}
      {chart.series.map((point, index) => {
        const show = chart.series.length <= 8 || index === 0 || index === chart.series.length - 1 || index === Math.floor(chart.series.length / 2)
        if (!show) return null
        return (
          <text key={`x-${index}`} x={xOf(point.x)} y={height - 8} className="lab-plot-axis" textAnchor="middle">
            {shortLabel(point.label)}
          </text>
        )
      })}
    </svg>
  )
}

export default function LabSqlChart({ chart }: { chart: LabChartSpec }) {
  const count = chart.series.length
  const seriesText = chart.series.map((point) => `${point.label} ${point.formatted}`).join("; ")
  const summary = `${chart.title}. ${count} ${chart.groupNoun}. Highest: ${chart.highestLabel}, ${chart.highestFormatted}. ${seriesText}.`
  return (
    <figure className="lab-chart" aria-label={summary}>
      <figcaption className="lab-chart-title">{chart.title}</figcaption>
      <p className="lab-chart-summary">
        {count} {chart.groupNoun}
        <br />
        Highest: {chart.highestLabel}
        <br />
        {chart.highestFormatted}
      </p>
      {chart.type === "bar" ? <BarChart chart={chart} /> : <PlotChart chart={chart} />}
    </figure>
  )
}
