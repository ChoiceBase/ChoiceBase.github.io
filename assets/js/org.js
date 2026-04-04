/**
 * ChoiceBase OrgChartApp — D3.js Collapsible Tree
 * Replaces Google OrgChart with a flexible, interactive tree.
 */
class OrgChartApp {
  constructor() {
    this.rawData = null;
    this.root = null;
    this.svg = null;
    this.gLink = null;
    this.gNode = null;
    this.zoomBehavior = null;
    this.duration = 300;
    this.nodeWidth = 120;
    this.nodeHeight = 50;
    this.deptColors = {
      "Engineering":  "#6366f1",
      "Product":      "#8b5cf6",
      "Design":       "#ec4899",
      "Sales":        "#10b981",
      "Marketing":    "#f59e0b",
      "HR":           "#ef4444",
      "Operations":   "#64748b"
    };
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source') || 'org_corporate.json';
    await this.load(source);
  }

  async load(fileName) {
    try {
      const data = await Utils.fetchData(`../data/${fileName}`);
      this.rawData = data;
      this.render();
      this.bindSearch();
      const bc = document.getElementById('org-breadcrumbs');
      if (bc) bc.innerHTML = 'Click a node to expand / collapse its children';
    } catch (err) {
      console.error('Error loading org data:', err);
    }
  }

  /** Convert flat {role: {manages, description, department}} → D3 hierarchy */
  buildHierarchy(data) {
    const visited = new Set();
    const parentCount = {};
    Object.values(data).forEach(v => (v.manages || []).forEach(c => {
      parentCount[c] = (parentCount[c] || 0) + 1;
    }));

    const allManaged = new Set(Object.values(data).flatMap(v => v.manages || []));
    const roots = Object.keys(data).filter(k => !allManaged.has(k));

    const build = (name) => {
      if (visited.has(name)) {
        // Multi-parent alias — leaf only
        return { name, alias: true, dept: (data[name] || {}).department || 'Operations', description: '↗ Shared — see primary location' };
      }
      visited.add(name);
      const node = data[name] || {};
      const children = (node.manages || []).map(build).filter(Boolean);
      return {
        name,
        dept: node.department || 'Operations',
        description: node.description || '',
        isMultiParent: (parentCount[name] || 0) > 1,
        children: children.length ? children : null
      };
    };

    // Single virtual root if multiple tops, otherwise just the one
    if (roots.length === 1) return build(roots[0]);
    return { name: 'Organisation', dept: 'Operations', description: '', children: roots.map(build) };
  }

  render() {
    const container = document.getElementById('chart_div');
    container.innerHTML = '';

    const W = container.clientWidth  || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    // SVG setup
    this.svg = d3.select('#chart_div').append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .style('font-family', 'inherit');

    const g = this.svg.append('g').attr('class', 'tree-root');
    this.gLink = g.append('g').attr('class', 'links');
    this.gNode = g.append('g').attr('class', 'nodes');

    // Zoom & pan
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.05, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    this.svg.call(this.zoomBehavior);

    // Build hierarchy
    const hierarchyData = this.buildHierarchy(this.rawData);
    this.root = d3.hierarchy(hierarchyData);

    // Collapse all beyond depth 1 by default
    this.root.each(d => {
      if (d.depth > 1 && d.children) {
        d._children = d.children;
        d.children = null;
      }
    });

    this.update(this.root);

    // Initial pan to center root on left
    const initX = 80, initY = H / 2;
    this.svg.call(this.zoomBehavior.transform, d3.zoomIdentity.translate(initX, initY));
  }

