# Bug Tracker Deployment Guide

## Prerequisites
- GitHub account
- Railway account (for backend)
- Vercel account (for frontend)

## Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository (SS1)
5. Set Root Directory to `backend`
6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://bugtracker_user:BugTracker123!@bugtracker.fjfebkx.mongodb.net/bugtracker?retryWrites=true&w=majority&appName=BugTracker
   JWT_SECRET=your_super_secret_jwt_key_here
   MAIL_USERNAME=mithunan600@gmail.com
   MAIL_PASSWORD=xjzw egyz toet lrge
   ```
7. Deploy and copy the generated URL (e.g., `https://bugtracker-backend-production.up.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project" → Import your repository (SS1)
4. Configure:
   - Framework Preset: Create React App
   - Root Directory: `./` (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-railway-backend-url.railway.app/api` (replace with your Railway URL)
6. Deploy

## Step 3: Update API URL

After getting your Railway backend URL, update `src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-actual-railway-url.railway.app/api';
```

## Step 4: Test Your Application

1. Visit your Vercel frontend URL
2. Test registration and login
3. Test bug creation and management

## Troubleshooting

- If you get CORS errors, make sure your Railway backend allows requests from your Vercel domain
- If authentication fails, check that JWT_SECRET is set correctly
- If database connection fails, verify MONGODB_URI is correct

## URLs to Update

After deployment, you'll have:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app` 