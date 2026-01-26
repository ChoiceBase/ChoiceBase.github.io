# ChoiceBase

<div align="center">

**A free, community-powered resource hub to help people upskill, find tools, and discover job opportunities.**

[🌐 Live Demo](https://choicebase.github.io) • [📖 Documentation](./docs/) • [🤝 Contributing](./CONTRIBUTING.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success)](https://choicebase.github.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## ✨ Features

- ✅ **Curated Resource Lists** - AI Tools, Programming, Jobs, Upskilling, and more
- ✅ **Smart Filtering** - Filter by tags, search, and pagination (6 mobile / 15 desktop)
- ✅ **Vote & Feedback System** - Community-driven ranking and feedback
- ✅ **Shareable URLs** - Share filtered views with `?category=ai-tools&filter=free`
- ✅ **Sort by Votes** - Most liked resources appear first
- ✅ **Tag-Based Filtering** - Quick filtering by resource tags
- ✅ **Favorites System** - Save and bookmark your favorite resources
- ✅ **Resource Submission** - Users can suggest new resources (with admin approval)
- ✅ **Admin Panel** - Review submissions, view feedback, and manage resources
- ✅ **New Resource Highlighting** - Resources added in last 30 days are highlighted
- ✅ **Fully Responsive** - Optimized for Mobile, Tablet, and Desktop
- ✅ **Client-Side Only** - No backend required, works with GitHub Pages
- ✅ **SEO Optimized** - Meta tags, structured data, sitemap, and robots.txt

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Production server
docker-compose up -d

# Development server (with auto-reload)
docker-compose --profile dev up -d choicebase-dev
```

Access at: `http://localhost:8081` (production) or `http://localhost:8081` (development)

### Using npm

```bash
npm install
npm start
```

### Using Python

```bash
python -m http.server 8081
```

## 📁 Repository Structure

```
ChoiceBase.github.io/
├── .github/              # GitHub workflows and templates
├── assets/              # Static assets (CSS, JS, images)
├── data/                # JSON data files
├── docs/                # Documentation
├── html/                # HTML pages
├── includes/            # Reusable HTML fragments
├── scripts/             # Build and utility scripts
└── config/              # Configuration files
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed structure documentation.

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Quick setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Deployment options
- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines

## 🛠️ Development

### Prerequisites

- Node.js 18+ (optional, for npm scripts)
- Docker (optional, for containerized development)
- Python 3 (optional, for Python server)

### Scripts

```bash
npm start          # Start development server
npm run dev        # Start with auto-reload
npm run lint       # Lint JavaScript files
npm run format     # Format code with Prettier
npm run docker:up  # Start Docker containers
```

## 🌐 Deployment

### GitHub Pages

1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Site available at: `https://yourusername.github.io/ChoiceBase.github.io/`

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Netlify
- Vercel
- Cloudflare Pages
- Surge.sh
- Render
- Firebase Hosting

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built by the community, for the community
- Inspired by the need for accessible, free learning resources
- Thanks to all contributors and users

## 📞 Support

- 📧 [Contact Form](./html/contact.html)
- 🐛 [Report Issues](https://github.com/yourusername/ChoiceBase.github.io/issues)
- 💬 [Discussions](https://github.com/yourusername/ChoiceBase.github.io/discussions)

---

<div align="center">

**Made with by the ChoiceBase Community**

</div>
