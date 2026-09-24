import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

dotenv.config({ override: true })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for the API runtime")
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})
