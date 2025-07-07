function renderFilters(resources, containerId) {
  const tags = Array.from(new Set(resources.flatMap(r => r.tags)));
  const container = document.getElementById(containerId);
  container.innerHTML = tags.map(tag =>
    `<button class="filter-btn" data-tag="${tag}">#${tag}</button>`
  ).join('');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      const tag = btn.dataset.tag;
      const filtered = resources.filter(r => r.tags.includes(tag));
      renderResources(filtered, 'resource-list', 1, window.innerWidth < 600 ? 6 : 12);
    };
  });
}
