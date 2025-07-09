import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { blogPosts } from "@/server/db/schemas/blog";
import { comments } from "@/server/db/schemas/comment";
import { eq } from "drizzle-orm";

export const blogPublicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.query.blogPosts.findMany({
      where: eq(blogPosts.isLocked, false),
      with: {
        author: true,
      },
    });
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
        with: {
          author: true,
        },
      });

      if (post?.isLocked) {
        return null;
      }

      return post;
    }),
  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return await db.query.comments.findMany({
        where: eq(comments.postId, input.postId),
        with: {
          author: true,
        },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      });
    }),
});
