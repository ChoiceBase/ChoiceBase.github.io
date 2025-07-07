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

// Render resource cards into container
function renderResources(resources, containerClass) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const container = document.querySelector(`.${containerClass}`);
  container.innerHTML = '';
  resources.forEach(resource => {
    const isFav = favs.includes(resource.id);
    const card = document.createElement('div');
    card.className = 'resource-card';
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
  allResources.forEach(r => r.votes = votes[r.id] || 0);

  filteredResources = allResources;
  renderPaginatedResources(filteredResources, 1);
}

// Search input listener
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('resource-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filteredResources = filterResources(allResources, this.value);
      renderPaginatedResources(filteredResources, 1);
    });
  }
  loadAndRenderResources();
});
