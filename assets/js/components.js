/**
 * ChoiceBase OOP Refit: Component Factory
 */
class ComponentFactory {
    /**
     * Create a single resource row (Flat View)
     */
    static createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = 'resource-item';
        card.style.position = 'relative';

        card.innerHTML = `
            <div class="resource-content">
                <h3 class="resource-title">
                    <a href="${resource.url}" target="_blank" class="stretched-link">${resource.title}</a>
                </h3>
                <p class="resource-desc">${resource.description || 'No description available.'}</p>
            </div>
        `;

        return card;
    }

    /**
     * Create a vertical list
     */
    static createScroller(resources) {
        const container = document.createElement('div');
        container.className = 'resource-list-grid';
        resources.forEach(r => container.appendChild(this.createResourceCard(r)));
        return container;
    }

    /**
     * Render a sectioned list with summary details
     */
    static renderSectionedList(resources, containerId, dropdownMenuId) {
        const container = document.getElementById(containerId);
        const dropdownMenu = document.getElementById(dropdownMenuId);
        if (!container) return;

        container.innerHTML = '';
        if (dropdownMenu) dropdownMenu.innerHTML = '';

        // Grouping: Use only the first tag, or 'General'
        let groups = {};
        resources.forEach(r => {
            const tag = (r.tags && r.tags.length > 0) ? r.tags[0] : 'General';
            if (!groups[tag]) groups[tag] = [];
            groups[tag].push(r);
        });

        // Consolidate single-item sections into 'General'
        const keys = Object.keys(groups);
        keys.forEach(tag => {
            if (tag !== 'General' && groups[tag].length === 1) {
                if (!groups['General']) groups['General'] = [];
                groups['General'].push(...groups[tag]);
                delete groups[tag];
            }
        });

        // Priority Sort: Free, Top, then Alpha
        const sorted = Object.keys(groups).sort((a, b) => {
            const priority = ['free', 'top', 'popular', 'general'];
            const indexA = priority.indexOf(a.toLowerCase());
            const indexB = priority.indexOf(b.toLowerCase());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        sorted.forEach(name => {
            const id = `section-${name.replace(/\s+/g, '-').toLowerCase()}`;

            // Dropdown Item Integration
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
            details.className = 'section-details';
            details.id = id;

            // Open top sections by default
            if (['free', 'top', 'popular', 'general'].some(k => name.toLowerCase().includes(k))) {
                details.setAttribute('open', '');
            }

            const summary = document.createElement('summary');
            summary.className = 'section-summary';
            summary.innerHTML = `<span class="me-2">▶</span> ${name} <span class="badge bg-primary rounded-pill ms-2 profile-badge" style="font-size:0.7em">${groups[name].length}</span>`;
            details.appendChild(summary);

            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'p-3';
            scrollContainer.appendChild(this.createScroller(groups[name]));

            details.appendChild(scrollContainer);
            container.appendChild(details);
        });
    }

    /**
     * Render a simple grid (Search Results)
     */
    static renderGrid(resources, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'resource-list-grid mt-4';
        resources.forEach(r => list.appendChild(this.createResourceCard(r)));
        container.appendChild(list);
    }
}

// Global accessor for legacy support - will eventually be phased out
window.components = ComponentFactory;
window.ComponentFactory = ComponentFactory;
