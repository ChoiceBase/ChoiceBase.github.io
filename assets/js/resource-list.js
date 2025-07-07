// Load header and footer
function loadFragment(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => { document.getElementById(id).innerHTML = html; });
}
window.addEventListener('DOMContentLoaded', function() {
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

// Render resource cards
function renderResources(resources, containerClass) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const container = document.querySelector(`.${containerClass}`);
  container.innerHTML = '';
  resources.forEach(resource => {
    const isFav = favs.includes(resource.id);
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <h3><a href="${resource.url}" target="_blank">${resource.title}</a></h3>
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

// Main loader
document.addEventListener('DOMContentLoaded', async () => {
  const catKey = getCategoryFromURL();
  const cat = categories[catKey] || categories['ai-tools'];
  document.getElementById('category-title').textContent = cat.title;
  document.getElementById('page-title').textContent = `${cat.title} – ChoiceBase`;

  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const resp = await fetch(cat.data);
  let resources = await resp.json();
  resources.forEach(r => r.votes = votes[r.id] || 0);

  renderResources(resources, 'resource-list');
});



let allResources = []; // Will hold all resources for this page

// After fetching your resources JSON:
async function loadAndRenderResources() {
  const catKey = getCategoryFromURL();
  const cat = categories[catKey] || categories['ai-tools'];
  document.getElementById('category-title').textContent = cat.title;
  document.getElementById('page-title').textContent = `${cat.title} – ChoiceBase`;

  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const resp = await fetch(cat.data);
  allResources = await resp.json();
  allResources.forEach(r => r.votes = votes[r.id] || 0);

  renderResources(allResources, 'resource-list');
}

// Filter function
function filterResources(resources, query) {
  query = query.trim().toLowerCase();
  if (!query) return resources;
  return resources.filter(r =>
    (r.title && r.title.toLowerCase().includes(query)) ||
    (r.description && r.description.toLowerCase().includes(query)) ||
    (r.tags && r.tags.some(tag => tag.toLowerCase().includes(query)))
  );
}

// Listen for input on the search bar
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('resource-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const filtered = filterResources(allResources, this.value);
      renderResources(filtered, 'resource-list');
    });
  }
  loadAndRenderResources();
});
