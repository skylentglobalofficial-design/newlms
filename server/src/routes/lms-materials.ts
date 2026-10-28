import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth, type AuthenticatedRequest } from "../lib/auth.js"
import { resolveCourseEnrollment } from "../lib/lms.js"
import { downloadFile, StorageServiceError } from "../lib/storage.js"

export const lmsMaterialsRouter = Router()

lmsMaterialsRouter.get("/materials/:materialId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ materialId: z.string().uuid() }).safeParse(req.params)
  if (!parsed.success) return res.status(400).json({ error: "Invalid material" })

  const material = await prisma.lessonMaterial.findUnique({
    where: { id: parsed.data.materialId },
    include: { node: { select: { module: { select: { courseId: true } } } } },
  })
  const courseId = material?.node.module.courseId
  if (!material || !courseId) return res.status(404).json({ error: "Material not found" })

  const enrollment = await resolveCourseEnrollment(req.auth!.user.id, courseId)
  if (!enrollment) return res.status(403).json({ error: "Not enrolled in this course" })

  try {
    const bytes = await downloadFile(material.storageKey)
    res.setHeader("Content-Type", material.mimeType)
    res.setHeader("Content-Disposition", `attachment; filename="${material.fileName.replace(/["\r\n]/g, "")}"`)
    res.setHeader("Cache-Control", "private, no-store")
    res.send(bytes)
  } catch (error) {
    if (error instanceof StorageServiceError) {
      return res.status(404).json({ error: "Material file is not available" })
    }
    console.error("Failed to download lesson material:", error)
    res.status(500).json({ error: "Failed to download lesson material" })
  }
})
