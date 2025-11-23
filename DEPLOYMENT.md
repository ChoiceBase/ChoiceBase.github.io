# Deployment Guide

## 🐳 Docker Setup

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

### Quick Start

### Prerequisites
- Docker installed ([Get Docker](https://www.docker.com/get-started))
- Docker Compose (usually included with Docker Desktop)

### Quick Start

#### Option 1: Production-like (Nginx)
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at: `http://localhost:8081`

#### Option 2: Development Server (with auto-reload)
```bash
# Build and run dev server
docker-compose --profile dev up choicebase-dev

# Or in detached mode
docker-compose --profile dev up -d choicebase-dev
```

Access at: `http://localhost:8081`

#### Option 3: Using Docker directly
```bash
# Build image
docker build -t choicebase .

# Run container
docker run -d -p 8081:80 --name choicebase choicebase

# Stop and remove
docker stop choicebase && docker rm choicebase
```

### Docker Commands Reference

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f choicebase

# Rebuild after changes
docker-compose up -d --build

# Remove everything
docker-compose down -v
```

---

## 🌐 GitHub Pages Deployment

### Method 1: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ChoiceBase.github.io.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: `Deploy from a branch`
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click Save

3. **Access Your Site**
   - URL: `https://YOUR_USERNAME.github.io/ChoiceBase.github.io/`
   - Or if repo is named `YOUR_USERNAME.github.io`: `https://YOUR_USERNAME.github.io/`

### Method 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### Method 3: Manual Deployment

1. Install GitHub CLI: `gh auth login`
2. Deploy:
   ```bash
   gh pages deploy --branch gh-pages --dist ./
   ```

---

## 🚀 Alternative Open Source Hosting Options

### 1. Netlify (Free Tier)

**Setup:**
1. Sign up at [netlify.com](https://www.netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: (leave empty)
   - Publish directory: `./`
4. Deploy!

**Or use Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Continuous deployment
- ✅ Form handling (for feedback forms)
- ✅ 100GB bandwidth/month

### 2. Vercel (Free Tier)

**Setup:**
1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Framework preset: Other
4. Deploy!

**Or use Vercel CLI:**
```bash
npm install -g vercel
vercel --prod
```

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Edge network
- ✅ Analytics
- ✅ Unlimited bandwidth

### 3. Cloudflare Pages (Free Tier)

**Setup:**
1. Sign up at [cloudflare.com](https://www.cloudflare.com)
2. Go to Pages section
3. Connect GitHub repository
4. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `./`
5. Deploy!

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Global CDN
- ✅ Unlimited bandwidth
- ✅ Fast performance

### 4. Surge.sh (Free Tier)

**Setup:**
```bash
npm install -g surge
cd ChoiceBase.github.io
surge
# Follow prompts
```

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Simple deployment
- ✅ Unlimited sites

### 5. Render (Free Tier)

**Setup:**
1. Sign up at [render.com](https://render.com)
2. Create new Static Site
3. Connect GitHub repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `./`
5. Deploy!

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Auto-deploy on push
- ✅ 100GB bandwidth/month

### 6. Firebase Hosting (Free Tier)

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select: Use existing project or create new
# Public directory: ./
# Configure as single-page app: No
firebase deploy
```

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ CDN
- ✅ 10GB storage, 360MB/day transfer

### 7. GitLab Pages (Free)

**Setup:**
1. Push to GitLab repository
2. Create `.gitlab-ci.yml`:
   ```yaml
   pages:
     stage: deploy
     script:
       - echo "Deploying to GitLab Pages"
     artifacts:
       paths:
         - public
   ```
3. GitLab automatically deploys

**Features:**
- ✅ Free SSL
- ✅ Custom domains
- ✅ Unlimited bandwidth

---

## 📊 Hosting Comparison

| Platform | Free Tier | SSL | Custom Domain | Bandwidth | Best For |
|----------|-----------|-----|---------------|-----------|----------|
| **GitHub Pages** | ✅ | ✅ | ✅ | Unlimited | Open source projects |
| **Netlify** | ✅ | ✅ | ✅ | 100GB/month | Static sites with forms |
| **Vercel** | ✅ | ✅ | ✅ | Unlimited | Fast global deployment |
| **Cloudflare Pages** | ✅ | ✅ | ✅ | Unlimited | Performance-focused |
| **Surge.sh** | ✅ | ✅ | ✅ | Unlimited | Quick deployments |
| **Render** | ✅ | ✅ | ✅ | 100GB/month | Simple static sites |
| **Firebase** | ✅ | ✅ | ✅ | 360MB/day | Google ecosystem |

---

## 🔧 Configuration Files

### For Netlify
Create `netlify.toml`:
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### For Vercel
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### For Cloudflare Pages
No configuration needed - works out of the box!

---

## 🚀 Quick Deploy Scripts

### Deploy to Multiple Platforms

Create `deploy.sh`:
```bash
#!/bin/bash

echo "Deploying to multiple platforms..."

# GitHub Pages (if using gh-pages branch)
# git push origin main

# Netlify
if command -v netlify &> /dev/null; then
  netlify deploy --prod --dir .
fi

# Vercel
if command -v vercel &> /dev/null; then
  vercel --prod
fi

# Surge
if command -v surge &> /dev/null; then
  surge . your-domain.surge.sh
fi

echo "Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📝 Environment Variables (if needed)

For platforms that support environment variables:

```bash
# Netlify
netlify env:set VARIABLE_NAME value

# Vercel
vercel env add VARIABLE_NAME

# Render
# Set in dashboard under Environment
```

---

## 🔒 Security Considerations

1. **Don't commit sensitive data** (API keys, tokens)
2. **Use environment variables** for configuration
3. **Enable HTTPS** (all platforms provide free SSL)
4. **Set up CORS** if using external APIs
5. **Review dependencies** regularly

---

## 📞 Support

- **GitHub Pages**: [docs.github.com/pages](https://docs.github.com/pages)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Cloudflare**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

---

**Recommended**: Start with **GitHub Pages** (free, easy, unlimited) or **Netlify** (great for forms and features).


