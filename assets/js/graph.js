// --- D3 Career Nexus: The "Infinite Rebirth" Engine (V2 Premium) ---

const domainToJson = {
  construction: '../data/roles_construction.json',
  electronics: '../data/roles_electronics.json',
  software: '../data/roles_it.json',
  manufacturing: '../data/roles_manufacturing.json',
  marketing: '../data/roles_marketing.json',
  medical: '../data/roles_medical.json'
};

let currentNodes = [], currentLinks = [];
let pathStartNode = null;
let simulation = null;
let width = 0, height = 0;

// Global Resize Listener - only add once
window.addEventListener('resize', () => {
  const container = document.getElementById('graph-container');
  if (!container || !simulation) return;
  width = container.clientWidth;
  height = container.clientHeight;
  simulation.force("center", d3.forceCenter(width / 2, height / 2)).alpha(0.3).restart();
});

function getDomainFromHash() {
  const hash = window.location.hash.replace('#', '');
  return domainToJson[hash] ? hash : 'software';
}

function renderFromHash() {
  const domain = getDomainFromHash();
  renderGraph(domainToJson[domain]);
}

window.addEventListener('hashchange', renderFromHash);
renderFromHash();

// 3D Parallax Tilt Effect
document.getElementById('graph-container').addEventListener('mousemove', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  const svg = e.currentTarget.querySelector('svg');
  if (svg) {
    svg.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  }
});

