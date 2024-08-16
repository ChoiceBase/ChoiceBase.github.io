let currentPage = 1;
const cardsPerPage = 10;
let allCards = []; // This will store all card data

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

    // const cardLink  = document.createElement('a');
    // cardLink .href = cardData.url || '#';
    // cardLink .target = '_blank'; 
    // cardLink .className = 'card-link';

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = cardData.description;
    // cardLink.appendChild(description);
    card.appendChild(description);

    // Add an event listener for the entire card click (except the title link)
    card.addEventListener('click', function (e) {
        if (!e.target.closest('.card-title-link')) {
            const cardDetailsWindow = window.open("", "_blank");
            cardDetailsWindow.document.write(`
                <html>
                <head>
                    <title>${cardData.title}</title>
                    <link rel="stylesheet" href="css/cards.css">
                </head>
                <body>
                    <div class="card-details">
                        <h2>${cardData.title}</h2>
                        <img src="${cardData.image}" alt="${cardData.title} Logo" class="card-logo">
                        <p>${cardData.description}</p>
                        <!-- Add any other details from cardData here -->
                    </div>
                </body>
                </html>
            `);
            cardDetailsWindow.document.close();
        }
    })

    return card;
}

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

function setupPagination(totalCards) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(totalCards / cardsPerPage);

    // Create Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayCards(allCards);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Create page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayCards(allCards);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Create Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayCards(allCards);
        }
    });
    paginationContainer.appendChild(nextButton);
}

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
            })
            .catch(error => console.error('Error loading card data:', error));
    };

    const loadPromises = fileNames.map(loadFile);

    Promise.all(loadPromises)
        .then(() => {
            currentPage = 1; // Reset to first page on new load
            displayCards(allCards);
        })
        .catch(error => console.error('Error processing loaded data:', error));
}

function initializeCards() {
    const contentElement = document.getElementById('content');
    if (contentElement) {
        const dataFileElement = contentElement.querySelector('#data-file');
        if (dataFileElement) {
            const fileNames = JSON.parse(dataFileElement.dataset.fileNames || '[]');
            if (fileNames && Array.isArray(fileNames)) {
                loadCards(fileNames);
                console.log(fileNames);
            } else {
                console.error('Invalid or missing data-file-names attribute.');
            }
        }
    } else {
        console.error('Element with ID "content" not found.');
    }
}

// Attach initializeCards to the window object
// window.initializeCards = initializeCards;

// Ensure initializeCards is available and called on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initializeCards === 'function') {
        initializeCards();
    } else {
        console.error('initializeCards function is not available.');
    }
});
