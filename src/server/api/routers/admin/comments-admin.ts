import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { comments } from "@/server/db/schemas/comment";
import { user } from "@/server/db/schemas/auth";
import { blogPosts } from "@/server/db/schemas/blog";
import { eq, like, or, desc, count } from "drizzle-orm";

export const commentsAdminRouter = createTRPCRouter({
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
            like(comments.content, `%${search}%`),
            like(user.name, `%${search}%`),
            like(blogPosts.title, `%${search}%`)
          )
        : undefined;

      // Get total count for pagination
      const [totalCountResult, items] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .leftJoin(user, eq(comments.userId, user.id))
          .leftJoin(blogPosts, eq(comments.postId, blogPosts.id))
          .where(whereCondition),
        db
          .select({
            id: comments.id,
            content: comments.content,
            postId: comments.postId,
            userId: comments.userId,
            isStarred: comments.isStarred,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
            post: {
              id: blogPosts.id,
              title: blogPosts.title,
            },
          })
          .from(comments)
          .leftJoin(user, eq(comments.userId, user.id))
          .leftJoin(blogPosts, eq(comments.postId, blogPosts.id))
          .where(whereCondition)
          .orderBy(desc(comments.createdAt))
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
