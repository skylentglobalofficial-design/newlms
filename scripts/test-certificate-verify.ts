/**
 * GET /certificates/verify/:code — status codes for each outcome, with the database stubbed.
 * No database is contacted: the lookup is replaced before any request is made, and DATABASE_URL
 * is set to an unusable local address first so nothing could connect even by mistake.
 */
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1:1/unused"
process.env.DIRECT_URL = process.env.DATABASE_URL

import type { AddressInfo } from "node:net"
import express from "express"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { skylentCertificatesRouter } = await import("../server/src/routes/skylent/certificates.ts")

  type Lookup = (args: { where: { code: string } }) => Promise<unknown>
  let lookup: Lookup = async () => null
  // Replace the one query this route makes. Nothing else on the client is used by the test.
  ;(prisma.skylentCertificate as unknown as { findUnique: Lookup }).findUnique = (args) => lookup(args)

  const app = express()
  app.use("/certificates", skylentCertificatesRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/certificates/verify`
  const get = async (code: string) => {
    const response = await fetch(`${base}/${code}`)
    return { status: response.status, type: response.headers.get("content-type") ?? "", body: (await response.json()) as Record<string, unknown> }
  }

  try {
    console.log("1. A malformed ID is refused before any lookup")
    let called = false
    lookup = async () => {
      called = true
      return null
    }
    const malformed = await get("bad")
    assert(malformed.status === 400 && !called, `malformed should be 400 without a lookup, got ${malformed.status}`)

    console.log("2. An unknown certificate is 404 valid:false")
    const unknown = await get("SKL-2026-DA-000000")
    assert(unknown.status === 404 && (unknown.body.data as { valid?: boolean })?.valid === false, `unknown should be 404, got ${unknown.status}`)

    console.log("3. A revoked certificate is reported the same way as an unknown one")
    lookup = async () => ({ code: "SKL-2026-DA-AAAAAA", revoked: true, learnerName: "A", courseTitle: "B", issuedAt: new Date() })
    const revoked = await get("SKL-2026-DA-AAAAAA")
    assert(revoked.status === 404, `revoked should be 404, got ${revoked.status}`)

    console.log("4. A valid certificate is 200 valid:true and is looked up in upper case")
    let seen = ""
    lookup = async (args) => {
      seen = args.where.code
      return { code: args.where.code, revoked: false, learnerName: "Test Learner", courseTitle: "Data Analytics", issuedAt: new Date("2026-10-01T00:00:00Z") }
    }
    const valid = await get("skl-2026-da-bbbbbb")
    assert(valid.status === 200 && (valid.body.data as { valid?: boolean })?.valid === true, `valid should be 200, got ${valid.status}`)
    assert(seen === "SKL-2026-DA-BBBBBB", "the code should be normalised to upper case")

    console.log("5. A failed lookup is 503 JSON, never 404 and never an unhandled 500")
    lookup = async () => {
      throw new Error('The table "public.SkylentCertificate" does not exist in the current database.')
    }
    const down = await get("SKL-2026-DA-CCCCCC")
    assert(down.status === 503, `a failed lookup should be 503, got ${down.status}`)
    assert(down.type.includes("application/json") && down.body.code === "unavailable", "a failed lookup should answer JSON with code unavailable")
    assert(!JSON.stringify(down.body).includes("SkylentCertificate"), "the database error must not be sent to the client")

    console.log("Certificate verification checks passed")
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
