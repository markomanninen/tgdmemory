# TGD Memory Deployment Guide

## 🚀 Publishing Options

### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Add MongoDB service in Railway
4. Set environment variables from `.env.example`
5. Deploy automatically from main branch

### Option 2: DigitalOcean App Platform
1. Create App Platform project
2. Connect to GitHub repository
3. Configure build settings:
   - Build Command: `npm run build:prod`
   - Run Command: `npm run start:prod`
4. Add managed MongoDB database
5. Configure environment variables

### Option 3: Render
1. Create new Web Service from GitHub
2. Configure:
   - Build Command: `npm run build:prod`
   - Start Command: `npm run start:prod`
3. Add MongoDB Atlas database
4. Set environment variables

## 📋 Pre-deployment Checklist

- [ ] Create `.env` file with your actual values
- [ ] Test Docker build locally: `docker-compose up --build`
- [ ] Commit all changes to GitHub
- [ ] Set up MongoDB Atlas account (if not using platform database)
- [ ] Get API keys for OpenAI/Google (optional)
- [ ] Choose your domain name

## 🔧 Environment Variables Needed

Copy from `.env.example` and fill in your actual values:
- `MONGO_ROOT_USERNAME` & `MONGO_ROOT_PASSWORD`
- `JWT_SECRET` (generate a secure 32+ character string)
- `MONGODB_URI` (for cloud database)
- `ALLOWED_ORIGINS` (your production domain)
- API keys for AI features (optional)

## 💡 Tips

1. **Start with Railway** - easiest setup for full-stack apps
2. **Use MongoDB Atlas** - reliable managed database
3. **Enable GitHub auto-deploy** - for continuous deployment
4. **Set up domain** - most platforms provide free subdomains
5. **Monitor logs** - check for any deployment issues

## 📞 Need Help?
If you encounter issues during deployment, check:
- Platform-specific logs
- Environment variable configuration  
- Database connection strings
- CORS settings for your domain
