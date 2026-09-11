/**
 * Generate synthetic curriculum dataset for data-analytics l14.
 * Phase 16 implementation of skylent_virelia_shared_services_hr_v1
 * Deterministic seeded PRNG — reproducible, no real PII.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import * as XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, "../../content/lms/data-analytics/l14")
const FILE_NAME = "skylent_virelia_shared_services_hr_v1.xlsx"
const OUT_FILE = path.join(OUT_DIR, FILE_NAME)
const REPORT_FILE = path.join(OUT_DIR, "dataset-validation.json")

const ANALYSIS_START = "2023-01-01"
const ANALYSIS_END = "2024-12-31"
const AS_OF = "2024-12-31"

/** Mulberry32 deterministic PRNG */
function mulberry32(seed) {
  let t = seed >>> 0
  return function next() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)]
}

function weightedPick(rand, items) {
  const total = items.reduce((sum, item) => sum + item.w, 0)
  let x = rand() * total
  for (const item of items) {
    x -= item.w
    if (x <= 0) return item.value
  }
  return items[items.length - 1].value
}

function dateBetween(rand, startIso, endIso) {
  const start = Date.parse(`${startIso}T00:00:00Z`)
  const end = Date.parse(`${endIso}T00:00:00Z`)
  if (end < start) return startIso
  const t = start + Math.floor(rand() * (end - start + 1))
  return new Date(t).toISOString().slice(0, 10)
}

