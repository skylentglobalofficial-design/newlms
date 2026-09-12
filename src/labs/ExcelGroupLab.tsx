import { useMemo, useState } from 'react'
import LabCompletion from './LabCompletion'

type Sale = { region: string; product: string; amount: number }

const SALES: Sale[] = [
  { region: 'West', product: 'Tea', amount: 120 },
  { region: 'East', product: 'Tea', amount: 80 },
  { region: 'West', product: 'Coffee', amount: 150 },
  { region: 'North', product: 'Tea', amount: 60 },
  { region: 'East', product: 'Coffee', amount: 110 },
  { region: 'North', product: 'Coffee', amount: 90 },
  { region: 'West', product: 'Tea', amount: 70 },
  { region: 'East', product: 'Tea', amount: 40 },
]

type GroupBy = 'region' | 'product'
type Agg = 'sum' | 'count' | 'avg'

export default function ExcelGroupLab() {
  const [groupBy, setGroupBy] = useState<GroupBy>('region')
  const [agg, setAgg] = useState<Agg>('sum')
  const [ran, setRan] = useState(false)

  const grouped = useMemo(() => {
    if (!ran) return [] as { key: string; value: number }[]
    const buckets = new Map<string, number[]>()
    for (const row of SALES) {
      const key = row[groupBy]
      const list = buckets.get(key) ?? []
      list.push(row.amount)
      buckets.set(key, list)
    }
    return Array.from(buckets.entries()).map(([key, amounts]) => {
      if (agg === 'count') return { key, value: amounts.length }
      const sum = amounts.reduce((total, n) => total + n, 0)
      if (agg === 'avg') return { key, value: Math.round((sum / amounts.length) * 10) / 10 }
      return { key, value: sum }
    })
  }, [ran, groupBy, agg])

  const valueLabel = agg === 'count' ? 'COUNT' : agg === 'avg' ? 'AVERAGE of amount' : 'SUM of amount'

  return (
    <div className="sk-lab-work">
      <div>
        <table className="sk-lab-table">
          <caption>Sample sales table — not Microsoft Excel</caption>
          <thead>
            <tr>
              <th>region</th>
              <th>product</th>
              <th>amount</th>
            </tr>
          </thead>
          <tbody>
            {SALES.map((row, index) => (
              <tr key={`${row.region}-${row.product}-${index}`}>
                <td>{row.region}</td>
                <td>{row.product}</td>
                <td>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ran && (
          <>
            <p className="sk-lab-legend">Grouped by {groupBy} · {valueLabel}</p>
            <table className="sk-lab-table">
              <thead>
                <tr>
                  <th>{groupBy}</th>
                  <th>{valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(row => (
                  <tr key={row.key}>
                    <td>{row.key}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="sk-lab-controls">
        <label>
          Group by
          <select
            value={groupBy}
            onChange={event => {
              setGroupBy(event.target.value as GroupBy)
              setRan(false)
            }}
          >
            <option value="region">region</option>
            <option value="product">product</option>
          </select>
        </label>
        <label>
          Aggregation
          <select
            value={agg}
            onChange={event => {
              setAgg(event.target.value as Agg)
              setRan(false)
            }}
          >
            <option value="sum">SUM of amount</option>
            <option value="count">COUNT of rows</option>
            <option value="avg">AVERAGE of amount</option>
          </select>
        </label>

        <div className="sk-lab-actions">
          <button type="button" className="sk-lab-run" onClick={() => setRan(true)}>Run grouping</button>
          <button
            type="button"
            className="sk-lab-reset"
            onClick={() => {
              setRan(false)
              setGroupBy('region')
              setAgg('sum')
            }}
          >
            Reset
          </button>
        </div>

        <div className="sk-lab-metrics" aria-live="polite">
          {ran ? (
            <p>
              {grouped.length} group{grouped.length === 1 ? '' : 's'}. This groups a sample table in your browser
              — it is not Microsoft Excel or a spreadsheet file.
            </p>
          ) : (
            <p>Pick a column to group by and an aggregation, then run. The original rows stay visible so you can check the totals.</p>
          )}
        </div>

        <LabCompletion labId="excel-group" enabled={ran} />
      </div>
    </div>
  )
}
