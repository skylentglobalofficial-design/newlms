import { useMemo, useState } from 'react'
import { readLabCompletion, writeLabCompletion } from '../lib/virtual-labs'
import LabRange from './LabRange'

type Point = { x: number; y: number; label: 0 | 1 }

const W = 520
const H = 360
const PAD = 18

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function generate(n: number, noise: number, seed: number): Point[] {
  const rand = rng(seed)
  const gauss = () => {
    const u = Math.max(rand(), 1e-9)
    const v = Math.max(rand(), 1e-9)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const points: Point[] = []
  const spread = 0.12 + noise * 0.28
  for (let i = 0; i < n; i++) {
    points.push({
      x: clamp01(0.32 + gauss() * spread),
      y: clamp01(0.34 + gauss() * spread),
      label: 0,
    })
    points.push({
      x: clamp01(0.68 + gauss() * spread),
      y: clamp01(0.66 + gauss() * spread),
      label: 1,
    })
  }
  return points
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

function classify(points: Point[], k: number, x: number, y: number, skip = -1): 0 | 1 {
  const scored = points
    .map((point, index) => ({ point, index, d: dist(point, { x, y }) }))
    .filter(item => item.index !== skip)
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(1, k))
  let votes = 0
  for (const item of scored) votes += item.point.label === 1 ? 1 : -1
  return votes >= 0 ? 1 : 0
}

function leaveOneOut(points: Point[], k: number) {
  if (points.length < 2) return 0
  let correct = 0
  for (let i = 0; i < points.length; i++) {
    const predicted = classify(points, k, points[i].x, points[i].y, i)
    if (predicted === points[i].label) correct += 1
  }
  return correct / points.length
}

function toPx(x: number, y: number) {
  return {
    cx: PAD + x * (W - PAD * 2),
    cy: PAD + (1 - y) * (H - PAD * 2),
  }
}

export default function ClassificationLab() {
  const [samples, setSamples] = useState(18)
  const [noise, setNoise] = useState(0.35)
  const [k, setK] = useState(3)
  const [seed, setSeed] = useState(7)
  const [ran, setRan] = useState(false)
  const [complete, setComplete] = useState(() => readLabCompletion('knn-classifier'))

  const points = useMemo(() => generate(samples, noise, seed), [samples, noise, seed])

  const grid = useMemo(() => {
    if (!ran) return [] as { x: number; y: number; label: 0 | 1 }[]
    const step = 14
    const cells = []
    for (let gx = 0; gx < step; gx++) {
      for (let gy = 0; gy < step; gy++) {
        const x = (gx + 0.5) / step
        const y = (gy + 0.5) / step
        cells.push({ x, y, label: classify(points, k, x, y) })
      }
    }
    return cells
  }, [ran, points, k])

  const accuracy = ran ? leaveOneOut(points, k) : null
  const cell = (W - PAD * 2) / 14

  function run() {
    setRan(true)
  }

  function reset() {
    setRan(false)
    setSeed(s => (s + 11) % 997)
  }

  function markComplete() {
    writeLabCompletion('knn-classifier', true)
    setComplete(true)
  }

  return (
    <div className="sk-lab-work">
      <div className="sk-lab-canvas-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="sk-lab-canvas" role="img" aria-label="Two-class scatter plot with optional k-NN decision grid">
          <rect x="0" y="0" width={W} height={H} fill="#f7f4ee" />
          {grid.map((cellPoint, index) => {
            const { cx, cy } = toPx(cellPoint.x, cellPoint.y)
            return (
              <rect
                key={index}
                x={cx - cell / 2}
                y={cy - cell / 2}
                width={cell}
                height={cell}
                fill={cellPoint.label === 1 ? 'rgba(45,91,214,0.16)' : 'rgba(243,107,33,0.16)'}
              />
            )
          })}
          {points.map((point, index) => {
            const { cx, cy } = toPx(point.x, point.y)
            if (point.label === 1) {
              return (
                <rect
                  key={index}
                  x={cx - 5}
                  y={cy - 5}
                  width={10}
                  height={10}
                  fill="#2D5BD6"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              )
            }
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={5.5}
                fill="#F36B21"
                stroke="#fff"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
        <p className="sk-lab-legend">
          <span><i className="is-a" /> Class A · circle</span>
          <span><i className="is-b" /> Class B · square</span>
          {ran && <span>Shaded cells show the predicted class across the plane.</span>}
        </p>
      </div>

      <div className="sk-lab-controls">
        <LabRange
          id="knn-samples"
          label="Samples per class"
          min={8}
          max={40}
          value={samples}
          display={`${samples}`}
          onChange={value => { setSamples(value); setRan(false) }}
        />
        <LabRange
          id="knn-noise"
          label="Noise"
          min={0}
          max={100}
          value={Math.round(noise * 100)}
          display={noise.toFixed(2)}
          onChange={value => { setNoise(value / 100); setRan(false) }}
        />
        <LabRange
          id="knn-k"
          label="k neighbours"
          min={1}
          max={15}
          step={2}
          value={k}
          display={`${k}`}
          onChange={value => { setK(value); setRan(false) }}
        />

        <div className="sk-lab-actions">
          <button type="button" className="sk-lab-run" onClick={run}>Run experiment</button>
          <button type="button" className="sk-lab-reset" onClick={reset}>Reset data</button>
        </div>

        <div className="sk-lab-metrics" aria-live="polite">
          {accuracy === null ? (
            <p>Set the parameters, then run. The classifier is computed in this browser — there is no remote runtime.</p>
          ) : (
            <dl>
              <div>
                <dt>Leave-one-out accuracy</dt>
                <dd>{Math.round(accuracy * 100)}%</dd>
              </div>
              <div>
                <dt>Points</dt>
                <dd>{points.length}</dd>
              </div>
              <div>
                <dt>k</dt>
                <dd>{k}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="sk-lab-complete">
          {complete ? (
            <p>Experiment marked complete on this device. It is not a certificate and it is not Career OS evidence.</p>
          ) : (
            <button type="button" className="sk-lab-reset" onClick={markComplete} disabled={!ran}>
              Mark experiment complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
