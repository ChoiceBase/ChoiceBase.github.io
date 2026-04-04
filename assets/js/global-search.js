/**
 * ChoiceBase OOP Refit: Universal Search Controller
 */
class SearchController {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('submit', (e) => {
      const searchForm = e.target.closest('#header-search-form, #global-search-form, .search-form-universal');
      if (searchForm) {
        e.preventDefault();
        const searchInput = searchForm.querySelector('input[type="search"], #header-search-input, #global-search-input');
        if (searchInput) {
          this.handleSearch(searchInput.value.trim());
        }
      }
    });

    // Also listen to input events for real-time search on specific pages
    document.addEventListener('input', (e) => {
      if (e.target.id === 'org-search-input') {
        if (typeof window.searchOrg === 'function') {
          window.searchOrg(e.target.value.trim());
        }
      }
    });
  }

  handleSearch(query) {
    if (!query) return;

    // Delegate to page-specific search if applicable
    if (window.location.pathname.includes('career_nexus.html') && typeof window.filterNexusGraph === 'function') {
      window.filterNexusGraph(query);
      return;
    }

    if (window.location.pathname.includes('org.html') && typeof window.searchOrg === 'function') {
      window.searchOrg(query);
      return;
    }

    // Default: Redirect to results
    let searchUrl;
    if (window.location.protocol === 'file:') {
      const isSubfolder = window.location.pathname.includes('/html/');
      searchUrl = (isSubfolder ? '' : 'html/') + 'search-results.html';
    } else {
      searchUrl = '/html/search-results.html';
    }

    window.location.href = `${searchUrl}?q=${encodeURIComponent(query)}`;
  }
}

// Global initialization
window.searchController = new SearchController();
