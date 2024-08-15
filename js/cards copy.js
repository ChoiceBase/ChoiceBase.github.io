document.addEventListener('DOMContentLoaded', function() {
    // Function to create a card element
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

        const title = document.createElement('h2');
        title.textContent = cardData.title;
        card.appendChild(title);

        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = cardData.description;
        card.appendChild(description);

        return card;
    }

    // Function to load and render cards
    function loadCards() {
        fetch('json/cards.json')
            .then(response => response.json())
            .then(data => {
                const cardContainer = document.getElementById('card-container');
                data.forEach(cardData => {
                    const card = createCard(cardData);
                    cardContainer.appendChild(card);
                });
            })
            .catch(error => console.error('Error loading the card data:', error));
    }

    // Load cards on page load
    loadCards();
});
