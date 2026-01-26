document.addEventListener('DOMContentLoaded', async () => {
  // Load highlighted resources
  const data = await utils.fetchData('/data/ai-tools.json');
  const highlighted = data.slice(0, 4); // Just show first 4 for now

  const container = document.getElementById('highlighted-resources');
  if (container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'resource-list-grid mt-4';
    highlighted.forEach(r => grid.appendChild(components.createResourceCard(r)));
    container.appendChild(grid);
  }
});
