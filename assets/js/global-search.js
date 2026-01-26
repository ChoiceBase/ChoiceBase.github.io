// Universal Integrated Search Logic
document.addEventListener('submit', (e) => {
    const searchForm = e.target.closest('#header-search-form, #global-search-form, .search-form-universal');
    if (searchForm) {
        e.preventDefault();
        const searchInput = searchForm.querySelector('input[type="search"], #header-search-input, #global-search-input');
        if (searchInput) {
            const query = searchInput.value.trim();
            if (query) {
                // Check if we are on Career Nexus page
                if (window.location.pathname.includes('career_nexus.html')) {
                    if (typeof window.filterNexusGraph === 'function') {
                        window.filterNexusGraph(query);
                        return;
                    }
                }

                // Check if we are on Organization Chart page
                if (window.location.pathname.includes('org.html')) {
                    if (typeof window.searchOrg === 'function') {
                        window.searchOrg(query);
                        return;
                    }
                }

                // Default behavior: redirect to search results
                let searchUrl;
                if (window.location.protocol === 'file:') {
                    const isSubfolder = window.location.pathname.includes('/html/');
                    searchUrl = (isSubfolder ? '' : 'html/') + 'search-results.html';
                } else {
                    searchUrl = '/html/search-results.html';
                }

                window.location.href = searchUrl + '?q=' + encodeURIComponent(query);
            }
        }
    }
});


