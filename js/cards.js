let currentPage = 1;
const cardsPerPage = 10;
let allCards = []; // This will store all card data
let filteredCards = []; // This will store filtered cards based on search query or tag selection

function createCard(cardData) {
    const card = document.createElement('div');
    card.className = 'card';

    if (cardData.image) {
        const img = document.createElement('img');
        img.src = cardData.image;
        img.alt = `${cardData.title} Logo`;
        img.className = 'card-logo';
        card.appendChild(img);
    }

    const titleLink = document.createElement('a');
    titleLink.href = cardData.url || '#';
    titleLink.target = '_blank'; 
    titleLink.className = 'card-title-link';

    const title = document.createElement('h2');
    title.textContent = cardData.title;
    titleLink.appendChild(title);
    card.appendChild(titleLink);

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = cardData.description;
    card.appendChild(description);

    function loadCardDetails(cardData) {
        // Load the card details page
        loadPage('html/card_info.html').then(() => {
            const contentDiv = document.getElementById('content');
            const cardHeader = contentDiv.querySelector('#card-header');
            const cardTable = contentDiv.querySelector('#card-table');
    
            // Insert the card header (image, title, and URL)
            if (cardHeader) {
                cardHeader.innerHTML = `
                    <img src="${cardData.image}" alt="${cardData.title} Logo" style="height: 50px;">
                    <h2>${cardData.title}</h2>
                    <a href="${cardData.url}" target="_blank">${cardData.url}</a>
                `;
            }
    
            // Sort keys in alphanumeric order and insert the JSON key-value pairs into the table
            if (cardTable) {
                const sortedKeys = Object.keys(cardData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                cardTable.innerHTML = sortedKeys.map(key => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${cardData[key]}</td>
                    </tr>
                `).join('');
            }
        }).catch(error => console.error('Error loading card details:', error));
    }
    
    // Add event listener for entire card click (except title link)
    card.addEventListener('click', function (e) {
        if (!e.target.closest('.card-title-link')) {
            loadCardDetails(cardData);
        }
    });

    return card;
}

// Function to display cards for the current page
function displayCards(cardsData) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ''; // Clear existing cards

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = cardsData.slice(startIndex, endIndex);

    pageCards.forEach(cardData => {
        const card = createCard(cardData);
        cardContainer.appendChild(card);
    });

    setupPagination(cardsData.length);
}

// Function to setup pagination controls
function setupPagination(totalCards) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(totalCards / cardsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayCards(filteredCards.length > 0 ? filteredCards : allCards);
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayCards(filteredCards.length > 0 ? filteredCards : allCards);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayCards(filteredCards.length > 0 ? filteredCards : allCards);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Function to load JSON data from multiple files and merge them
function loadCards(fileNames) {
    let mergedData = {};

    const loadFile = (fileName) => {
        return fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok for ${fileName}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                Object.assign(mergedData, data);
                allCards = Object.values(mergedData);
                // Sort the cards alphabetically by title
                allCards.sort((a, b) => a.title.localeCompare(b.title));
            })
            .catch(error => console.error('Error loading card data:', error));
    };

    const loadPromises = fileNames.map(loadFile);

    Promise.all(loadPromises)
        .then(() => {
            displayAllTags();
            currentPage = 1; // Reset to first page on new load
            displayCards(allCards);
        })
        .catch(error => console.error('Error processing loaded data:', error));
}

// Function to display unique tags from all cards
function displayAllTags() {
    const tags = new Set();
    allCards.forEach(card => {
        if (card.tags) {
            card.tags.forEach(tag => tags.add(tag));
        }
    });

    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = '';

    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            const isSelected = tagElement.classList.toggle('selected');
            filterCardsByTag(tag, isSelected);
        });
        tagsContainer.appendChild(tagElement);
    });
}

// Function to filter cards based on selected tag
function filterCardsByTag(tag, isSelected) {
    if (isSelected) {
        filteredCards = allCards.filter(card => card.tags && card.tags.includes(tag));
    } else {
        filteredCards = allCards;
    }
    currentPage = 1; // Reset to first page on tag selection
    displayCards(filteredCards);
}

// Function to search through cards based on query
function searchCards(query) {
    const lowerCaseQuery = query.toLowerCase();
    console.log('Searching for:', lowerCaseQuery); // Log the query

    filteredCards = allCards.filter(card => {
        return (
            card.title.toLowerCase().includes(lowerCaseQuery) ||
            card.description.toLowerCase().includes(lowerCaseQuery) ||
            (card.tags && card.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
    });

    // console.log('Filtered cards:', filteredCards); // Log filtered results
    currentPage = 1; // Reset to first page on search
    displayCards(filteredCards);
}

// Event listener for search box
document.getElementById('search-box').addEventListener('input', (e) => {
    searchCards(e.target.value);
});

// Initialize cards loading and display
function initializeCards() {
    const contentElement = document.getElementById('content');
    if (contentElement) {
        const dataFileElement = contentElement.querySelector('#data-file');
        if (dataFileElement) {
            const fileNames = JSON.parse(dataFileElement.dataset.fileNames || '[]');
            if (fileNames && Array.isArray(fileNames)) {
                loadCards(fileNames);
            } else {
                console.error('Invalid or missing data-file-names attribute.');
            }
        }
    } else {
        console.error('Element with ID "content" not found.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeCards();
});
