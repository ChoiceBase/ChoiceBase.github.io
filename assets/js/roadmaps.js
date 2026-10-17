/**
 * ChoiceBase Interactive Roadmaps Engine
 * Provides dual-view: Catalog Grid & Deep-Dive Stage-by-Stage Progression with Persistent Checklists
 */

class RoadmapsApp {
  constructor() {
    this.allRoadmaps = [];
    this.activeRoadmap = null;
    this.activeDomain = 'all';
    this.searchQuery = '';
    this.init();
  }

  async init() {
    try {
      const isLocal = window.location.protocol === 'file:';
      const jsonUrl = isLocal ? '../data/roadmaps.json' : '/data/roadmaps.json';
      const res = await fetch(jsonUrl);
      if (!res.ok) throw new Error('Failed to load roadmaps data');
      const data = await res.json();
      this.allRoadmaps = data.roadmaps || [];

      this.setupEventListeners();
      this.handleUrlRouting();
    } catch (err) {
      console.error('Error initializing roadmaps:', err);
      const container = document.getElementById('roadmaps-grid');
      if (container) {
        container.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-exclamation-triangle display-4 text-warning mb-3 d-block"></i>
            <h5>Unable to load roadmaps data.</h5>
            <p>Please refresh the page or check your connection.</p>
          </div>
        `;
      }
    }
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('roadmap-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderCatalog();
      });
    }

    // Filter pills
    document.querySelectorAll('.roadmap-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.roadmap-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeDomain = e.currentTarget.getAttribute('data-domain') || 'all';
        this.renderCatalog();
      });
    });

    // Popstate handling for browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleUrlRouting(false);
    });
  }

  handleUrlRouting(pushState = true) {
    const params = new URLSearchParams(window.location.search);
    const roadmapId = params.get('roadmap');
    const searchParam = params.get('search');
    const domainParam = params.get('domain');

    if (searchParam) {
      this.searchQuery = searchParam.toLowerCase();
      const searchInput = document.getElementById('roadmap-search-input');
      if (searchInput) searchInput.value = searchParam;
    }

    if (domainParam) {
      this.activeDomain = domainParam;
      document.querySelectorAll('.roadmap-filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-domain') === domainParam);
      });
    }

    if (roadmapId) {
      const match = this.allRoadmaps.find(r => r.id === roadmapId);
      if (match) {
        this.openRoadmapDeepDive(match, pushState);
        return;
      }
    }

    this.showCatalogView(pushState);
  }

  renderCatalog() {
    const grid = document.getElementById('roadmaps-grid');
    const countBadge = document.getElementById('roadmaps-total-count');
    if (!grid) return;

    let filtered = this.allRoadmaps;

    // Filter by Domain
    if (this.activeDomain !== 'all') {
      filtered = filtered.filter(r => r.domain === this.activeDomain);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      filtered = filtered.filter(r => {
        const inTitle = r.title.toLowerCase().includes(this.searchQuery);
        const inDesc = r.description.toLowerCase().includes(this.searchQuery);
        const inStages = r.stages && r.stages.some(s => 
          s.title.toLowerCase().includes(this.searchQuery) ||
          (s.topics && s.topics.some(t => t.toLowerCase().includes(this.searchQuery))) ||
          (s.tools && s.tools.some(t => t.toLowerCase().includes(this.searchQuery)))
        );
        return inTitle || inDesc || inStages;
      });
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Roadmaps`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="empty-state-box p-5 rounded-4 border border-dashed">
            <i class="bi bi-search display-5 text-muted mb-3 d-block"></i>
            <h4>No roadmaps match your search</h4>
            <p class="text-muted">Try adjusting your keywords or clearing the category filter.</p>
            <button class="btn btn-outline-primary btn-sm rounded-pill mt-2" onclick="window.roadmapsApp.clearFilters()">Clear Filters</button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(r => {
      const stageCount = r.stages ? r.stages.length : 0;
      const progress = this.getRoadmapProgress(r.id, r);

      const domainNames = {
        software: 'Software IT',
        electronics: 'Electronics & VLSI',
        marketing: 'Marketing & Growth',
        medical: 'Medical & Clinical',
        construction: 'Construction & VDC',
        manufacturing: 'Smart Manufacturing'
      };

      const domainLabel = domainNames[r.domain] || r.domain;

      // Extract a few preview tools from stages
      let previewTools = [];
      if (r.stages) {
        r.stages.forEach(s => {
          if (s.tools) previewTools.push(...s.tools);
        });
      }
      previewTools = [...new Set(previewTools)].slice(0, 4);

      return `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="roadmap-card h-100" onclick="window.roadmapsApp.openRoadmapDeepDiveById('${r.id}')">
            <div class="roadmap-card-header d-flex justify-content-between align-items-start">
              <div class="roadmap-icon-box">
                <i class="bi ${r.icon || 'bi-map'}"></i>
              </div>
              <span class="badge roadmap-domain-badge">${domainLabel}</span>
            </div>

            <div class="roadmap-card-body">
              <h3 class="roadmap-title">${r.title}</h3>
              <p class="roadmap-desc">${r.description}</p>

              <div class="roadmap-meta-row">
                <span><i class="bi bi-bar-chart-steps me-1"></i>${r.level || 'All Levels'}</span>
                <span><i class="bi bi-clock me-1"></i>${r.duration || '6-9 Mos'}</span>
              </div>

              ${r.salary ? `<div class="roadmap-salary"><i class="bi bi-cash-stack me-1 text-success"></i>${r.salary}</div>` : ''}

              <div class="roadmap-tools-preview mt-3">
                ${previewTools.map(t => `<span class="tool-chip">${t}</span>`).join('')}
              </div>
            </div>

            <div class="roadmap-card-footer mt-auto pt-3 border-top">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted"><i class="bi bi-layers me-1"></i>${stageCount} Sequential Stages</small>
                <small class="fw-bold ${progress.percent === 100 ? 'text-success' : 'text-primary'}">${progress.percent}% Completed</small>
              </div>
              <div class="progress roadmap-mini-progress" style="height: 6px;">
                <div class="progress-bar ${progress.percent === 100 ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${progress.percent}%"></div>
              </div>
              <div class="d-flex justify-content-end align-items-center mt-3 text-primary fw-semibold small">
                <span>Start Roadmap</span>
                <i class="bi bi-arrow-right ms-2"></i>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  clearFilters() {
    this.searchQuery = '';
    this.activeDomain = 'all';
    const input = document.getElementById('roadmap-search-input');
    if (input) input.value = '';
    document.querySelectorAll('.roadmap-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-domain') === 'all');
    });
    this.renderCatalog();
  }

  showCatalogView(pushState = true) {
    this.activeRoadmap = null;
    document.getElementById('roadmap-catalog-section').style.display = 'block';
    document.getElementById('roadmap-detail-section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pushState) {
      const url = new URL(window.location);
      url.searchParams.delete('roadmap');
      window.history.pushState({}, '', url);
    }

    this.renderCatalog();
  }

  openRoadmapDeepDiveById(id) {
    const roadmap = this.allRoadmaps.find(r => r.id === id);
    if (roadmap) this.openRoadmapDeepDive(roadmap, true);
  }

  openRoadmapDeepDive(roadmap, pushState = true) {
    this.activeRoadmap = roadmap;

    if (pushState) {
      const url = new URL(window.location);
      url.searchParams.set('roadmap', roadmap.id);
      window.history.pushState({ roadmap: roadmap.id }, '', url);
    }

    document.getElementById('roadmap-catalog-section').style.display = 'none';
    const detailSection = document.getElementById('roadmap-detail-section');
    detailSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.renderRoadmapDeepDive(roadmap);
  }

  getStorageKey(roadmapId) {
    return `choicebase_roadmap_progress_${roadmapId}`;
  }

  getRoadmapProgress(roadmapId, roadmap) {
    try {
      const stored = localStorage.getItem(this.getStorageKey(roadmapId));
      const checkedTopics = stored ? JSON.parse(stored) : [];
      let totalTopics = 0;
      if (roadmap.stages) {
        roadmap.stages.forEach(s => {
          if (s.topics) totalTopics += s.topics.length;
        });
      }
      const completedCount = checkedTopics.length;
      const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
      return { completedCount, totalTopics, percent, checkedTopics };
    } catch {
      return { completedCount: 0, totalTopics: 0, percent: 0, checkedTopics: [] };
    }
  }

  toggleTopic(roadmapId, topicKey) {
    try {
      const key = this.getStorageKey(roadmapId);
      const stored = localStorage.getItem(key);
      let checked = stored ? JSON.parse(stored) : [];
      if (checked.includes(topicKey)) {
        checked = checked.filter(t => t !== topicKey);
      } else {
        checked.push(topicKey);
      }
      localStorage.setItem(key, JSON.stringify(checked));
      this.updateProgressBar(roadmapId);
    } catch (err) {
      console.error('Error toggling topic progress:', err);
    }
  }

  resetProgress(roadmapId) {
    if (confirm('Are you sure you want to reset your checklist progress for this roadmap?')) {
      localStorage.removeItem(this.getStorageKey(roadmapId));
      this.renderRoadmapDeepDive(this.activeRoadmap);
    }
  }

  updateProgressBar(roadmapId) {
    if (!this.activeRoadmap) return;
    const progress = this.getRoadmapProgress(roadmapId, this.activeRoadmap);
    const bar = document.getElementById('detail-progress-bar');
    const label = document.getElementById('detail-progress-label');
    const count = document.getElementById('detail-progress-count');

    if (bar) bar.style.width = `${progress.percent}%`;
    if (label) label.textContent = `${progress.percent}% Completed`;
    if (count) count.textContent = `${progress.completedCount} of ${progress.totalTopics} checkpoints achieved`;
  }

  renderRoadmapDeepDive(r) {
    const container = document.getElementById('roadmap-detail-container');
    if (!container) return;

    const progress = this.getRoadmapProgress(r.id, r);

    const domainLinks = {
      software: 'software',
      electronics: 'electronics',
      marketing: 'marketing',
      medical: 'medical',
      construction: 'construction',
      manufacturing: 'manufacturing'
    };
    const nexusTarget = domainLinks[r.nexusDomain || r.domain] || 'software';

    const prereqsHTML = (r.prerequisites && r.prerequisites.length > 0)
      ? `<div class="roadmap-callout prereqs-callout mb-4">
          <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
            <i class="bi bi-info-circle-fill"></i>
            <span>Prerequisites & Foundational Knowledge</span>
          </div>
          <ul class="mb-0 ps-3">
            ${r.prerequisites.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>`
      : '';

    const certsHTML = (r.certifications && r.certifications.length > 0)
      ? `<div class="roadmap-callout certs-callout mb-4">
          <div class="d-flex align-items-center gap-2 mb-2 text-warning fw-bold">
            <i class="bi bi-award-fill"></i>
            <span>Recommended Industry Certifications</span>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-2">
            ${r.certifications.map(c => `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-2 px-3">${c}</span>`).join('')}
          </div>
        </div>`
      : '';

    const stagesHTML = (r.stages || []).map((stage, sIdx) => {
      const stageTopics = stage.topics || [];
      const topicsListHTML = stageTopics.map((topic, tIdx) => {
        const topicKey = `s${stage.number || sIdx + 1}_t${tIdx}_${topic.slice(0, 20)}`;
        const isChecked = progress.checkedTopics.includes(topicKey);

        return `
          <div class="stage-topic-item d-flex align-items-start gap-3 py-2 border-bottom border-light-subtle">
            <div class="form-check mt-1">
              <input class="form-check-input topic-checkbox" type="checkbox" id="${topicKey}" ${isChecked ? 'checked' : ''} onchange="window.roadmapsApp.toggleTopic('${r.id}', '${topicKey}')">
            </div>
            <label class="form-check-label flex-grow-1 ${isChecked ? 'text-decoration-line-through text-muted' : ''}" for="${topicKey}">
              ${topic}
            </label>
          </div>
        `;
      }).join('');

      const stageTools = (stage.tools || []).map(t => `<span class="badge bg-secondary bg-opacity-25 text-body me-1 mb-1">${t}</span>`).join('');

      const projectHTML = stage.project
        ? `<div class="stage-project-box mt-3 p-3 rounded-3">
            <div class="d-flex align-items-center gap-2 fw-bold text-success mb-1 small text-uppercase">
              <i class="bi bi-rocket-takeoff-fill"></i> Hands-on Capstone Project
            </div>
            <p class="mb-0 small">${stage.project}</p>
          </div>`
        : '';

      const resourcesHTML = (stage.resources && stage.resources.length > 0)
        ? `<div class="stage-resources-box mt-3">
            <span class="small fw-bold text-muted text-uppercase d-block mb-2">Curated Free Resources & Guides:</span>
            <div class="d-flex flex-wrap gap-2">
              ${stage.resources.map(res => `
                <a href="${res.url}" target="_blank" class="resource-pill-link">
                  <i class="bi bi-box-arrow-up-right me-1 small"></i>${res.name}
                </a>
              `).join('')}
            </div>
          </div>`
        : '';

      return `
        <div class="roadmap-stage-card mb-4" id="stage-${stage.number}">
          <div class="stage-card-header d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 p-md-4">
            <div>
              <span class="badge bg-primary bg-opacity-25 text-primary fw-bold text-uppercase me-2 mb-1">Stage ${stage.number}</span>
              <span class="badge bg-secondary bg-opacity-25 text-muted mb-1"><i class="bi bi-clock me-1"></i>${stage.duration || '4-6 Weeks'}</span>
              <h4 class="fw-bold mb-1 mt-2">${stage.title}</h4>
            </div>
          </div>

          <div class="stage-card-body p-3 p-md-4 pt-0">
            <p class="stage-summary text-muted mb-3">${stage.summary || ''}</p>

            ${stageTools ? `<div class="mb-3"><span class="small fw-bold text-muted text-uppercase d-block mb-1">Key Tools & Frameworks:</span>${stageTools}</div>` : ''}

            <div class="stage-topics-wrapper mt-3">
              <span class="small fw-bold text-muted text-uppercase d-block mb-2">Essential Mastery Checkpoints:</span>
              <div class="stage-topics-list bg-body-tertiary p-3 rounded-3 border">
                ${topicsListHTML}
              </div>
            </div>

            ${projectHTML}
            ${resourcesHTML}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Back Navigation Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2" onclick="window.roadmapsApp.showCatalogView()">
          <i class="bi bi-arrow-left"></i>
          <span>Back to All Roadmaps</span>
        </button>

        <div class="d-flex align-items-center gap-2">
          <a href="/html/career_nexus.html#${nexusTarget}" class="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2">
            <i class="bi bi-diagram-3-fill"></i>
            <span>View in Career Nexus Graph</span>
          </a>
          <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="window.roadmapsApp.resetProgress('${r.id}')" title="Reset all checkboxes">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Progress
          </button>
        </div>
      </div>

      <!-- Roadmap Header Hero -->
      <div class="roadmap-detail-hero p-4 p-md-5 rounded-4 mb-4 border shadow-sm">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-primary px-3 py-2 rounded-pill text-uppercase">${r.domain}</span>
              <span class="badge bg-secondary bg-opacity-50 px-3 py-2 rounded-pill">${r.level}</span>
            </div>
            <h1 class="display-5 fw-bold mb-3">${r.title}</h1>
            <p class="lead text-muted mb-4">${r.description}</p>

            <div class="d-flex flex-wrap gap-4 text-muted small">
              <div><i class="bi bi-clock me-1 text-primary"></i> <b>Estimated Duration:</b> ${r.duration}</div>
              ${r.salary ? `<div><i class="bi bi-cash-stack me-1 text-success"></i> <b>Salary Range:</b> ${r.salary}</div>` : ''}
              <div><i class="bi bi-layers me-1 text-primary"></i> <b>Total Stages:</b> ${r.stages.length}</div>
            </div>
          </div>

          <!-- Overall Progress Card -->
          <div class="col-lg-4 mt-4 mt-lg-0">
            <div class="card border-primary border-opacity-25 bg-body-tertiary shadow-sm rounded-4 p-4 text-center">
              <span class="text-uppercase small fw-bold text-muted mb-1">Your Learning Progress</span>
              <h2 class="display-6 fw-bold text-primary mb-2" id="detail-progress-label">${progress.percent}% Completed</h2>
              <div class="progress mb-3" style="height: 10px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" id="detail-progress-bar" style="width: ${progress.percent}%"></div>
              </div>
              <p class="small text-muted mb-0" id="detail-progress-count">${progress.completedCount} of ${progress.totalTopics} checkpoints achieved</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Prerequisites & Certifications Callouts -->
      <div class="row">
        <div class="col-md-6">${prereqsHTML}</div>
        <div class="col-md-6">${certsHTML}</div>
      </div>

      <!-- Stages Timeline -->
      <div class="roadmap-stages-container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold mb-0"><i class="bi bi-signpost-split me-2 text-primary"></i>Sequential Learning Path</h3>
          <span class="small text-muted">Check off topics as you learn</span>
        </div>
        ${stagesHTML}
      </div>

      <!-- Bottom Navigation Footer -->
      <div class="mt-5 pt-4 text-center border-top">
        <h4 class="fw-bold mb-2">Ready to explore connected roles?</h4>
        <p class="text-muted mb-3">See how this role connects to others across industries in the Career Nexus 3D knowledge map.</p>
        <div class="d-flex justify-content-center gap-3">
          <a href="/html/career_nexus.html#${nexusTarget}" class="btn btn-primary px-4 py-2 rounded-pill fw-bold">
            <i class="bi bi-diagram-3-fill me-2"></i>Explore Career Nexus Graph
          </a>
          <button class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" onclick="window.roadmapsApp.showCatalogView()">
            <i class="bi bi-grid-fill me-2"></i>Browse More Roadmaps
          </button>
        </div>
      </div>
    `;
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.roadmapsApp = new RoadmapsApp();
});
