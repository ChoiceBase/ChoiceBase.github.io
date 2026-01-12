document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'ai-tools';

  const cat = categories[category] || categories['ai-tools'];
  const titleEl = document.getElementById('category-title');
  if (titleEl) titleEl.textContent = cat.title;
  document.getElementById('page-title').textContent = `${cat.title} – ChoiceBase`;

  const votes = utils.getVotes();
  const data = await utils.fetchData(cat.data);

  // Data is already sorted with highest IDs (most popular) first
  data.forEach(r => r.votes = votes[r.id] || r.votes || 0);

  components.renderSectionedList(data, 'resource-container', 'sections-dropdown-menu');
});

// Categories map (remains here as it's page-specific context)
const categories = {
  'ai-tools': { title: 'AI Tools', data: '/data/ai-tools.json' },
  'programming': { title: 'Programming', data: '/data/programming.json' },
  'jobs': { title: 'Jobs', data: '/data/jobs.json' },
  'women-in-tech': { title: 'Women in Tech', data: '/data/women-in-tech.json' }
};