function addDays(iso, days) {
  const dt = new Date(`${iso}T00:00:00Z`)
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function main() {
  const rand = mulberry32(0xb14e14)

  const dim_department = [
    { department_id: "D-OPS", department_name: "Customer Operations", business_unit: "Service Delivery" },
    { department_id: "D-FIN", department_name: "Finance Operations", business_unit: "Corporate" },
    { department_id: "D-TEC", department_name: "Technology", business_unit: "Service Delivery" },
    { department_id: "D-PEO", department_name: "People Operations", business_unit: "Corporate" },
    { department_id: "D-COM", department_name: "Commercial Support", business_unit: "Growth" },
    { department_id: "D-QUA", department_name: "Quality Assurance", business_unit: "Service Delivery" },
  ]

  const dim_location = [
    { location_id: "L-BLR", city: "Bengaluru", region: "South" },
    { location_id: "L-HYD", city: "Hyderabad", region: "South" },
    { location_id: "L-PUN", city: "Pune", region: "West" },
    { location_id: "L-GGN", city: "Gurugram", region: "North" },
    { location_id: "L-CHN", city: "Chennai", region: "South" },
  ]

  const salaryBands = ["Band A", "Band B", "Band C", "Band D", "Band E"]
  const exitReasons = ["Voluntary", "Involuntary", "End of contract"]

  const departmentWeights = [
    { value: "D-OPS", w: 0.34 },
    { value: "D-FIN", w: 0.14 },
    { value: "D-TEC", w: 0.2 },
    { value: "D-PEO", w: 0.08 },
    { value: "D-COM", w: 0.14 },
    { value: "D-QUA", w: 0.1 },
  ]

  const locationWeights = [
    { value: "L-BLR", w: 0.32 },
    { value: "L-HYD", w: 0.22 },
    { value: "L-PUN", w: 0.18 },
    { value: "L-GGN", w: 0.16 },
    { value: "L-CHN", w: 0.12 },
  ]

  const levelWeights = [
    { value: "Associate", w: 0.34 },
    { value: "Specialist", w: 0.28 },
    { value: "Senior", w: 0.2 },
    { value: "Lead", w: 0.1 },
    { value: "Manager", w: 0.08 },
  ]

  const TARGET_EMPLOYEES = 500
  const dim_employee = []
  const fact_hr_events = []
  let eventSeq = 1

  function pushEvent(row) {
    fact_hr_events.push({
      event_id: `EVT-${String(eventSeq).padStart(6, "0")}`,
      ...row,
    })
    eventSeq += 1
  }

  for (let i = 1; i <= TARGET_EMPLOYEES; i++) {
    const employee_id = `EMP-${String(i).padStart(5, "0")}`
    let department_id = weightedPick(rand, departmentWeights)
    const location_id = weightedPick(rand, locationWeights)

    let hire_date = dateBetween(rand, "2018-01-15", "2024-10-31")
    // Controlled pattern: later hires skew toward Technology
    if (hire_date >= "2023-07-01" && rand() < 0.35) {
      department_id = "D-TEC"
    }

    const job_family =
      department_id === "D-TEC"
        ? pick(rand, ["Engineering", "Analytics"])
        : department_id === "D-FIN"
          ? pick(rand, ["Finance", "Analytics"])
          : department_id === "D-PEO"
            ? "People"
            : department_id === "D-COM"
              ? pick(rand, ["Sales Support", "Operations"])
              : pick(rand, ["Operations", "Analytics"])

    const job_level = weightedPick(rand, levelWeights)
    const employment_type = rand() < 0.82 ? "Full-time" : "Contract"
    const salary_band = rand() < 0.04 ? null : pick(rand, salaryBands)

    let exitBoost = 0
    if (department_id === "D-OPS") exitBoost += 0.12
    if (location_id === "L-GGN") exitBoost += 0.08
    if (employment_type === "Contract") exitBoost += 0.06
    if (job_level === "Associate") exitBoost += 0.04

    const willExit = rand() < 0.22 + exitBoost
    let exit_date = null
    let exit_reason = null

    if (willExit) {
      if (hire_date < ANALYSIS_START && rand() < 0.12) {
        exit_date = dateBetween(rand, addDays(hire_date, 30), addDays(ANALYSIS_START, -1))
      } else {
        const start = hire_date > ANALYSIS_START ? hire_date : ANALYSIS_START
        if (start <= ANALYSIS_END) {
          exit_date = dateBetween(rand, start, ANALYSIS_END)
        }
      }
      if (exit_date && exit_date < hire_date) exit_date = hire_date
      if (exit_date) {
        if (employment_type === "Contract" && rand() < 0.45) exit_reason = "End of contract"
        else if (rand() < 0.18) exit_reason = "Involuntary"
        else exit_reason = "Voluntary"
      }
    }

    const employment_status = exit_date && exit_date <= AS_OF ? "Exited" : "Active"

    dim_employee.push({
      employee_id,
      department_id,
      location_id,
      job_family,
      job_level,
      employment_type,
      employment_status,
      hire_date,
      exit_date: employment_status === "Exited" ? exit_date : null,
      salary_band,
    })

    pushEvent({
      employee_id,
      event_date: hire_date,
      event_type: "Hire",
      department_id,
      location_id,
      exit_reason: null,
    })

    if (employment_status === "Exited" && exit_date) {
      pushEvent({
        employee_id,
        event_date: exit_date,
        event_type: "Exit",
        department_id,
        location_id,
        exit_reason,
      })
    }
  }

  const deptIds = new Set(dim_department.map((d) => d.department_id))
  const locIds = new Set(dim_location.map((l) => l.location_id))
  const empIds = new Set(dim_employee.map((e) => e.employee_id))

  let duplicateEmployeeKeys = 0
  let duplicateEventKeys = 0
  let foreignKeyViolations = 0
  let badDateSequences = 0
  let statusMismatch = 0
  let missingHireEvents = 0
  let exitEventMismatch = 0
  let salaryBandNulls = 0

  const seenEmp = new Set()
  for (const employee of dim_employee) {
    if (seenEmp.has(employee.employee_id)) duplicateEmployeeKeys += 1
    seenEmp.add(employee.employee_id)
    if (!deptIds.has(employee.department_id) || !locIds.has(employee.location_id)) {
      foreignKeyViolations += 1
    }
    if (employee.exit_date && employee.exit_date < employee.hire_date) badDateSequences += 1
    const active =
      employee.hire_date <= AS_OF && (employee.exit_date == null || employee.exit_date > AS_OF)
    if (active && employee.employment_status !== "Active") statusMismatch += 1
    if (!active && employee.employment_status !== "Exited") statusMismatch += 1
    if (employee.salary_band == null) salaryBandNulls += 1
  }

  const seenEvt = new Set()
  const hiresByEmp = new Map()
  const exitsByEmp = new Map()
  for (const event of fact_hr_events) {
    if (seenEvt.has(event.event_id)) duplicateEventKeys += 1
    seenEvt.add(event.event_id)
    if (
      !empIds.has(event.employee_id) ||
      !deptIds.has(event.department_id) ||
      !locIds.has(event.location_id)
    ) {
      foreignKeyViolations += 1
    }
    if (event.event_type === "Hire") {
      hiresByEmp.set(event.employee_id, (hiresByEmp.get(event.employee_id) || 0) + 1)
      if (event.exit_reason != null) badDateSequences += 1
    }
    if (event.event_type === "Exit") {
      exitsByEmp.set(event.employee_id, (exitsByEmp.get(event.employee_id) || 0) + 1)
      if (!event.exit_reason || !exitReasons.includes(event.exit_reason)) badDateSequences += 1
    }
  }

  for (const employee of dim_employee) {
    if ((hiresByEmp.get(employee.employee_id) || 0) !== 1) missingHireEvents += 1
    if (employee.employment_status === "Exited" && (exitsByEmp.get(employee.employee_id) || 0) !== 1) {
      exitEventMismatch += 1
    }
    if (employee.employment_status === "Active" && (exitsByEmp.get(employee.employee_id) || 0) !== 0) {
      exitEventMismatch += 1
    }
  }

  const activeEmployees = dim_employee.filter((e) => e.employment_status === "Active")
  const activeHeadcount = activeEmployees.length
  const hiresInWindow = fact_hr_events.filter(
    (e) => e.event_type === "Hire" && e.event_date >= ANALYSIS_START && e.event_date <= ANALYSIS_END,
  ).length
  const exitsInWindow = fact_hr_events.filter(
    (e) => e.event_type === "Exit" && e.event_date >= ANALYSIS_START && e.event_date <= ANALYSIS_END,
  ).length

  const exitsByDept = {}
  for (const event of fact_hr_events) {
    if (event.event_type !== "Exit" || event.event_date < ANALYSIS_START || event.event_date > ANALYSIS_END) {
      continue
    }
    exitsByDept[event.department_id] = (exitsByDept[event.department_id] || 0) + 1
  }

  const activeByDept = {}
  const activeByLevel = {}
  for (const employee of activeEmployees) {
    activeByDept[employee.department_id] = (activeByDept[employee.department_id] || 0) + 1
    activeByLevel[employee.job_level] = (activeByLevel[employee.job_level] || 0) + 1
  }

  const salaryBandNullPct = (salaryBandNulls / dim_employee.length) * 100
  const counts = {
    dim_department: dim_department.length,
    dim_location: dim_location.length,
    dim_employee: dim_employee.length,
    fact_hr_events: fact_hr_events.length,
  }
  const ranges = {
    dim_department: [5, 8],
    dim_location: [4, 6],
    dim_employee: [420, 580],
    fact_hr_events: [520, 780],
  }
  const countOk = Object.entries(ranges).every(([key, [lo, hi]]) => counts[key] >= lo && counts[key] <= hi)

  const validation = {
    generatedAt: new Date().toISOString(),
    datasetId: "skylent_virelia_shared_services_hr_v1",
    fileName: FILE_NAME,
    honesty:
      "Synthetic / fictional Skylent curriculum data. Not a real HRIS extract, employer dataset, or production people-analytics feed. No real employee PII.",
    analysisWindow: { start: ANALYSIS_START, end: ANALYSIS_END, asOfDate: AS_OF },
    sheets: ["dim_department", "dim_location", "dim_employee", "fact_hr_events"],
    counts,
    integrity: {
      duplicateEmployeeKeys,
      duplicateEventKeys,
      foreignKeyViolations,
      badDateSequences,
      statusMismatch,
      missingHireEvents,
      exitEventMismatch,
      salaryBandNullPct: Number(salaryBandNullPct.toFixed(2)),
    },
    analyticsSample: {
      activeHeadcount,
      hiresInWindow,
      exitsInWindow,
      activeByDepartment: activeByDept,
      activeByJobLevel: activeByLevel,
      exitsInWindowByDepartment: exitsByDept,
    },
    piiPolicy: {
      realNames: false,
      emails: false,
      phones: false,
      governmentIds: false,
      protectedClassFields: false,
    },
    passed:
      countOk &&
      duplicateEmployeeKeys === 0 &&
      duplicateEventKeys === 0 &&
      foreignKeyViolations === 0 &&
      badDateSequences === 0 &&
      statusMismatch === 0 &&
      missingHireEvents === 0 &&
      exitEventMismatch === 0 &&
      salaryBandNullPct < 5 &&
      activeHeadcount > 200 &&
      exitsInWindow > 40 &&
      hiresInWindow > 40,
  }

  if (!validation.passed) {
    console.error("Dataset validation FAILED", validation)
    process.exit(1)
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dim_department), "dim_department")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dim_location), "dim_location")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dim_employee), "dim_employee")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(fact_hr_events), "fact_hr_events")
  fs.mkdirSync(OUT_DIR, { recursive: true })
  XLSX.writeFile(workbook, OUT_FILE)
  fs.writeFileSync(REPORT_FILE, JSON.stringify(validation, null, 2))
  console.log("Wrote", OUT_FILE)
  console.log("Validation", JSON.stringify(validation, null, 2))
}

main()
