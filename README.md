# ChoiceBase

<div align="center">

**A free, community-powered resource hub & intelligence platform to help people upskill, discover tools, explore career pathways, and visualize organizations.**

[🌐 Live Site](https://choicebase.github.io) • [🗺️ Career Nexus](https://choicebase.github.io/html/career_nexus.html) • [🏢 Org Charts](https://choicebase.github.io/html/org.html) • [🤖 AI Integration](./skills/ai-model-integrator/SKILL.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success)](https://choicebase.github.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/choicebase/ChoiceBase.github.io)

</div>

---

## ✨ Features & Modules

- 📚 **Curated Resource Directory** - Handcrafted, structured datasets for AI Tools, Programming, Job Portals, Applications, Upskilling, and Essential Websites.
- 🏷️ **Smart Categorization & Sectioning** - Automatic grouping by tags, alphabetical folding, and responsive collapsible drawers.
- 🧭 **Career Nexus (Interactive D3 Force Graph)** - Visual map of tech and industrial career transitions across Software IT, Electronics, Manufacturing, Construction, Marketing, and Medical domains.
- 🏢 **Organization Chart Hierarchy** - Interactive collapsible D3 hierarchy tree for Corporate leadership structures and Indian Political administrative frameworks.
- ⚡ **Multi-Criteria Universal Search** - Real-time keyword scoring engine searching across titles, URLs, tags, and descriptions with zero lag.
- 🌓 **Adaptive Theme Engine** - Seamless Dark/Light mode switcher with glassmorphism UI, CSS custom properties, and persistent preference memory.
- 🤖 **Universal AI Model Integration (`ChoiceBaseAI`)** - Plug-and-play client supporting **Google Gemini, OpenAI, Claude, Groq, DeepSeek, OpenRouter, and local Ollama** with streaming and structured JSON output.
- 🚀 **100% Client-Side & Zero-Backend** - Fast, lightweight, and deployed directly to GitHub Pages.

---

## 📁 Repository Structure

```
ChoiceBase.github.io/
├── index.html                    # Homepage (Hero, quick search, feature highlights)
├── README.md                     # Project documentation & guide
├── assets/
│   ├── css/
│   │   ├── custom.css            # Unified design system tokens, themes, cards & layout
│   │   └── graph.css             # Career Nexus viewport & floating panel styles
│   └── js/
│       ├── ai-service.js         # Universal AI model provider client (Gemini, OpenAI, Ollama, etc.)
│       ├── components.js         # ComponentFactory: Card rendering, section grouping & grid views
│       ├── global-search.js      # Universal search interceptor & query dispatcher
│       ├── graph.js              # D3.js Force-directed graph engine for Career Nexus
│       ├── home.js               # Homepage initialization & featured tool loader
│       ├── org.js                # D3.js Collapsible Org Tree with zoom/pan & autocomplete
│       ├── resource-list.js      # Category pages with automatic grouping by tags
│       ├── search-results.js     # Multi-dataset keyword scoring engine
│       └── utils.js              # Fetch helpers, dynamic fragment loader, ThemeManager
├── data/                         # 15 Verified JSON datasets
│   ├── ai-tools.json             # 120+ AI platforms and toolkits
│   ├── applications.json         # Developer tools and utility software
│   ├── jobs.json                 # Remote, tech, and global job boards
│   ├── org_corporate.json        # Corporate hierarchy structure
│   ├── org_indian_political.json # Indian political governance structure
│   ├── programming.json          # Coding tutorials, libraries, and frameworks
│   ├── roles_*.json              # 6 Industry role graphs (IT, Construction, Medical, etc.)
│   ├── upskilling.json           # Online courses, certifications, and learning paths
│   └── websites.json             # Curated developer and knowledge bookmarks
├── html/
│   ├── career_nexus.html         # Interactive industry role & skill relationship visualizer
│   ├── org.html                  # Organization chart hierarchy visualizer
│   ├── resource-list.html        # Filterable category resource directory
│   └── search-results.html       # Universal search results interface
├── includes/
│   ├── header.html               # Shared navigation, dropdowns, and theme switcher
│   └── footer.html               # Shared footer with quick scroll buttons
└── skills/
    └── ai-model-integrator/      # Antigravity skill & documentation for AI model orchestration
        └── SKILL.md
```

---

## 🤖 AI Model Integration (`ChoiceBaseAI`)

ChoiceBase includes `assets/js/ai-service.js`, a modular library that allows you to easily connect any AI model to the application.

### Basic Usage:

```html
<script src="/assets/js/ai-service.js"></script>
<script>
  // 1. Google Gemini
  const gemini = new ChoiceBaseAI({
    provider: 'gemini',
    apiKey: 'YOUR_GEMINI_API_KEY',
    model: 'gemini-1.5-flash'
  });

  // 2. Local Ollama (100% Free & Offline)
  const ollama = new ChoiceBaseAI({
    provider: 'ollama',
    model: 'llama3.2',
    baseUrl: 'http://localhost:11434'
  });

  // 3. Ultra-Fast Groq / OpenAI
  const groq = new ChoiceBaseAI({
    provider: 'groq',
    apiKey: 'YOUR_GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile'
  });

  // Execute Generation
  async function askAI() {
    const response = await gemini.generate("Suggest 3 beginner friendly resources for Learning Rust");
    console.log(response);
  }
</script>
```

For complete patterns (streaming, JSON schema extraction, career path intelligence), see [skills/ai-model-integrator/SKILL.md](./skills/ai-model-integrator/SKILL.md).

---

## 🚀 Getting Started Locally

Because ChoiceBase uses standard web technologies with fetch-based JSON loading and fragment loading, run it with any local static HTTP server:

### Option 1: Python 3 (Quickest)
```bash
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Node.js / npx
```bash
npx serve .
# or
npx http-server . -p 8080
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 📊 Data Schema Guide

### Adding a New Resource (`data/*.json`)
```json
{
  "title": "Example Resource",
  "url": "https://example.com",
  "description": "Brief description of what this resource provides.",
  "tags": ["CategoryName", "Free", "Beginner"]
}
```

### Adding a Career Nexus Role (`data/roles_*.json`)
```json
{
  "name": "Cloud Architect",
  "related": ["DevOps Engineer", "Solutions Architect", "Systems Administrator"],
  "skills": ["AWS/GCP", "Kubernetes", "Terraform", "Security Architecture"],
  "description": "Designs and oversees an organization's cloud computing strategy."
}
```

---

## 🌐 Deployment to GitHub Pages

1. Push this repository to GitHub.
2. In your repository, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built for the community • Always Free • ChoiceBase</b>
</div>
