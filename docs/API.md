# 📚 API Documentation - UniConnect

## Base URL
- **Development**: `http://localhost:8080`
- **Production**: `https://your-backend.railway.app`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "regNo": "21BCE1234",
  "email": "student@vitstudent.ac.in",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "regNo": "21BCE1234",
    "email": "student@vitstudent.ac.in",
    "name": "John Doe",
    "role": "USER",
    "bio": "",
    "dpUrl": "",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@vitstudent.ac.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "regNo": "21BCE1234",
    "email": "student@vitstudent.ac.in",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Test API Health
```http
GET /api/auth/test
```

**Response:**
```json
{
  "status": "API is working",
  "message": "UniConnect Backend is running",
  "timestamp": 1640995200000
}
```

---

## 👤 User Management

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Update Current User
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Updated bio",
  "dpUrl": "https://example.com/profile.jpg"
}
```

### Get User by ID
```http
GET /api/users/{userId}
Authorization: Bearer <token>
```

### Search Users
```http
GET /api/users/search?query=john
Authorization: Bearer <token>
```

### Get User's Clubs
```http
GET /api/users/{userId}/clubs
Authorization: Bearer <token>
```

---

## 📝 Posts

### Get Posts Feed
```http
GET /api/posts/feed
```

### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentText": "Hello World!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE"
}
```

### Create Club Post
```http
POST /api/clubs/{clubId}/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentText": "Club announcement!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE"
}
```

### Get User Posts
```http
GET /api/posts/user/{userId}
Authorization: Bearer <token>
```

### Delete Post
```http
DELETE /api/posts/{postId}
Authorization: Bearer <token>
```

---

## 💬 Comments

### Add Comment
```http
POST /api/posts/{postId}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!"
}
```

### Get Post Comments
```http
GET /api/posts/{postId}/comments
```

---

## ❤️ Likes

### Like Post
```http
POST /api/posts/{postId}/like
Authorization: Bearer <token>
```

### Unlike Post
```http
DELETE /api/posts/{postId}/like
Authorization: Bearer <token>
```

### Get Post Likes
```http
GET /api/posts/{postId}/likes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "postId": 1,
  "totalLikes": 25,
  "likedByCurrentUser": true
}
```

---

## 🏛️ Clubs

### Get All Clubs
```http
GET /api/clubs
```

### Get Verified Clubs
```http
GET /api/clubs?verified=true
```

### Get Club by ID
```http
GET /api/clubs/{clubId}
```

### Create Club
```http
POST /api/clubs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Club",
  "description": "Technology enthusiasts",
  "logoUrl": "https://example.com/logo.jpg"
}
```

### Join Club
```http
POST /api/clubs/{clubId}/join
Authorization: Bearer <token>
```

### Get Club Membership Status
```http
GET /api/clubs/{clubId}/membership-status
Authorization: Bearer <token>
```

### Get Club Posts
```http
GET /api/clubs/{clubId}/posts
Authorization: Bearer <token>
```

---

## 🎉 Events

### Get All Events
```http
GET /api/events
```

### Get Upcoming Events
```http
GET /api/events/upcoming
```

### Get Events by Club
```http
GET /api/clubs/{clubId}/events
```

### Create Event
```http
POST /api/clubs/{clubId}/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Workshop",
  "description": "Learn about React",
  "startTime": "2024-02-01T10:00:00Z",
  "endTime": "2024-02-01T12:00:00Z",
  "location": "VIT Campus",
  "bannerUrl": "https://example.com/banner.jpg"
}
```

### Get Event by ID
```http
GET /api/events/{eventId}
```

### Update Event
```http
PUT /api/events/{eventId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Workshop",
  "description": "Updated description"
}
```

### Delete Event
```http
DELETE /api/events/{eventId}
Authorization: Bearer <token>
```

---

## 💬 Chat

### Get User's Chat Rooms
```http
GET /api/chat/rooms
Authorization: Bearer <token>
```

### Get Chat Messages
```http
GET /api/chat/{chatRoomId}/messages
Authorization: Bearer <token>
```

### Send Message
```http
POST /api/chat/{chatRoomId}/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello everyone!"
}
```

### Start Private Chat
```http
POST /api/chat/private/{receiverId}
Authorization: Bearer <token>
```

### Start Group Chat
```http
POST /api/chat/group/{clubId}
Authorization: Bearer <token>
```

---

## 📁 File Upload

### Upload Media
```http
POST /api/upload/media
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
```

### Upload Video
```http
POST /api/upload/video
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <video-file>
```

### Upload Profile Picture
```http
POST /api/upload/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
```

**Response:**
```json
{
  "url": "https://your-backend.railway.app/uploads/filename.jpg",
  "type": "IMAGE"
}
```

---

## 👑 Admin Endpoints

### Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer <admin-token>
```

### Get Admin Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin-token>
```

### Delete User (Admin Only)
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer <admin-token>
```

### Approve Club (Admin Only)
```http
PUT /api/admin/clubs/{clubId}/approve
Authorization: Bearer <admin-token>
```

### Reject Club (Admin Only)
```http
PUT /api/admin/clubs/{clubId}/reject
Authorization: Bearer <admin-token>
```

---

## 📊 Analytics

### Get User Trends
```http
GET /api/analytics/users/trends
Authorization: Bearer <admin-token>
```

### Get Trending Posts
```http
GET /api/analytics/posts/trending?limit=10
Authorization: Bearer <admin-token>
```

### Get Club Analytics
```http
GET /api/analytics/clubs/{clubId}
Authorization: Bearer <token>
```

---

## 🎯 Recommendations

### Get Recommended Posts
```http
GET /api/recommendations/posts
Authorization: Bearer <token>
```

### Get Recommended Events
```http
GET /api/recommendations/events
Authorization: Bearer <token>
```

### Get Recommended Clubs
```http
GET /api/recommendations/clubs
Authorization: Bearer <token>
```

---

## 📝 Data Models

### User
```json
{
  "userId": 1,
  "regNo": "21BCE1234",
  "email": "student@vitstudent.ac.in",
  "name": "John Doe",
  "role": "USER",
  "bio": "Student at VIT",
  "dpUrl": "https://example.com/profile.jpg",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Post
```json
{
  "postId": 1,
  "authorId": 1,
  "authorName": "John Doe",
  "authorDpUrl": "https://example.com/profile.jpg",
  "authorType": "USER",
  "contentText": "Hello World!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE",
  "createdAt": "2024-01-15T10:30:00Z",
  "likeCount": 5,
  "commentCount": 2,
  "likedByCurrentUser": false
}
```

### Club
```json
{
  "clubId": 1,
  "name": "Tech Club",
  "description": "Technology enthusiasts",
  "logoUrl": "https://example.com/logo.jpg",
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": {
    "userId": 1,
    "name": "John Doe"
  }
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Admin role required"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## 🚀 Rate Limiting

- **Authentication endpoints**: 10 requests per minute
- **General API endpoints**: 100 requests per minute
- **File upload endpoints**: 20 requests per minute

---

## 📞 Support

For API support or questions:
- Check the [Deployment Guide](DEPLOYMENT.md)
- Open an issue on GitHub
- Contact the development team

---

**API Version**: 1.0  
**Last Updated**: January 2024
