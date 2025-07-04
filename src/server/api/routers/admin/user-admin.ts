import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { user } from "@/server/db/schemas/auth";
import { eq, like, or, desc, count } from "drizzle-orm";

export const userAdminRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      // Build where conditions for search
      const whereCondition = search
        ? or(
            like(user.name, `%${search}%`),
            like(user.email, `%${search}%`)
          )
        : undefined;

      // Get total count for pagination
      const [totalCountResult, items] = await Promise.all([
        db
          .select({ count: count() })
          .from(user)
          .where(whereCondition),
        db
          .select()
          .from(user)
          .where(whereCondition)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      const totalCount = totalCountResult[0]?.count ?? 0;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };
    }),

  ban: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(user)
        .set({ isBanned: true })
        .where(eq(user.id, input.id));
    }),

  unban: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(user)
        .set({ isBanned: false })
        .where(eq(user.id, input.id));
    }),
});
