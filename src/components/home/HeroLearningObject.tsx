import { useRef, useState, type KeyboardEvent } from "react"
import { Link } from "react-router-dom"

const STORES = 12
const LOGGED_EXCEPTIONS = 6
const UNLOGGED_EXCEPTIONS = 3

const CHOICES = [
  {
    id: "gmail",
    mark: "A",
    label: "A shared inbox like Gmail, for every store exception",
    note: "If you ask for Gmail, I will build Gmail badly.",
    voice: "Karthik · engineer",
  },
  {
    id: "queue",
    mark: "B",
    label: "A weekend exception queue — two engineers, six weeks",
    note: "The late truck has to be someone's job before the fridge is empty.",
    voice: "Priya · store lead, T. Nagar",
  },
  {
    id: "chat",
    mark: "C",
    label: "Another all-company chat for store operations",
    note: "We tried an all-hands app last year. I turned notifications off in two days.",
    voice: "Priya · store lead, T. Nagar",
  },
] as const

type ChoiceId = (typeof CHOICES)[number]["id"]

function storeClass(index: number) {
  if (index < LOGGED_EXCEPTIONS) return "is-ex"
  if (index < LOGGED_EXCEPTIONS + UNLOGGED_EXCEPTIONS) return "is-miss"
  return undefined
}

export default function HeroLearningObject() {
  const [choice, setChoice] = useState<ChoiceId | null>(null)
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])
  const selected = CHOICES.find((item) => item.id === choice)

  function move(next: number) {
    const index = (next + CHOICES.length) % CHOICES.length
    setChoice(CHOICES[index].id)
    buttonsRef.current[index]?.focus()
  }

  function onGroupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = choice ? CHOICES.findIndex((item) => item.id === choice) : 0
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault()
      move(current + 1)
      return
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault()
      move(current - 1)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      move(0)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      move(CHOICES.length - 1)
    }
  }

  return (
    <div className={choice ? "hp-learn is-live" : "hp-learn"}>
      <span className="hp-learn-rule" aria-hidden="true" />
      <p className="hp-learn-chip">2 engineers · 6 weeks</p>
      <div className="hp-learn-sheet">
        <p className="hp-learn-kicker">
          <Link to="/programs/product-management">Product Management</Link>
          <span>harbor-desk-case.md</span>
        </p>
        <p className="hp-learn-q">Two engineers. Six weeks. What do you ship?</p>
        <div
          className="hp-learn-stores"
          role="img"
          aria-label="Twelve Harbor Retail stores. Nine had weekend exceptions. Three of those never appeared in a channel."
        >
          {Array.from({ length: STORES }, (_, index) => (
            <span key={index} className={storeClass(index)} />
          ))}
        </div>
        <p className="hp-learn-evidence">
          3 of 9 weekend exceptions never appeared in a channel.
        </p>
        <div
          className="hp-learn-choices"
          role="radiogroup"
          aria-label="What do you ship?"
          onKeyDown={onGroupKeyDown}
        >
          {CHOICES.map((item, index) => {
            const on = choice === item.id
            return (
              <button
                key={item.id}
                ref={(node) => {
                  buttonsRef.current[index] = node
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on || (choice === null && index === 0) ? 0 : -1}
                className={on ? "is-on" : undefined}
                onClick={() => setChoice(item.id)}
              >
                <b>{item.mark}</b>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className={selected ? "hp-learn-note is-on" : "hp-learn-note"} aria-live="polite">
          {selected ? (
            <>
              <p>{selected.note}</p>
              <span>{selected.voice}</span>
            </>
          ) : (
            <p>Read the evidence. Make a bet. That is the work.</p>
          )}
        </div>
      </div>
    </div>
  )
}
