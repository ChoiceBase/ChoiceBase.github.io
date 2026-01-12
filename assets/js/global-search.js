// Robust Global Search with Event Delegation
document.addEventListener('submit', (e) => {
    const searchForm = e.target.closest('#global-search-form');
    if (searchForm) {
        e.preventDefault();
        const searchInput = searchForm.querySelector('#global-search-input');
        if (searchInput) {
            const query = searchInput.value.trim();
            if (query) {
                console.log('Searching for:', query);

                const isLocalFile = window.location.protocol === 'file:';
                let baseUrl = '/html/search-results.html';

                if (isLocalFile) {
                    const pathDepth = window.location.pathname.includes('/html/') ? '' : 'html/';
                    baseUrl = pathDepth + 'search-results.html';
                }

                const searchUrl = new URL(baseUrl, window.location.href.split('?')[0]);
                searchUrl.searchParams.set('q', query);
                window.location.href = searchUrl.toString();
            }
        }
    }
});

console.log('Global search script loaded');
