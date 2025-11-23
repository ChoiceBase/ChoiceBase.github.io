# Architecture Documentation

## Overview

ChoiceBase is a client-side static website built with vanilla JavaScript, HTML, and CSS. It uses localStorage for data persistence and is designed to work without a backend.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables
- **Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons
- **Data**: JSON files
- **Storage**: Browser localStorage
- **Deployment**: GitHub Pages / Static Hosting

## Architecture Principles

### 1. Client-Side Only
- No backend required
- All data stored in JSON files or localStorage
- Works with static hosting (GitHub Pages)

### 2. Modular Design
- JavaScript organized by functionality
- Reusable components
- Clear separation of concerns

### 3. Progressive Enhancement
- Works without JavaScript (basic functionality)
- Enhanced with JavaScript
- Graceful degradation

## File Structure

```
assets/js/
├── security.js      # Input validation & sanitization
├── submissions.js   # Resource submission system
├── admin.js        # Admin panel functionality
├── resource-list.js # Resource listing & pagination
├── home.js         # Home page logic
├── contact.js      # Contact form handling
├── voting.js       # Voting system
├── favorites.js    # Favorites/bookmarks
├── filters.js      # Filtering utilities
├── graph.js        # Graph visualization
└── org.js          # Organization chart
```

## Data Flow

1. **Initial Load**: JSON files loaded via fetch API
2. **User Interactions**: Stored in localStorage
3. **Submissions**: Validated → Stored in localStorage → Admin reviews
4. **Admin Actions**: Approve/Reject submissions

## Security Considerations

- Input sanitization (XSS prevention)
- URL validation
- Rate limiting (client-side)
- HTML escaping


