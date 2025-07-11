// Example: filter resources by tag
function filterResourcesByTag(resources, tag) {
  return resources.filter(r => (r.tags || []).includes(tag));
}

// Attach listeners to filter buttons
function attachFilterListeners(resources, renderFn) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      const tag = btn.dataset.tag;
      const filtered = filterResourcesByTag(resources, tag);
      renderFn(filtered, 'resource-list');
    };
  });
}
