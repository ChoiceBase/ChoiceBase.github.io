function attachFavListeners() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      let favs = JSON.parse(localStorage.getItem('favorites') || '[]');

      if (favs.includes(id)) {
        // Remove from favorites
        favs = favs.filter(f => f !== id);
        btn.classList.remove('active');
      } else {
        // Add to favorites
        favs.push(id);
        btn.classList.add('active');
      }

      localStorage.setItem('favorites', JSON.stringify(favs));

      // Optional: If on home page or any page with liked resources section, update it live
      if (typeof showUserLikedResources === 'function' && document.getElementById('user-liked-resources')) {
        showUserLikedResources();
      }
    };
  });
}
