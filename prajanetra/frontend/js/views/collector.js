/* ============================================
   PrajaNetra AI - Collector Command Center View
   ============================================ */

const CollectorView = (() => {
  let charts = {};

  function render() {
    const stats = Store.getStats();
    const depts = Store.getDepartments();
    const complaints = Store.getComplaints();
    const activity = Store.getActivity(8);

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-chess-king"></i> District Command Center</h2>
            <p class="page-subtitle">Real-time district-level civic governance monitoring</p>
          </div>
          <div class="flex gap-3 items-center">
            <div class="header-status"><div class="dot"></div> Live Monitoring</div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-file-lines"></i></div>
            <div class="stat-value counter" data-target="${stats.total}">${stats.total}</div>
            <div class="stat-label">Total Complaints</div>
            <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> Active district monitoring</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon emerald"><i class="fa-solid fa-circle-check"></i></div>
            <div class="stat-value counter" data-target="${stats.resolved}">${stats.resolved}</div>
            <div class="stat-label">Resolved</div>
            <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> ${stats.resolutionRate}% rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i class="fa-solid fa-clock"></i></div>
            <div class="stat-value counter" data-target="${stats.pending}">${stats.pending}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-bolt"></i></div>
            <div class="stat-value counter" data-target="${stats.critical}">${stats.critical}</div>
            <div class="stat-label">Critical</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan"><i class="fa-solid fa-stopwatch"></i></div>
            <div class="stat-value">${stats.avgResolutionHours}h</div>
            <div class="stat-label">Avg Resolution Time</div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="command-grid">
          <!-- Left Column -->
          <div>
            <!-- Department Performance -->
            <div class="chart-card mb-6">
              <div class="chart-header">
                <div class="chart-title"><i class="fa-solid fa-building"></i> Department Response Performance</div>
              </div>
              <div class="chart-body" style="min-height: 280px;">
                <canvas id="dept-perf-chart"></canvas>
              </div>
            </div>

            <!-- Category Distribution -->
            <div class="chart-card mb-6">
              <div class="chart-header">
                <div class="chart-title"><i class="fa-solid fa-chart-pie"></i> Complaint Category Distribution</div>
              </div>
              <div class="chart-body" style="min-height: 280px;">
                <canvas id="category-dist-chart"></canvas>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Resolution Rate Gauge -->
            <div class="card mb-6" style="text-align: center; padding: var(--space-6);">
              <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4); color: var(--text-primary);">
                <i class="fa-solid fa-gauge-high" style="color: var(--accent-primary);"></i> Overall Resolution Rate
              </h3>
              <div style="position: relative; width: 150px; height: 150px; margin: 0 auto;">
                <canvas id="resolution-gauge"></canvas>
              </div>
              <div style="margin-top: var(--space-3); font-family: var(--font-display); font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--accent-emerald);">
                ${stats.resolutionRate}%
              </div>
            </div>

            <!-- Top Civic Hotspots -->
            <div class="card mb-6">
              <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-fire" style="color: var(--priority-critical);"></i> Civic Hotspots</h3>
              ${renderHotspots(stats.wardDist)}
            </div>

            <!-- Recent Activity -->
            <div class="card">
              <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-timeline" style="color: var(--accent-primary);"></i> Recent Activity</h3>
              <div class="activity-feed">
                ${activity.map(a => `
                  <div class="activity-item">
                    <div class="activity-dot ${a.type === 'resolved' ? 'emerald' : a.type === 'alert' || a.type === 'escalation' ? 'red' : a.type === 'new' ? 'blue' : 'gold'}"></div>
                    <div class="activity-content">
                      <div class="activity-text">${a.text}</div>
                      <div class="activity-time">${formatTimeAgo(a.time)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderHotspots(wardDist) {
    const sorted = Object.entries(wardDist).sort(([, a], [, b]) => b - a).slice(0, 5);
    if (sorted.length === 0) return '<p style="color: var(--text-muted);">No data</p>';
    return sorted.map(([ward, count], i) => `
      <div class="hotspot-card">
        <div class="hotspot-rank">#${i + 1}</div>
        <div class="hotspot-info">
          <div class="hotspot-name">${ward}</div>
          <div class="hotspot-count">${count} complaint${count > 1 ? 's' : ''}</div>
        </div>
        <span class="badge ${i === 0 ? 'badge-critical' : i === 1 ? 'badge-high' : 'badge-medium'}">${i === 0 ? 'Highest' : i === 1 ? 'High' : 'Moderate'}</span>
      </div>
    `).join('');
  }

  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  function initCharts() {
    setTimeout(() => {
      const stats = Store.getStats();
      const depts = Store.getDepartments();

      // Department Performance Chart
      const deptCtx = document.getElementById('dept-perf-chart');
      if (deptCtx) {
        charts.deptPerf = new Chart(deptCtx, {
          type: 'bar',
          data: {
            labels: depts.map(d => d.shortName),
            datasets: [
              {
                label: 'Total',
                data: depts.map(d => (stats.deptStats[d.id] || {}).total || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 6,
              },
              {
                label: 'Resolved',
                data: depts.map(d => (stats.deptStats[d.id] || {}).resolved || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderRadius: 6,
              },
              {
                label: 'Pending',
                data: depts.map(d => (stats.deptStats[d.id] || {}).pending || 0),
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderRadius: 6,
              },
            ],
          },
          options: getChartOptions('Complaints by Department'),
        });
      }

      // Category Distribution (Doughnut)
      const catCtx = document.getElementById('category-dist-chart');
      if (catCtx) {
        const catEntries = Object.entries(stats.categoryDist);
        charts.catDist = new Chart(catCtx, {
          type: 'doughnut',
          data: {
            labels: catEntries.map(([k]) => k),
            datasets: [{
              data: catEntries.map(([, v]) => v),
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'],
              borderWidth: 0,
              hoverOffset: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 15, font: { size: 11 } } },
            },
            cutout: '65%',
          },
        });
      }

      // Resolution Rate Gauge
      const gaugeCtx = document.getElementById('resolution-gauge');
      if (gaugeCtx) {
        charts.gauge = new Chart(gaugeCtx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [stats.resolutionRate, 100 - stats.resolutionRate],
              backgroundColor: ['#10b981', 'rgba(148, 163, 184, 0.1)'],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            rotation: -90,
            circumference: 180,
            cutout: '80%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
          },
        });
      }
    }, 100);
  }

  function getChartOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } },
      },
      scales: {
        x: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8', font: { size: 10 } }, beginAtZero: true },
      },
    };
  }

  function destroy() {
    Object.values(charts).forEach(c => { if (c && c.destroy) c.destroy(); });
    charts = {};
  }

  return { render, initCharts, destroy };
})();
