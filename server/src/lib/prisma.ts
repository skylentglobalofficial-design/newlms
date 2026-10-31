import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

dotenv.config()

const rawDatabaseUrl = process.env.DATABASE_URL

if (!rawDatabaseUrl) {
  throw new Error("DATABASE_URL is required for the API runtime")
}

function tunePoolUrl(url: string): string {
  if (!url.includes("pooler.supabase.com") || url.includes("connection_limit=")) {
    return url
  }
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}connection_limit=3&pool_timeout=20`
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: tunePoolUrl(rawDatabaseUrl),
    },
  },
})
