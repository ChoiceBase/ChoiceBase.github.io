function setupPagination(resources, paginationId, containerId) {
  const perPage = window.innerWidth < 600 ? 6 : 12;
  const totalPages = Math.ceil(resources.length / perPage);
  const pagination = document.getElementById(paginationId);
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => renderResources(resources, containerId, i, perPage);
    pagination.appendChild(btn);
  }
}
