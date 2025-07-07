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
