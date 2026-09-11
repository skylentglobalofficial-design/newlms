import crypto from "node:crypto"
import { prisma } from "./prisma.js"
import { recordLmsCourseEvidence } from "./lms-evidence.js"

export const CERTIFICATE_DISCLAIMER =
  "This certificate records completion of a published Skylent course. It is not an accredited, government, university, or professional-body credential."

export function certificateIssuerName(): string {
  const configured = process.env.CERTIFICATE_ISSUER?.trim()
  return configured && configured.length > 0 ? configured : "Skylent"
}

export function newCertificatePublicId(): string {
  return `SKY-${crypto.randomBytes(12).toString("hex").toUpperCase()}`
}

export function serializeCertificate(row: {
  publicId: string
  learnerName: string
  courseTitle: string
  courseSlug: string
  issuerName: string
  issuedAt: Date
}) {
  return {
    publicId: row.publicId,
    learnerName: row.learnerName,
    courseTitle: row.courseTitle,
    courseSlug: row.courseSlug,
    issuerName: row.issuerName,
    issuedAt: row.issuedAt.toISOString(),
    disclaimer: CERTIFICATE_DISCLAIMER,
  }
}

export async function issueCourseCertificate(input: {
  enrollmentId: string
  userId: string
  courseId: string
  courseSlug: string
  courseTitle: string
  learnerName: string
}) {
  const existing = await prisma.courseCertificate.findUnique({
    where: { enrollmentId: input.enrollmentId },
  })
  if (existing) {
    try {
      await recordLmsCourseEvidence({
        userId: input.userId,
        enrollmentId: input.enrollmentId,
        courseSlug: input.courseSlug,
        courseTitle: input.courseTitle,
        certificatePublicId: existing.publicId,
        completedAt: existing.issuedAt,
      })
    } catch (error) {
      console.error("Failed to record course completion evidence:", error)
    }
    return existing
  }

  const issuedAt = new Date()
  let created
  try {
    created = await prisma.courseCertificate.create({
      data: {
        publicId: newCertificatePublicId(),
        enrollmentId: input.enrollmentId,
        userId: input.userId,
        courseId: input.courseId,
        learnerName: input.learnerName,
        courseTitle: input.courseTitle,
        courseSlug: input.courseSlug,
        issuerName: certificateIssuerName(),
        issuedAt,
      },
    })
  } catch (error) {
    const duplicate = await prisma.courseCertificate.findUnique({
      where: { enrollmentId: input.enrollmentId },
    })
    if (duplicate) return duplicate
    throw error
  }

  await prisma.userEnrollment.update({
    where: { id: input.enrollmentId },
    data: { certificateEligible: true, certificateStatus: "issued" },
  })

  try {
    await recordLmsCourseEvidence({
      userId: input.userId,
      enrollmentId: input.enrollmentId,
      courseSlug: input.courseSlug,
      courseTitle: input.courseTitle,
      certificatePublicId: created.publicId,
      completedAt: issuedAt,
    })
  } catch (error) {
    console.error("Failed to record course completion evidence:", error)
  }

  return created
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function winAnsi(value: string): string {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code === 10) return " "
      if (code < 32 || code > 255) return "?"
      return char
    })
    .join("")
}

function wrapText(value: string, width: number): string[] {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > width) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : [""]
}

export function renderCertificatePdf(row: {
  publicId: string
  learnerName: string
  courseTitle: string
  issuerName: string
  issuedAt: Date
}): Buffer {
  const date = row.issuedAt.toISOString().slice(0, 10)
  const blocks: Array<{ text: string; size: number; y: number }> = []
  let y = 720
  const push = (text: string, size: number, gap = 22) => {
    for (const line of wrapText(text, size >= 16 ? 42 : 78)) {
      blocks.push({ text: line, size, y })
      y -= gap
    }
  }

  push("Certificate of completion", 22, 28)
  push(row.issuerName, 12, 36)
  push("This certifies that", 11, 20)
  push(row.learnerName, 20, 28)
  push("completed", 11, 20)
  push(row.courseTitle, 16, 26)
  push(`Issued ${date}`, 11, 18)
  push(`Certificate ID ${row.publicId}`, 10, 18)
  y -= 12
  push(CERTIFICATE_DISCLAIMER, 9, 14)

  const contentStream = [
    "BT",
    "/F1 12 Tf",
    ...blocks.flatMap((block) => [
      `/F1 ${block.size} Tf`,
      `1 0 0 1 56 ${block.y} Tm`,
      `(${pdfEscape(winAnsi(block.text))}) Tj`,
    ]),
    "ET",
  ].join("\n")

  const objects: string[] = []
  const add = (body: string) => {
    objects.push(body)
    return objects.length
  }

  add("<< /Type /Catalog /Pages 2 0 R >>")
  add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>")
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  add(`<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`)

  let offset = 0
  const header = "%PDF-1.4\n"
  const parts = [header]
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "]
  offset = Buffer.byteLength(header, "utf8")
  objects.forEach((body, index) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `)
    const chunk = `${index + 1} 0 obj\n${body}\nendobj\n`
    parts.push(chunk)
    offset += Buffer.byteLength(chunk, "utf8")
  })
  const xrefStart = offset
  parts.push(`${xref.join("\n")}\n`)
  parts.push(`trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`)
  return Buffer.from(parts.join(""), "utf8")
}

export function renderCertificateHtml(row: {
  publicId: string
  learnerName: string
  courseTitle: string
  issuerName: string
  issuedAt: Date
}): string {
  const date = row.issuedAt.toISOString().slice(0, 10)
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Certificate ${escape(row.publicId)}</title>
  <style>
    body { font-family: Georgia, serif; color: #111; background: #f6f4ee; margin: 0; padding: 48px 24px; }
    .sheet { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #d7d2c8; padding: 56px 48px; }
    p { line-height: 1.5; }
    .kicker { letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; color: #666; }
    h1 { font-size: 32px; margin: 8px 0 24px; }
    .name { font-size: 28px; margin: 8px 0 16px; }
    .disclaimer { font-size: 13px; color: #444; margin-top: 32px; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <article class="sheet">
    <p class="kicker">${escape(row.issuerName)}</p>
    <h1>Certificate of completion</h1>
    <p>This certifies that</p>
    <p class="name">${escape(row.learnerName)}</p>
    <p>completed</p>
    <p class="name">${escape(row.courseTitle)}</p>
    <p>Issued ${escape(date)}</p>
    <p>Certificate ID ${escape(row.publicId)}</p>
    <p class="disclaimer">${escape(CERTIFICATE_DISCLAIMER)}</p>
  </article>
</body>
</html>`
}
