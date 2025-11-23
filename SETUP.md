# Quick Setup Guide

## Local Development

### Method 1: Docker (Recommended)

```bash
cd ChoiceBase.github.io

# Production-like server (nginx)
docker-compose up -d

# Or development server with auto-reload
docker-compose --profile dev up -d choicebase-dev
```

Access at:
- Production: `http://localhost:8081`
- Development: `http://localhost:8081`

### Method 2: npm (Easiest)

```bash
cd ChoiceBase.github.io
npm start
```

Opens automatically at `http://localhost:8081`

### Method 3: Python

```bash
cd ChoiceBase.github.io
python -m http.server 8081
```

Then open `http://localhost:8081` in your browser.

### Method 4: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Testing Features

1. **Voting**: Click 👍 on any resource
2. **Favorites**: Click ⭐ to bookmark
3. **Filtering**: Use tag buttons or search bar
4. **Shareable URLs**: Copy URL with `?category=ai-tools&filter=free`
5. **Admin Panel**: Visit `/html/admin.html` to see stats

## Troubleshooting

- **404 errors**: Make sure you're running from the `ChoiceBase.github.io` directory
- **CORS errors**: Use a local server (not `file://` protocol)
- **Styles not loading**: Check that paths use `/` for root or `../` for relative paths
- **Docker issues**: Make sure Docker is running and ports 8081/8081 are available

## Production Deployment

### GitHub Pages (Free)
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Site available at: `https://yourusername.github.io/ChoiceBase.github.io/`

### Other Options
See `DEPLOYMENT.md` for:
- Netlify
- Vercel
- Cloudflare Pages
- Surge.sh
- Render
- Firebase Hosting
- GitLab Pages

All platforms offer free tiers with SSL and custom domains!

