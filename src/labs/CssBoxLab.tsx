import { useState } from 'react'
import LabCompletion from './LabCompletion'
import LabRange from './LabRange'

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
        <LabRange
          id="css-width"
          label="Content width"
          min={80}
          max={260}
          value={width}
          display={`${width}px`}
          onChange={value => { setWidth(value); setRan(false) }}
        />
        <LabRange
          id="css-padding"
          label="Padding"
          min={0}
          max={40}
          value={padding}
          display={`${padding}px`}
          onChange={value => { setPadding(value); setRan(false) }}
        />
        <LabRange
          id="css-border"
          label="Border"
          min={0}
          max={16}
          value={border}
          display={`${border}px`}
          onChange={value => { setBorder(value); setRan(false) }}
        />
        <LabRange
          id="css-margin"
          label="Margin"
          min={0}
          max={48}
          value={margin}
          display={`${margin}px`}
          onChange={value => { setMargin(value); setRan(false) }}
        />

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
          {ran ? (
            <p>
              Content stays {contentBox}px. Padding {padding}px on each side and a {border}px border make the
              border box {borderBox}px. Margin {margin}px on each side makes the outer width {total}px. This is a
              box-model diagram in your browser — not a webpage editor.
            </p>
          ) : (
            <p>Widths update as you move the sliders. Read the totals to log the observation locally.</p>
          )}
        </div>

        <LabCompletion labId="css-box" enabled={ran} />
      </div>
    </div>
  )
}
