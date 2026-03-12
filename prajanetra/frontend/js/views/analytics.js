/* ============================================
   PrajaNetra AI - Civic Intelligence Analytics View
   ============================================ */

const AnalyticsView = (() => {
  let charts = {};
  let map = null;

  function render() {
    const stats = Store.getStats();
    const complaints = Store.getComplaints();
    const insights = AIEngine.generateInsights(complaints);

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-chart-line"></i> Civic Intelligence Analytics</h2>
            <p class="page-subtitle">Data-driven governance insights, heatmaps, and predictive intelligence</p>
          </div>
        </div>

        <!-- Summary KPIs -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-database"></i></div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Complaints</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon emerald"><i class="fa-solid fa-chart-pie"></i></div>
            <div class="stat-value">${stats.resolutionRate}%</div>
            <div class="stat-label">Resolution Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan"><i class="fa-solid fa-stopwatch"></i></div>
            <div class="stat-value">${stats.avgResolutionHours}h</div>
            <div class="stat-label">Avg Response</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-fire"></i></div>
            <div class="stat-value">${stats.critical + stats.high}</div>
            <div class="stat-label">High Priority</div>
          </div>
        </div>

        <!-- Heatmap -->
        <div class="map-container mb-6">
          <div class="map-header">
            <div class="chart-title"><i class="fa-solid fa-map-location-dot"></i> Complaint Heatmap</div>
            <div class="flex gap-2">
              <span class="badge badge-blue">${complaints.length} locations plotted</span>
            </div>
          </div>
          <div class="map-body" id="complaint-heatmap"></div>
          <div class="map-legend">
            <div class="legend-item"><div class="legend-dot" style="background: #ef4444;"></div> Critical</div>
            <div class="legend-item"><div class="legend-dot" style="background: #f97316;"></div> High</div>
            <div class="legend-item"><div class="legend-dot" style="background: #f59e0b;"></div> Medium</div>
            <div class="legend-item"><div class="legend-dot" style="background: #10b981;"></div> Low/Resolved</div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid-2 mb-6">
          <!-- Department Performance -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title"><i class="fa-solid fa-building"></i> Department Performance</div>
            </div>
            <div class="chart-body">
              <canvas id="analytics-dept-chart"></canvas>
            </div>
          </div>

          <!-- Monthly Trends -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title"><i class="fa-solid fa-chart-area"></i> Monthly Complaint Trends</div>
            </div>
            <div class="chart-body">
              <canvas id="analytics-trend-chart"></canvas>
            </div>
          </div>
        </div>

        <div class="grid-2 mb-6">
          <!-- Priority Distribution -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title"><i class="fa-solid fa-signal"></i> Priority Distribution</div>
            </div>
            <div class="chart-body" style="min-height: 250px;">
              <canvas id="analytics-priority-chart"></canvas>
            </div>
          </div>

          <!-- Status Breakdown -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title"><i class="fa-solid fa-circle-nodes"></i> Status Breakdown</div>
            </div>
            <div class="chart-body" style="min-height: 250px;">
              <canvas id="analytics-status-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Department Performance Table -->
        <div class="card mb-6">
          <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-ranking-star" style="color: var(--accent-gold);"></i> Department Performance Ranking</h3>
          ${renderDeptPerformance(stats)}
        </div>

        <!-- Predictive Insights -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title"><i class="fa-solid fa-brain"></i> Predictive Civic Intelligence</div>
          </div>
          <div class="grid-2">
            ${insights.map(insight => `
              <div class="insight-card" style="border-left-color: ${insight.severity === 'critical' ? 'var(--priority-critical)' : insight.severity === 'high' ? 'var(--priority-high)' : 'var(--accent-gold)'};">
                <div class="insight-type">${insight.type}</div>
                <div class="insight-text">${insight.text}</div>
                <div class="insight-metric"><i class="fa-solid fa-chart-simple"></i> ${insight.metric}</div>
              </div>
            `).join('')}
            ${insights.length === 0 ? '<div class="card"><p style="color: var(--text-muted); text-align: center;">Not enough data for predictive insights.</p></div>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderDeptPerformance(stats) {
    const depts = Store.getDepartments();
    const deptData = depts.map(d => ({
      ...d,
      stats: stats.deptStats[d.id] || { total: 0, resolved: 0, pending: 0, rate: 0 },
    })).sort((a, b) => b.stats.rate - a.stats.rate);

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Department</th>
            <th>Total</th>
            <th>Resolved</th>
            <th>Pending</th>
            <th>Resolution Rate</th>
          </tr>
        </thead>
        <tbody>
          ${deptData.map((d, i) => `
            <tr>
              <td><span style="font-family: var(--font-mono); color: ${i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight: var(--font-bold);">#${i + 1}</span></td>
              <td><i class="fa-solid ${d.icon}" style="color: ${d.color}; margin-right: var(--space-2);"></i>${d.shortName}</td>
              <td>${d.stats.total}</td>
              <td style="color: var(--accent-emerald);">${d.stats.resolved}</td>
              <td style="color: var(--accent-gold);">${d.stats.pending}</td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <div class="progress-bar" style="width: 80px;"><div class="progress-fill" style="width: ${d.stats.rate}%; background: ${d.stats.rate >= 70 ? 'var(--accent-emerald)' : d.stats.rate >= 40 ? 'var(--accent-gold)' : 'var(--priority-critical)'}"></div></div>
                  <span style="font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--font-semibold);">${d.stats.rate}%</span>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function initCharts() {
    setTimeout(() => {
      initMap();
      initAnalyticsCharts();
    }, 150);
  }

  function initMap() {
    const mapEl = document.getElementById('complaint-heatmap');
    if (!mapEl || typeof L === 'undefined') return;

    map = L.map('complaint-heatmap').setView([17.4450, 78.4867], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const complaints = Store.getComplaints();
    complaints.forEach(c => {
      if (!c.lat || !c.lng) return;
      const color = c.status === 'Resolved' ? '#10b981' :
                    c.priority === 'Critical' ? '#ef4444' :
                    c.priority === 'High' ? '#f97316' : '#f59e0b';
      const circle = L.circleMarker([c.lat, c.lng], {
        radius: c.priority === 'Critical' ? 12 : c.priority === 'High' ? 10 : 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4,
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <strong style="color: #3b82f6;">${c.id}</strong><br>
          <strong>${c.category}</strong><br>
          <small>${c.description.substring(0, 80)}...</small><br>
          <span style="color: ${color};">● ${c.priority}</span> | ${c.status}<br>
          <small>📍 ${c.location}</small>
        </div>
      `);
    });
  }

  function initAnalyticsCharts() {
    const stats = Store.getStats();
    const depts = Store.getDepartments();
    const complaints = Store.getComplaints();

    // Department performance horizontal bar
    const deptCtx = document.getElementById('analytics-dept-chart');
    if (deptCtx) {
      charts.dept = new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: depts.map(d => d.shortName),
          datasets: [{
            label: 'Resolution Rate %',
            data: depts.map(d => (stats.deptStats[d.id] || {}).rate || 0),
            backgroundColor: depts.map(d => d.color + 'cc'),
            borderRadius: 6,
            barThickness: 28,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { max: 100, grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
            y: { grid: { display: false }, ticks: { color: '#f1f5f9', font: { size: 11 } } },
          },
        },
      });
    }

    // Monthly Trends (area)
    const trendCtx = document.getElementById('analytics-trend-chart');
    if (trendCtx) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthData = months.map((m, i) => {
        return complaints.filter(c => {
          const d = new Date(c.createdAt);
          return d.getMonth() === i;
        }).length;
      });
      // Simulate some trend data if only a few months have data
      const simData = monthData.map((v, i) => v || Math.floor(Math.random() * 3 + 1));
      charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Complaints',
            data: simData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
          },
        },
      });
    }

    // Priority distribution doughnut
    const prioCtx = document.getElementById('analytics-priority-chart');
    if (prioCtx) {
      const prioData = {
        'Critical': complaints.filter(c => c.priority === 'Critical').length,
        'High': complaints.filter(c => c.priority === 'High').length,
        'Medium': complaints.filter(c => c.priority === 'Medium').length,
        'Low': complaints.filter(c => c.priority === 'Low').length,
      };
      charts.priority = new Chart(prioCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(prioData),
          datasets: [{
            data: Object.values(prioData),
            backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981'],
            borderWidth: 0,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } },
        },
      });
    }

    // Status breakdown
    const statCtx = document.getElementById('analytics-status-chart');
    if (statCtx) {
      charts.status = new Chart(statCtx, {
        type: 'doughnut',
        data: {
          labels: ['Submitted', 'Assigned', 'In Progress', 'Resolved'],
          datasets: [{
            data: [stats.submitted, stats.assigned, stats.inProgress, stats.resolved],
            backgroundColor: ['#f59e0b', '#3b82f6', '#f97316', '#10b981'],
            borderWidth: 0,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } },
        },
      });
    }
  }

  function destroy() {
    Object.values(charts).forEach(c => { if (c && c.destroy) c.destroy(); });
    charts = {};
    if (map) { map.remove(); map = null; }
  }

  return { render, initCharts, destroy };
})();
