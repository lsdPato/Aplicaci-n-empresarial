import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

function createPrismaClient() {
  // Strip Prisma v5/v6 params that confuse pg.Pool (adapter handles pgbouncer natively)
  const url = new URL(process.env.DATABASE_URL!)
  url.searchParams.delete("pgbouncer")
  url.searchParams.delete("connection_limit")

  const pool = new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: 1,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
