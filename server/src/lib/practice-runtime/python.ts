/**
 * Isolated Python execution contract.
 *
 * Learner code must never run inside the Node.js API process. This host has no
 * container or sandbox tool, so the only implementation is the closed runtime.
 * A later provider can replace it without changing course provisioning.
 */

export const PYTHON_RUNTIME_BLOCKER =
  "No isolated Python runtime is configured. This environment has no container or sandbox runtime. Learner code is not executed in the Node.js process."

export type PythonExecutionRequest = {
  courseSlug: string
  lessonId: string
  source: string
}

export type PythonExecutionResult = {
  ok: true
  stdout: string
  stderr: string
  durationMs: number
}

export class PythonRuntimeUnavailable extends Error {
  readonly code = "runtime_unavailable"
  constructor(message = PYTHON_RUNTIME_BLOCKER) {
    super(message)
  }
}

export interface IsolatedPythonRuntime {
  id: string
  probe(): Promise<{ available: boolean; reason: string }>
  execute(request: PythonExecutionRequest): Promise<PythonExecutionResult>
}

export class ClosedPythonRuntime implements IsolatedPythonRuntime {
  readonly id = "closed"
  async probe() {
    return { available: false, reason: PYTHON_RUNTIME_BLOCKER }
  }
  async execute(_request: PythonExecutionRequest): Promise<PythonExecutionResult> {
    throw new PythonRuntimeUnavailable()
  }
}

export const pythonRuntime: IsolatedPythonRuntime = new ClosedPythonRuntime()
