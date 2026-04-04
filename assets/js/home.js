/**
 * ChoiceBase OOP Refit: Home Logic
 */
class HomeApp {
  static async init() {
    const data = await Utils.fetchData('/data/ai-tools.json');
    const highlighted = data.slice(0, 4);

    const container = document.getElementById('highlighted-resources');
    if (container) {
      container.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'resource-list-grid mt-4';
      highlighted.forEach(r => grid.appendChild(ComponentFactory.createResourceCard(r)));
      container.appendChild(grid);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => HomeApp.init());
