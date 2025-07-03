import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

const createTable = sqliteTableCreator((name) => `fable_${name}`);

export const portfolioProjects = createTable(
  "portfolio_project",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }).notNull(),
    description: d.text().notNull(),
    technologies: d.text({ mode: "json" }).$type<string[]>(),
    url: d.text(),
    imageUrl: d.text(),
    isStarred: integer("is_starred", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("portfolio_project_name_idx").on(t.name)],
); 