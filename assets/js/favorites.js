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
      // Update favorites section if it exists
      if (typeof showUserLikedResources === 'function' && document.getElementById('user-liked-resources')) {
        showUserLikedResources();
      }
    };
  });
}

