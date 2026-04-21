import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().default(''),
  password: text("password").notNull(),
});

export const mailingList = pgTable("mailing_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username"),
  userId: varchar("user_id"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  coverImagePath: text("cover_image_path"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const samplePacks = pgTable("sample_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull().default(0),
  coverImagePath: text("cover_image_path"),
  filePath: text("file_path"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const savedSongs = pgTable("saved_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  bpm: integer("bpm").notNull().default(120),
  pattern: text("pattern").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertMailingListSchema = createInsertSchema(mailingList).omit({
  id: true,
  subscribedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  publishedAt: true,
});

export const insertSamplePackSchema = createInsertSchema(samplePacks).omit({
  id: true,
  publishedAt: true,
});

export const insertSavedSongSchema = createInsertSchema(savedSongs).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMailingList = z.infer<typeof insertMailingListSchema>;
export type MailingListEntry = typeof mailingList.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertSamplePack = z.infer<typeof insertSamplePackSchema>;
export type SamplePack = typeof samplePacks.$inferSelect;
export type InsertSavedSong = z.infer<typeof insertSavedSongSchema>;
export type SavedSong = typeof savedSongs.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
