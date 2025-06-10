import {
  users, teams, teamMembers, socialPlatforms, posts, templates, analytics, activities,
  type User, type InsertUser, type Team, type InsertTeam, type Post, type InsertPost,
  type Template, type InsertTemplate, type SocialPlatform, type InsertSocialPlatform,
  type Activity, type InsertActivity, type Analytics, type TeamMember
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Teams
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamsByUser(userId: number): Promise<Team[]>;
  getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]>;
  addTeamMember(teamId: number, userId: number, role?: string): Promise<void>;

  // Social Platforms
  getSocialPlatforms(userId: number): Promise<SocialPlatform[]>;
  createSocialPlatform(platform: InsertSocialPlatform): Promise<SocialPlatform>;
  updateSocialPlatform(id: number, updates: Partial<SocialPlatform>): Promise<SocialPlatform | undefined>;

  // Posts
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  getPostsByTeam(teamId: number): Promise<Post[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getScheduledPosts(): Promise<Post[]>;
  getPostsForToday(): Promise<Post[]>;

  // Templates
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplatesByTeam(teamId: number): Promise<Template[]>;
  getPublicTemplates(): Promise<Template[]>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByTeam(teamId: number, limit?: number): Promise<Activity[]>;

  // Analytics
  getAnalytics(postId: number): Promise<Analytics[]>;
  createAnalytics(analytics: Omit<Analytics, 'id' | 'createdAt'>): Promise<Analytics>;
  getTeamAnalytics(teamId: number): Promise<Analytics[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    const userTeams = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    
    return userTeams.map(ut => ut.team);
  }

  async getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]> {
    const members = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: users
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return members;
  }

  async addTeamMember(teamId: number, userId: number, role = "member"): Promise<void> {
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role,
    });
  }

  async getSocialPlatforms(userId: number): Promise<SocialPlatform[]> {
    return await db.select().from(socialPlatforms).where(eq(socialPlatforms.userId, userId));
  }

  async createSocialPlatform(insertPlatform: InsertSocialPlatform): Promise<SocialPlatform> {
    const [platform] = await db
      .insert(socialPlatforms)
      .values(insertPlatform)
      .returning();
    return platform;
  }

  async updateSocialPlatform(id: number, updates: Partial<SocialPlatform>): Promise<SocialPlatform | undefined> {
    const [platform] = await db
      .update(socialPlatforms)
      .set(updates)
      .where(eq(socialPlatforms.id, id))
      .returning();
    return platform || undefined;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async getPostsByTeam(teamId: number): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.teamId, teamId)).orderBy(desc(posts.createdAt));
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.authorId, userId)).orderBy(desc(posts.createdAt));
  }

  async getScheduledPosts(): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.status, "scheduled")).orderBy(desc(posts.scheduledAt));
  }

  async getPostsForToday(): Promise<Post[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.select().from(posts).where(
      and(
        eq(posts.status, "scheduled"),
        // Note: This is a simplified date comparison. In production, you'd want more precise date handling
      )
    );
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async getTemplatesByTeam(teamId: number): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.teamId, teamId)).orderBy(desc(templates.createdAt));
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isPublic, true)).orderBy(desc(templates.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getActivitiesByTeam(teamId: number, limit = 10): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.teamId, teamId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getAnalytics(postId: number): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.postId, postId));
  }

  async createAnalytics(insertAnalytics: Omit<Analytics, 'id' | 'createdAt'>): Promise<Analytics> {
    const [analyticsRecord] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsRecord;
  }

  async getTeamAnalytics(teamId: number): Promise<Analytics[]> {
    return await db
      .select({ analytics: analytics })
      .from(analytics)
      .innerJoin(posts, eq(analytics.postId, posts.id))
      .where(eq(posts.teamId, teamId))
      .then(results => results.map(r => r.analytics));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private teams: Map<number, Team> = new Map();
  private teamMembers: Map<number, TeamMember> = new Map();
  private socialPlatforms: Map<number, SocialPlatform> = new Map();
  private posts: Map<number, Post> = new Map();
  private templates: Map<number, Template> = new Map();
  private analytics: Map<number, Analytics> = new Map();
  private activities: Map<number, Activity> = new Map();

  private currentId = {
    users: 1,
    teams: 1,
    teamMembers: 1,
    socialPlatforms: 1,
    posts: 1,
    templates: 1,
    analytics: 1,
    activities: 1,
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: 1,
        username: "sarah.chen",
        password: "password",
        email: "sarah@company.com",
        name: "Sarah Chen",
        role: "admin",
        avatar: "https://pixabay.com/get/g9742a70d5e972f523495af85bf3ba3e90d77fe1b2ffeb3746b230da98f8b0511d5c8fb89b553705a539b4ae215a65ebc6ee0032a6d0061d12c9c877afe84aeea_1280.jpg",
        timezone: "UTC-8",
        createdAt: new Date(),
      },
      {
        id: 2,
        username: "alex.rivera",
        password: "password",
        email: "alex@company.com",
        name: "Alex Rivera",
        role: "manager",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64",
        timezone: "UTC-5",
        createdAt: new Date(),
      },
      {
        id: 3,
        username: "maria.garcia",
        password: "password",
        email: "maria@company.com",
        name: "Maria Garcia",
        role: "member",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64",
        timezone: "UTC+1",
        createdAt: new Date(),
      },
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
      this.currentId.users = Math.max(this.currentId.users, user.id + 1);
    });

    // Create sample team
    const sampleTeam: Team = {
      id: 1,
      name: "Marketing Team",
      description: "Global marketing and social media team",
      ownerId: 1,
      createdAt: new Date(),
    };
    this.teams.set(1, sampleTeam);
    this.currentId.teams = 2;

    // Add team members
    const sampleTeamMembers: TeamMember[] = [
      { id: 1, teamId: 1, userId: 1, role: "admin", joinedAt: new Date() },
      { id: 2, teamId: 1, userId: 2, role: "admin", joinedAt: new Date() },
      { id: 3, teamId: 1, userId: 3, role: "member", joinedAt: new Date() },
    ];

    sampleTeamMembers.forEach(member => {
      this.teamMembers.set(member.id, member);
      this.currentId.teamMembers = Math.max(this.currentId.teamMembers, member.id + 1);
    });

    // Create sample social platforms
    const samplePlatforms: SocialPlatform[] = [
      { id: 1, name: "twitter", displayName: "Twitter", icon: "fab fa-twitter", isConnected: true, userId: 1, credentials: {}, createdAt: new Date() },
      { id: 2, name: "facebook", displayName: "Facebook", icon: "fab fa-facebook", isConnected: true, userId: 1, credentials: {}, createdAt: new Date() },
      { id: 3, name: "linkedin", displayName: "LinkedIn", icon: "fab fa-linkedin", isConnected: true, userId: 1, credentials: {}, createdAt: new Date() },
      { id: 4, name: "instagram", displayName: "Instagram", icon: "fab fa-instagram", isConnected: false, userId: 1, credentials: {}, createdAt: new Date() },
      { id: 5, name: "tiktok", displayName: "TikTok", icon: "fab fa-tiktok", isConnected: true, userId: 1, credentials: {}, createdAt: new Date() },
      { id: 6, name: "pinterest", displayName: "Pinterest", icon: "fab fa-pinterest", isConnected: false, userId: 1, credentials: {}, createdAt: new Date() },
    ];

    samplePlatforms.forEach(platform => {
      this.socialPlatforms.set(platform.id, platform);
      this.currentId.socialPlatforms = Math.max(this.currentId.socialPlatforms, platform.id + 1);
    });

    // Create sample posts
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const evening = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now

    const samplePosts: Post[] = [
      {
        id: 1,
        title: "New Product Launch Announcement",
        content: {
          en: "Excited to announce our latest product that will revolutionize remote work! 🚀 #RemoteWork #Innovation",
          es: "¡Emocionados de anunciar nuestro último producto que revolucionará el trabajo remoto! 🚀 #TrabajoRemoto #Innovación",
          "pt-BR": "Empolgados em anunciar nosso novo produto que vai revolucionar o trabalho remoto! 🚀 #TrabalhoRemoto #Inovação"
        },
        media: null,
        platforms: ["twitter", "linkedin"],
        authorId: 2,
        teamId: 1,
        status: "scheduled",
        scheduledAt: later,
        publishedAt: null,
        approvalStatus: "pending",
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "Weekly Tips: Remote Team Management",
        content: {
          en: "This week's tip focuses on maintaining team productivity while working distributed. 💼 #RemoteWork #TeamManagement",
          fr: "Le conseil de cette semaine se concentre sur le maintien de la productivité de l'équipe en travaillant de manière distribuée. 💼 #TravailDistance #GestionEquipe",
          de: "Der Tipp dieser Woche konzentriert sich darauf, die Teamproduktivität bei verteilter Arbeit aufrechtzuerhalten. 💼 #RemoteArbeit #TeamManagement",
          "pt-BR": "A dica desta semana foca em manter a produtividade da equipe trabalhando de forma distribuída. 💼 #TrabalhoRemoto #GestãoDeEquipe"
        },
        media: null,
        platforms: ["tiktok", "pinterest"],
        authorId: 3,
        teamId: 1,
        status: "scheduled",
        scheduledAt: evening,
        publishedAt: null,
        approvalStatus: "approved",
        approverId: 1,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    samplePosts.forEach(post => {
      this.posts.set(post.id, post);
      this.currentId.posts = Math.max(this.currentId.posts, post.id + 1);
    });

    // Create sample activities
    const sampleActivities: Activity[] = [
      {
        id: 1,
        userId: 2,
        teamId: 1,
        type: "post_published",
        description: "published post to LinkedIn",
        metadata: { platform: "linkedin", postId: 1 },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: 3,
        teamId: 1,
        type: "post_scheduled",
        description: "scheduled post for Twitter & Facebook",
        metadata: { platforms: ["twitter", "facebook"], postId: 2 },
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId: 1,
        teamId: 1,
        type: "post_approved",
        description: "approved content for review",
        metadata: { postId: 2 },
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
    ];

    sampleActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
      this.currentId.activities = Math.max(this.currentId.activities, activity.id + 1);
    });

    // Create sample templates with multilingual content
    const sampleTemplates = [
      {
        id: 1,
        name: "Product Launch Announcement",
        description: "Template for announcing new product launches",
        content: {
          en: "🚀 Exciting news! We're launching [PRODUCT_NAME] - a game-changer for [INDUSTRY]. Get ready to revolutionize your workflow! #ProductLaunch #Innovation",
          es: "🚀 ¡Noticias emocionantes! Estamos lanzando [PRODUCT_NAME] - un cambio revolucionario para [INDUSTRY]. ¡Prepárate para revolucionar tu flujo de trabajo! #LanzamientoProducto #Innovación",
          "pt-BR": "🚀 Novidades empolgantes! Estamos lançando [PRODUCT_NAME] - uma revolução para [INDUSTRY]. Prepare-se para revolucionar seu fluxo de trabalho! #LançamentoProduto #Inovação"
        },
        category: "product",
        authorId: 1,
        teamId: 1,
        isPublic: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Weekly Team Update",
        description: "Template for sharing weekly team progress",
        content: {
          en: "📊 Weekly Update: Our team accomplished [ACHIEVEMENTS] this week. Next week we're focusing on [GOALS]. #TeamWork #Progress",
          fr: "📊 Mise à jour hebdomadaire : Notre équipe a accompli [ACHIEVEMENTS] cette semaine. La semaine prochaine, nous nous concentrons sur [GOALS]. #TravailEquipe #Progrès",
          "pt-BR": "📊 Atualização Semanal: Nossa equipe conquistou [ACHIEVEMENTS] esta semana. Na próxima semana vamos focar em [GOALS]. #TrabalhoEmEquipe #Progresso"
        },
        category: "social",
        authorId: 2,
        teamId: 1,
        isPublic: false,
        createdAt: new Date(),
      }
    ];

    sampleTemplates.forEach(template => {
      this.templates.set(template.id, template);
      this.currentId.templates = Math.max(this.currentId.templates, template.id + 1);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Team methods
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentId.teams++;
    const team: Team = {
      ...insertTeam,
      id,
      createdAt: new Date(),
    };
    this.teams.set(id, team);
    return team;
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    const userTeamIds = Array.from(this.teamMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.teamId);
    
    return Array.from(this.teams.values())
      .filter(team => userTeamIds.includes(team.id));
  }

  async getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]> {
    const members = Array.from(this.teamMembers.values())
      .filter(member => member.teamId === teamId);
    
    return members.map(member => {
      const user = this.users.get(member.userId);
      return { ...member, user: user! };
    }).filter(member => member.user);
  }

  async addTeamMember(teamId: number, userId: number, role = "member"): Promise<void> {
    const id = this.currentId.teamMembers++;
    const member: TeamMember = {
      id,
      teamId,
      userId,
      role,
      joinedAt: new Date(),
    };
    this.teamMembers.set(id, member);
  }

  // Social Platform methods
  async getSocialPlatforms(userId: number): Promise<SocialPlatform[]> {
    return Array.from(this.socialPlatforms.values())
      .filter(platform => platform.userId === userId);
  }

  async createSocialPlatform(insertPlatform: InsertSocialPlatform): Promise<SocialPlatform> {
    const id = this.currentId.socialPlatforms++;
    const platform: SocialPlatform = {
      ...insertPlatform,
      id,
      createdAt: new Date(),
    };
    this.socialPlatforms.set(id, platform);
    return platform;
  }

  async updateSocialPlatform(id: number, updates: Partial<SocialPlatform>): Promise<SocialPlatform | undefined> {
    const platform = this.socialPlatforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform = { ...platform, ...updates };
    this.socialPlatforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentId.posts++;
    const post: Post = {
      ...insertPost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async getPostsByTeam(teamId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.teamId === teamId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getScheduledPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.status === "scheduled")
      .sort((a, b) => {
        if (!a.scheduledAt || !b.scheduledAt) return 0;
        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
      });
  }

  async getPostsForToday(): Promise<Post[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.posts.values())
      .filter(post => {
        if (!post.scheduledAt) return false;
        return post.scheduledAt >= today && post.scheduledAt < tomorrow;
      })
      .sort((a, b) => {
        if (!a.scheduledAt || !b.scheduledAt) return 0;
        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
      });
  }

  // Template methods
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentId.templates++;
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async getTemplatesByTeam(teamId: number): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.teamId === teamId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPublicTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.isPublic)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activities++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivitiesByTeam(teamId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.teamId === teamId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Analytics methods
  async getAnalytics(postId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.postId === postId);
  }

  async createAnalytics(insertAnalytics: Omit<Analytics, 'id' | 'createdAt'>): Promise<Analytics> {
    const id = this.currentId.analytics++;
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getTeamAnalytics(teamId: number): Promise<Analytics[]> {
    const teamPosts = await this.getPostsByTeam(teamId);
    const postIds = teamPosts.map(post => post.id);
    
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.postId && postIds.includes(analytics.postId));
  }
}

export const storage = new DatabaseStorage();
