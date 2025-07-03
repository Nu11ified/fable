import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

const createTable = sqliteTableCreator((name) => `fable_${name}`);

export const experience = createTable("experience", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: d.text().notNull(),
  company: d.text().notNull(),
  location: d.text(),
  startDate: d.integer({ mode: "timestamp" }).notNull(),
  endDate: d.integer({ mode: "timestamp" }),
  description: d.text().notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const education = createTable("education", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  school: d.text().notNull(),
  degree: d.text().notNull(),
  fieldOfStudy: d.text().notNull(),
  startDate: d.integer({ mode: "timestamp" }).notNull(),
  endDate: d.integer({ mode: "timestamp" }),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const skills = createTable("skill", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: d.text().notNull(),
  category: d.text().notNull(), // e.g., 'Language', 'Framework', 'Tool'
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
})); 

export const interests = createTable("interest", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: d.text().notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const personalInfo = createTable("personal_info", (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text().notNull(),
    email: d.text().notNull(),
    phoneNumber: d.text(),
    city: d.text(),
    country: d.text(),
    citizenship: d.text(),
    website: d.text(),
    linkedin: d.text(),
    github: d.text(),
    summary: d.text(),
    createdAt: d
        .integer({ mode: "timestamp" })
        .default(sql`(unixepoch())`)
        .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));