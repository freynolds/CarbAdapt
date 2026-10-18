/**
 * Apps import the database from this package, not from @prisma/client.
 * Nothing here opens a connection. Callers construct PrismaClient themselves.
 */
export { PrismaClient } from "@prisma/client";
