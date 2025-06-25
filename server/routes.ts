import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
import { insertPostSchema, insertTemplateSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd set up proper session management
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User endpoints
  app.get("/api/users/me", async (req, res) => {
    // Mock current user - in real app would come from session
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...user, password: undefined });
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Team endpoints
  app.get("/api/teams/:teamId/members", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const members = await storage.getTeamMembers(teamId);
      res.json(members.map(member => ({
        ...member,
        user: { ...member.user, password: undefined }
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/teams/1", async (req, res) => {
    try {
      const team = await storage.getTeam(1);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Social platform endpoints
  app.get("/api/social-platforms", async (req, res) => {
    try {
      // Mock user ID - in real app would come from session
      const platforms = await storage.getSocialPlatforms(1);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social platforms" });
    }
  });

  app.patch("/api/social-platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const platform = await storage.updateSocialPlatform(id, req.body);
      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      res.status(500).json({ message: "Failed to update platform" });
    }
  });

  // Post endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByTeam(1);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/scheduled", async (req, res) => {
    try {
      const posts = await storage.getScheduledPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheduled posts" });
    }
  });

  app.get("/api/posts/today", async (req, res) => {
    try {
      const posts = await storage.getPostsForToday();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...validatedData,
        authorId: 1, // Mock user ID
        teamId: 1, // Mock team ID
      });

      // Create activity
      await storage.createActivity({
        userId: 1,
        teamId: 1,
        type: validatedData.status === "scheduled" ? "post_scheduled" : "post_created",
        description: `${validatedData.status === "scheduled" ? "scheduled" : "created"} post: ${validatedData.title || "Untitled"}`,
        metadata: { postId: post.id, platforms: validatedData.platforms },
      });

      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updatePost(id, req.body);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Create activity for status changes
      if (req.body.approvalStatus && req.body.approvalStatus !== post.approvalStatus) {
        await storage.createActivity({
          userId: 1,
          teamId: 1,
          type: `post_${req.body.approvalStatus}`,
          description: `${req.body.approvalStatus} post: ${post.title || "Untitled"}`,
          metadata: { postId: post.id },
        });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // In a real implementation, you'd delete the post
      // For now, we'll just mark it as deleted by updating status
      await storage.updatePost(id, { status: "deleted" });

      await storage.createActivity({
        userId: 1,
        teamId: 1,
        type: "post_deleted",
        description: `deleted post: ${post.title || "Untitled"}`,
        metadata: { postId: post.id },
      });

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Template endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const [teamTemplates, publicTemplates] = await Promise.all([
        storage.getTemplatesByTeam(1),
        storage.getPublicTemplates(),
      ]);
      res.json([...teamTemplates, ...publicTemplates]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate({
        ...validatedData,
        authorId: 1,
        teamId: 1,
      });
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Activity endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByTeam(1, limit);
      
      // Enhance activities with user information
      const enhancedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          return {
            ...activity,
            user: user ? { ...user, password: undefined } : null,
          };
        })
      );

      res.json(enhancedActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const posts = await storage.getPostsByTeam(1);
      const scheduledPosts = posts.filter(p => p.status === "scheduled");
      const publishedToday = posts.filter(p => {
        if (!p.publishedAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return p.publishedAt >= today && p.publishedAt < tomorrow;
      });

      const teamMembers = await storage.getTeamMembers(1);

      res.json({
        scheduledPosts: scheduledPosts.length,
        publishedToday: publishedToday.length,
        totalReach: "45.2K", // Mock data
        teamMembers: teamMembers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  app.get("/api/analytics/team-performance", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers(1);
      const posts = await storage.getPostsByTeam(1);

      const performance = teamMembers.map(member => {
        const userPosts = posts.filter(p => p.authorId === member.userId);
        const publishedPosts = userPosts.filter(p => p.status === "published");
        
        return {
          user: { ...member.user, password: undefined },
          posts: userPosts.length,
          published: publishedPosts.length,
          completion: userPosts.length > 0 ? Math.round((publishedPosts.length / userPosts.length) * 100) : 0,
        };
      });

      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team performance" });
    }
  });

  // Bulk operations
  app.post("/api/posts/bulk-schedule", async (req, res) => {
    try {
      const { posts, schedule } = req.body;
      
      if (!posts || !Array.isArray(posts)) {
        return res.status(400).json({ message: "Posts array is required" });
      }

      const createdPosts = [];
      
      for (const postData of posts) {
        const validatedData = insertPostSchema.parse(postData);
        const post = await storage.createPost({
          ...validatedData,
          authorId: 1,
          teamId: 1,
          status: "scheduled",
        });
        createdPosts.push(post);
      }

      await storage.createActivity({
        userId: 1,
        teamId: 1,
        type: "bulk_schedule",
        description: `bulk scheduled ${createdPosts.length} posts`,
        metadata: { postIds: createdPosts.map(p => p.id) },
      });

      res.status(201).json(createdPosts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to bulk schedule posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
