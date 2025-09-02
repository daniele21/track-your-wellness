# Secure Deployment Guide

## Overview
This guide shows you how to deploy your Track Your Wellness app securely without exposing API keys or secrets.

## Deployment Platforms

### 1. Vercel (Recommended)

#### Setup:
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`

#### Environment Variables:
```bash
# Add your environment variables securely
vercel env add GEMINI_API_KEY production
# When prompted, paste your API key: AIzaSyCM_F-iLTCYI_pZReSFMgeDqC-HQI8C1ck
```

#### Alternative via Dashboard:
1. Go to your project dashboard on vercel.com
2. Navigate to Settings → Environment Variables
3. Add: `GEMINI_API_KEY` = `AIzaSyCM_F-iLTCYI_pZReSFMgeDqC-HQI8C1ck`
4. Redeploy your app

### 2. Netlify

#### Setup:
1. Build your app: `npm run build`
2. Install Netlify CLI: `npm i -g netlify-cli`
3. Login: `netlify login`
4. Deploy: `netlify deploy --prod --dir=dist`

#### Environment Variables:
```bash
# Via CLI
netlify env:set GEMINI_API_KEY AIzaSyCM_F-iLTCYI_pZReSFMgeDqC-HQI8C1ck
```

#### Alternative via Dashboard:
1. Go to your site dashboard on netlify.com
2. Navigate to Site settings → Environment variables
3. Add: `GEMINI_API_KEY` = `AIzaSyCM_F-iLTCYI_pZReSFMgeDqC-HQI8C1ck`
4. Trigger a new deploy

### 3. GitHub Pages (Static Only)

⚠️ **Warning**: GitHub Pages doesn't support server-side environment variables. For a client-side app like this, you'll need to:

1. Create a `vercel.json` or use a different platform
2. Or build with environment variables at build time

### 4. Docker Deployment

#### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Docker Compose with Secrets:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    env_file:
      - .env.local
```

## Security Best Practices for Deployment

### 1. API Key Management
- **Never** commit API keys to git
- Use platform-specific environment variable systems
- Rotate keys regularly
- Monitor API usage for unusual activity

### 2. Domain Restrictions
Configure your Gemini API key to only work from your domains:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your API key
4. Add HTTP referrers (websites):
   - `https://yourdomain.com/*`
   - `https://www.yourdomain.com/*`
   - `http://localhost:*` (for development)

### 3. Build-time Security
```bash
# Before deploying, always check for secrets
git log --oneline | head -10
grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=.git || echo "No API keys found in code"
```

### 4. Monitoring and Alerts
- Set up monitoring for your API usage
- Configure alerts for unusual traffic patterns
- Regularly audit your deployed environment variables

## Deployment Checklist

- [ ] API key removed from all committed files
- [ ] Environment variables configured on hosting platform
- [ ] Domain restrictions applied to API key
- [ ] Build process tested locally
- [ ] Security audit passed (`npm run security-check`)
- [ ] .env.local and .env files in .gitignore
- [ ] No secrets in git history

## Emergency Response

If your API key is accidentally exposed:
1. **Immediately** regenerate the key in Google Cloud Console
2. Update the key in your deployment platform
3. Check git history: `git log -p --all -S "AIzaSyC"`
4. If found in git history, consider cleaning it: `git filter-branch` or create a new repo
5. Monitor API usage for the next 24-48 hours

## Platform-Specific Commands

### Quick Deployment Commands:

```bash
# Vercel
npm run build && vercel --prod

# Netlify
npm run build && netlify deploy --prod --dir=dist

# Manual server deployment
npm run build
scp -r dist/ user@server:/var/www/html/
```

Remember: Always verify that your environment variables are properly configured before going live!
