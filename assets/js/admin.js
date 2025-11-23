// Load header and footer fragments
function loadFragment(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => { document.getElementById(id).innerHTML = html; });
}

window.addEventListener('DOMContentLoaded', function() {
  loadFragment('common-header', '/includes/header.html');
  loadFragment('common-footer', '/includes/footer.html');
  loadAdminData();
});

// Load and display admin data
async function loadAdminData() {
  await showTopLikedResources();
  showRecentFeedback();
  showResourceSubmissions();
}

// Show top-liked resources across all categories
async function showTopLikedResources() {
  const container = document.getElementById('top-liked-resources');
  if (!container) return;

  // Fetch all resources
  const [ai, jobs, programming, upskilling, others] = await Promise.all([
    fetch('/data/ai-tools.json').then(r => r.json()).catch(() => []),
    fetch('/data/jobs.json').then(r => r.json()).catch(() => []),
    fetch('/data/programming.json').then(r => r.json()).catch(() => []),
    fetch('/data/upskilling.json').then(r => r.json()).catch(() => []),
    fetch('/data/others.json').then(r => r.json()).catch(() => [])
  ]);

  // Get votes from localStorage
  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  // Combine all resources and add vote counts
  const allResources = [...ai, ...jobs, ...programming, ...upskilling, ...others].map(r => ({
    ...r,
    votes: votes[r.id] || r.votes || 0,
    favoriteCount: favorites.includes(r.id) ? 1 : 0
  }));

  // Sort by votes (descending) and get top 20
  const topResources = allResources
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 20);

  if (topResources.length === 0) {
    container.innerHTML = '<p>No resources with votes yet.</p>';
    return;
  }

  let html = `
    <div class="card mb-4" style="background: var(--bg-surface); border: 1.5px solid var(--primary);">
      <div class="card-body">
        <h2 class="mb-3" style="color: var(--primary);">Top Liked Resources</h2>
        <div class="table-responsive">
          <table class="table table-dark table-striped">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Title</th>
                <th>Category</th>
                <th>Votes</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
  `;

  topResources.forEach((resource, index) => {
    const category = getCategoryFromResource(resource, { ai, jobs, programming, upskilling, others });
    html += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${resource.title}</strong></td>
        <td>${category}</td>
        <td><span style="color: var(--highlight);">👍 ${resource.votes}</span></td>
        <td><a href="${resource.url}" target="_blank" style="color: var(--primary);">View</a></td>
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Determine category from resource
function getCategoryFromResource(resource, categories) {
  if (categories.ai.some(r => r.id === resource.id)) return 'AI Tools';
  if (categories.jobs.some(r => r.id === resource.id)) return 'Jobs';
  if (categories.programming.some(r => r.id === resource.id)) return 'Programming';
  if (categories.upskilling.some(r => r.id === resource.id)) return 'Upskilling';
  if (categories.others.some(r => r.id === resource.id)) return 'Others';
  return 'Unknown';
}

// Show recent feedback
function showRecentFeedback() {
  const container = document.getElementById('recent-feedback');
  if (!container) return;

  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  
  // Sort by timestamp (newest first)
  const sortedFeedbacks = feedbacks.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, 20);

  if (sortedFeedbacks.length === 0) {
    container.innerHTML = '<p>No feedback submitted yet.</p>';
    return;
  }

  let html = `
    <div class="card mb-4" style="background: var(--bg-surface); border: 1.5px solid var(--primary);">
      <div class="card-body">
        <h2 class="mb-3" style="color: var(--primary);">Recent Feedback</h2>
        <div class="feedback-list">
  `;

  sortedFeedbacks.forEach(feedback => {
    const date = new Date(feedback.timestamp).toLocaleString();
    const typeColors = {
      'general': 'var(--primary)',
      'bug': 'var(--accent)',
      'suggestion': 'var(--highlight)',
      'other': 'var(--text-muted)'
    };
    
    html += `
      <div class="feedback-item mb-3 p-3" style="background: var(--bg-main); border-left: 4px solid ${typeColors[feedback.type] || 'var(--primary)'}; border-radius: 0.5em;">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge" style="background: ${typeColors[feedback.type] || 'var(--primary)'}; color: var(--bg-main);">
            ${feedback.type.toUpperCase()}
          </span>
          <small style="color: var(--text-muted);">${date}</small>
        </div>
        <p style="color: var(--text-main); margin: 0;">${escapeHtml(feedback.message)}</p>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Show resource submissions with approval workflow
function showResourceSubmissions() {
  const container = document.getElementById('resource-submissions');
  if (!container) return;

  const pending = Submissions.getPending();
  const approved = Submissions.getApproved();
  
  // Sort by timestamp (newest first)
  const sortedPending = pending.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  let html = `
    <div class="card mb-4" style="background: var(--bg-surface); border: 1.5px solid var(--primary);">
      <div class="card-body">
        <h2 class="mb-3" style="color: var(--primary);">
          Resource Submissions
          <span class="badge" style="background: var(--accent);">Pending: ${pending.length}</span>
          <span class="badge" style="background: var(--highlight); color: var(--bg-main);">Approved: ${approved.length}</span>
        </h2>
  `;

  if (sortedPending.length === 0) {
    html += '<p>No pending submissions.</p>';
  } else {
    html += `
        <div class="table-responsive">
          <table class="table table-dark table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Tags</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    sortedPending.forEach(submission => {
      const date = new Date(submission.timestamp).toLocaleDateString();
      html += `
        <tr>
          <td>
            <strong>${escapeHtml(submission.title)}</strong><br>
            <small style="color: var(--text-muted);">${escapeHtml(submission.description.substring(0, 60))}...</small><br>
            <a href="${submission.url}" target="_blank" style="color: var(--primary); font-size: 0.9em;">${submission.url}</a>
          </td>
          <td>${submission.category}</td>
          <td>${(submission.tags || []).map(t => `<span class="badge" style="background: var(--primary); color: var(--bg-main); margin: 2px;">${escapeHtml(t)}</span>`).join(' ')}</td>
          <td>${date}</td>
          <td>
            <button class="btn btn-sm approve-btn" data-id="${submission.id}" style="background: var(--highlight); color: var(--bg-main); margin: 2px;">✓ Approve</button>
            <button class="btn btn-sm reject-btn" data-id="${submission.id}" style="background: var(--accent); color: white; margin: 2px;">✗ Reject</button>
            <button class="btn btn-sm copy-resource-btn" data-resource='${JSON.stringify(submission).replace(/'/g, "&apos;")}' style="background: var(--primary); color: var(--bg-main); margin: 2px;">Copy JSON</button>
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add approval/rejection handlers
  container.querySelectorAll('.approve-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const result = Submissions.approve(id);
      if (result.success) {
        showResourceSubmissions(); // Refresh
        alert('Resource approved! You can copy the JSON and add it to the data file.');
      }
    };
  });

  container.querySelectorAll('.reject-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const reason = prompt('Rejection reason (optional):');
      const result = Submissions.reject(id, reason);
      if (result.success) {
        showResourceSubmissions(); // Refresh
      }
    };
  });

  // Add copy functionality
  container.querySelectorAll('.copy-resource-btn').forEach(btn => {
    btn.onclick = () => {
      const resource = JSON.parse(btn.dataset.resource);
      const jsonStr = JSON.stringify({
        id: resource.id.replace('submitted-', '').split('-')[0],
        title: resource.title,
        url: resource.url,
        description: resource.description,
        tags: resource.tags,
        votes: 0,
        addedDate: new Date().toISOString()
      }, null, 2);
      
      navigator.clipboard.writeText(jsonStr).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy JSON';
        }, 2000);
      });
    };
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
