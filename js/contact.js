document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim();
  const message = e.target.message.value.trim();
  console.log('Feedback:', { name, email, message });
  alert('Thank you for your feedback!');
  e.target.reset();
});

document.getElementById('resourceForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const resourceName = e.target.resourceName.value.trim();
  const resourceLink = e.target.resourceLink.value.trim();
  const resourceDescription = e.target.resourceDescription.value.trim();
  const resourceTags = e.target.resourceTags.value.trim();
  console.log('New Resource Suggestion:', { resourceName, resourceLink, resourceDescription, resourceTags });
  alert('Thank you for suggesting a resource!');
  e.target.reset();
});
