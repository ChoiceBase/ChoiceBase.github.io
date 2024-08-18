// GIt contiributers
function loadContributors() {
    const contributorsContainer = document.getElementById('contributors');
    const repoOwner = 'ChoiceBase';
    const repoName = 'V1';

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contributors`)
        .then(response => response.json())
        .then(data => {
            data.forEach(contributor => {
                const contributorElement = document.createElement('div');
                contributorElement.className = 'contributor';

                contributorElement.innerHTML = `
                    <img src="${contributor.avatar_url}" alt="${contributor.login}'s avatar">
                    <h2>${contributor.login}</h2>
                    <p>Contributions: ${contributor.contributions}</p>
                    <a href="${contributor.html_url}" target="_blank">GitHub Profile</a>
                `;

                contributorsContainer.appendChild(contributorElement);
            });
        })
        .catch(error => {
            console.error('Error fetching contributors:', error);
            contributorsContainer.innerHTML = '<p>Failed to load contributors.</p>';
        });
};


window.loadContributors = loadContributors;
