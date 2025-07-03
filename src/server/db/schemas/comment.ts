import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { blogPosts } from "./blog";

const createTable = sqliteTableCreator((name) => `fable_${name}`);

export const comments = createTable(
  "comment",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    content: d.text().notNull(),
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isStarred: integer("is_starred", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("comment_post_id_idx").on(t.postId)],
);

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [comments.postId],
    references: [blogPosts.id],
  }),
  author: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
})); 