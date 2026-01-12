document.addEventListener('DOMContentLoaded', async () => {
  // Load highlighted resources
  const data = await utils.fetchData('/data/ai-tools.json');
  const highlighted = data.slice(0, 4); // Just show first 4 for now

  const favs = utils.getFavorites();
  const container = document.getElementById('highlighted-resources');
  if (container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'resource-list-grid mt-4';
    highlighted.forEach(r => grid.appendChild(components.createResourceCard(r, favs)));
    container.appendChild(grid);
  }

  // Load user liked resources if section exists
  showUserLikedResources();
});

// Global callback for when favorites are toggled
window.onFavoritesUpdated = () => {
  showUserLikedResources();
};

async function showUserLikedResources() {
  const container = document.getElementById('user-liked-resources');
  if (!container) return;

  const favIds = utils.getFavorites();
  if (favIds.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Fetch all data to find the matching resources (Simplified for now)
  const files = ['/data/ai-tools.json', '/data/programming.json', '/data/jobs.json'];
  let allData = [];
  for (const f of files) {
    const d = await utils.fetchData(f);
    allData = allData.concat(d);
  }

  const liked = allData.filter(r => favIds.includes(String(r.id)));

  if (liked.length > 0) {
    container.innerHTML = '<h2 class="mb-3" style="color: var(--accent);">Your Bookmarked Resources</h2>';
    const wrapper = document.createElement('div');
    wrapper.appendChild(components.createScroller(liked, favIds));
    container.appendChild(wrapper);
  } else {
    container.innerHTML = '';
  }
}
