# Repository Structure

This document outlines the repository structure and organization principles.

## 📁 Directory Structure

```
ChoiceBase.github.io/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/                     # Static assets
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript modules
│   ├── images/                # Images and icons
│   └── fonts/                 # Custom fonts (if any)
├── data/                       # JSON data files
│   ├── resources/             # Resource data by category
│   └── metadata/              # Site metadata
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── guides/                 # User guides
│   └── development/           # Development docs
├── html/                       # HTML pages
├── includes/                   # Reusable HTML fragments
├── scripts/                    # Build and utility scripts
├── tests/                      # Test files (future)
├── public/                     # Public assets (favicon, etc.)
├── config/                     # Configuration files
└── .vscode/                    # VS Code settings (optional)
```

## 🎯 Organization Principles

1. **Separation of Concerns**: Code is organized by function, not by type
2. **Scalability**: Structure supports growth without reorganization
3. **Maintainability**: Clear naming and logical grouping
4. **Documentation**: Comprehensive docs for all components
5. **Standards**: Follows web development best practices

## 📝 File Naming Conventions

- **HTML**: kebab-case (e.g., `resource-list.html`)
- **JavaScript**: camelCase (e.g., `resourceList.js`)
- **CSS**: kebab-case (e.g., `custom-styles.css`)
- **JSON**: kebab-case (e.g., `ai-tools.json`)
- **Config**: dot-prefixed (e.g., `.editorconfig`)

## 🔄 Future Considerations

- **Build System**: Ready for Webpack/Vite if needed
- **TypeScript**: Structure supports TS migration
- **Testing**: Test directory ready for Jest/Vitest
- **API**: Separate API directory if backend added
- **i18n**: Structure supports internationalization


