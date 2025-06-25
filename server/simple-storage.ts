import { 
  User, InsertUser, Team, InsertTeam, Post, InsertPost, 
  Template, InsertTemplate, SocialPlatform, InsertSocialPlatform,
  Activity, InsertActivity, Analytics, TeamMember
} from "@shared/schema";

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

export class SimpleStorage implements IStorage {
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
    const sampleUsers = [
      { username: "sarah.chen", password: "hashed_password_1", email: "sarah@example.com", name: "Sarah Chen", role: "admin" },
      { username: "mike.rodriguez", password: "hashed_password_2", email: "mike@example.com", name: "Mike Rodriguez", role: "editor" },
      { username: "emma.johnson", password: "hashed_password_3", email: "emma@example.com", name: "Emma Johnson", role: "member" },
    ];

    sampleUsers.forEach(userData => {
      const user: User = {
        id: this.currentId.users++,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: null,
        timezone: null,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });

    // Create sample team
    const sampleTeam: Team = {
      id: this.currentId.teams++,
      name: "Content Team",
      description: "Main content creation team",
      ownerId: 1,
      createdAt: new Date(),
    };
    this.teams.set(sampleTeam.id, sampleTeam);

    // Create team members
    [1, 2, 3].forEach(userId => {
      const member: TeamMember = {
        id: this.currentId.teamMembers++,
        teamId: 1,
        userId,
        role: userId === 1 ? "admin" : "member",
        joinedAt: new Date(),
      };
      this.teamMembers.set(member.id, member);
    });

    // Create sample social platforms
    const platforms = [
      { name: "twitter", displayName: "Twitter", icon: "twitter" },
      { name: "facebook", displayName: "Facebook", icon: "facebook" },
      { name: "linkedin", displayName: "LinkedIn", icon: "linkedin" },
      { name: "instagram", displayName: "Instagram", icon: "instagram" },
    ];

    platforms.forEach(platformData => {
      const platform: SocialPlatform = {
        id: this.currentId.socialPlatforms++,
        name: platformData.name,
        displayName: platformData.displayName,
        icon: platformData.icon,
        isConnected: false,
        userId: 1,
        credentials: null,
        createdAt: new Date(),
      };
      this.socialPlatforms.set(platform.id, platform);
    });

    // Create sample posts
    const samplePosts = [
      {
        title: "Welcome Post",
        content: { en: "Welcome to our platform!", pt: "Bem-vindos à nossa plataforma!" },
        platforms: ["twitter", "facebook"],
        authorId: 1,
        teamId: 1,
        status: "published" as const,
        approvalStatus: "approved" as const,
      },
      {
        title: "Scheduled Post",
        content: { en: "This is a scheduled post", pt: "Este é um post agendado" },
        platforms: ["twitter"],
        authorId: 2,
        teamId: 1,
        status: "scheduled" as const,
        approvalStatus: "pending" as const,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    samplePosts.forEach(postData => {
      const post: Post = {
        id: this.currentId.posts++,
        title: postData.title,
        content: postData.content,
        media: null,
        platforms: postData.platforms,
        authorId: postData.authorId,
        teamId: postData.teamId,
        status: postData.status,
        scheduledAt: postData.scheduledAt || null,
        publishedAt: postData.status === "published" ? new Date() : null,
        approvalStatus: postData.approvalStatus,
        approverId: postData.approvalStatus === "approved" ? 1 : null,
        approvedAt: postData.approvalStatus === "approved" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.posts.set(post.id, post);
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
    const user: User = {
      id: this.currentId.users++,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      name: insertUser.name,
      role: insertUser.role || "member",
      avatar: insertUser.avatar || null,
      timezone: insertUser.timezone || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
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
    const team: Team = {
      id: this.currentId.teams++,
      name: insertTeam.name,
      description: insertTeam.description || null,
      ownerId: insertTeam.ownerId || null,
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);
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
    return Array.from(this.teamMembers.values())
      .filter(member => member.teamId === teamId && member.userId)
      .map(member => {
        const user = this.users.get(member.userId!);
        return user ? { ...member, user } : null;
      })
      .filter((member): member is TeamMember & { user: User } => member !== null);
  }

  async addTeamMember(teamId: number, userId: number, role = "member"): Promise<void> {
    const member: TeamMember = {
      id: this.currentId.teamMembers++,
      teamId,
      userId,
      role,
      joinedAt: new Date(),
    };
    this.teamMembers.set(member.id, member);
  }

  // Social Platform methods
  async getSocialPlatforms(userId: number): Promise<SocialPlatform[]> {
    return Array.from(this.socialPlatforms.values())
      .filter(platform => platform.userId === userId);
  }

  async createSocialPlatform(insertPlatform: InsertSocialPlatform): Promise<SocialPlatform> {
    const platform: SocialPlatform = {
      id: this.currentId.socialPlatforms++,
      name: insertPlatform.name,
      displayName: insertPlatform.displayName,
      icon: insertPlatform.icon,
      isConnected: insertPlatform.isConnected || false,
      userId: insertPlatform.userId || null,
      credentials: insertPlatform.credentials || null,
      createdAt: new Date(),
    };
    this.socialPlatforms.set(platform.id, platform);
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
    const post: Post = {
      id: this.currentId.posts++,
      title: insertPost.title || null,
      content: insertPost.content,
      media: insertPost.media || null,
      platforms: insertPost.platforms,
      authorId: insertPost.authorId || null,
      teamId: insertPost.teamId || null,
      status: insertPost.status || "draft",
      scheduledAt: insertPost.scheduledAt || null,
      publishedAt: null,
      approvalStatus: insertPost.approvalStatus || "pending",
      approverId: insertPost.approverId || null,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(post.id, post);
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
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getScheduledPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.status === "scheduled");
  }

  async getPostsForToday(): Promise<Post[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.posts.values())
      .filter(post => 
        post.scheduledAt && 
        post.scheduledAt >= today && 
        post.scheduledAt < tomorrow
      );
  }

  // Template methods
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const template: Template = {
      id: this.currentId.templates++,
      name: insertTemplate.name,
      description: insertTemplate.description || null,
      content: insertTemplate.content,
      teamId: insertTemplate.teamId || null,
      authorId: insertTemplate.authorId || null,
      category: insertTemplate.category || null,
      isPublic: insertTemplate.isPublic || false,
      createdAt: new Date(),
    };
    this.templates.set(template.id, template);
    return template;
  }

  async getTemplatesByTeam(teamId: number): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.teamId === teamId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getPublicTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.isPublic)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: this.currentId.activities++,
      type: insertActivity.type,
      description: insertActivity.description,
      teamId: insertActivity.teamId || null,
      userId: insertActivity.userId || null,
      metadata: insertActivity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async getActivitiesByTeam(teamId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.teamId === teamId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  // Analytics methods
  async getAnalytics(postId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.postId === postId);
  }

  async createAnalytics(insertAnalytics: Omit<Analytics, 'id' | 'createdAt'>): Promise<Analytics> {
    const analytics: Analytics = {
      id: this.currentId.analytics++,
      ...insertAnalytics,
      createdAt: new Date(),
    };
    this.analytics.set(analytics.id, analytics);
    return analytics;
  }

  async getTeamAnalytics(teamId: number): Promise<Analytics[]> {
    const teamPosts = Array.from(this.posts.values())
      .filter(post => post.teamId === teamId);
    const postIds = teamPosts.map(post => post.id);
    
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.postId && postIds.includes(analytics.postId));
  }
}

// Always use memory storage for simplicity and reliability
export const storage = new SimpleStorage();