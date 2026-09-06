import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { CareerSupportTask } from "../../lib/career-api"
import { formatSupportDateTime, formatTaskStatus, isOpenTask } from "./support-utils"

const accent = getDomainAccent("career")

type Props = {
  tasks: CareerSupportTask[]
  requestSubject?: string
  requestId?: string
  emptyMessage?: string
}

export default function CareerSupportTaskList({
  tasks,
  requestSubject,
  requestId,
  emptyMessage = "No support tasks yet.",
}: Props) {
  const open = tasks.filter(isOpenTask)
  const done = tasks.filter(t => !isOpenTask(t))

  if (tasks.length === 0) {
    return (
      <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <section style={{ minWidth: 0 }}>
      {open.length > 0 && (
        <TaskGroup label="Needs attention" tasks={open} requestSubject={requestSubject} requestId={requestId} />
      )}
      {done.length > 0 && (
        <TaskGroup
          label={open.length > 0 ? "Completed & closed" : "Tasks"}
          tasks={done}
          requestSubject={requestSubject}
          requestId={requestId}
        />
      )}
    </section>
  )
}

function TaskGroup({
  label,
  tasks,
  requestSubject,
  requestId,
}: {
  label: string
  tasks: CareerSupportTask[]
  requestSubject?: string
  requestId?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} requestSubject={requestSubject} requestId={requestId} />
        ))}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  requestSubject,
  requestId,
}: {
  task: CareerSupportTask
  requestSubject?: string
  requestId?: string
}) {
  const due = formatSupportDateTime(task.dueAt)
  const completed = formatSupportDateTime(task.completedAt)
  const open = isOpenTask(task)

  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: T.rControl,
      border: `1px solid ${open ? accent.border : T.lineDark}`,
      background: open ? accent.subtle : "rgba(255,255,255,0.02)",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word", minWidth: 0 }}>{task.title}</div>
        <span style={{
          padding: "3px 8px",
          borderRadius: 100,
          border: `1px solid ${T.lineDark}`,
          color: open ? accent.text : "rgba(255,255,255,0.45)",
          fontSize: 11,
          flexShrink: 0,
        }}>
          {formatTaskStatus(task.status)}
        </span>
      </div>
      {task.description && (
        <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
          {task.description}
        </p>
      )}
      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
        {[due ? `Due ${due}` : null, completed ? `Completed ${completed}` : null].filter(Boolean).join(" · ")}
      </div>
      {!requestSubject && requestId && (
        <Link to={`/career-os/support/${requestId}`} style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 12.5, textDecoration: "none" }}>
          View request →
        </Link>
      )}
    </div>
  )
}
