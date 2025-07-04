// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
const createTable = sqliteTableCreator((name) => `fable_${name}`);

export const blogPosts = createTable(
  "blog_post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    title: d.text({ length: 256 }).notNull(),
    content: d.text({ mode: "json" }).notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isLocked: integer("is_locked", { mode: "boolean" })
      .default(false)
      .notNull(),
    isStarred: integer("is_starred", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("blog_post_title_idx").on(t.title)],
);

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(user, {
    fields: [blogPosts.authorId],
    references: [user.id],
  }),
}));
