export function LabRange({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  display,
  onChange,
}: {
  id: string
  label: string
  min: number
  max: number
  step?: number
  value: number
  display: string
  onChange: (value: number) => void
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <em>{display}</em>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default LabRange
