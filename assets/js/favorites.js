function attachFavListeners() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
      } else {
        favs.push(id);
      }
      localStorage.setItem('favorites', JSON.stringify(favs));
      btn.classList.toggle('active');
    };
  });
}

// Favorites page rendering
if (window.location.pathname.endsWith('favorites.html')) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  Promise.all([
    fetch('../data/ai-tools.json').then(r => r.json()),
    fetch('../data/jobs.json').then(r => r.json())
  ]).then(([ai, jobs]) => {
    const all = [...ai, ...jobs];
    const favResources = all.filter(r => favs.includes(r.id));
    renderResources(favResources, 'favorites-list', 1, 20);
  });
}
