import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { portfolioProjects } from "@/server/db/schemas/portfolio";
import { eq } from "drizzle-orm";

export const portfolioAdminRouter = createTRPCRouter({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.portfolioProjects.findMany();
  }),

  add: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional(),
        url: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(portfolioProjects).values(input);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        url: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db
        .update(portfolioProjects)
        .set(data)
        .where(eq(portfolioProjects.id, id));
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(portfolioProjects).where(eq(portfolioProjects.id, input.id));
    }),

  star: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(portfolioProjects)
        .set({ isStarred: true })
        .where(eq(portfolioProjects.id, input.id));
    }),

  unstar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(portfolioProjects)
        .set({ isStarred: false })
        .where(eq(portfolioProjects.id, input.id));
    }),
});
