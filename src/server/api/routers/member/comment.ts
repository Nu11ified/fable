import { z } from "zod";
import { createTRPCRouter, userProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { comments } from "@/server/db/schemas/comment";

export const commentMemberRouter = createTRPCRouter({
  add: userProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new Error("User not authenticated");
      }
      await db.insert(comments).values({
        postId: input.postId,
        content: input.content,
        userId: ctx.session.user.id,
      });
    }),
});
