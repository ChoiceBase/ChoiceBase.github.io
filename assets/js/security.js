/**
 * Security and Validation Utilities
 * Simple, secure data handling for ChoiceBase
 */

// Input sanitization
const Security = {
  // Sanitize HTML to prevent XSS
  sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Validate URL
  validateURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  // Validate email (simple)
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate and sanitize text input
  validateText(text, maxLength = 500) {
    if (!text || typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return null;
    return this.sanitizeHTML(trimmed);
  },

  // Validate resource submission
  validateResource(data) {
    const errors = [];
    
    // Title validation
    const title = this.validateText(data.title, 200);
    if (!title) errors.push('Title is required (max 200 characters)');
    
    // URL validation
    if (!this.validateURL(data.url)) {
      errors.push('Valid URL is required (http:// or https://)');
    }
    
    // Description validation
    const description = this.validateText(data.description, 1000);
    if (!description) errors.push('Description is required (max 1000 characters)');
    
    // Category validation
    const validCategories = ['ai-tools', 'jobs', 'programming', 'upskilling', 'others'];
    if (!validCategories.includes(data.category)) {
      errors.push('Invalid category');
    }
    
    // Tags validation
    const tags = Array.isArray(data.tags) 
      ? data.tags.filter(t => t && typeof t === 'string' && t.trim().length > 0 && t.length <= 50)
      : [];
    if (tags.length > 10) errors.push('Maximum 10 tags allowed');
    
    return {
      valid: errors.length === 0,
      errors,
      sanitized: {
        title,
        url: data.url.trim(),
        description,
        category: data.category,
        tags: tags.map(t => t.trim().toLowerCase()).slice(0, 10),
        timestamp: new Date().toISOString(),
        id: `submitted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        submittedBy: data.submittedBy || 'anonymous'
      }
    };
  },

  // Validate feedback
  validateFeedback(data) {
    const errors = [];
    
    const message = this.validateText(data.message, 2000);
    if (!message) errors.push('Feedback message is required (max 2000 characters)');
    
    const validTypes = ['general', 'bug', 'suggestion', 'other'];
    if (!validTypes.includes(data.type)) {
      errors.push('Invalid feedback type');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      sanitized: {
        type: data.type,
        message,
        timestamp: new Date().toISOString(),
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };
  },

  // Rate limiting (simple client-side check)
  checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `ratelimit_${key}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{"count":0,"reset":0}');
    
    if (now > data.reset) {
      data.count = 0;
      data.reset = now + windowMs;
    }
    
    if (data.count >= maxRequests) {
      return false;
    }
    
    data.count++;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Security;
}



