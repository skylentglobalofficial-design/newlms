import { useMemo, useState } from 'react'
import LabCompletion from './LabCompletion'

type Staff = { name: string; dept: string; salary: number }

const STAFF: Staff[] = [
  { name: 'Priya Nair', dept: 'Engineering', salary: 92000 },
  { name: 'Arjun Shah', dept: 'Sales', salary: 71000 },
  { name: 'Leela Iyer', dept: 'Engineering', salary: 88000 },
  { name: 'Omar Khan', dept: 'Operations', salary: 64000 },
  { name: 'Nina Bose', dept: 'Sales', salary: 76000 },
  { name: 'Dev Patel', dept: 'Engineering', salary: 101000 },
  { name: 'Sana Ali', dept: 'Operations', salary: 69000 },
]

const DEPTS = ['all', 'Engineering', 'Sales', 'Operations'] as const
const ORDERS = ['salary_desc', 'salary_asc', 'name_asc'] as const

export default function SqlFilterLab() {
  const [dept, setDept] = useState<(typeof DEPTS)[number]>('Engineering')
  const [order, setOrder] = useState<(typeof ORDERS)[number]>('salary_desc')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => {
    if (!ran) return [] as Staff[]
    const filtered = STAFF.filter(row => dept === 'all' || row.dept === dept)
    const sorted = [...filtered]
    if (order === 'salary_desc') sorted.sort((a, b) => b.salary - a.salary)
    if (order === 'salary_asc') sorted.sort((a, b) => a.salary - b.salary)
    if (order === 'name_asc') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [ran, dept, order])

  const where = dept === 'all' ? '' : ` WHERE dept = '${dept}'`
  const orderSql =
    order === 'name_asc' ? 'name ASC' : order === 'salary_asc' ? 'salary ASC' : 'salary DESC'
  const snippet = `SELECT name, dept, salary\nFROM staff${where}\nORDER BY ${orderSql};`

  return (
    <div className="sk-lab-work">
      <div>
        <table className="sk-lab-table">
          <caption>Sample table <code>staff</code> — not a database</caption>
          <thead>
            <tr>
              <th>name</th>
              <th>dept</th>
              <th>salary</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map(row => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.dept}</td>
                <td>{row.salary.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ran && (
          <>
            <p className="sk-lab-legend">Query result · {result.length} row{result.length === 1 ? '' : 's'}</p>
            <table className="sk-lab-table">
              <thead>
                <tr>
                  <th>name</th>
                  <th>dept</th>
                  <th>salary</th>
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
                      <td>{row.dept}</td>
                      <td>{row.salary.toLocaleString('en-IN')}</td>
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
          Department
          <select
            value={dept}
            onChange={event => {
              setDept(event.target.value as (typeof DEPTS)[number])
              setRan(false)
            }}
          >
            {DEPTS.map(item => (
              <option key={item} value={item}>{item === 'all' ? 'All departments' : item}</option>
            ))}
          </select>
        </label>
        <label>
          Order by
          <select
            value={order}
            onChange={event => {
              setOrder(event.target.value as (typeof ORDERS)[number])
              setRan(false)
            }}
          >
            <option value="salary_desc">salary descending</option>
            <option value="salary_asc">salary ascending</option>
            <option value="name_asc">name ascending</option>
          </select>
        </label>

        <div className="sk-lab-actions">
          <button type="button" className="sk-lab-run" onClick={() => setRan(true)}>Run query</button>
          <button
            type="button"
            className="sk-lab-reset"
            onClick={() => {
              setRan(false)
              setDept('Engineering')
              setOrder('salary_desc')
            }}
          >
            Reset
          </button>
        </div>

        <div className="sk-lab-metrics" aria-live="polite">
          {ran ? (
            <p>
              {result.length} row{result.length === 1 ? '' : 's'} returned. This filters a sample table in your
              browser — it is not a SQL database.
            </p>
          ) : (
            <p>Choose a WHERE and ORDER BY, then run. You are picking filters, not writing SQL against a server.</p>
          )}
        </div>

        <LabCompletion labId="sql-filter" enabled={ran} />
      </div>
    </div>
  )
}
