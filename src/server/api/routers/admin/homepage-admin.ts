import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  homepageConfig,
  homepageStats,
  homepageServices,
  homepageSkills,
  homepageTimeline,
} from "@/server/db/schemas/homepage";
import { eq } from "drizzle-orm";

const configRouter = createTRPCRouter({
  get: adminProcedure.query(async () => {
    const config = await db.query.homepageConfig.findFirst();
    return config ?? null;
  }),
  update: adminProcedure
    .input(
      z.object({
        heroTitle: z.string().optional(),
        heroSubtitle: z.string().optional(),
        heroDescription: z.string().optional(),
        heroButtonPrimary: z.string().optional(),
        heroButtonSecondary: z.string().optional(),
        creativeTitle: z.string().optional(),
        aboutTitle: z.string().optional(),
        aboutSubtitle: z.string().optional(),
        age: z.string().optional(),
        professionalTitle: z.string().optional(),
        yearsExperience: z.string().optional(),
        workSectionTitle: z.string().optional(),
        workSectionSubtitle: z.string().optional(),
        workProjectMeta: z.string().optional(),
        contactSectionSubtitle: z.string().optional(),
        contactTitle: z.string().optional(),
        contactDescription: z.string().optional(),
        discordTitle: z.string().optional(),
        discordUsername: z.string().optional(),
        discordResponseTime: z.string().optional(),
        socialLinksTitle: z.string().optional(),
        backgroundText: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingConfig = await db.query.homepageConfig.findFirst();
      
      if (existingConfig) {
        await db.update(homepageConfig).set(input).where(eq(homepageConfig.id, existingConfig.id));
      } else {
        await db.insert(homepageConfig).values(input);
      }
    }),
});

const statsRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    return await db.query.homepageStats.findMany({
      orderBy: (homepageStats, { asc }) => [asc(homepageStats.order)],
    });
  }),
  add: adminProcedure
    .input(
      z.object({
        label: z.string(),
        value: z.string(),
        description: z.string(),
        order: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(homepageStats).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        label: z.string().optional(),
        value: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(homepageStats).set(data).where(eq(homepageStats.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(homepageStats).where(eq(homepageStats.id, input.id));
    }),
});

const servicesRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    return await db.query.homepageServices.findMany({
      orderBy: (homepageServices, { asc }) => [asc(homepageServices.order)],
    });
  }),
  add: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
        order: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(homepageServices).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(homepageServices).set(data).where(eq(homepageServices.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(homepageServices).where(eq(homepageServices.id, input.id));
    }),
});

const skillsRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    return await db.query.homepageSkills.findMany({
      orderBy: (homepageSkills, { asc }) => [asc(homepageSkills.order)],
    });
  }),
  add: adminProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        order: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(homepageSkills).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(homepageSkills).set(data).where(eq(homepageSkills.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(homepageSkills).where(eq(homepageSkills.id, input.id));
    }),
});

const timelineRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    return await db.query.homepageTimeline.findMany({
      orderBy: (homepageTimeline, { asc }) => [asc(homepageTimeline.order)],
    });
  }),
  add: adminProcedure
    .input(
      z.object({
        year: z.string(),
        duration: z.string().optional(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        description: z.string(),
        highlights: z.string().optional(),
        skills: z.string().optional(),
        color: z.string().default("blue"),
        order: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(homepageTimeline).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        year: z.string().optional(),
        duration: z.string().optional(),
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        highlights: z.string().optional(),
        skills: z.string().optional(),
        color: z.string().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(homepageTimeline).set(data).where(eq(homepageTimeline.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(homepageTimeline).where(eq(homepageTimeline.id, input.id));
    }),
});

export const homepageAdminRouter = createTRPCRouter({
  config: configRouter,
  stats: statsRouter,
  services: servicesRouter,
  skills: skillsRouter,
  timeline: timelineRouter,
}); 