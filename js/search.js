// Listen for input in the global search bar
document.getElementById('global-search').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    
    // If search query is empty, load default content
    if (!query) {
        loadPage('index.html'); // Load the default homepage
        return;
    }

    // Perform a search across all cards/data on the site
    searchAcrossWebsite(query);
});

function searchAcrossWebsite(query) {
    // Gather cards from different pages (assuming data is fetched dynamically)
    const allCards = [
        ...getCardsFromPage('upskil.html'),  // Assuming this page has cards
        ...getCardsFromPage('about.html'),
        ...getCardsFromPage('contact.html')
    ];

    // Filter the cards based on the search query (title, description, tags)
    const filteredCards = allCards.filter(card => 
        card.title.toLowerCase().includes(query) || 
        card.description.toLowerCase().includes(query) ||
        (card.tags && card.tags.some(tag => tag.toLowerCase().includes(query)))
    );

    // Display the filtered cards
    displayCards(filteredCards);
}

// Mock function to fetch cards from other pages (replace with actual dynamic loading)
function getCardsFromPage(page) {
    // In a real case, you would load data from the page or API
    if (page === 'upskil.html') {
        return [
            { title: 'Upskilling 101', description: 'A guide to modern skills.', tags: ['education'] },
            { title: 'Advanced Learning', description: 'Take your skills to the next level.', tags: ['learning'] }
        ];
    } else if (page === 'about.html') {
        return [
            { title: 'Our Mission', description: 'To provide knowledge and skills.', tags: ['about'] }
        ];
    }
    return [];
}
