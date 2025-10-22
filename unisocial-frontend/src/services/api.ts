import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Post,
  CreatePostRequest,
  Comment,
  CreateCommentRequest,
  Club,
  CreateClubRequest,
  ClubMembership,
  Event,
  CreateEventRequest,
  ChatRoom,
  Message,
  AdminAnalytics,
  UserTrend,
  TrendingPost,
  ClubAnalytics,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          console.warn('Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async testConnection(): Promise<ApiResponse<string>> {
    const response: AxiosResponse<ApiResponse<string>> = await this.api.get('/api/auth/test');
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/login', data);
    return response.data;
  }

  // User APIs
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/users/me');
    return response.data;
  }

  async updateCurrentUser(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/api/users/me', data);
    return response.data;
  }

  // Alias for updateCurrentUser (for profile completion)
  async updateProfile(data: { name?: string; bio?: string; dpUrl?: string }): Promise<User> {
    return this.updateCurrentUser(data);
  }

  async deleteCurrentUser(): Promise<void> {
    await this.api.delete('/api/users/me');
  }

  async getUserById(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/api/users/${id}`);
    return response.data;
  }

  async getUserClubs(userId: number): Promise<ClubMembership[]> {
    const response: AxiosResponse<ClubMembership[]> = await this.api.get(`/api/users/${userId}/clubs`);
    return response.data;
  }

  async getAllUserMemberships(userId: number): Promise<ClubMembership[]> {
    const response: AxiosResponse<ClubMembership[]> = await this.api.get(`/api/users/${userId}/memberships`);
    return response.data;
  }

  // File Upload APIs
  async uploadMedia(file: File): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<{ url: string; type: string }> = await this.api.post('/api/upload/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadImage(file: File): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<{ url: string; type: string }> = await this.api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadVideo(file: File): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<{ url: string; type: string }> = await this.api.post('/api/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<{ url: string; type: string }> = await this.api.post('/api/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Post APIs
  async createPost(data: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post('/api/posts', data);
    return response.data;
  }

  async createClubPost(clubId: number, data: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post(`/api/clubs/${clubId}/posts`, data);
    return response.data;
  }

  async deletePost(postId: number): Promise<void> {
    await this.api.delete(`/api/posts/${postId}`);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get(`/api/posts/user/${userId}`);
    return response.data;
  }

  async getPostsFeed(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/api/posts/feed');
    return response.data;
  }

  async addComment(postId: number, data: CreateCommentRequest): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/api/posts/${postId}/comments`, data);
    return response.data;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const response: AxiosResponse<Comment[]> = await this.api.get(`/api/posts/${postId}/comments`);
    return response.data;
  }

  // Like APIs
  async getPostLikes(postId: number): Promise<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> {
    const response: AxiosResponse<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> = await this.api.get(`/api/posts/${postId}/likes`);
    return response.data;
  }

  async likePost(postId: number): Promise<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> {
    const response: AxiosResponse<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> = await this.api.post(`/api/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: number): Promise<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> {
    const response: AxiosResponse<{ postId: number; totalLikes: number; likedByCurrentUser: boolean }> = await this.api.delete(`/api/posts/${postId}/like`);
    return response.data;
  }

  // Chat APIs
  async getUserChatRooms(): Promise<ChatRoom[]> {
    const response: AxiosResponse<ChatRoom[]> = await this.api.get('/api/chat/rooms');
    return response.data;
  }

  async getChatMessages(chatRoomId: number): Promise<Message[]> {
    const response: AxiosResponse<Message[]> = await this.api.get(`/api/chat/${chatRoomId}/messages`);
    return response.data;
  }

  async sendMessage(chatRoomId: number, content: string): Promise<Message> {
    const response: AxiosResponse<Message> = await this.api.post(`/api/chat/${chatRoomId}/message`, { content });
    return response.data;
  }

  async startPrivateChat(receiverId: number): Promise<ChatRoom> {
    const response: AxiosResponse<ChatRoom> = await this.api.post(`/api/chat/private/${receiverId}`);
    return response.data;
  }

  async startGroupChat(clubId: number): Promise<ChatRoom> {
    const response: AxiosResponse<ChatRoom> = await this.api.post(`/api/chat/group/${clubId}`);
    return response.data;
  }

  // Club APIs
  async createClub(data: CreateClubRequest): Promise<Club> {
    const response: AxiosResponse<Club> = await this.api.post('/api/clubs', data);
    return response.data;
  }

  async getClubById(clubId: number): Promise<Club> {
    const response: AxiosResponse<Club> = await this.api.get(`/api/clubs/${clubId}`);
    return response.data;
  }

  async getClubs(verified?: boolean): Promise<Club[]> {
    const params = verified !== undefined ? { verified } : {};
    const response: AxiosResponse<Club[]> = await this.api.get('/api/clubs', { params });
    return response.data;
  }

  async getAllClubsForAdmin(): Promise<Club[]> {
    const response: AxiosResponse<Club[]> = await this.api.get('/api/clubs', { params: { verified: 'all' } });
    return response.data;
  }

  async joinClub(clubId: number): Promise<void> {
    await this.api.post(`/api/clubs/${clubId}/join`);
  }

  async getClubMembershipStatus(clubId: number): Promise<{ isMember: boolean; status: string; role: string; membershipId?: number }> {
    const response: AxiosResponse<{ isMember: boolean; status: string; role: string; membershipId?: number }> = await this.api.get(`/api/clubs/${clubId}/membership-status`);
    return response.data;
  }

  async verifyClub(clubId: number): Promise<void> {
    await this.api.put(`/api/clubs/${clubId}/verify`);
  }

  async updateClub(clubId: number, clubData: { name: string; description?: string; logoUrl?: string }): Promise<Club> {
    const response: AxiosResponse<Club> = await this.api.put(`/api/clubs/${clubId}`, clubData);
    return response.data;
  }

  async deleteClub(clubId: number): Promise<void> {
    await this.api.delete(`/api/clubs/${clubId}`);
  }

  async approveClub(clubId: number): Promise<void> {
    await this.api.put(`/api/admin/clubs/${clubId}/approve`);
  }

  async rejectClub(clubId: number): Promise<void> {
    await this.api.put(`/api/admin/clubs/${clubId}/reject`);
  }

  async getClubPosts(clubId: number): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get(`/api/clubs/${clubId}/posts`);
    return response.data;
  }

  async getClubMembers(clubId: number): Promise<ClubMembership[]> {
    const response: AxiosResponse<ClubMembership[]> = await this.api.get(`/api/clubs/memberships/club/${clubId}/members`);
    return response.data;
  }

  // Club Membership APIs
  async approveMembership(membershipId: number): Promise<void> {
    await this.api.put(`/api/clubs/memberships/${membershipId}/approve`);
  }

  async rejectMembership(membershipId: number): Promise<void> {
    await this.api.put(`/api/clubs/memberships/${membershipId}/reject`);
  }

  async promoteMember(membershipId: number): Promise<void> {
    await this.api.put(`/api/clubs/memberships/${membershipId}/promote`);
  }

  async demoteMember(membershipId: number): Promise<void> {
    await this.api.put(`/api/clubs/memberships/${membershipId}/demote`);
  }

  async getPendingMemberships(clubId: number): Promise<ClubMembership[]> {
    const response: AxiosResponse<ClubMembership[]> = await this.api.get(`/api/clubs/memberships/club/${clubId}/pending`);
    return response.data;
  }

  async removeMember(clubId: number, userId: number): Promise<void> {
    await this.api.delete(`/api/clubs/memberships/club/${clubId}/members/${userId}`);
  }

  // Event APIs
  async createEvent(clubId: number, data: CreateEventRequest): Promise<Event> {
    const response: AxiosResponse<Event> = await this.api.post(`/api/clubs/${clubId}/events`, data);
    return response.data;
  }

  async updateEvent(eventId: number, data: Partial<CreateEventRequest>): Promise<Event> {
    const response: AxiosResponse<Event> = await this.api.put(`/api/events/${eventId}`, data);
    return response.data;
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.api.delete(`/api/events/${eventId}`);
  }

  async getEventById(eventId: number): Promise<Event> {
    const response: AxiosResponse<Event> = await this.api.get(`/api/events/${eventId}`);
    return response.data;
  }

  async getAllEvents(year?: number, month?: number): Promise<Event[]> {
    const params = year && month ? { year, month } : {};
    const response: AxiosResponse<Event[]> = await this.api.get('/api/events', { params });
    return response.data;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.api.get('/api/events/upcoming');
    return response.data;
  }

  async getClubEvents(clubId: number): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.api.get(`/api/clubs/${clubId}/events`);
    return response.data;
  }

  // Admin APIs
  async getAllUsers(): Promise<{ total: number; users: any[] }> {
    const response: AxiosResponse<{ total: number; users: any[] }> = await this.api.get('/api/admin/users');
    return response.data;
  }

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const response: AxiosResponse<AdminAnalytics> = await this.api.get('/api/admin/analytics');
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/api/admin/users/${userId}`);
  }

  // Analytics APIs
  async getUserTrends(startDate?: string, endDate?: string): Promise<{ total: number; trends: UserTrend[] }> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response: AxiosResponse<{ total: number; trends: UserTrend[] }> = await this.api.get('/api/analytics/users/trends', { params });
    return response.data;
  }

  async getTrendingPosts(limit?: number): Promise<{ count: number; posts: TrendingPost[] }> {
    const params = limit ? { limit } : {};
    const response: AxiosResponse<{ count: number; posts: TrendingPost[] }> = await this.api.get('/api/analytics/posts/trending', { params });
    return response.data;
  }

  async getClubAnalytics(clubId: number): Promise<ClubAnalytics> {
    const response: AxiosResponse<ClubAnalytics> = await this.api.get(`/api/analytics/clubs/${clubId}`);
    return response.data;
  }

  // Recommendation APIs
  async getRecommendedPosts(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/api/recommendations/posts');
    return response.data;
  }

  async getRecommendedEvents(): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.api.get('/api/recommendations/events');
    return response.data;
  }

  async getRecommendedClubs(): Promise<Club[]> {
    const response: AxiosResponse<Club[]> = await this.api.get('/api/recommendations/clubs');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
