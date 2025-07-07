// Add a vote for a resource
function voteResource(id) {
  let votes = JSON.parse(localStorage.getItem('votes') || '{}');
  votes[id] = (votes[id] || 0) + 1;
  localStorage.setItem('votes', JSON.stringify(votes));
  return votes[id];
}

// Attach listeners to all .vote-btn buttons
function attachVoteListeners() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const count = voteResource(id);
      btn.textContent = `👍 ${count}`;
    };
  });
}
