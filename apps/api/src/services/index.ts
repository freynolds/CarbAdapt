/**
 * Use-cases called by controllers: load a workout, save a product, and so on.
 *
 * Nothing belongs here in this step. Health does not touch MySQL, the calc
 * engine, or a provider. Do not put fueling math in this folder; that lives
 * in packages/engine. Do not query Prisma from a route file; a service will
 * call packages/db when models exist.
 */
export {};