function renderGraph(jsonUrl) {
  const svg = d3.select("#nexus-svg");
  const container = document.getElementById('graph-container');

  if (simulation) simulation.stop();
  svg.selectAll("*").remove();

  fetch(jsonUrl).then(r => r.json()).then(json => {
    // 1. Data Processing
    const rawLinks = [];
    json.roles.forEach(n => {
      if (n.related) n.related.forEach(rel => rawLinks.push({ source: n.name, target: rel }));
    });

    const connections = {};
    rawLinks.forEach(l => {
      connections[l.source] = (connections[l.source] || 0) + 1;
      connections[l.target] = (connections[l.target] || 0) + 1;
    });

    const nodes = json.roles.map(r => ({ ...r, id: r.name, connCount: connections[r.name] || 0 }));
    const links = rawLinks.filter(l => nodes.find(n => n.id === l.source) && nodes.find(n => n.id === l.target));

    currentNodes = nodes; currentLinks = links;

    // 2. Dimensions
    width = container.clientWidth;
    height = container.clientHeight;

    const g = svg.append("g");

    // 3. Zoom handling
    const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);

    window.zoomNexus = (f) => svg.transition().duration(400).call(zoom.scaleBy, f);
    window.resetNexusZoom = () => {
      const bounds = g.node().getBBox();
      const scale = 0.8 / Math.max(bounds.width / width, bounds.height / height);
      const transform = d3.zoomIdentity
        .translate(width / 2 - scale * (bounds.x + bounds.width / 2), height / 2 - scale * (bounds.y + bounds.height / 2))
        .scale(scale);
      svg.transition().duration(750).call(zoom.transform, transform);
    };

    const colorScale = d3.scaleLinear().domain([0, 2, 5, 8]).range(["#4f46e5", "#6366f1", "#a855f7", "#06b6d4"]);

    // 4. Forces
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(220))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05);

    // 5. Drawing Layers
    const linkGroup = g.append("g");
    const nodeGroup = g.append("g");

    const link = linkGroup.selectAll("line").data(links).enter().append("line").attr("class", "link");
    const pulseLink = linkGroup.selectAll(".link-pulse").data(links).enter().append("line").attr("class", "link-pulse").style("pointer-events", "none");

    const node = nodeGroup.selectAll("g")
      .data(nodes).enter().append("g")
      .attr("class", "node")
      .on("click", (e, d) => {
        if (e.shiftKey) togglePathSelection(d);
        else showSideInfo(d, e);
      })
      .on("mouseenter", (e, d) => setFocusScope(d))
      .on("mouseleave", () => resetFocusScope())
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("text").attr("text-anchor", "middle").attr("dy", ".35em").text(d => d.id);
    node.insert("rect", "text")
      .attr("fill", d => colorScale(d.connCount))
      .attr("x", function () { const b = d3.select(this.parentNode).select("text").node().getBBox(); return b.x - 15; })
      .attr("y", function () { const b = d3.select(this.parentNode).select("text").node().getBBox(); return b.y - 8; })
      .attr("width", function () { const b = d3.select(this.parentNode).select("text").node().getBBox(); return b.width + 30; })
      .attr("height", function () { const b = d3.select(this.parentNode).select("text").node().getBBox(); return b.height + 16; })
      .attr("rx", 10).attr("ry", 10);

    let lastUpdate = 0;
    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      pulseLink.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      const now = Date.now();
      if (now - lastUpdate > 300) { updateDashboardData(); lastUpdate = now; }
    });

    // --- Core Interaction Logic ---

    function setFocusScope(d) {
      const neighbors = new Set([d.id]);
      links.forEach(l => {
        if (l.source.id === d.id) neighbors.add(l.target.id);
        if (l.target.id === d.id) neighbors.add(l.source.id);
      });
      node.classed("faded", n => !neighbors.has(n.id));
      link.classed("faded", l => l.source.id !== d.id && l.target.id !== d.id);
      pulseLink.classed("faded", l => l.source.id !== d.id && l.target.id !== d.id);
    }

    function resetFocusScope() {
      node.classed("faded", false);
      link.classed("faded", false);
      pulseLink.classed("faded", false);
    }

    let allVisibleTools = [];
    function updateDashboardData() {
      const isMob = window.innerWidth <= 768;
      const limit = isMob ? 5 : 10;
      const visibleTools = {};
      nodes.forEach(n => {
        if (n.x > 0 && n.x < width && n.y > 0 && n.y < height && n.tools) {
          n.tools.forEach(t => visibleTools[t] = (visibleTools[t] || 0) + 1);
        }
      });
      allVisibleTools = Object.entries(visibleTools).sort((a, b) => b[1] - a[1]);
      const top = allVisibleTools.slice(0, limit);
      const dashList = document.getElementById('dash-list');
      if (dashList) dashList.innerHTML = top.map(t => `<div class="dashboard-item"><span>${t[0]}</span><b>${t[1]}</b></div>`).join('');
    }

    window.toggleFullIntel = () => {
      const modal = document.getElementById('intel-modal');
      const list = document.getElementById('full-intel-list');
      if (!modal.classList.contains('show')) {
        list.innerHTML = allVisibleTools.map(t => `<div class="dashboard-item border-bottom py-2"><span>${t[0]}</span><b>${t[1]} instances</b></div>`).join('');
        modal.style.visibility = "visible";
        setTimeout(() => modal.classList.add('show'), 10);
      } else {
        modal.classList.remove('show');
        setTimeout(() => modal.style.visibility = "hidden", 300);
      }
    };

    window.teleportToNode = (id) => {
      const d = nodes.find(n => n.id === id);
      if (!d) return;
      const panel = document.getElementById('nexus-info-panel');
      panel.classList.remove('show');
      const scale = 2;
      const transform = d3.zoomIdentity.translate(width / 2 - scale * d.x, height / 2 - scale * d.y).scale(scale);
      svg.transition().duration(1000).call(zoom.transform, transform).on("end", () => showSideInfo(d));
    };

    function showSideInfo(d, e = null) {
      if (e) e.stopPropagation();
      const panel = document.getElementById('nexus-info-panel');
      const body = document.getElementById('info-panel-body');
      const toolsHTML = d.tools ? d.tools.map(t => `<span class="info-badge">${t}</span>`).join('') : 'None';
      const skillsHTML = d.skills ? d.skills.map(s => `<span class="info-badge">${s}</span>`).join('') : 'None';
      const relatedHTML = (d.related && d.related.length > 0)
        ? d.related.map(r => `<span class="info-badge bg-primary text-white" style="cursor:pointer" onclick="teleportToNode('${r}')">${r}</span>`).join('')
        : 'None';

      body.innerHTML = `
        <div class="info-section">
          <h3>${d.name}</h3>
          <p class="badge bg-primary mb-3">${d.connCount} Connections</p>
          <div class="info-content">${d.description || ''}</div>
        </div>
        <div class="info-section"><span class="info-label">Essential Tools</span><div class="d-flex flex-wrap">${toolsHTML}</div></div>
        <div class="info-section"><span class="info-label">Core Skills</span><div class="d-flex flex-wrap">${skillsHTML}</div></div>
        <div class="info-section"><span class="info-label">Related Roles</span><div class="d-flex flex-wrap">${relatedHTML}</div></div>
      `;
      panel.classList.add('show');
    }

    window.filterNexusGraph = function (searchTerm) {
      if (!searchTerm) { resetFocusScope(); return; }
      const term = searchTerm.trim().toLowerCase();
      const matchedNodes = new Set();
      nodes.forEach(n => {
        const inName = n.name && n.name.toLowerCase().includes(term);
        const inTools = n.tools && n.tools.join(' ').toLowerCase().includes(term);
        if (inName || inTools) matchedNodes.add(n.id);
      });
      if (matchedNodes.size > 0) {
        node.classed("faded", n => !matchedNodes.has(n.id));
        link.classed("faded", l => !matchedNodes.has(l.source.id) || !matchedNodes.has(l.target.id));
        const first = nodes.find(n => matchedNodes.has(n.id));
        if (first) teleportToNode(first.id);
      } else { resetFocusScope(); }
    };

    function togglePathSelection(d) {
      if (!pathStartNode) {
        pathStartNode = d;
        document.getElementById('path-status').innerHTML = `Tracing: <b>${d.id}</b>... click target`;
      } else {
        findAndHighlightPath(pathStartNode, d);
        pathStartNode = null;
      }
    }

    function findAndHighlightPath(start, end) {
      const queue = [[start.id]];
      const visited = new Set();
      let path = null;
      while (queue.length > 0) {
        const currentPath = queue.shift();
        const nodeID = currentPath[currentPath.length - 1];
        if (nodeID === end.id) { path = currentPath; break; }
        if (!visited.has(nodeID)) {
          visited.add(nodeID);
          const currentNeighbors = links.filter(l => l.source.id === nodeID || l.target.id === nodeID)
            .map(l => l.source.id === nodeID ? l.target.id : l.source.id);
          currentNeighbors.forEach(neigh => queue.push([...currentPath, neigh]));
        }
      }
      node.classed("path-member", false); link.classed("path-member", false);
      if (path) {
        node.classed("path-member", n => path.includes(n.id));
        link.classed("path-member", l => path.includes(l.source.id) && path.includes(l.target.id));
        document.getElementById('path-status').innerHTML = `Path Trace Active! <span style="cursor:pointer; text-decoration:underline" onclick="resetPathVisuals()">Clear</span>`;
      } else { document.getElementById('path-status').innerHTML = "No direct connection found."; }
    }

    window.resetPathVisuals = () => {
      node.classed("path-member", false); link.classed("path-member", false);
      document.getElementById('path-status').innerHTML = "Shift+Click a role for path trace.";
    };

    setTimeout(window.resetNexusZoom, 1000);
  });
}
