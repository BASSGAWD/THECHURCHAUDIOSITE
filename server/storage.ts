import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  articles,
  samplePacks,
  savedSongs,
  comments,
  mailingList,
  type User,
  type InsertUser,
  type Article,
  type InsertArticle,
  type SamplePack,
  type InsertSamplePack,
  type SavedSong,
  type InsertSavedSong,
  type Comment,
  type InsertComment,
  type MailingListEntry,
  type InsertMailingList,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getArticles(category?: string): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;

  getSamplePacks(): Promise<SamplePack[]>;
  getSamplePack(id: string): Promise<SamplePack | undefined>;
  createSamplePack(pack: InsertSamplePack): Promise<SamplePack>;
  updateSamplePack(id: string, pack: Partial<InsertSamplePack>): Promise<SamplePack | undefined>;
  deleteSamplePack(id: string): Promise<boolean>;

  getSavedSongsByUser(userId: string): Promise<SavedSong[]>;
  getSavedSong(id: string): Promise<SavedSong | undefined>;
  createSavedSong(song: InsertSavedSong): Promise<SavedSong>;
  updateSavedSong(id: string, song: Partial<InsertSavedSong>): Promise<SavedSong | undefined>;
  deleteSavedSong(id: string): Promise<boolean>;

  getCommentsByArticle(articleId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;

  addToMailingList(entry: InsertMailingList): Promise<MailingListEntry>;
  getMailingList(): Promise<MailingListEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getArticles(category?: string): Promise<Article[]> {
    if (category) {
      return db.select().from(articles).where(eq(articles.category, category)).orderBy(desc(articles.publishedAt));
    }
    return db.select().from(articles).orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db.update(articles).set(article).where(eq(articles.id, id)).returning();
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  async getSamplePacks(): Promise<SamplePack[]> {
    return db.select().from(samplePacks).orderBy(desc(samplePacks.publishedAt));
  }

  async getSamplePack(id: string): Promise<SamplePack | undefined> {
    const [pack] = await db.select().from(samplePacks).where(eq(samplePacks.id, id));
    return pack;
  }

  async createSamplePack(pack: InsertSamplePack): Promise<SamplePack> {
    const [created] = await db.insert(samplePacks).values(pack).returning();
    return created;
  }

  async updateSamplePack(id: string, pack: Partial<InsertSamplePack>): Promise<SamplePack | undefined> {
    const [updated] = await db.update(samplePacks).set(pack).where(eq(samplePacks.id, id)).returning();
    return updated;
  }

  async deleteSamplePack(id: string): Promise<boolean> {
    const result = await db.delete(samplePacks).where(eq(samplePacks.id, id)).returning();
    return result.length > 0;
  }

  async getSavedSongsByUser(userId: string): Promise<SavedSong[]> {
    return db.select().from(savedSongs).where(eq(savedSongs.userId, userId)).orderBy(desc(savedSongs.createdAt));
  }

  async getSavedSong(id: string): Promise<SavedSong | undefined> {
    const [song] = await db.select().from(savedSongs).where(eq(savedSongs.id, id));
    return song;
  }

  async createSavedSong(song: InsertSavedSong): Promise<SavedSong> {
    const [created] = await db.insert(savedSongs).values(song).returning();
    return created;
  }

  async updateSavedSong(id: string, song: Partial<InsertSavedSong>): Promise<SavedSong | undefined> {
    const [updated] = await db.update(savedSongs).set(song).where(eq(savedSongs.id, id)).returning();
    return updated;
  }

  async deleteSavedSong(id: string): Promise<boolean> {
    const result = await db.delete(savedSongs).where(eq(savedSongs.id, id)).returning();
    return result.length > 0;
  }

  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async addToMailingList(entry: InsertMailingList): Promise<MailingListEntry> {
    const [created] = await db.insert(mailingList).values(entry).onConflictDoNothing().returning();
    if (!created) {
      const [existing] = await db.select().from(mailingList).where(eq(mailingList.email, entry.email));
      return existing;
    }
    return created;
  }

  async getMailingList(): Promise<MailingListEntry[]> {
    return db.select().from(mailingList).orderBy(desc(mailingList.subscribedAt));
  }
}

export const storage = new DatabaseStorage();
