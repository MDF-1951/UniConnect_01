# UniConnect - University Social Media Platform

A full-stack social media platform designed specifically for university students, built with React and Spring Boot.

## 🌟 Features

- **User Authentication**: JWT-based secure authentication with VIT email validation
- **Social Feed**: Create, like, and comment on posts
- **Club Management**: Join clubs, create events, and manage memberships
- **Real-time Chat**: Private and group messaging system
- **File Uploads**: Support for images, videos, and profile pictures
- **Admin Panel**: Analytics and user management
- **Recommendations**: AI-powered content recommendations

## 🏗️ Project Structure

```
UniConnect/
├── frontend/          # React Frontend (Port 3000)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # Spring Boot Backend (Port 8080)
│   ├── src/
│   ├── pom.xml
│   └── ...
├── docs/             # Documentation
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Java** 21+
- **MySQL** 8.0+
- **Git**

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/UniConnect.git
   cd UniConnect
   ```

2. **Setup Database**
   ```sql
   CREATE DATABASE unisocial;
   CREATE USER 'unisocial'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON unisocial.* TO 'unisocial'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Start Backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Backend will run on: http://localhost:8080

4. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on: http://localhost:3000

5. **Access Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **API Test**: http://localhost:8080/api/auth/test

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 with TypeScript
- **Material-UI (MUI)** v7 for UI components
- **React Router DOM** v7 for navigation
- **Axios** for API communication
- **React Context API** for state management

### Backend
- **Spring Boot** 3.x with Java 21
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **MySQL** 8.0 database
- **Maven** for dependency management

### Database
- **MySQL** 8.0
- **JPA/Hibernate** ORM
- **Optimized indexes** for performance

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/test` - API health check

### User Management
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/search` - Search users

### Posts & Social Features
- `GET /api/posts/feed` - Get posts feed
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/like` - Like post
- `POST /api/posts/{id}/comments` - Add comment

### Club Management
- `GET /api/clubs` - Get clubs
- `POST /api/clubs` - Create club
- `POST /api/clubs/{id}/join` - Join club

### Chat System
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/{id}/message` - Send message

## 🌐 Deployment

### Production URLs
- **Frontend**: https://unisocial-frontend.vercel.app
- **Backend**: https://unisocial-backend.railway.app

### Environment Variables

#### Frontend (Vercel)
```
REACT_APP_API_URL=https://unisocial-backend.railway.app
```

#### Backend (Railway)
```
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=mysql://user:pass@host:port/db
FRONTEND_URL=https://unisocial-frontend.vercel.app
```

## 🔐 Security Features

- **JWT Authentication** with 24-hour expiration
- **VIT Email Validation** (only @vitstudent.ac.in and @vit.ac.in)
- **BCrypt Password Hashing**
- **CORS Configuration**
- **Role-based Authorization** (USER/ADMIN)
- **Input Validation** and sanitization

## 📊 Database Schema

### Key Tables
- **users** - User accounts and profiles
- **posts** - Social media posts
- **clubs** - University clubs
- **club_memberships** - User-club relationships
- **events** - Club events
- **messages** - Chat messages
- **likes** - Post likes
- **comments** - Post comments

## 🚀 Getting Started for Developers

1. **Fork the repository**
2. **Clone your fork**
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes**
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in the `docs/` folder

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] Video calling integration
- [ ] Advanced recommendation algorithms

---

**Built with ❤️ for VIT University Students**
