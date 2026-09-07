function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

/** Minimal PDF 1.4 generator for certificate download (no external dependency). */
export function buildCertificatePdf(input: {
  learnerName: string
  courseTitle: string
  certificateId: string
  issuedAt: Date
}): Buffer {
  const lines = [
    "Skylent Certificate of Completion",
    "",
    `Awarded to: ${input.learnerName}`,
    `Course: ${input.courseTitle}`,
    `Certificate ID: ${input.certificateId}`,
    `Issued: ${input.issuedAt.toISOString().slice(0, 10)}`,
    "",
    "This certificate confirms course completion recorded in Skylent LMS.",
  ]

  const contentLines = ["BT", "/F1 16 Tf", "72 720 Td", "18 TL"]
  lines.forEach((line, index) => {
    if (index > 0) contentLines.push("T*")
    contentLines.push(`(${escapePdfText(line)}) Tj`)
  })
  contentLines.push("ET")
  const stream = `${contentLines.join("\n")}\n`
  const streamLength = Buffer.byteLength(stream, "utf8")

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += object
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, "utf8")
}

export function buildCertificateId(enrollmentId: string): string {
  return `SKL-${enrollmentId.replace(/-/g, "").slice(0, 12).toUpperCase()}`
}
