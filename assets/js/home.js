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

// Show user's liked resources (from all categories)
async function showUserLikedResources() {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favs.length) {
    document.getElementById('user-liked-resources').innerHTML = '';
    return;
  }
  // Fetch all resources from all categories
  const [ai, jobs, programming, upskilling] = await Promise.all([
    fetch('/data/ai-tools.json').then(r => r.json()),
    fetch('/data/jobs.json').then(r => r.json()),
    fetch('/data/programming.json').then(r => r.json()),
    fetch('/data/upskilling.json').then(r => r.json())
  ]);
  const all = [...ai, ...jobs, ...programming, ...upskilling];
  const liked = all.filter(r => favs.includes(r.id));
  if (liked.length) {
    const container = document.getElementById('user-liked-resources');
    container.innerHTML = `<h2>Your Liked Resources</h2><div class="resource-list" id="liked-list"></div>`;
    renderResources(liked, 'liked-list');
  }
}

// Check if resource is new (added in last 30 days)
function isNewResource(resource) {
  if (!resource.addedDate) return false;
  const addedDate = new Date(resource.addedDate);
  const daysSinceAdded = (Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceAdded <= 30;
}

// Render resource cards
function renderResources(resources, containerClass) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const container = document.querySelector(`.${containerClass}`);
  container.innerHTML = '';
  resources.forEach(resource => {
    const isFav = favs.includes(resource.id);
    const voteCount = votes[resource.id] || resource.votes || 0;
    const isNew = isNewResource(resource);
    const card = document.createElement('div');
    card.className = `resource-card${isNew ? ' new-resource' : ''}`;
    card.innerHTML = `
      <h3><a href="${resource.url}" target="_blank">${resource.title}</a></h3>
      <p>${resource.description}</p>
      <div>
        <button class="btn vote-btn" data-id="${resource.id}">👍 ${voteCount}</button>
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
      showUserLikedResources(); // Instantly update liked section
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

// Show highlighted resources (top 1 from each category)
async function showHighlightedResources() {
  const [ai, jobs, programming, upskilling] = await Promise.all([
    fetch('/data/ai-tools.json').then(r => r.json()),
    fetch('/data/jobs.json').then(r => r.json()),
    fetch('/data/programming.json').then(r => r.json()),
    fetch('/data/upskilling.json').then(r => r.json())
  ]);
  const highlighted = [ai[0], jobs[0], programming[0], upskilling[0]].filter(Boolean);
  renderResources(highlighted, 'highlighted-resources');
}

document.addEventListener('DOMContentLoaded', () => {
  showUserLikedResources();
  showHighlightedResources();
});
