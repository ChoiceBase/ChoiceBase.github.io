/**
 * Reusable UI Components for ChoiceBase
 */

const components = {
    /**
     * Create a single resource card
     */
    createResourceCard(resource, favs) {
        const isFav = favs.includes(String(resource.id));
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
      <div class="card h-100 bg-transparent border-primary">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title"><a href="${resource.url}" target="_blank" class="text-primary text-decoration-none">${resource.title}</a></h5>
          <p class="card-text text-secondary small flex-grow-1">${resource.description || 'No description available.'}</p>
          <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
            <button class="btn btn-sm vote-btn" data-id="${resource.id}">👍 <span class="vote-count">${resource.votes || 0}</span></button>
            <button class="btn btn-sm fav-btn${isFav ? ' active' : ''}" data-id="${resource.id}">⭐</button>
          </div>
        </div>
      </div>
    `;

        // Attach scoped listeners
        card.querySelector('.vote-btn').onclick = (e) => {
            const btn = e.currentTarget;
            const id = btn.dataset.id;
            const count = utils.recordVote(id);
            btn.querySelector('.vote-count').textContent = count;
        };

        card.querySelector('.fav-btn').onclick = (e) => {
            const btn = e.currentTarget;
            const id = btn.dataset.id;
            const updatedFavs = utils.toggleFavorite(id);
            btn.classList.toggle('active', updatedFavs.includes(String(id)));

            // Global trigger for home page refresh if needed
            if (window.onFavoritesUpdated) window.onFavoritesUpdated();
        };

        return card;
    },

    /**
     * Create a horizontal scroller
     */
    createScroller(resources, favs) {
        const wrapper = document.createElement('div');
        wrapper.className = 'resource-scroller-container';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'scroller-btn prev';
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'scroller-btn next';
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';

        const scroller = document.createElement('div');
        scroller.className = 'resource-scroller';

        resources.forEach(r => scroller.appendChild(this.createResourceCard(r, favs)));

        const scrollOffset = 374;
        prevBtn.onclick = () => scroller.scrollBy({ left: -scrollOffset, behavior: 'smooth' });
        nextBtn.onclick = () => scroller.scrollBy({ left: scrollOffset, behavior: 'smooth' });

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(scroller);
        wrapper.appendChild(nextBtn);
        return wrapper;
    },

    /**
     * Render a sectioned list (used in resource-list.html)
     */
    renderSectionedList(resources, containerId, dropdownMenuId) {
        const container = document.getElementById(containerId);
        const dropdownMenu = document.getElementById(dropdownMenuId);
        const favs = utils.getFavorites();
        if (!container) return;

        container.innerHTML = '';
        if (dropdownMenu) dropdownMenu.innerHTML = '';

        // Grouping - Add each resource to all matching tag sections
        const groups = {};
        resources.forEach(r => {
            if (r.tags && r.tags.length > 0) {
                r.tags.forEach(tag => {
                    if (!groups[tag]) groups[tag] = [];
                    groups[tag].push(r);
                });
            } else {
                if (!groups['General']) groups['General'] = [];
                groups['General'].push(r);
            }
        });

        // Priority Sort: Free, Top, then Alpha
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const priority = ['free', 'top'];
            const indexA = priority.indexOf(a.toLowerCase());
            const indexB = priority.indexOf(b.toLowerCase());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach(name => {
            const id = `section-${name.replace(/\s+/g, '-').toLowerCase()}`;

            // Dropdown Item
            if (dropdownMenu) {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item d-flex align-items-center" href="#${id}"><i class="bi bi-chevron-right me-2 small"></i>${name}</a>`;
                li.querySelector('a').onclick = (e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                };
                dropdownMenu.appendChild(li);
            }

            // Details Section
            const details = document.createElement('details');
            details.className = 'section-details mb-5';
            details.id = id;
            if (name.toLowerCase() === 'free' || name.toLowerCase().includes('tos')) {
                details.setAttribute('open', '');
            }

            const summary = document.createElement('summary');
            summary.className = 'section-summary h2 mb-0 px-4 py-3';
            summary.textContent = name;
            details.appendChild(summary);

            details.appendChild(this.createScroller(groups[name], favs));
            container.appendChild(details);
        });
    },

    /**
     * Render a simple grid (used in search-results.html)
     */
    renderGrid(resources, containerId) {
        const container = document.getElementById(containerId);
        const favs = utils.getFavorites();
        if (!container) return;

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'resource-list-grid mt-4';
        resources.forEach(r => grid.appendChild(this.createResourceCard(r, favs)));
        container.appendChild(grid);
    }
};
