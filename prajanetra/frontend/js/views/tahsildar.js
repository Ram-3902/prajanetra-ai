/* ============================================
   PrajaNetra AI - Tahsildar Dashboard View
   ============================================ */

const TahsildarView = (() => {
  let selectedZone = 'Zone A';

  function render() {
    const zones = Store.getZones();
    const zoneWards = zones[selectedZone] || [];
    const zoneComplaints = Store.getComplaints({ wards: zoneWards });
    const resolved = zoneComplaints.filter(c => c.status === 'Resolved').length;
    const pending = zoneComplaints.filter(c => c.status !== 'Resolved').length;
    const critical = zoneComplaints.filter(c => c.priority === 'Critical').length;
    const depts = Store.getDepartments();

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-building-columns"></i> Tahsildar Dashboard</h2>
            <p class="page-subtitle">Multi-ward monitoring and department workload analysis</p>
          </div>
          <div class="flex gap-3 items-center">
            <label class="form-label" style="margin:0;">Zone:</label>
            <select class="form-select" style="width: auto;" onchange="TahsildarView.setZone(this.value)">
              ${Object.keys(zones).map(z => `<option value="${z}" ${z === selectedZone ? 'selected' : ''}>${z} (${zones[z].join(', ')})</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-map"></i></div>
            <div class="stat-value">${zoneWards.length}</div>
            <div class="stat-label">Wards in ${selectedZone}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="stat-value">${zoneComplaints.length}</div>
            <div class="stat-label">Total Complaints</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i class="fa-solid fa-hourglass-half"></i></div>
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-circle-exclamation"></i></div>
            <div class="stat-value">${critical}</div>
            <div class="stat-label">Critical</div>
          </div>
        </div>

        <div class="grid-2 mb-6">
          <!-- Ward Comparison -->
          <div class="card">
            <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-chart-bar" style="color: var(--accent-primary);"></i> Ward-wise Complaint Distribution</h3>
            ${renderWardComparison(zoneWards)}
          </div>

          <!-- Department Workload -->
          <div class="card">
            <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-building" style="color: var(--accent-secondary);"></i> Department Workload</h3>
            ${renderDeptWorkload(zoneComplaints, depts)}
          </div>
        </div>

        <!-- Escalation Indicators -->
        <div class="card mb-6">
          <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);"><i class="fa-solid fa-triangle-exclamation" style="color: var(--priority-critical);"></i> Escalation Indicators</h3>
          ${renderEscalations(zoneComplaints)}
        </div>

        <!-- Zone Complaints Table -->
        <div class="data-table-wrapper">
          <div class="data-table-header">
            <div class="data-table-title"><i class="fa-solid fa-table-list"></i> ${selectedZone} Complaints</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ward</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${zoneComplaints.length === 0 ? '<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: var(--space-8);">No complaints</td></tr>' :
                zoneComplaints.map(c => `
                <tr>
                  <td><span class="complaint-id">${c.id}</span></td>
                  <td>${c.ward}</td>
                  <td><span class="chip">${c.category}</span></td>
                  <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
                  <td><span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                      <div class="progress-bar" style="width: 60px;"><div class="progress-fill" style="width: ${c.urgencyScore}%; background: ${c.urgencyScore >= 80 ? 'var(--priority-critical)' : c.urgencyScore >= 60 ? 'var(--accent-gold)' : 'var(--accent-emerald)'}"></div></div>
                      <span style="font-family: var(--font-mono); font-size: var(--text-xs);">${c.urgencyScore}</span>
                    </div>
                  </td>
                  <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderWardComparison(wards) {
    const wardData = wards.map(w => ({
      name: w,
      total: Store.getComplaints({ ward: w }).length,
      resolved: Store.getComplaints({ ward: w }).filter(c => c.status === 'Resolved').length,
    }));
    const maxCount = Math.max(...wardData.map(w => w.total), 1);
    return wardData.map(w => `
      <div class="dept-row">
        <div class="dept-name">${w.name}</div>
        <div class="dept-bar-container">
          <div class="dept-bar">
            <div class="dept-bar-fill" style="width: ${(w.total / maxCount * 100)}%; background: var(--accent-primary);"></div>
          </div>
          <div class="dept-value" style="color: var(--text-primary);">${w.total}</div>
        </div>
      </div>
    `).join('') || '<p style="color: var(--text-muted);">No data</p>';
  }

  function renderDeptWorkload(complaints, depts) {
    const deptData = depts.map(d => ({
      name: d.shortName,
      count: complaints.filter(c => c.department === d.id).length,
      pending: complaints.filter(c => c.department === d.id && c.status !== 'Resolved').length,
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
    
    if (deptData.length === 0) return '<p style="color: var(--text-muted);">No workload data</p>';
    const max = Math.max(...deptData.map(d => d.count), 1);
    return deptData.map(d => `
      <div class="dept-row">
        <div class="dept-name">${d.name}</div>
        <div class="dept-bar-container">
          <div class="dept-bar"><div class="dept-bar-fill" style="width: ${(d.count / max * 100)}%; background: var(--accent-secondary);"></div></div>
          <div class="dept-value" style="color: var(--text-primary);">${d.count} <span style="font-size: var(--text-xs); color: var(--accent-gold);">(${d.pending}⏳)</span></div>
        </div>
      </div>
    `).join('');
  }

  function renderEscalations(complaints) {
    const escalation = complaints.filter(c => 
      (c.priority === 'Critical' && c.status !== 'Resolved') ||
      (c.urgencyScore >= 80 && c.status === 'Submitted')
    );
    if (escalation.length === 0) {
      return '<p style="color: var(--accent-emerald); font-size: var(--text-sm);"><i class="fa-solid fa-shield-check"></i> No escalations needed. All critical complaints are being addressed.</p>';
    }
    return `
      <div style="display: grid; gap: var(--space-3);">
        ${escalation.map(c => `
          <div class="insight-card" style="border-left-color: var(--priority-critical);">
            <div class="flex justify-between items-center">
              <div>
                <span class="complaint-id">${c.id}</span>
                <span class="badge badge-${c.priority.toLowerCase()}" style="margin-left: var(--space-2);">${c.priority}</span>
              </div>
              <span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span>
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-2);">${c.description.substring(0, 80)}...</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function setZone(zone) {
    selectedZone = zone;
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  return { render, setZone };
})();
