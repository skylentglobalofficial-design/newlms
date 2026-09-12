import { useState } from 'react'
import LabCompletion from './LabCompletion'

export default function CssBoxLab() {
  const [width, setWidth] = useState(180)
  const [padding, setPadding] = useState(16)
  const [border, setBorder] = useState(4)
  const [margin, setMargin] = useState(20)
  const [ran, setRan] = useState(false)

  const contentBox = width
  const borderBox = width + padding * 2 + border * 2
  const total = borderBox + margin * 2

  return (
    <div className="sk-lab-work">
      <div>
        <div className="sk-lab-box-stage" aria-hidden>
          <div className="sk-lab-box-margin" style={{ padding: margin }}>
            <div className="sk-lab-box-border" style={{ borderWidth: border }}>
              <div className="sk-lab-box-padding" style={{ padding }}>
                <div className="sk-lab-box-content" style={{ width }}>
                  content
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="sk-lab-legend">
          <span><i className="is-a" /> Margin</span>
          <span><i className="is-b" /> Border + padding + content</span>
        </p>
      </div>

      <div className="sk-lab-controls">
        <label>
          Content width
          <input type="range" min={80} max={260} value={width} onChange={event => { setWidth(Number(event.target.value)); setRan(false) }} />
          <em>{width}px</em>
        </label>
        <label>
          Padding
          <input type="range" min={0} max={40} value={padding} onChange={event => { setPadding(Number(event.target.value)); setRan(false) }} />
          <em>{padding}px</em>
        </label>
        <label>
          Border
          <input type="range" min={0} max={16} value={border} onChange={event => { setBorder(Number(event.target.value)); setRan(false) }} />
          <em>{border}px</em>
        </label>
        <label>
          Margin
          <input type="range" min={0} max={48} value={margin} onChange={event => { setMargin(Number(event.target.value)); setRan(false) }} />
          <em>{margin}px</em>
        </label>

        <div className="sk-lab-actions">
          <button type="button" className="sk-lab-run" onClick={() => setRan(true)}>Read the totals</button>
          <button
            type="button"
            className="sk-lab-reset"
            onClick={() => {
              setRan(false)
              setWidth(180)
              setPadding(16)
              setBorder(4)
              setMargin(20)
            }}
          >
            Reset
          </button>
        </div>

        <div className="sk-lab-metrics" aria-live="polite">
          {ran ? (
            <dl>
              <div>
                <dt>Content</dt>
                <dd>{contentBox}px</dd>
              </div>
              <div>
                <dt>Border box</dt>
                <dd>{borderBox}px</dd>
              </div>
              <div>
                <dt>Outer width</dt>
                <dd>{total}px</dd>
              </div>
            </dl>
          ) : (
            <p>
              Move padding, border and margin, then read the totals. This is a box-model diagram in your browser —
              not a webpage editor and not a CSS runtime for your own files.
            </p>
          )}
        </div>

        <LabCompletion labId="css-box" enabled={ran} />
      </div>
    </div>
  )
}
