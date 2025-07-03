import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { comments } from "@/server/db/schemas/comment";
import { eq } from "drizzle-orm";

export const commentsAdminRouter = createTRPCRouter({
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(comments).where(eq(comments.id, input.id));
    }),

  star: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(comments)
        .set({ isStarred: true })
        .where(eq(comments.id, input.id));
    }),

  unstar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(comments)
        .set({ isStarred: false })
        .where(eq(comments.id, input.id));
    }),
});
