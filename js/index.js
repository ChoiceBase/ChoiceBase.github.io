document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('hidden');
});
const dummyResources = [{title:'ChatGPT',link:'https://chat.openai.com',votes:10,tags:['ai','free']},{title:'LeetCode',link:'https://leetcode.com',votes:8,tags:['coding']},{title:'Kaggle',link:'https://kaggle.com',votes:5,tags:['ai']}];
const container = document.getElementById('resourceContainer');
dummyResources.forEach(r => {
  const div = document.createElement('div');
  div.className = 'bg-white p-4 rounded shadow';
  div.innerHTML = `<h3>${r.title}</h3><a href="${r.link}" target="_blank">Visit</a><p>Votes: ${r.votes}</p>`;
  container.appendChild(div);
});
