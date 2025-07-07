function attachVoteListeners() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      let votes = JSON.parse(localStorage.getItem('votes') || '{}');
      votes[id] = (votes[id] || 0) + 1;
      localStorage.setItem('votes', JSON.stringify(votes));
      btn.textContent = `👍 ${votes[id]}`;
    };
  });
}
