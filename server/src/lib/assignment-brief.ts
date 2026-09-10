import fs from "node:fs"
import path from "node:path"
import type { AssignmentBrief } from "@prisma/client"

export type AssignmentBriefPayload = {
  title: string
  kicker: string | null
  content: unknown
  dataset: {
    available: boolean
    name: string | null
    fileName: string | null
    mimeType: string | null
    disclaimer: string | null
    downloadPath: string | null
  } | null
}

export function resolveDatasetAbsolutePath(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null
  const normalized = path.normalize(relativePath)
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null
  if (!normalized.startsWith(`content${path.sep}`) && !normalized.startsWith("content/")) return null
  const absolute = path.resolve(process.cwd(), normalized)
  const contentRoot = path.resolve(process.cwd(), "content")
  if (!absolute.startsWith(contentRoot + path.sep) && absolute !== contentRoot) return null
  if (!fs.existsSync(absolute)) return null
  return absolute
}

export function formatAssignmentBrief(
  brief: AssignmentBrief | null | undefined,
  slug: string,
  lessonKey: string,
): AssignmentBriefPayload | null {
  if (!brief) return null
  const datasetPath = resolveDatasetAbsolutePath(brief.datasetRelativePath)
  const datasetAvailable = Boolean(brief.datasetFileName && datasetPath)
  return {
    title: brief.title,
    kicker: brief.kicker,
    content: brief.content,
    dataset: brief.datasetName || brief.datasetFileName
      ? {
          available: datasetAvailable,
          name: brief.datasetName,
          fileName: brief.datasetFileName,
          mimeType: brief.datasetMimeType,
          disclaimer: brief.datasetDisclaimer,
          downloadPath: datasetAvailable
            ? `/api/v1/lms/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonKey)}/assignment/dataset`
            : null,
        }
      : null,
  }
}

/** Project briefs require written analysis + declared analytical artifact on submit. */
export function projectSubmissionRequirements(briefContent: unknown): {
  requireWrittenAnalysis: boolean
  requireAttachment: boolean
  allowedMimeTypes: string[] | null
} {
  const content = briefContent as {
    submissionExpectations?: { completeWhen?: string }
    deliverables?: { analyticalArtifact?: { required?: boolean } }
  } | null
  const isProject = Boolean(content?.submissionExpectations?.completeWhen)
  if (!isProject) {
    return { requireWrittenAnalysis: false, requireAttachment: false, allowedMimeTypes: null }
  }
  return {
    requireWrittenAnalysis: true,
    requireAttachment: Boolean(content?.deliverables?.analyticalArtifact?.required),
    allowedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
      "application/octet-stream", // .pbix often reported this way
      "text/markdown",
      "text/plain",
    ],
  }
}
