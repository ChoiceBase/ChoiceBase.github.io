/**
 * Shared Utilities for ChoiceBase
 */

const utils = {
    // Persistence Keys
    FAVS_KEY: 'favorites',
    VOTES_KEY: 'votes',

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
                    container.innerHTML = await resp.text();
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
     * Favorites Management
     */
    getFavorites() {
        return JSON.parse(localStorage.getItem(this.FAVS_KEY) || '[]');
    },

    toggleFavorite(id, onUpdate) {
        let favs = this.getFavorites();
        id = String(id);
        if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
        } else {
            favs.push(id);
        }
        localStorage.setItem(this.FAVS_KEY, JSON.stringify(favs));
        if (onUpdate) onUpdate(favs);
        return favs;
    },

    /**
     * Voting Management
     */
    getVotes() {
        return JSON.parse(localStorage.getItem(this.VOTES_KEY) || '{}');
    },

    recordVote(id) {
        let votes = this.getVotes();
        votes[id] = (votes[id] || 0) + 1;
        localStorage.setItem(this.VOTES_KEY, JSON.stringify(votes));
        return votes[id];
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