  update(source) {
    const treeLayout = d3.tree()
      .nodeSize([this.nodeHeight + 16, this.nodeWidth + 40])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.4));

    treeLayout(this.root);

    const nodes = this.root.descendants();
    const links = this.root.links();

    // ─── Links ────────────────────────────────────────────────────────────────
    const link = this.gLink.selectAll('path.link').data(links, d => d.target.data.name + d.source.data.name);

    const linkEnter = link.enter().append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(100,116,139,0.4)')
      .attr('stroke-width', 1.5)
      .attr('d', () => this.diagonal({ x: source.x0 || source.x, y: source.y0 || source.y },
                                      { x: source.x0 || source.x, y: source.y0 || source.y }));

    link.merge(linkEnter).transition().duration(this.duration)
      .attr('d', d => this.diagonal(d.source, d.target));

    link.exit().transition().duration(this.duration)
      .attr('d', () => this.diagonal(source, source))
      .remove();

    // ─── Nodes ────────────────────────────────────────────────────────────────
    const node = this.gNode.selectAll('g.node').data(nodes, d => d.data.name);

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.y0 || source.y},${source.x0 || source.x})`)
      .style('cursor', d => (d.children || d._children) ? 'pointer' : 'default')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.toggle(d);
        this.update(d);
        this.updateBreadcrumbs(d);
      });

    // Node card background
    nodeEnter.append('rect')
      .attr('x', 0)
      .attr('y', -this.nodeHeight / 2)
      .attr('width', this.nodeWidth)
      .attr('height', this.nodeHeight)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', d => this.getNodeFill(d))
      .attr('stroke', d => this.deptColors[d.data.dept] || '#64748b')
      .attr('stroke-width', d => d.data.alias ? 0.8 : 1.5)
      .attr('stroke-dasharray', d => d.data.alias ? '4,3' : 'none')
      .attr('opacity', d => d.data.alias ? 0.6 : 1)
      .append('title').text(d => d.data.description || d.data.name);

    // Left accent bar
    nodeEnter.append('rect')
      .attr('x', 0)
      .attr('y', -this.nodeHeight / 2)
      .attr('width', 4)
      .attr('height', this.nodeHeight)
      .attr('rx', 10)
      .attr('fill', d => this.deptColors[d.data.dept] || '#64748b')
      .attr('opacity', d => d.data.alias ? 0.5 : 1);

    // Role name text
    nodeEnter.append('text')
      .attr('x', 12)
      .attr('y', d => d.data.dept ? -4 : 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('font-size', '0.65rem')
      .attr('font-weight', '600')
      .attr('fill', 'var(--tx)')
      .attr('dominant-baseline', 'middle')
      .each(function(d) {
        const words = d.data.name.split(' ');
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        if (line2) {
          d3.select(this).append('tspan').attr('x', 12).attr('dy', '-0.6em').text(line1);
          d3.select(this).append('tspan').attr('x', 12).attr('dy', '1.1em').text(line2);
        } else {
          d3.select(this).append('tspan').attr('x', 12).attr('dy', '0').text(line1);
        }
      });

    // Department label
    nodeEnter.append('text')
      .attr('x', 12)
      .attr('y', this.nodeHeight / 2 - 9)
      .attr('font-size', '0.55rem')
      .attr('fill', d => this.deptColors[d.data.dept] || '#64748b')
      .attr('opacity', 0.9)
      .text(d => d.data.alias ? '↗ Shared' : d.data.dept || '');

    // Expand/collapse indicator dot
    nodeEnter.append('circle')
      .attr('cx', this.nodeWidth)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', d => (d._children ? 'var(--p, #6366f1)' : 'transparent'))
      .attr('stroke', d => (d._children || d.children) ? (this.deptColors[d.data.dept] || '#64748b') : 'none')
      .attr('stroke-width', 1.5);

    // Merge + transition
    const nodeMerge = node.merge(nodeEnter);
    nodeMerge.transition().duration(this.duration)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Update collapse indicator
    nodeMerge.select('circle')
      .attr('fill', d => d._children ? (this.deptColors[d.data.dept] || 'var(--p)') : 'transparent')
      .attr('stroke', d => (d._children || d.children) ? (this.deptColors[d.data.dept] || '#64748b') : 'none');

    node.exit().transition().duration(this.duration)
      .attr('transform', () => `translate(${source.y},${source.x})`)
      .remove();

    // Store positions for transitions
    nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });
  }

  /** Curved horizontal connector */
  diagonal(s, t) {
    return `M${s.y + this.nodeWidth},${s.x}
            C${(s.y + this.nodeWidth + t.y) / 2},${s.x}
             ${(s.y + this.nodeWidth + t.y) / 2},${t.x}
             ${t.y},${t.x}`;
  }

  /** Toggle a node's children */
  toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }

  getNodeFill(d) {
    return d.data.alias ? 'rgba(100,116,139,0.08)' : 'var(--glass, rgba(255,255,255,0.05))';
  }

  /** Search: find by name, highlight & pan to */
  search(query) {
    if (!query || !this.root) return;
    const q = query.toLowerCase();
    let found = null;

    // Traverse both visible and collapsed children to find the node
    const searchNode = (node) => {
      if (found) return;
      if (node.data.name.toLowerCase().includes(q)) {
        found = node;
        return;
      }
      if (node.children) node.children.forEach(searchNode);
      if (node._children) node._children.forEach(searchNode);
    };
    
    searchNode(this.root);

    if (!found) return;

    // Expand all ancestors
    let anc = found;
    while (anc.parent) {
      if (!anc.parent.children) {
        anc.parent.children = anc.parent._children;
        anc.parent._children = null;
      }
      anc = anc.parent;
    }
    this.update(this.root);
    this.updateBreadcrumbs(found);

    // Pan to the found node and highlight it
    setTimeout(() => {
      const W = this.svg.node().clientWidth;
      const H = this.svg.node().clientHeight;
      const S = 1.3; // Zoom in to scale 1.3 when focusing
      // Calculate exact center accounting for the target scale
      const tx = W / 2 - (found.y + this.nodeWidth / 2) * S;
      const ty = H / 2 - found.x * S;
      
      this.svg.transition().duration(600).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(tx, ty).scale(S)
      );

      // Highlight the found node
      this.gNode.selectAll('g.node').filter(d => d === found)
        .select('rect')
        .transition().duration(300)
        .style('stroke', 'var(--p)')
        .style('stroke-width', '3px')
        .style('filter', 'drop-shadow(0 0 10px var(--p))')
        .transition().duration(2000).delay(1500)
        .style('stroke', d => this.deptColors[d.data.dept] || '#64748b')
        .style('stroke-width', d => d.data.alias ? 0.8 : 1.5)
        .style('filter', 'none');

    }, this.duration + 50);
  }

  /**
   * Bind input for search suggestions
   */
  bindSearch() {
    const input = document.getElementById('org-search-input');
    const box = document.getElementById('org-search-suggestions');
    if (!input || !box || !this.rawData) return;

    // Use rawData to ensure we get ALL nodes, even those currently collapsed
    const allNames = Object.keys(this.rawData).sort();

    input.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      box.innerHTML = '';
      if (!val) {
        box.style.display = 'none';
        return;
      }

      const matches = allNames.filter(n => n.toLowerCase().includes(val)).slice(0, 10);
      
      if (matches.length > 0) {
        matches.forEach(name => {
          const li = document.createElement('li');
          li.className = 'dropdown-item';
          // Highlight match
          const rx = new RegExp(`(${val})`, "gi");
          li.innerHTML = name.replace(rx, "<strong>$1</strong>");
          
          li.onclick = () => {
            input.value = name;
            box.style.display = 'none';
            this.search(name);
          };
          box.appendChild(li);
        });
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        box.style.display = 'none';
      }
    });
  }

  updateBreadcrumbs(d) {
    const path = [];
    let n = d;
    while (n) { path.unshift(n.data.name); n = n.parent; }
    const bc = document.getElementById('org-breadcrumbs');
    if (bc) bc.innerHTML = path.map(p => `<span>${p}</span>`).join(' <i class="bi bi-chevron-right mx-1 small opacity-50"></i> ');
  }

  export() { window.print(); }

  // ── Public zoom helpers (called from HTML buttons) ─────────────────────────
  zoomIn()  { this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 1.3); }
  zoomOut() { this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 0.77); }
  resetZoom() {
    const W = this.svg.node().clientWidth;
    const H = this.svg.node().clientHeight;
    this.svg.transition().duration(400).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity.translate(80, H / 2)
    );
  }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
const orgChart = new OrgChartApp();

// Load D3 dynamically then init
(function loadD3() {
  if (window.d3) { orgChart.init(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
  s.onload = () => orgChart.init();
  document.head.appendChild(s);
})();

// Global wrappers
window.searchOrg     = q  => orgChart.search(q);
window.exportOrgChart = () => orgChart.export();
window.orgChart      = orgChart;
// Remap old button handlers to D3 equivalents
window.adjustZoom    = f  => f > 1 ? orgChart.zoomIn() : orgChart.zoomOut();
window.resetView     = () => orgChart.resetZoom();
