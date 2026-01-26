// --- ChoiceBase OrgChart Enterprise V2 ---

let currentRolesData = null;
let googleChartInstance = null;
let googleDataTable = null;

const deptColors = {
  "Engineering": "#6366f1",
  "Product": "#8b5cf6",
  "Design": "#ec4899",
  "Sales": "#10b981",
  "Marketing": "#f59e0b",
  "HR": "#ef4444",
  "Operations": "#64748b"
};

function findTopRoles(roles) {
  const allManaged = new Set();
  Object.values(roles).forEach(r => (r.manages || []).forEach(m => allManaged.add(m)));
  return Object.keys(roles).filter(role => !allManaged.has(role));
}

function buildOrgChartRows(roles) {
  const rows = [];
  function addRows(role, manager = '') {
    const data = roles[role];
    if (!data) return;

    // Branch Color Coding Logic
    const dept = data.department || "Operations";
    const color = deptColors[dept] || deptColors["Operations"];

    const html = `
      <div class="org-node-inner" data-role="${role}" style="border-left: 4px solid ${color}">
        <div class="fw-bold">${role}</div>
        <div class="small opacity-75">${dept}</div>
      </div>
    `;

    rows.push([
      { v: role, f: html },
      manager,
      data.description
    ]);

    (data.manages || []).forEach(child => addRows(child, role));
  }

  findTopRoles(roles).forEach(top => addRows(top, ''));
  return rows;
}

google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(() => {
  fetch('../data/org.json')
    .then(r => r.json())
    .then(rolesData => {
      currentRolesData = rolesData;
      renderChart();
    });
});

function renderChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Name');
  data.addColumn('string', 'Manager');
  data.addColumn('string', 'ToolTip');
  data.addRows(buildOrgChartRows(currentRolesData));

  googleDataTable = data;
  googleChartInstance = new google.visualization.OrgChart(document.getElementById('chart_div'));

  // Selection listener for Bradcrumbs
  google.visualization.events.addListener(googleChartInstance, 'select', () => {
    const selection = googleChartInstance.getSelection();
    if (selection.length > 0) {
      const role = googleDataTable.getValue(selection[0].row, 0);
      updateBreadcrumbs(role);
    }
  });

  googleChartInstance.draw(data, { allowHtml: true, size: 'medium' });
}

// --- Premium Features ---

window.searchOrg = (query) => {
  if (!query) return;
  const q = query.toLowerCase();
  const foundIdx = [];
  for (let i = 0; i < googleDataTable.getNumberOfRows(); i++) {
    const name = googleDataTable.getValue(i, 0).toLowerCase();
    if (name.includes(q)) {
      googleChartInstance.setSelection([{ row: i }]);
      const role = googleDataTable.getValue(i, 0);

      // Auto-Center in Viewport (Logic from HTML)
      if (window.focusOnNode) window.focusOnNode(role);
      updateBreadcrumbs(role);
      return;
    }
  }
};

function updateBreadcrumbs(role) {
  const path = [];
  let current = role;

  while (current) {
    path.unshift(current);
    // Find manager
    let manager = null;
    for (let i = 0; i < googleDataTable.getNumberOfRows(); i++) {
      if (googleDataTable.getValue(i, 0) === current) {
        manager = googleDataTable.getValue(i, 1);
        break;
      }
    }
    current = manager;
  }

  const bc = document.getElementById('org-breadcrumbs');
  if (bc) bc.innerHTML = path.map(p => `<span>${p}</span>`).join(' <i class="bi bi-chevron-right mx-1 small opacity-50"></i> ');
}

window.exportOrgChart = () => {
  const chartArea = document.getElementById('chart_div');
  // Simple "Snapshot" logic - in real world would use html2canvas, 
  // but for pure JS we can trigger print or suggest save
  window.print();
};
