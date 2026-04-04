/**
 * ChoiceBase OOP Refit: Utils and Theme Management
 */
class Utils {
  /**
   * Fetch JSON data with robust error handling
   */
  static async fetchData(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Fetch failed for ${url}`);
      return await resp.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  /**
   * Load shared UI segments (header, footer)
   */
  static async loadHeaderFooter(callback) {
    const isLocalFile = window.location.protocol === 'file:';
    const rootPrefix = isLocalFile && window.location.pathname.includes('/html/') ? '../' : '';

    const loadFragment = async (id, url) => {
      const container = document.getElementById(id);
      if (!container) return;

      const adjustedUrl = isLocalFile ? (rootPrefix + url.replace(/^\//, '')) : url;

      try {
        const resp = await fetch(adjustedUrl);
        if (!resp.ok) throw new Error(`Fragment failed: ${adjustedUrl}`);
        const html = await resp.text();
        container.innerHTML = html;

        // Script Execution for dynamic segments
        container.querySelectorAll('script').forEach(s => {
          const ns = document.createElement('script');
          Array.from(s.attributes).forEach(attr => ns.setAttribute(attr.name, attr.value));
          ns.appendChild(document.createTextNode(s.innerHTML));
          s.parentNode.replaceChild(ns, s);
        });

        if (id === 'common-header') {
          ThemeManager.init();
          if (callback) callback();
        }
      } catch (err) {
        console.error(err);
      }
    };

    await Promise.all([
      loadFragment('common-header', '/includes/header.html'),
      loadFragment('common-footer', '/includes/footer.html')
    ]);
  }

  /**
   * Fuzzy string comparison
   */
  static isSimilar(s1, s2) {
    if (!s1 || !s2) return false;
    const l = s1.length > s2.length ? s1 : s2;
    const s = s1.length > s2.length ? s2 : s1;
    if (l.length === 0) return true;

    const editDistance = (a, b) => {
      const m = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
      for (let i = 0; i <= b.length; i++) m[i][0] = i;
      for (let j = 0; j <= a.length; j++) m[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) m[i][j] = m[i - 1][j - 1];
          else m[i][j] = Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
        }
      }
      return m[b.length][a.length];
    };

    const d = editDistance(l, s);
    return d <= (l.length >= 4 ? 1 : 0);
  }
}

class ThemeManager {
  static init() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const icon = toggle.querySelector('i');
    const stored = localStorage.getItem('theme') || 'dark';

    const apply = (t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
      if (icon) icon.className = t === 'light' ? 'bi bi-sun' : 'bi bi-moon-stars';
    };

    apply(stored);
    toggle.onclick = () => {
      apply(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    };
  }
}

// Global accessor for legacy support - will eventually be phased out
window.utils = Utils;
window.ThemeManager = ThemeManager;
