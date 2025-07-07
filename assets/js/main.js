async function loadResources(category) {
  const resp = await fetch(`../data/${category}.json`);
  let resources = await resp.json();
  // Load votes from localStorage
  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  resources.forEach(r => r.votes = votes[r.id] || 0);
  // Sort by votes descending
  resources.sort((a, b) => b.votes - a.votes);
  return resources;
}

function renderResources(resources, containerId, page = 1, perPage = 10) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const start = (page - 1) * perPage;
  const end = start + perPage;
  resources.slice(start, end).forEach(resource => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <a href="${resource.url}" target="_blank">${resource.title}</a>
      <p>${resource.description}</p>
      <div>
        <button class="vote-btn" data-id="${resource.id}">👍 ${resource.votes || 0}</button>
        <button class="fav-btn" data-id="${resource.id}">⭐</button>
      </div>
      <small>${resource.tags.map(t => `#${t}`).join(' ')}</small>
      ${resource.highlight ? '<span class="highlight">New</span>' : ''}
    `;
    container.appendChild(card);
  });
  attachVoteListeners();
  attachFavListeners();
}

if (window.CATEGORY) {
  loadResources(window.CATEGORY).then(resources => {
    renderResources(resources, 'resource-list', 1, window.innerWidth < 600 ? 6 : 12);
    setupPagination(resources, 'pagination', 'resource-list');
  });
}





async function showUserLikedResources() {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favs.length) {
    document.getElementById('user-liked-resources').innerHTML = '';
    return;
  }
  // Fetch all resources from all categories
  const [ai, jobs, programming] = await Promise.all([
    fetch('/data/ai-tools.json').then(r => r.json()),
    fetch('/data/jobs.json').then(r => r.json()),
    fetch('/data/programming.json').then(r => r.json())
  ]);
  const all = [...ai, ...jobs, ...programming];
  const liked = all.filter(r => favs.includes(r.id));
  if (liked.length) {
    const container = document.getElementById('user-liked-resources');
    container.innerHTML = `<h2>Your Liked Resources</h2><div id="liked-list" class="row g-3"></div>`;
    renderResources(liked, 'liked-list');
  }
}
