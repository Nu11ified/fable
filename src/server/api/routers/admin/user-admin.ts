import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { user } from "@/server/db/schemas/auth";
import { eq } from "drizzle-orm";

export const userAdminRouter = createTRPCRouter({
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
