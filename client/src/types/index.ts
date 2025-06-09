export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  timezone?: string;
  createdAt: Date;
}

export interface Post {
  id: number;
  title?: string;
  content: Record<string, string>;
  media?: any;
  platforms: string[];
  authorId: number;
  teamId: number;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approverId?: number;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPlatform {
  id: number;
  name: string;
  displayName: string;
  icon: string;
  isConnected: boolean;
  userId: number;
  credentials?: any;
  createdAt: Date;
}

export interface Activity {
  id: number;
  userId: number;
  teamId: number;
  type: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  user?: User;
}

export interface AnalyticsOverview {
  scheduledPosts: number;
  publishedToday: number;
  totalReach: string;
  teamMembers: number;
}

export interface TeamPerformance {
  user: User;
  posts: number;
  published: number;
  completion: number;
}
