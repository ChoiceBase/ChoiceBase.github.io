// Add or remove a resource from favorites
function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  return favs;
}

// Attach listeners to all .fav-btn buttons
function attachFavListeners() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const favs = toggleFavorite(id);
      btn.classList.toggle('active', favs.includes(id));
      // Optionally update liked resources section if present
      if (typeof showUserLikedResources === 'function' && document.getElementById('user-liked-resources')) {
        showUserLikedResources();
      }
    };
  });
}

// Utility: check if a resource is favorited
function isFavorited(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favs.includes(id);
}
