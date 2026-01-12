// --- D3 Force Network Visualization: Multi-Domain, Reusable ---
// Assumes: 
// - <svg></svg> in HTML
// - <select id="domain-select"> dropdown with values matching domainToJson keys
// - <input id="node-search">, <button id="search-btn">, <button id="reset-btn">
// - <div id="details"></div>, <div id="node-popup"></div>

const domainToJson = {
  construction: '../data/roles_construction.json',
  electronics: '../data/roles_electronics.json',
  software: '../data/roles_it.json',
  manufacturing: '../data/roles_manufacturing.json',
  marketing: '../data/roles_marketing.json',
  medical: '../data/roles_medical.json'
  // Add more as needed
};

// Helper: Get domain from hash
function getDomainFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (domainToJson[hash]) return hash;
  // Default domain if hash is missing or invalid
  return 'software';
}

// On page load and on hash change, render the correct domain
function renderFromHash() {
  const domain = getDomainFromHash();
  renderGraph(domainToJson[domain]);
  // Optional: scroll to the section if you want
  const section = document.getElementById(domain);
  if (section) section.scrollIntoView({ behavior: "smooth" });
}
// Listen for hash changes (if user clicks another dropdown item)
window.addEventListener('hashchange', renderFromHash);

// Initial render on page load
renderFromHash();

// // On page load, render default domain
// renderGraph(domainToJson.software);

// // On dropdown change, render selected domain
// document.getElementById('domain-select').addEventListener('change', function() {
//   renderGraph(domainToJson[this.value]);
// });

// Hide popup when clicking elsewhere (only one handler, global)
document.addEventListener('click', function (e) {
  const popup = document.getElementById('node-popup');
  if (
    popup && popup.style.display === "block" &&
    !e.target.closest('.node') &&
    !e.target.closest('#node-popup')
  ) {
    popup.classList.remove('show');
    setTimeout(() => popup.style.display = "none", 250);
  }
});

