import { z } from "zod";
import { createTRPCRouter, userProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { blogPosts } from "@/server/db/schemas/blog";
import { eq } from "drizzle-orm";

export const lockedBlogMemberRouter = createTRPCRouter({
  view: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
        with: {
          author: true,
        },
      });
    }),
});
