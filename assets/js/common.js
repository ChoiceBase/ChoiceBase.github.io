    function loadFragment(id, url) {
      fetch(url)
        .then(res => res.text())
        .then(html => { document.getElementById(id).innerHTML = html; });
    }
    window.addEventListener('DOMContentLoaded', function() {
      loadFragment('common-header', '/includes/header.html');
      loadFragment('common-footer', '/includes/footer.html');
    });