/**
 * Apps import the database from this package, not from @prisma/client.
 * Step 1 has no models, so nothing here opens a connection.
 */
export { PrismaClient } from "@prisma/client";
