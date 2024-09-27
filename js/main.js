function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('show');
}

// Load external HTML into specified element
function loadHTML(page, elementID) {
    fetch(page)
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
            console.error('Failed to load the HTML page:', error);
        });
}

// Load common elements
loadHTML('html/header.html', 'header');
loadHTML('html/nav.html', 'nav');
loadHTML('html/footer.html', 'footer');

// Load content dynamically
// function loadPage(page) {
//     loadHTML(page, 'content');
// }

function loadPage(page) {
    return fetch(page) // Ensure this fetch call returns the promise
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${page}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('content').innerHTML = data;

            // Check for and call page-specific initialization functions
            if (page.includes('about.html') && typeof window.loadContributors === 'function') {
                window.loadContributors(); // Call loadContributors if it is defined
            } else if (typeof window.initializeCards === 'function') {
                window.initializeCards(); // Call initializeCards if it is defined
            } else {
                console.error('Initialization function is not available for this page.');
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

// Store the scroll position when the user leaves the page or refreshes
window.addEventListener('beforeunload', function () {
    localStorage.setItem('scrollPosition', window.scrollY);
});

// Retrieve and restore the scroll position when the page loads
window.addEventListener('load', function () {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
    }
});