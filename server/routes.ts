import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertSamplePackSchema, insertSavedSongSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "churchaudio2026";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "church-audio-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  registerObjectStorageRoutes(app);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }
      if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }
      const user = await storage.createUser({ username, email, password: hashPassword(password) });
      try {
        await storage.addToMailingList({ email, username, userId: user.id });
      } catch (e) {}
      req.session.userId = user.id;
      req.session.username = user.username;
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session?.userId) {
      res.json({ id: req.session.userId, username: req.session.username });
    } else {
      res.json(null);
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const articles = await storage.getArticles(category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", requireAdmin, async (req, res) => {
    try {
      const parsed = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(parsed);
      res.status(201).json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid article data" });
    }
  });

  app.patch("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateArticle(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Article not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteArticle(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Article not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      const articleComments = await storage.getCommentsByArticle(req.params.id);
      res.json(articleComments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/articles/:id/comments", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content is required" });
      }
      const comment = await storage.createComment({
        articleId: req.params.id,
        userId: req.session.userId!,
        username: req.session.username!,
        content: content.trim(),
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to post comment" });
    }
  });

  app.delete("/api/comments/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Comment not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.get("/api/sample-packs", async (_req, res) => {
    try {
      const packs = await storage.getSamplePacks();
      res.json(packs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sample packs" });
    }
  });

  app.get("/api/sample-packs/:id", async (req, res) => {
    try {
      const pack = await storage.getSamplePack(req.params.id);
      if (!pack) return res.status(404).json({ error: "Sample pack not found" });
      res.json(pack);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sample pack" });
    }
  });

  app.post("/api/sample-packs", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSamplePackSchema.parse(req.body);
      const pack = await storage.createSamplePack(parsed);
      res.status(201).json(pack);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid sample pack data" });
    }
  });

  app.patch("/api/sample-packs/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSamplePack(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Sample pack not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update sample pack" });
    }
  });

  app.delete("/api/sample-packs/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSamplePack(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Sample pack not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sample pack" });
    }
  });

  app.get("/api/saved-songs", requireAuth, async (req, res) => {
    try {
      const songs = await storage.getSavedSongsByUser(req.session.userId!);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved songs" });
    }
  });

  app.post("/api/saved-songs", requireAuth, async (req, res) => {
    try {
      const parsed = insertSavedSongSchema.parse({
        ...req.body,
        userId: req.session.userId!,
      });
      const song = await storage.createSavedSong(parsed);
      res.status(201).json(song);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to save song" });
    }
  });

  app.patch("/api/saved-songs/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getSavedSong(req.params.id);
      if (!existing) return res.status(404).json({ error: "Song not found" });
      if (existing.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });
      const updated = await storage.updateSavedSong(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update song" });
    }
  });

  app.delete("/api/saved-songs/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getSavedSong(req.params.id);
      if (!existing) return res.status(404).json({ error: "Song not found" });
      if (existing.userId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });
      await storage.deleteSavedSong(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  app.get("/api/mailing-list", requireAdmin, async (req, res) => {
    try {
      const list = await storage.getMailingList();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mailing list" });
    }
  });

  app.get("/api/mailing-list/export", requireAdmin, async (req, res) => {
    try {
      const list = await storage.getMailingList();
      const csv = "Email,Username,Subscribed At\n" + list.map(e =>
        `"${e.email}","${e.username || ''}","${e.subscribedAt ? new Date(e.subscribedAt).toISOString() : ''}"`
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=mailing-list.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export mailing list" });
    }
  });

  return httpServer;
}
