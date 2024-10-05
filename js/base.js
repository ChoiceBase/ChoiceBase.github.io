

// Function to load external content into specific sections
function loadSection(sectionId, file) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block'; // Show loading animation

    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(sectionId).innerHTML = data;
            loadingDiv.style.display = 'none'; // Hide loading animation after loading
        })
        .catch(error => {
            console.error(`Error loading ${file}:`, error);
            loadingDiv.style.display = 'none'; // Hide loading animation on error
        });
}

// Function to load head section content
function loadHead(file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            const headContent = document.createElement('div');
            headContent.innerHTML = data;

            // Append fetched head content to <head>
            Array.from(headContent.children).forEach(child => {
                document.head.appendChild(child);
            });
        })
        .catch(error => console.error(`Error loading ${file}:`, error));
}
document.addEventListener('DOMContentLoaded', function() {
    // Check if the current URL is the old format
    const currentPath = window.location.pathname;
    
    // If the current path includes '/html/' and ends with 'jobportals.html'
    if (currentPath.includes('html')) {
        // Create the new URL
        const newUrl = currentPath.replace('/html/', '/').replace('.html', '').replace('index', '');
        
        // Replace the state in the history
        window.history.replaceState(null, '', newUrl + window.location.search);
    }
});

// Load head, header, nav, and footer when the page loads
window.onload = function() {
    loadHead('/html/head.html');  // Load head content
    // loadSection('header', '/html/header.html');  // Load header content
    loadSection('nav', '/html/nav.html');        // Load navigation content
    loadSection('footer', '/html/footer.html');  // Load footer content
};



