/* ============================================
   PrajaNetra AI - Corporator Dashboard View
   ============================================ */

const CorporatorView = (() => {
  let selectedWard = 'Ward 12';

  function render() {
    const wardComplaints = Store.getComplaints({ ward: selectedWard });
    const resolved = wardComplaints.filter(c => c.status === 'Resolved').length;
    const pending = wardComplaints.filter(c => c.status !== 'Resolved').length;
    const critical = wardComplaints.filter(c => c.priority === 'Critical' || c.priority === 'High').length;
    const rate = wardComplaints.length > 0 ? Math.round((resolved / wardComplaints.length) * 100) : 0;

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-landmark"></i> Corporator Dashboard</h2>
            <p class="page-subtitle">Ward-level complaint monitoring and tracking</p>
          </div>
          <div class="flex gap-3 items-center">
            <label class="form-label" style="margin:0;">Select Ward:</label>
            <select class="form-select" style="width: auto;" onchange="CorporatorView.setWard(this.value)" id="corpWardSelect">
              ${Store.getWards().map(w => `<option value="${w}" ${w === selectedWard ? 'selected' : ''}>${w}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="stat-value">${wardComplaints.length}</div>
            <div class="stat-label">Total in ${selectedWard}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon emerald"><i class="fa-solid fa-circle-check"></i></div>
            <div class="stat-value">${resolved}</div>
            <div class="stat-label">Resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i class="fa-solid fa-hourglass-half"></i></div>
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="stat-value">${critical}</div>
            <div class="stat-label">High/Critical</div>
          </div>
        </div>

        <!-- Resolution Rate -->
        <div class="card mb-6">
          <div class="flex justify-between items-center mb-4">
            <span style="font-size: var(--text-sm); font-weight: var(--font-semibold);">Resolution Rate</span>
            <span style="font-family: var(--font-mono); color: var(--accent-emerald); font-weight: var(--font-bold);">${rate}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${rate}%;"></div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="grid-2 mb-6">
          <div class="card">
            <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-chart-pie" style="color: var(--accent-primary);"></i> Category Breakdown</h3>
            ${renderCategoryBreakdown(wardComplaints)}
          </div>
          <div class="card">
            <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-exclamation-triangle" style="color: var(--accent-gold);"></i> Unresolved Complaints</h3>
            ${renderUnresolved(wardComplaints)}
          </div>
        </div>

        <!-- Complaints Table -->
        <div class="data-table-wrapper">
          <div class="data-table-header">
            <div class="data-table-title"><i class="fa-solid fa-list"></i> ${selectedWard} Complaints</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${wardComplaints.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: var(--space-8); color: var(--text-muted);">No complaints in this ward</td></tr>' :
                wardComplaints.map(c => `
                <tr>
                  <td><span class="complaint-id">${c.id}</span></td>
                  <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.description}</td>
                  <td><span class="chip">${c.category}</span></td>
                  <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
                  <td><span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span></td>
                  <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCategoryBreakdown(complaints) {
    const cats = {};
    complaints.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
    const entries = Object.entries(cats).sort(([, a], [, b]) => b - a);
    if (entries.length === 0) return '<p style="color: var(--text-muted); font-size: var(--text-sm);">No data</p>';
    const max = entries[0][1];
    return entries.map(([cat, count]) => `
      <div class="dept-row">
        <div class="dept-name">${cat}</div>
        <div class="dept-bar-container">
          <div class="dept-bar"><div class="dept-bar-fill" style="width: ${(count / max * 100)}%; background: var(--gradient-accent);"></div></div>
          <div class="dept-value" style="color: var(--text-primary);">${count}</div>
        </div>
      </div>
    `).join('');
  }

  function renderUnresolved(complaints) {
    const unresolved = complaints.filter(c => c.status !== 'Resolved').sort((a, b) => b.urgencyScore - a.urgencyScore);
    if (unresolved.length === 0) return '<p style="color: var(--accent-emerald); font-size: var(--text-sm);"><i class="fa-solid fa-check-circle"></i> All complaints resolved!</p>';
    return unresolved.slice(0, 5).map(c => `
      <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
        <span class="complaint-id" style="font-size: var(--text-xs);">${c.id}</span>
        <span style="flex: 1; font-size: var(--text-xs); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.description}</span>
        <span class="badge badge-${c.priority.toLowerCase()}" style="font-size: 0.6rem;">${c.priority}</span>
      </div>
    `).join('');
  }

  function setWard(ward) {
    selectedWard = ward;
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  return { render, setWard };
})();
