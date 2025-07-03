import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { portfolioProjects } from "@/server/db/schemas/portfolio";
import { eq } from "drizzle-orm";

export const portfolioPublicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.portfolioProjects.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.query.portfolioProjects.findFirst({
        where: eq(portfolioProjects.id, input.id),
      });
    }),
});
