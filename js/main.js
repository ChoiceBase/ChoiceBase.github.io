function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('show');
}

// Load external HTML into specified element
function loadHTML(file, elementID) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementID).innerHTML = data;
        })
        .catch(error => {
            console.error('Failed to load the HTML file:', error);
        });
}

// Load common elements
loadHTML('header.html', 'header');
loadHTML('nav.html', 'nav');
loadHTML('footer.html', 'footer');

// Load content dynamically
// function loadPage(page) {
//     loadHTML(page, 'content');
// }

function loadPage(page) {
    console.log(page);
    return fetch(page) // Ensure this fetch call returns the promise
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${page}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('content').innerHTML = data;
            // After loading content, call initializeCards if it exists
            if (typeof window.initializeCards === 'function') {
                window.initializeCards();
            } else {
                console.error('initializeCards function is not available.');
            }
        })
        .catch(error => console.error('Error loading the page:', error));
}

// Load default content on page load
window.onload = function() {
    loadPage('index.html');
    
};

// Once the DOM is fully loaded, change the URL if needed
document.addEventListener('DOMContentLoaded', function() {
    // Change the URL to '/' without reloading the page if it's currently 'index.html'
    if (window.location.pathname.endsWith('html')) {
        window.history.pushState({}, '', '/');
    }
});
