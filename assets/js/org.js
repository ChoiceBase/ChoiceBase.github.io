// Helper: Find all roles with no manager (top-level)
function findTopRoles(roles) {
  const allManaged = new Set();
  Object.values(roles).forEach(r => r.manages.forEach(m => allManaged.add(m)));
  return Object.keys(roles).filter(role => !allManaged.has(role));
}

// Convert roles JSON into [Name, Manager, Tooltip] rows for Google OrgChart
function buildOrgChartRows(roles) {
  const rows = [];
  function addRows(role, manager = '') {
    rows.push([
      { v: role, f: `<b>${role}</b><div style="font-size:0.9em;color:#555">${roles[role].description}</div>` },
      manager,
      roles[role].description
    ]);
    (roles[role].manages || []).forEach(child => {
      if (roles[child]) addRows(child, role);
    });
  }
  findTopRoles(roles).forEach(top => addRows(top, ''));
  return rows;
}

// Google Charts setup
google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(() => {
  fetch('../data/org.json')
    .then(response => response.json())
    .then(rolesData => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Name');
      data.addColumn('string', 'Manager');
      data.addColumn('string', 'ToolTip');
      data.addRows(buildOrgChartRows(rolesData));

      const chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
      chart.draw(data, { allowHtml: true });
    });
});
