import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  experience,
  education,
  skills,
  interests,
  personalInfo,
} from "@/server/db/schemas/resume";
import { eq } from "drizzle-orm";

const experienceRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(experience).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(experience).set(data).where(eq(experience.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(experience).where(eq(experience.id, input.id));
    }),
});

const educationRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        school: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(education).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        school: z.string().optional(),
        degree: z.string().optional(),
        fieldOfStudy: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(education).set(data).where(eq(education.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(education).where(eq(education.id, input.id));
    }),
});

const skillsRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(skills).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(skills).set(data).where(eq(skills.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(skills).where(eq(skills.id, input.id));
    }),
});

const interestsRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(interests).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(interests).set(data).where(eq(interests.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(interests).where(eq(interests.id, input.id));
    }),
});

const personalInfoRouter = createTRPCRouter({
  add: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phoneNumber: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        citizenship: z.string().optional(),
        website: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(personalInfo).values(input);
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        citizenship: z.string().optional(),
        website: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(personalInfo).set(data).where(eq(personalInfo.id, id));
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(personalInfo).where(eq(personalInfo.id, input.id));
    }),
});

export const resumeAdminRouter = createTRPCRouter({
  experience: experienceRouter,
  education: educationRouter,
  skills: skillsRouter,
  interests: interestsRouter,
  personalInfo: personalInfoRouter,
});
