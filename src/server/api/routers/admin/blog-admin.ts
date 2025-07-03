import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { blogPosts } from "@/server/db/schemas/blog";
import { eq } from "drizzle-orm";

export const blogAdminRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new Error("User not authenticated");
      }
      await db.insert(blogPosts).values({
        title: input.title,
        content: input.content,
        authorId: ctx.session.user.id,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        content: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(blogPosts)
        .set({
          title: input.title,
          content: input.content,
        })
        .where(eq(blogPosts.id, input.id));
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
    }),

  lock: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogPosts)
        .set({ isLocked: true })
        .where(eq(blogPosts.id, input.id));
    }),

  unlock: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogPosts)
        .set({ isLocked: false })
        .where(eq(blogPosts.id, input.id));
    }),
  
  star: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogPosts)
        .set({ isStarred: true })
        .where(eq(blogPosts.id, input.id));
    }),

  unstar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogPosts)
        .set({ isStarred: false })
        .where(eq(blogPosts.id, input.id));
    }),
});
