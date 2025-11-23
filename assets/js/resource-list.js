// Load header and footer fragments
function loadFragment(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => { document.getElementById(id).innerHTML = html; });
}

window.addEventListener('DOMContentLoaded', () => {
  loadFragment('common-header', '/includes/header.html');
  loadFragment('common-footer', '/includes/footer.html');
});

// Get category from query string
function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'ai-tools';
}

// Get filter from URL
function getFilterFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('filter') || '';
}

// Update URL with current filters
function updateURL(category, filter = '', page = 1) {
  const params = new URLSearchParams();
  params.set('category', category);
  if (filter) params.set('filter', filter);
  if (page > 1) params.set('page', page);
  window.history.pushState({}, '', `?${params.toString()}`);
}

// Category config
const categories = {
  'ai-tools': { title: 'AI Tools', data: '/data/ai-tools.json' },
  'jobs': { title: 'Jobs', data: '/data/jobs.json' },
  'programming': { title: 'Programming Languages', data: '/data/programming.json' },
  'upskilling': { title: 'Upskilling', data: '/data/upskilling.json' }
};

let allResources = [];
let filteredResources = [];
let currentPage = 1;
let perPage = getPerPage();

function getPerPage() {
  return window.innerWidth < 700 ? 6 : 15;
}

// Check if resource is new (added in last 30 days)
function isNewResource(resource) {
  if (!resource.addedDate) return false;
  const addedDate = new Date(resource.addedDate);
  const daysSinceAdded = (Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceAdded <= 30;
}

// Render resource cards into container
function renderResources(resources, containerClass) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const container = document.querySelector(`.${containerClass}`);
  container.innerHTML = '';
  resources.forEach(resource => {
    const isFav = favs.includes(resource.id);
    const isNew = isNewResource(resource);
    const card = document.createElement('div');
    card.className = `resource-card${isNew ? ' new-resource' : ''}`;
    card.innerHTML = `
      <h3><a href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a></h3>
      <p>${resource.description}</p>
      <div>
        <button class="btn vote-btn" data-id="${resource.id}">👍 ${resource.votes || 0}</button>
        <button class="btn fav-btn${isFav ? ' active' : ''}" data-id="${resource.id}">⭐</button>
      </div>
      <small class="text-muted">${(resource.tags || []).map(t => `#${t}`).join(' ')}</small>
    `;
    container.appendChild(card);
  });
  attachFavListeners();
  attachVoteListeners();
}

// Attach favorite button listeners
function attachFavListeners() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        btn.classList.remove('active');
      } else {
        favs.push(id);
        btn.classList.add('active');
      }
      localStorage.setItem('favorites', JSON.stringify(favs));
    };
  });
}

// Attach vote button listeners
function attachVoteListeners() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      let votes = JSON.parse(localStorage.getItem('votes') || '{}');
      votes[id] = (votes[id] || 0) + 1;
      localStorage.setItem('votes', JSON.stringify(votes));
      btn.textContent = `👍 ${votes[id]}`;
    };
  });
}

// Filter resources by search query
function filterResources(resources, query) {
  query = query.trim().toLowerCase();
  if (!query) return resources;
  return resources.filter(r =>
    (r.title && r.title.toLowerCase().includes(query)) ||
    (r.description && r.description.toLowerCase().includes(query)) ||
    (r.tags && r.tags.some(tag => tag.toLowerCase().includes(query)))
  );
}

// Filter resources by tag
function filterResourcesByTag(resources, tag) {
  if (!tag) return resources;
  return resources.filter(r => 
    (r.tags || []).some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Sort resources by votes (descending)
function sortResourcesByVotes(resources) {
  return [...resources].sort((a, b) => {
    const votesA = a.votes || 0;
    const votesB = b.votes || 0;
    return votesB - votesA;
  });
}

// Sort resources by popularity (if available), then by votes
function sortResourcesByPopularity(resources) {
  return [...resources].sort((a, b) => {
    // First sort by popularity if available
    if (a.popularity !== undefined && b.popularity !== undefined) {
      if (b.popularity !== a.popularity) {
        return b.popularity - a.popularity;
      }
    } else if (a.popularity !== undefined) {
      return -1; // a has popularity, b doesn't - a comes first
    } else if (b.popularity !== undefined) {
      return 1; // b has popularity, a doesn't - b comes first
    }
    // Then by votes
    const votesA = a.votes || 0;
    const votesB = b.votes || 0;
    return votesB - votesA;
  });
}

// Pagination rendering
function renderPaginatedResources(resources, page = 1) {
  perPage = getPerPage();
  const totalPages = Math.ceil(resources.length / perPage);
  currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageResources = resources.slice(start, end);

  renderResources(pageResources, 'resource-list');
  renderPaginationControls(resources.length, currentPage, perPage);
  
  // Update URL
  const category = getCategoryFromURL();
  const filter = getFilterFromURL();
  updateURL(category, filter, currentPage);
}

// Pagination controls rendering
function renderPaginationControls(totalItems, page, perPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const nav = document.getElementById('pagination');
  if (totalPages <= 1) {
    nav.innerHTML = '';
    return;
  }

  let html = `<ul class="pagination justify-content-center">`;
  html += `<li class="page-item${page === 1 ? ' disabled' : ''}">
    <a class="page-link" href="#" data-page="${page - 1}">Previous</a>
  </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === page ? ' active' : ''}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }

  html += `<li class="page-item${page === totalPages ? ' disabled' : ''}">
    <a class="page-link" href="#" data-page="${page + 1}">Next</a>
  </li>`;
  html += `</ul>`;

  nav.innerHTML = html;

  nav.querySelectorAll('.page-link').forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      const newPage = parseInt(link.dataset.page);
      if (!isNaN(newPage) && newPage !== page && newPage >= 1 && newPage <= totalPages) {
        renderPaginatedResources(filteredResources, newPage);
      }
    };
  });
}

