import { useState } from 'react'
import { readLabCompletion, writeLabCompletion } from '../lib/virtual-labs'

export default function LabCompletion({ labId, enabled }: { labId: string; enabled: boolean }) {
  const [complete, setComplete] = useState(() => readLabCompletion(labId))

  function markComplete() {
    writeLabCompletion(labId, true)
    setComplete(true)
  }

  return (
    <div className="sk-lab-complete">
      {complete ? (
        <p>Experiment marked complete on this device. It is not a certificate and it is not Career OS evidence.</p>
      ) : (
        <button type="button" className="sk-lab-reset" onClick={markComplete} disabled={!enabled}>
          Mark experiment complete
        </button>
      )}
    </div>
  )
}