// --- Main Render Function ---
function renderGraph(jsonUrl) {
  // Clear previous SVG content, details, popup
  d3.select("svg").selectAll("*").remove();
  document.getElementById('details').innerHTML = '';
  document.getElementById('node-popup').style.display = "none";

  fetch(jsonUrl)
    .then(response => response.json())
    .then(json => {
      // Node sizing and color based on related/included count
      const nodes = json.roles.map(role => {
        const baseCount =
          (role.tools ? role.tools.length : 0) +
          (role.languages ? role.languages.length : 0) +
          (role.skills ? role.skills.length : 0);
        const includesCount = (role.includes ? role.includes.length : 0);
        const nodeSize = baseCount * (includesCount > 0 ? includesCount : 1);
        const relatedCount = (role.related ? role.related.length : 0);
        return {
          id: role.name,
          ...role,
          nodeSize,
          relatedCount
        };
      });

      // Color scales
      const includesCounts = nodes.map(n => n.includes ? n.includes.length : 0);
      const minInc = Math.min(...includesCounts);
      const maxInc = Math.max(...includesCounts, 1);
      const includesColorScale = d3.scaleLinear()
        .domain([minInc, maxInc])
        .range(["#ffebee", "#b71c1c"]); // light red to dark red

      const relatedCounts = nodes.map(n => n.related ? n.related.length : 0);
      const minRel = Math.min(...relatedCounts);
      const maxRel = Math.max(...relatedCounts, 1);
      const relatedColorScale = d3.scaleLinear()
        .domain([minRel, maxRel])
        .range(["#b9f6ca", "#1b5e20"]); // light green to dark green

      const defaultBlue = "#1976d2";

      // Build links (related)
      const links = [];
      json.roles.forEach(role => {
        if (role.related) {
          role.related.forEach(rel => {
            if (json.roles.find(r => r.name === rel)) {
              links.push({ source: role.name, target: rel, type: "related" });
            }
          });
        }
      });

      // Node size scale
      const sizes = nodes.map(n => n.nodeSize);
      const minSize = Math.min(...sizes), maxSize = Math.max(...sizes);
      const minRadius = 30, maxRadius = 60;
      const sizeScale = d3.scaleLinear().domain([minSize, maxSize]).range([minRadius, maxRadius]);

      // Responsive SVG setup
      const svg = d3.select("svg");
      let width = svg.node().clientWidth || 900;
      let height = svg.node().clientHeight || 600;
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      // Add a <g> group for zoom/pan
      const container = svg.append("g");

      // D3 zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.3, 5])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        });

      svg.call(zoom);

      // Function to zoom to a specific node
      function zoomToNode(d) {
        const scale = 1.5;
        const x = -d.x * scale + width / 2;
        const y = -d.y * scale + height / 2;

        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
      }

      // Draw links (brown)
      const link = container.append("g")
        .attr("stroke-opacity", 0.7)
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#795548")
        .attr("stroke-width", 3);

      // Draw nodes
      const node = container.append("g")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("click", function (event, d) {
          event.stopPropagation();
          showPopup(d, event);
          zoomToNode(d);
        })
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        );

      node.append("circle")
        .attr("r", d => sizeScale(d.nodeSize))
        .attr("fill", d => {
          const inc = (d.includes && d.includes.length) ? d.includes.length : 0;
          const rel = (d.related && d.related.length) ? d.related.length : 0;
          if (inc > 0) {
            return includesColorScale(inc);
          } else if (rel > 0) {
            return relatedColorScale(rel);
          } else {
            return defaultBlue;
          }
        });

      // TEXT WRAP HELPER
      function wrapText(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y") || 0,
            dy = parseFloat(text.attr("dy")) || 0,
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 0).attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            }
          }
        });
      }

      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 0)
        .style("font-size", d => `${sizeScale(d.nodeSize) / 3}px`)
        .text(d => d.id)
        .each(function (d) {
          wrapText(d3.select(this), sizeScale(d.nodeSize) * 1.5);
        });

      // Force simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(220))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

      function ticked() {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);

        // Cluster included nodes near their parent
        nodes.forEach(parent => {
          if (parent.includes) {
            parent.includes.forEach(childName => {
              const child = nodes.find(n => n.id === childName);
              if (child) {
                child.x += (parent.x - child.x) * 0.005;
                child.y += (parent.y - child.y) * 0.005;
              }
            });
          }
        });
      }

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      function showPopup(d, event) {
        const popup = document.getElementById('node-popup');
        popup.innerHTML = `
          <h3 style="margin-top:0;">${d.name}</h3>
          <div><strong>Description:</strong> ${d.description || ''}</div>
          ${d.includes ? `<div><strong>Includes:</strong> ${d.includes.join(', ')}</div>` : ''}
          ${d.related ? `<div><strong>Related:</strong> ${d.related.join(', ')}</div>` : ''}
          ${d.tools ? `<div><strong>Tools:</strong> ${d.tools.join(', ')}</div>` : ''}
          ${Array.isArray(d.languages) && d.languages.length > 0 ? `<div><strong>Languages:</strong> ${d.languages.join(', ')}</div>` : ''}
          ${d.skills ? `<div><strong>Skills:</strong> ${d.skills.join(', ')}</div>` : ''}
        `;
        const [x, y] = d3.pointer(event, document.body);
        popup.style.left = (x + 20) + "px";
        popup.style.top = (y - 10) + "px";
        popup.style.display = "block";
        setTimeout(() => popup.classList.add('show'), 10);
      }

      // ---- SEARCH FUNCTIONALITY ----
      function highlightAndFilterNodes(searchTerm) {
        d3.selectAll(".node circle").classed("highlight", false);
        d3.selectAll(".node").style("display", null);
        d3.selectAll(".link").style("display", null);

        if (!searchTerm) return;

        const term = searchTerm.trim().toLowerCase();
        d3.selectAll(".node")
          .each(function (d) {
            const inId = d.id && d.id.toLowerCase().includes(term);
            const inSkills = d.skills && d.skills.join(' ').toLowerCase().includes(term);
            const inLangs = d.languages && d.languages.join(' ').toLowerCase().includes(term);
            const inTools = d.tools && d.tools.join(' ').toLowerCase().includes(term);
            if (inId || inSkills || inLangs || inTools) {
              d3.select(this).select("circle").classed("highlight", true);
              d3.select(this).style("display", null);
            } else {
              d3.select(this).style("display", "none");
            }
          });

        d3.selectAll(".link")
          .each(function (d) {
            const srcVisible = d3.selectAll(".node").filter(nd => nd.id === d.source.id).style("display") !== "none";
            const tgtVisible = d3.selectAll(".node").filter(nd => nd.id === d.target.id).style("display") !== "none";
            d3.select(this).style("display", (srcVisible && tgtVisible) ? null : "none");
          });
      }

      // Attach search/reset handlers (remove old first)
      document.getElementById('search-btn').onclick = function () {
        const val = document.getElementById('node-search').value;
        highlightAndFilterNodes(val);
      };
      document.getElementById('node-search').onkeydown = function (e) {
        if (e.key === 'Enter') {
          highlightAndFilterNodes(this.value);
        }
      };
      document.getElementById('reset-btn').onclick = function () {
        document.getElementById('node-search').value = '';
        highlightAndFilterNodes('');
      };

      // Responsive resize: update SVG and simulation center
      window.addEventListener('resize', () => {
        width = svg.node().clientWidth || 900;
        height = svg.node().clientHeight || 600;
        svg.attr("viewBox", `0 0 ${width} ${height}`);
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.5).restart();
      });
    });
}
