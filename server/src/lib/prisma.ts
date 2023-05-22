import { PrismaClient } from '@prisma/client'

// This is a singleton, so we can reuse the same instance of Prisma Client
export const prisma = new PrismaClient({ log: ['query'] })
