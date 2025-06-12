# 🚀 Deployment Guide to Render

This guide will help you deploy your Theory App to Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Backend Server** - Your Node.js server should also be deployed

## 🔧 Before Deployment

### 1. Update Backend URL

In your production deployment, update the `REACT_APP_API_URL` in `render.yaml`:

```yaml
envVars:
  - key: REACT_APP_API_URL
    value: https://the-way-to-the-license-chatgpt-server.onrender.com
```

### 2. Ensure Backend CORS

Make sure your backend server allows your frontend domain:

```javascript
// In your server
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-app.onrender.com'
  ]
}));
```

## 🚀 Deployment Steps

### Step 1: Push to GitHub

1. Make sure all your code is committed to GitHub
2. Your repository should contain the `new-theory-app` folder

### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `theory-app-frontend` (or your preferred name)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `new-theory-app`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

**Environment Variables:**
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://the-way-to-the-license-chatgpt-server.onrender.com`

### Step 3: Deploy

1. Click **"Create Static Site"**
2. Render will automatically build and deploy your app
3. You'll get a URL like: `https://your-app-name.onrender.com`

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that Node.js version is 18+
   - Ensure all dependencies are in `package.json`

2. **Routing Issues (404 on refresh)**
   - Make sure `_redirects` file exists in `public/` folder
   - Content should be: `/*    /index.html   200`

3. **API Connection Issues**
   - Verify `REACT_APP_API_URL` environment variable
   - Check backend CORS settings
   - Ensure backend is also deployed and running

4. **Environment Variables Not Working**
   - Environment variables must start with `REACT_APP_`
   - Rebuild the app after changing environment variables

## 📱 Testing Deployment

1. **Frontend URL**: Test all pages and navigation
2. **Registration**: Try creating a new account
3. **Login**: Test existing user login
4. **Chat**: Verify chat functionality works
5. **Course Selection**: Ensure course selection is saved and displayed

## 🔄 Updating Your App

1. Push changes to GitHub
2. Render will automatically rebuild and redeploy
3. Monitor the build logs in Render dashboard

## 📊 Monitoring

- **Build Logs**: Check in Render dashboard
- **Runtime Logs**: Monitor for any runtime errors
- **Performance**: Use Render's built-in analytics

## 🛡️ Security Notes

- Never commit sensitive API keys to GitHub
- Use environment variables for all configuration
- Enable HTTPS (Render provides this automatically)

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review build logs for specific errors
3. Verify all environment variables are set correctly 