// Responsive: update perPage and rerender on resize
window.addEventListener('resize', () => {
  const newPerPage = getPerPage();
  if (newPerPage !== perPage) {
    perPage = newPerPage;
    renderPaginatedResources(filteredResources, 1);
  }
});

// Main load function
async function loadAndRenderResources() {
  const catKey = getCategoryFromURL();
  const cat = categories[catKey] || categories['ai-tools'];
  document.getElementById('category-title').textContent = cat.title;
  document.getElementById('page-title').textContent = `${cat.title} – ChoiceBase`;

  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const resp = await fetch(cat.data);
  allResources = await resp.json();
  allResources.forEach(r => r.votes = votes[r.id] || r.votes || 0);

  // Sort by popularity (if available), then by votes
  allResources = sortResourcesByPopularity(allResources);

  // Apply URL filter if present
  const urlFilter = getFilterFromURL();
  const urlPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
  
  if (urlFilter) {
    filteredResources = filterResourcesByTag(allResources, urlFilter);
    // Update search input
    const searchInput = document.getElementById('resource-search');
    if (searchInput) searchInput.value = urlFilter;
  } else {
    filteredResources = allResources;
  }

  renderPaginatedResources(filteredResources, urlPage);
  
  // Render tag filters
  renderTagFilters();
}

// Render tag filter buttons
function renderTagFilters() {
  const container = document.getElementById('tag-filters');
  if (!container) return;
  
  // Get unique tags from all resources
  const allTags = new Set();
  allResources.forEach(r => {
    (r.tags || []).forEach(tag => allTags.add(tag));
  });
  
  const tags = Array.from(allTags).sort();
  if (tags.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const currentFilter = getFilterFromURL();
  let html = '<div class="tag-filters mb-3"><strong class="me-2">Filter by tag:</strong>';
  html += `<button class="btn btn-sm tag-filter-btn${!currentFilter ? ' active' : ''}" data-tag="">All</button>`;
  tags.forEach(tag => {
    html += `<button class="btn btn-sm tag-filter-btn${currentFilter === tag ? ' active' : ''}" data-tag="${tag}">#${tag}</button>`;
  });
  html += '</div>';
  container.innerHTML = html;
  
  // Attach listeners
  container.querySelectorAll('.tag-filter-btn').forEach(btn => {
    btn.onclick = () => {
      const tag = btn.dataset.tag;
      const category = getCategoryFromURL();
      updateURL(category, tag, 1);
      if (tag) {
        filteredResources = filterResourcesByTag(allResources, tag);
      } else {
        filteredResources = allResources;
      }
      renderPaginatedResources(filteredResources, 1);
      renderTagFilters(); // Re-render to update active state
    };
  });
}

// Search input listener
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('resource-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim();
      if (query) {
        filteredResources = filterResources(allResources, query);
      } else {
        const urlFilter = getFilterFromURL();
        if (urlFilter) {
          filteredResources = filterResourcesByTag(allResources, urlFilter);
        } else {
          filteredResources = allResources;
        }
      }
      renderPaginatedResources(filteredResources, 1);
    });
  }
  loadAndRenderResources();
});
