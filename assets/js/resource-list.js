document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'ai-tools';

  const cat = categories[category] || categories['ai-tools'];
  const titleEl = document.getElementById('category-title');
  if (titleEl) titleEl.textContent = cat.title;

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${cat.title} – ChoiceBase`;

  const data = await utils.fetchData(cat.data);

  components.renderSectionedList(data, 'resource-container', 'sections-dropdown-menu');
});

// Categories map
const categories = {
  'ai-tools': { title: 'AI Tools', data: '/data/ai-tools.json' },
  'programming': { title: 'Programming', data: '/data/programming.json' },
  'jobs': { title: 'Jobs', data: '/data/jobs.json' },
  'upskilling': { title: 'Upskilling', data: '/data/upskilling.json' },
  'websites': { title: 'Websites', data: '/data/websites.json' },
  'applications': { title: 'Applications', data: '/data/applications.json' }
};
