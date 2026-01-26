/**
 * Shared Utilities for ChoiceBase
 */

const utils = {
    // Persistence Keys - None needed currently

    /**
     * Fetch JSON data with error handling
     */
    async fetchData(url) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Fetch failed for ${url}`);
            return await resp.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    /**
     * Load common header and footer fragments
     */
    async loadHeaderFooter() {
        const isLocalFile = window.location.protocol === 'file:';
        const rootPrefix = isLocalFile && window.location.pathname.includes('/html/') ? '../' : '';

        const loadFragment = async (id, url) => {
            const container = document.getElementById(id);
            if (!container) return;

            const adjustedUrl = isLocalFile ? (rootPrefix + url.replace(/^\//, '')) : url;

            try {
                const resp = await fetch(adjustedUrl);
                if (resp.ok) {
                    const html = await resp.text();
                    container.innerHTML = html;

                    // Manually execute scripts found in the fragment
                    const scripts = container.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                    // If it's the header, re-initialize theme toggle
                    if (id === 'common-header') {
                        this.initTheme();
                    }
                } else {
                    console.error(`Fetch failed for ${adjustedUrl} with status ${resp.status}`);
                }
            } catch (err) {
                console.error(`Failed to load fragment ${adjustedUrl}:`, err);
            }
        };

        await Promise.all([
            loadFragment('common-header', '/includes/header.html'),
            loadFragment('common-footer', '/includes/footer.html')
        ]);
    },

    /**
     * Theme Initialization and Management
     */
    initTheme() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const icon = toggle.querySelector('i');
        const storedTheme = localStorage.getItem('theme') || 'dark';

        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            if (icon) {
                if (theme === 'light') {
                    icon.classList.remove('bi-moon-stars');
                    icon.classList.add('bi-sun');
                } else {
                    icon.classList.remove('bi-sun');
                    icon.classList.add('bi-moon-stars');
                }
            }
        };

        // Apply stored theme immediately
        setTheme(storedTheme);

        toggle.onclick = () => {
            const current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'light' ? 'dark' : 'light');
        };
    },

    /**
     * Fuzzy Search Logic
     */
    isSimilar(s1, s2) {
        if (!s1 || !s2) return false;
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        if (longer.length === 0) return true;
        const editDistance = (a, b) => {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                    else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
            return matrix[b.length][a.length];
        };
        const distance = editDistance(longer, shorter);
        // Allow 1 typo for length >= 4, exact for shorter
        return distance <= (longer.length >= 4 ? 1 : 0);
    }
};
