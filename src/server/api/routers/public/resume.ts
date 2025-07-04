import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const resumeRouter = createTRPCRouter({
  getExperience: publicProcedure.query(async () => {
    return await db.query.experience.findMany({
      orderBy: (experience, { desc }) => [desc(experience.startDate)],
    });
  }),

  getEducation: publicProcedure.query(async () => {
    return await db.query.education.findMany({
      orderBy: (education, { desc }) => [desc(education.startDate)],
    });
  }),

  getSkills: publicProcedure.query(async () => {
    return await db.query.skills.findMany({
      orderBy: (skills, { asc }) => [asc(skills.category), asc(skills.name)],
    });
  }),

  getPersonalInfo: publicProcedure.query(async () => {
    return await db.query.personalInfo.findFirst();
  }),

  getTimeline: publicProcedure.query(async () => {
    // Get both experience and education and combine them into a timeline
    const [experiences, educations] = await Promise.all([
      db.query.experience.findMany(),
      db.query.education.findMany(),
    ]);

    // Transform and combine into timeline items
    const timelineItems = [
      ...experiences.map(exp => ({
        id: `exp-${exp.id}`,
        type: 'experience' as const,
        title: exp.title,
        organization: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        current: !exp.endDate,
      })),
      ...educations.map(edu => ({
        id: `edu-${edu.id}`,
        type: 'education' as const,
        title: `${edu.degree} in ${edu.fieldOfStudy}`,
        organization: edu.school,
        location: null,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: `${edu.degree} in ${edu.fieldOfStudy}`,
        current: !edu.endDate,
      })),
    ];

    // Sort by start date (most recent first)
    return timelineItems.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }),
});
