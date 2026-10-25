import { prisma } from "./prisma.js"
import { isMissingSchemaError } from "./schema-capabilities.js"

export async function recordAdminAudit(entry: {
  actorId: string
  action: string
  targetType?: string | null
  targetId?: string | null
  summary: string
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        summary: entry.summary.slice(0, 500),
      },
    })
  } catch (error) {
    if (isMissingSchemaError(error)) return
    console.error("Audit log write failed:", error instanceof Error ? error.name : "unknown")
  }
}
