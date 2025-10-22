# 🚀 Deployment Guide - UniConnect

This guide will help you deploy UniConnect to production using Vercel (Frontend) + Render (Backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Git installed locally

## 🏗️ Project Structure

```
UniConnect/
├── frontend/                    # React Frontend
│   ├── .env.development        # Development environment variables
│   ├── .env.production         # Production environment variables
│   ├── vercel.json             # Vercel configuration
│   └── ...
├── backend/                     # Spring Boot Backend
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-prod.properties
│   ├── railway.json            # Railway configuration
│   └── ...
├── docs/                       # Documentation
└── README.md
```

## 🌐 Step 1: Deploy Backend to Render

### 1.1 Prepare Backend Repository
```bash
# Navigate to backend directory
cd unisocial-backend

# Build the project
./mvnw clean package -DskipTests

# Verify the JAR file is created
ls target/*.jar
```

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your UniConnect repository
5. Render will auto-detect it's a Spring Boot project

### 1.3 Add PostgreSQL Database
1. In Render dashboard, click "New" → "PostgreSQL"
2. Name it `unisocial-db`
3. Copy the connection details
4. Go to your backend service → Environment tab
5. Add these environment variables:

```bash
# Database Configuration (auto-configured by render.yaml)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-32-character-key-here

# Frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### 1.4 Deploy Backend
1. Render will automatically build and deploy using `render.yaml`
2. Wait for deployment to complete
3. Copy the backend URL (e.g., `https://unisocial-backend.onrender.com`)

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend
```bash
# Navigate to frontend directory
cd unisocial-frontend

# Install dependencies
npm install

# Test build locally
npm run build
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your UniConnect repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `unisocial-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Add Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:

```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

### 2.4 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy the frontend URL (e.g., `https://unisocial-frontend.vercel.app`)

## 🔄 Step 3: Update CORS Configuration

### 3.1 Update Backend CORS
1. Go to Render dashboard → Backend service → Environment
2. Update `FRONTEND_URL` with your actual Vercel URL:
```bash
FRONTEND_URL=https://your-frontend.vercel.app
```

### 3.2 Redeploy Backend
Render will automatically redeploy when you update environment variables.

## ✅ Step 4: Test Deployment

### 4.1 Test Backend
```bash
# Test API health
curl https://your-backend.onrender.com/api/auth/test

# Expected response:
# {"status":"API is working","message":"UniConnect Backend is running","timestamp":1234567890}
```

### 4.2 Test Frontend
1. Open your Vercel URL in browser
2. Try to register a new account
3. Test login functionality
4. Verify API calls are working

## 🔧 Step 5: Configure Custom Domain (Optional)

### 5.1 Backend Custom Domain (Railway)
1. Go to Railway dashboard → Backend service → Settings
2. Click "Custom Domain"
3. Add your domain (e.g., `api.unisocial.com`)
4. Update DNS records as instructed

### 5.2 Frontend Custom Domain (Vercel)
1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `unisocial.com`)
3. Update DNS records as instructed

## 🛠️ Troubleshooting

### Common Issues

#### Backend Issues
- **Database Connection Failed**: Check `DATABASE_URL` format
- **CORS Errors**: Verify `FRONTEND_URL` is correct
- **Build Failed**: Check Java version (should be 21+)

#### Frontend Issues
- **API Calls Failing**: Check `REACT_APP_API_URL` is correct
- **Build Failed**: Check Node.js version (should be 18+)
- **CORS Errors**: Verify backend CORS configuration

### Debug Commands
```bash
# Check backend logs
railway logs

# Check frontend build logs
vercel logs

# Test API locally
curl http://localhost:8080/api/auth/test
```

## 📊 Monitoring

### Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- View build logs in Vercel dashboard
- Monitor performance metrics
- Set up error tracking

## 🔐 Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is configured for specific domains
- [ ] Environment variables are not exposed
- [ ] HTTPS is enabled (automatic with Railway/Vercel)

## 💰 Cost Estimation

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Render (Backend) | Free | $0 |
| Render (Database) | Free | $0 |
| Vercel (Frontend) | Free | $0 |
| **Total** | | **$0/month** |

### 🎉 **Completely Free Hosting!**
- ✅ **Render**: 750 hours/month (enough for small apps)
- ✅ **Vercel**: Unlimited deployments
- ✅ **No time limits** on free tiers

## 🚀 Next Steps

1. Set up monitoring and alerts
2. Configure custom domains
3. Set up CI/CD for automatic deployments
4. Add error tracking (Sentry)
5. Set up analytics (Google Analytics)

## 📞 Support

If you encounter issues:
1. Check the logs in respective dashboards
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration
5. Open an issue on GitHub

---

**Happy Deploying! 🎉**
