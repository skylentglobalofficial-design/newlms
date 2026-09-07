import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

function resolveDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }
  return connectionString
}

export function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl() })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = createPrismaClient()
