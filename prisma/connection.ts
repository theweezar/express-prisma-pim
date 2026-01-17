import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from './generated/client';
import { ITXClientDenyList } from "@prisma/client/runtime/client"

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({
  adapter,
  log: ['query'],
});

console.log(`Connected to database: ${connectionString}`);

export { prisma };
export type TransactionPrismaClient = Omit<PrismaClient, ITXClientDenyList>;
export type DTOPrismaClient = PrismaClient | TransactionPrismaClient;