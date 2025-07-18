import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const tabs = pgTable("tabs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("projects"),
  content: jsonb("content"),
  afterId: uuid("after_id"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tabsRelations = relations(tabs, ({ one, many }) => ({
  afterTab: one(tabs, {
    fields: [tabs.afterId],
    references: [tabs.id],
    relationName: "tabOrder",
  }),
  beforeTabs: many(tabs, {
    relationName: "tabOrder",
  }),
}));

export type Tab = typeof tabs.$inferSelect;
export type NewTab = typeof tabs.$inferInsert;
