/**
 * ChoiceBase OOP Refit: Resource List Manager
 */
class ResourceListApp {
  static async init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'ai-tools';
    const categories = {
      'ai-tools': { title: 'AI Tools', data: '/data/ai-tools.json' },
      'programming': { title: 'Programming', data: '/data/programming.json' },
      'jobs': { title: 'Jobs', data: '/data/jobs.json' },
      'upskilling': { title: 'Upskilling', data: '/data/upskilling.json' },
      'websites': { title: 'Websites', data: '/data/websites.json' },
      'applications': { title: 'Applications', data: '/data/applications.json' }
    };

    const cat = categories[category] || categories['ai-tools'];
    
    // UI Update
    const titleEl = document.getElementById('category-title');
    if (titleEl) titleEl.textContent = cat.title;

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = `${cat.title} – ChoiceBase`;

    // Data Load
    const data = await Utils.fetchData(cat.data);
    ComponentFactory.renderSectionedList(data, 'resource-container', 'sections-dropdown-menu');
  }
}

document.addEventListener('DOMContentLoaded', () => ResourceListApp.init());
