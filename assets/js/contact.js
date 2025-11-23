/**
 * Simplified Contact Page Handler
 * Uses security validation and submission system
 */

// Load header and footer fragments
function loadFragment(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => { document.getElementById(id).innerHTML = html; });
}

window.addEventListener('DOMContentLoaded', function() {
  loadFragment('common-header', '/includes/header.html');
  loadFragment('common-footer', '/includes/footer.html');
  
  // Initialize forms
  initForms();
});

function initForms() {
  // Feedback form
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedback);
  }

  // Resource submission form
  const resourceForm = document.getElementById('resource-submission-form');
  if (resourceForm) {
    resourceForm.addEventListener('submit', handleResourceSubmission);
  }
}

// Handle feedback submission
function handleFeedback(e) {
  e.preventDefault();
  
  const feedbackData = {
    type: document.getElementById('feedback-type').value,
    message: document.getElementById('feedback-message').value
  };

  // Validate
  const validation = Security.validateFeedback(feedbackData);
  
  if (!validation.valid) {
    showError('feedback-error', validation.errors.join(', '));
    return;
  }

  // Rate limiting
  if (!Security.checkRateLimit('feedback', 5, 3600000)) { // 5 per hour
    showError('feedback-error', 'Too many submissions. Please wait before submitting again.');
    return;
  }

  // Store feedback
  let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  feedbacks.push(validation.sanitized);
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

  // Show success
  showSuccess('feedback-success');
  e.target.reset();
}

// Handle resource submission
function handleResourceSubmission(e) {
  e.preventDefault();
  
  const resourceData = {
    title: document.getElementById('resource-title').value,
    url: document.getElementById('resource-url').value,
    description: document.getElementById('resource-description').value,
    category: document.getElementById('resource-category').value,
    tags: document.getElementById('resource-tags').value.split(',').map(t => t.trim())
  };

  // Submit using submission system
  const result = Submissions.submit(resourceData);
  
  if (!result.success) {
    showError('resource-error', result.errors.join(', '));
    return;
  }

  // Show success
  showSuccess('resource-success');
  e.target.reset();
}

// Helper functions
function showSuccess(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

function showError(elementId, message) {
  let errorEl = document.getElementById(elementId);
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = elementId;
    errorEl.className = 'alert alert-danger mt-3';
    const form = document.getElementById('feedback-form') || document.getElementById('resource-submission-form');
    form.parentNode.insertBefore(errorEl, form.nextSibling);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

