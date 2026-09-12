import { useMemo, useState } from 'react'
import LabCompletion from './LabCompletion'

type Row = { name: string; city: string; score: number }

const STUDENTS: Row[] = [
  { name: 'Asha', city: 'Pune', score: 82 },
  { name: 'Rahul', city: 'Delhi', score: 64 },
  { name: 'Meera', city: 'Pune', score: 91 },
  { name: 'Ibrahim', city: 'Bengaluru', score: 73 },
  { name: 'Noor', city: 'Delhi', score: 55 },
  { name: 'Kabir', city: 'Bengaluru', score: 88 },
  { name: 'Zara', city: 'Pune', score: 47 },
  { name: 'Anika', city: 'Delhi', score: 79 },
]

const CITIES = ['all', 'Pune', 'Delhi', 'Bengaluru'] as const

export default function PythonFilterLab() {
  const [minScore, setMinScore] = useState(70)
  const [city, setCity] = useState<(typeof CITIES)[number]>('all')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => {
    if (!ran) return [] as Row[]
    return STUDENTS.filter(row => row.score >= minScore && (city === 'all' || row.city === city))
  }, [ran, minScore, city])

  const snippet =
    city === 'all'
      ? `[row for row in students if row['score'] >= ${minScore}]`
      : `[row for row in students if row['score'] >= ${minScore} and row['city'] == '${city}']`

  return (
    <div className="sk-lab-work">
      <div>
        <table className="sk-lab-table">
          <caption>Sample records (not a live dataset)</caption>
          <thead>
            <tr>
              <th>name</th>
              <th>city</th>
              <th>score</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map(row => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.city}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ran && (
          <>
            <p className="sk-lab-legend">Filtered result · {result.length} of {STUDENTS.length} rows</p>
            <table className="sk-lab-table">
              <thead>
                <tr>
                  <th>name</th>
                  <th>city</th>
                  <th>score</th>
                </tr>
              </thead>
              <tbody>
                {result.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No rows matched.</td>
                  </tr>
                ) : (
                  result.map(row => (
                    <tr key={`out-${row.name}`}>
                      <td>{row.name}</td>
                      <td>{row.city}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <pre className="sk-lab-code">{snippet}</pre>
          </>
        )}
      </div>

      <div className="sk-lab-controls">
        <label>
          Minimum score
          <input
            type="range"
            min={40}
            max={95}
            value={minScore}
            onChange={event => {
              setMinScore(Number(event.target.value))
              setRan(false)
            }}
          />
          <em>{minScore}</em>
        </label>
        <label>
          City
          <select
            value={city}
            onChange={event => {
              setCity(event.target.value as (typeof CITIES)[number])
              setRan(false)
            }}
          >
            {CITIES.map(item => (
              <option key={item} value={item}>{item === 'all' ? 'Any city' : item}</option>
            ))}
          </select>
        </label>

        <div className="sk-lab-actions">
          <button type="button" className="sk-lab-run" onClick={() => setRan(true)}>Run filter</button>
          <button
            type="button"
            className="sk-lab-reset"
            onClick={() => {
              setRan(false)
              setMinScore(70)
              setCity('all')
            }}
          >
            Reset
          </button>
        </div>

        <div className="sk-lab-metrics" aria-live="polite">
          {ran ? (
            <p>
              {result.length} row{result.length === 1 ? '' : 's'} matched. This is a structured exercise in your
              browser — not a Python interpreter, and nothing is executed on a server.
            </p>
          ) : (
            <p>Set a score and city, then run. The list comprehension is shown so you can compare the idea — it is not executed as Python.</p>
          )}
        </div>

        <LabCompletion labId="python-filter" enabled={ran} />
      </div>
    </div>
  )
}
