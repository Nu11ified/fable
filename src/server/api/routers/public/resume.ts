import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const resumePublicRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const experience = await db.query.experience.findMany();
    const education = await db.query.education.findMany();
    const skills = await db.query.skills.findMany();
    const interests = await db.query.interests.findMany();
    const personalInfo = await db.query.personalInfo.findFirst();

    return {
      experience,
      education,
      skills,
      interests,
      personalInfo,
    };
  }),
});
