// User Types
export interface User {
  userId: number;
  regNo: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  bio?: string;
  dpUrl?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  regNo: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Post Types
export interface Post {
  postId: number;
  contentText: string;
  contentImage?: string; // For backward compatibility
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL';
  authorId: number;
  authorName: string;
  authorDpUrl?: string;
  authorType: 'USER' | 'CLUB';
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser?: boolean;
}

export interface CreatePostRequest {
  contentText: string;
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL';
}

export interface Comment {
  commentId: number;
  content: string;
  authorId: number;
  authorName: string;
  authorDpUrl?: string;
  createdAt: string;
  parentCommentId?: number; // For nested comments
  replies?: Comment[]; // For nested comments
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number; // For nested comments
}

// Chat Types
export interface ChatRoom {
  chatRoomId: number;
  type: 'PRIVATE' | 'GROUP';
  club?: Club;
  createdAt: string;
  lastMessage?: Message;
  participants?: User[];
}

export interface Message {
  messageId: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface CreateMessageRequest {
  content: string;
}

export interface ChatParticipant {
  userId: number;
  userName: string;
  userDpUrl?: string;
}

// Club Types
export interface Club {
  clubId: number;
  name: string;
  description: string;
  logoUrl?: string;
  category?: string;
  verified: boolean | null;
  isVerified?: boolean; // Alias for verified (for backwards compatibility)
  memberCount?: number;
  createdAt: string;
  createdByUserId?: number;
  createdByName?: string;
}

export interface CreateClubRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface ClubMembership {
  membershipId: number;
  clubId: number;
  clubName: string;
  clubVerified: boolean;
  userId: number;
  userName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  role: 'MEMBER' | 'ADMIN';
  joinedAt: string;
}

// Event Types
export interface Event {
  eventId: number;
  clubId: number;
  clubName: string;
  title: string;
  description: string;
  bannerUrl?: string;
  location: string;
  startTime: string;
  endTime: string;
  registrationLink?: string;
  registrationDeadline?: string;
  odProvided: boolean;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  bannerUrl?: string;
  location: string;
  startTime: string;
  endTime: string;
  registrationLink?: string;
  registrationDeadline?: string;
  odProvided: boolean;
}

// Analytics Types
export interface AdminAnalytics {
  totalUsers: number;
  totalClubs: number;
  verifiedClubs: number;
  totalPosts: number;
  totalEvents: number;
  totalComments: number;
  totalLikes: number;
  activeUsers: number;
}

export interface UserTrend {
  date: string;
  count: number;
}

export interface TrendingPost {
  postId: number;
  authorName: string;
  contentText: string;
  likeCount: number;
  commentCount: number;
  totalEngagement: number;
  createdAt: string;
}

export interface ClubAnalytics {
  clubId: number;
  clubName: string;
  memberCount: number;
  postCount: number;
  eventCount: number;
  engagementScore: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
