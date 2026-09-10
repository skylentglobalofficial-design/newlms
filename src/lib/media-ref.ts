/**
 * Tiny media-ref helpers for the shell/foundation graph.
 * Keep PHOTO / PROGRAM_PHOTO maps in ../media so they stay off the homepage critical path.
 */
export type MediaRef = string

export type ProductVisualId = string

export function isSkylentVisualRef(src: string): boolean {
  return src.startsWith('skylent:')
}

export function parseSkylentVisualRef(src: string): ProductVisualId | null {
  if (!isSkylentVisualRef(src)) return null
  return src.slice('skylent:'.length)
}
