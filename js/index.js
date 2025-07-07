// Toggle Menu
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('hidden');
});

// Resource Loading
const resourceContainer = document.getElementById('resourceContainer');
const filterInput = document.getElementById('filterInput');
const adminView = document.getElementById('adminView');
const adminButton = document.getElementById('adminViewButton');
const topResourcesList = document.getElementById('topResources');

let currentPage = 1;
const itemsPerPage = 6;
let filteredResources = [];

const dummyData = [
  { id: 1, title: 'ChatGPT', link: 'https://chat.openai.com', tags: ['ai', 'free'], votes: 15 },
  { id: 2, title: 'GitHub', link: 'https://github.com', tags: ['code', 'free'], votes: 10 },
  { id: 3, title: 'Stack Overflow', link: 'https://stackoverflow.com', tags: ['programming'], votes: 8 },
  { id: 4, title: 'Kaggle', link: 'https://kaggle.com', tags: ['data', 'ai'], votes: 12 },
  { id: 5, title: 'LeetCode', link: 'https://leetcode.com', tags: ['coding'], votes: 9 },
  { id: 6, title: 'HackerRank', link: 'https://hackerrank.com', tags: ['coding'], votes: 5 },
  { id: 7, title: 'Upwork', link: 'https://upwork.com', tags: ['freelance'], votes: 7 },
  { id: 8, title: 'Fiverr', link: 'https://fiverr.com', tags: ['freelance'], votes: 4 },
];

function renderResources() {
  resourceContainer.innerHTML = '';
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = filteredResources.slice(start, end);

  currentItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'border rounded p-4 bg-white shadow';
    div.innerHTML = `
      <h3 class="font-semibold">${item.title}</h3>
      <p class="text-sm text-blue-500"><a href="${item.link}" target="_blank">Visit</a></p>
      <p class="text-xs text-gray-500">Tags: ${item.tags.join(', ')}</p>
      <p class="text-xs">Likes: ${item.votes}</p>
    `;
    resourceContainer.appendChild(div);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  const pageCount = Math.ceil(filteredResources.length / itemsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = currentPage === i ? 'active' : '';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderResources();
    });
    pagination.appendChild(btn);
  }
}

filterInput.addEventListener('input', () => {
  const val = filterInput.value.toLowerCase();
  filteredResources = dummyData.filter(item =>
    item.tags.some(tag => tag.toLowerCase().includes(val)) ||
    item.title.toLowerCase().includes(val)
  );
  currentPage = 1;
  renderResources();
});

adminButton.addEventListener('click', () => {
  adminView.classList.toggle('hidden');
  const top = [...dummyData].sort((a, b) => b.votes - a.votes).slice(0, 5);
  topResourcesList.innerHTML = top.map(item => `<li>${item.title} (${item.votes} votes)</li>`).join('');
});

// Init
filteredResources = dummyData;
renderResources();
