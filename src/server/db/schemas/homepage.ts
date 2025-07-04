import { sql } from "drizzle-orm";
import {
  sqliteTableCreator,
} from "drizzle-orm/sqlite-core";

const createTable = sqliteTableCreator((name) => `fable_${name}`);

export const homepageConfig = createTable("homepage_config", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  heroTitle: d.text().notNull().default("Crafting Digital Experiences"),
  heroSubtitle: d.text().notNull().default("Through Code & Design"),
  heroDescription: d.text().notNull().default("Building immersive web experiences that push the boundaries of what's possible"),
  heroButtonPrimary: d.text().notNull().default("View Work"),
  heroButtonSecondary: d.text().notNull().default("Get in Touch"),
  creativeTitle: d.text().notNull().default("CREATIVE DEVELOPER"),
  aboutTitle: d.text().notNull().default("About Me"),
  aboutSubtitle: d.text().notNull().default("ABOUT ME"),
  age: d.text().notNull().default(""),
  professionalTitle: d.text().notNull().default(""),
  yearsExperience: d.text().notNull().default(""),
  workSectionTitle: d.text().notNull().default("SELECTED WORKS"),
  workSectionSubtitle: d.text().notNull().default("Modern E-commerce"),
  workProjectMeta: d.text().notNull().default("INTERACTIVE DEVELOPMENT • 2024"),
  contactSectionSubtitle: d.text().notNull().default("GET IN TOUCH"),
  contactTitle: d.text().notNull().default("Let's Create Something Together"),
  contactDescription: d.text().notNull().default("Have a project in mind? Let's bring your ideas to life. I'm currently available for freelance projects and collaborations."),
  discordTitle: d.text().notNull().default(""),
  discordUsername: d.text().notNull().default(""),
  discordResponseTime: d.text().notNull().default(""),
  socialLinksTitle: d.text().notNull().default("Connect with me"),
  backgroundText: d.text().notNull().default("Developer • Digital Artist • WebGL • TypeScript • React • Next.js • Node.js"),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const homepageStats = createTable("homepage_stats", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  label: d.text().notNull(), // e.g., "Professional Level", "Projects Completed"
  value: d.text().notNull(), // e.g., "Junior", "20+"
  description: d.text().notNull(), // e.g., "years of experience", "happy clients"
  order: d.integer().notNull().default(0), // for ordering stats
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const homepageServices = createTable("homepage_services", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: d.text().notNull(), // e.g., "Full Stack Development"
  description: d.text().notNull(), // e.g., "Building complete web applications"
  icon: d.text(), // icon name or path
  order: d.integer().notNull().default(0), // for ordering services
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const homepageSkills = createTable("homepage_skills", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: d.text().notNull(), // e.g., "React", "TypeScript"
  category: d.text().notNull(), // e.g., "Key Skills", "Technologies"
  order: d.integer().notNull().default(0), // for ordering skills
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const homepageTimeline = createTable("homepage_timeline", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  year: d.text().notNull(), // e.g., "2023", "2017"
  duration: d.text(), // e.g., "1 year", "6 years"
  title: d.text().notNull(), // e.g., "Junior Full Stack Developer"
  company: d.text().notNull(), // e.g., "Automotive Industry"
  location: d.text().notNull(), // e.g., "Germany"
  description: d.text().notNull(), // main description
  highlights: d.text(), // JSON array of highlight items
  skills: d.text(), // JSON array of skills used
  color: d.text().notNull().default("blue"), // timeline color theme
  order: d.integer().notNull().default(0), // for ordering timeline items
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
})); 