// Show top-liked resources and recent feedback (from localStorage)
function showTopLiked() {
  Promise.all([
    fetch('../data/ai-tools.json').then(r => r.json()),
    fetch('../data/jobs.json').then(r => r.json())
  ]).then(([ai, jobs]) => {
    const all = [...ai, ...jobs];
    const votes = JSON.parse(localStorage.getItem('votes') || '{}');
    all.forEach(r => r.votes = votes[r.id] || 0);
    all.sort((a, b) => b.votes - a.votes);
    renderResources(all.slice(0, 10), 'top-liked-resources', 1, 10);
  });
}

showTopLiked();
