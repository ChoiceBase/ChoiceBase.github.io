document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    document.getElementById('search-query-display').textContent = query;

    if (!query) return;

    // Load all data in parallel
    const files = [
        '/data/ai-tools.json',
        '/data/programming.json',
        '/data/jobs.json',
        '/data/upskilling.json',
        '/data/others.json'
    ];

    const searchLoading = document.getElementById('search-loading');
    const searchContainer = document.getElementById('search-results-container');
    const noResults = document.getElementById('no-results');

    if (searchLoading) searchLoading.style.display = 'block';
    if (searchContainer) searchContainer.style.display = 'none';

    try {
        const dataArrays = await Promise.all(files.map(file => utils.fetchData(file)));
        let allData = dataArrays.flat();

        const results = scoreResults(allData, query);

        if (searchLoading) searchLoading.style.display = 'none';

        if (results.length > 0) {
            if (searchContainer) searchContainer.style.display = 'block';
            components.renderGrid(results, 'search-results-container');
        } else {
            if (noResults) noResults.style.display = 'block';
        }
    } catch (err) {
        console.error('Search failed:', err);
        if (searchLoading) searchLoading.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    }
});

function scoreResults(data, query) {
    const q = query.toLowerCase();
    const queryWords = q.split(/\s+/).filter(w => w.length > 0);

    return data.map(item => {
        let score = 0;
        const title = (item.title || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const tags = (item.tags || []).map(t => t.toLowerCase());

        // Exact/Prefix matches (highest priority)
        if (title === q) score += 100;
        else if (title.includes(q)) score += 50;
        else if (title.startsWith(q)) score += 40;

        // Description full match
        if (desc.includes(q)) score += 30;

        // Word-by-word matching (NO FUZZY MATCHING for speed)
        queryWords.forEach(word => {
            if (title.includes(word)) score += 60;
            if (tags.some(t => t.includes(word))) score += 40;
            if (desc.includes(word)) score += 20;
        });

        return { ...item, score };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 100); // Limit to top 100 results for performance
}
