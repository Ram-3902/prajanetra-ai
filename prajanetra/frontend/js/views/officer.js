/* ============================================
   PrajaNetra AI - Officer Dashboard View
   ============================================ */

const OfficerView = (() => {
  let currentFilter = 'all';

  function render() {
    const stats = Store.getStats();
    const complaints = Store.getComplaints();
    const assignedCount = complaints.filter(c => c.assignedTo).length;
    const pendingCount = complaints.filter(c => c.status !== 'Resolved').length;
    const todayCount = complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length;

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-user-shield"></i> Officer Dashboard</h2>
            <p class="page-subtitle">Manage assigned complaints and update resolution status</p>
          </div>
          <div class="flex gap-3">
            <button class="btn btn-secondary" onclick="OfficerView.autoAssign()">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Assign Pending
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Complaints</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i class="fa-solid fa-clock"></i></div>
            <div class="stat-value">${pendingCount}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon emerald"><i class="fa-solid fa-circle-check"></i></div>
            <div class="stat-value">${stats.resolved}</div>
            <div class="stat-label">Resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan"><i class="fa-solid fa-bolt"></i></div>
            <div class="stat-value">${todayCount}</div>
            <div class="stat-label">Today</div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <span style="font-size: var(--text-sm); color: var(--text-muted); margin-right: var(--space-2);">Filter:</span>
          <div class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" onclick="OfficerView.setFilter('all')">All</div>
          <div class="filter-chip ${currentFilter === 'Submitted' ? 'active' : ''}" onclick="OfficerView.setFilter('Submitted')">Submitted</div>
          <div class="filter-chip ${currentFilter === 'Assigned' ? 'active' : ''}" onclick="OfficerView.setFilter('Assigned')">Assigned</div>
          <div class="filter-chip ${currentFilter === 'In Progress' ? 'active' : ''}" onclick="OfficerView.setFilter('In Progress')">In Progress</div>
          <div class="filter-chip ${currentFilter === 'Resolved' ? 'active' : ''}" onclick="OfficerView.setFilter('Resolved')">Resolved</div>
        </div>

        <!-- Complaints Table -->
        <div class="data-table-wrapper">
          <div class="data-table-header">
            <div class="data-table-title"><i class="fa-solid fa-table-list"></i> Complaints</div>
            <div class="data-table-actions">
              <div class="search-box">
                <i class="fa-solid fa-search"></i>
                <input type="text" placeholder="Search complaints..." id="officer-search" oninput="OfficerView.refresh()">
              </div>
            </div>
          </div>
          <div id="officer-table-body">
            ${renderTable()}
          </div>
        </div>
      </div>
    `;
  }

  function renderTable() {
    let complaints = currentFilter === 'all' ? Store.getComplaints() : Store.getComplaints({ status: currentFilter });
    const searchEl = document.getElementById('officer-search');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    if (search) {
      complaints = complaints.filter(c =>
        c.id.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.location.toLowerCase().includes(search)
      );
    }

    if (complaints.length === 0) {
      return `<div class="empty-state"><i class="fa-solid fa-filter"></i><h3>No complaints match</h3><p>Try adjusting your filters.</p></div>`;
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Category</th>
            <th>Ward</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.map(c => `
            <tr>
              <td><span class="complaint-id">${c.id}</span></td>
              <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.description}">${c.description}</td>
              <td><span class="chip">${c.category}</span></td>
              <td>${c.ward}</td>
              <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
              <td>
                <select class="form-select" style="width: auto; min-width: 130px; padding: 4px 30px 4px 8px;" onchange="OfficerView.updateStatus('${c.id}', this.value)">
                  <option value="Submitted" ${c.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                  <option value="Assigned" ${c.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
                  <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-ghost btn-icon" onclick="OfficerView.viewDetail('${c.id}')" data-tooltip="View"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-ghost btn-icon" onclick="OfficerView.resolveModal('${c.id}')" data-tooltip="Resolve"><i class="fa-solid fa-check-circle"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function setFilter(f) {
    currentFilter = f;
    refresh();
  }

  function refresh() {
    const container = document.getElementById('officer-table-body');
    if (container) container.innerHTML = renderTable();
    // Update filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      const filterVal = chip.textContent.trim() === 'All' ? 'all' : chip.textContent.trim();
      chip.classList.toggle('active', filterVal === currentFilter);
    });
  }

  function updateStatus(id, status) {
    Store.updateComplaint(id, { status });
    if (status === 'Assigned') {
      // Auto-assign to first available officer for the department
      const complaint = Store.getComplaint(id);
      if (complaint && !complaint.assignedTo) {
        const officers = Store.getOfficers({ role: 'officer', department: complaint.department });
        if (officers.length > 0) {
          Store.updateComplaint(id, { assignedTo: officers[0].id });
        }
      }
    }
    App.showToast(`Complaint ${id} updated to ${status}`, 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function autoAssign() {
    const submitted = Store.getComplaints({ status: 'Submitted' });
    let assigned = 0;
    submitted.forEach(c => {
      const officers = Store.getOfficers({ role: 'officer', department: c.department });
      if (officers.length > 0) {
        const officer = officers[assigned % officers.length];
        Store.updateComplaint(c.id, { status: 'Assigned', assignedTo: officer.id });
        assigned++;
      }
    });
    App.showToast(`${assigned} complaints auto-assigned to officers.`, 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function viewDetail(id) {
    const c = Store.getComplaint(id);
    if (!c) return;
    const dept = Store.getDepartment(c.department);
    const officer = c.assignedTo ? Store.getOfficer(c.assignedTo) : null;
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-file-lines"></i> ${c.id}</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); font-size: var(--text-sm);">
          <div><span style="color: var(--text-muted);">Status</span><br><span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span></div>
          <div><span style="color: var(--text-muted);">Priority</span><br><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></div>
          <div><span style="color: var(--text-muted);">Category</span><br><strong>${c.category}</strong></div>
          <div><span style="color: var(--text-muted);">Department</span><br><strong>${dept ? dept.name : 'N/A'}</strong></div>
          <div><span style="color: var(--text-muted);">Ward</span><br><strong>${c.ward}</strong></div>
          <div><span style="color: var(--text-muted);">Location</span><br><strong>${c.location}</strong></div>
          <div><span style="color: var(--text-muted);">Filed</span><br><strong>${new Date(c.createdAt).toLocaleString()}</strong></div>
          <div><span style="color: var(--text-muted);">Assigned To</span><br><strong>${officer ? officer.name : 'Unassigned'}</strong></div>
        </div>
        <div style="margin-top: var(--space-4); padding: var(--space-4); background: var(--bg-surface); border-radius: var(--border-radius-md);">
          <span style="color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px;">Description</span>
          <p style="margin-top: var(--space-2); font-size: var(--text-sm); line-height: 1.6;">${c.description}</p>
        </div>
        ${c.resolutionNote ? `<div style="margin-top: var(--space-4); padding: var(--space-4); background: rgba(16, 185, 129, 0.08); border-radius: var(--border-radius-md); border-left: 3px solid var(--accent-emerald);">
          <span style="color: var(--accent-emerald); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px;"><i class="fa-solid fa-check-circle"></i> Resolution</span>
          <p style="margin-top: var(--space-2); font-size: var(--text-sm);">${c.resolutionNote}</p>
        </div>` : ''}
        <div style="margin-top: var(--space-4);">
          <span style="color: var(--text-muted); font-size: var(--text-xs);">Urgency Score</span>
          <div class="progress-bar" style="margin-top: var(--space-2);">
            <div class="progress-fill" style="width: ${c.urgencyScore}%; background: ${c.urgencyScore >= 80 ? 'var(--priority-critical)' : c.urgencyScore >= 60 ? 'var(--accent-gold)' : 'var(--accent-emerald)'};"></div>
          </div>
          <span style="font-size: var(--text-xs); color: var(--text-muted);">${c.urgencyScore}/100</span>
        </div>
      </div>
    `;
    overlay.classList.add('active');
  }

  function resolveModal(id) {
    const c = Store.getComplaint(id);
    if (!c) return;
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-check-circle" style="color: var(--accent-emerald);"></i> Resolve ${c.id}</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Resolution Note *</label>
          <textarea class="form-textarea" id="resolve-note" placeholder="Describe the resolution action taken..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Upload Proof (Optional)</label>
          <div class="file-upload" onclick="document.getElementById('resolve-proof').click()">
            <i class="fa-solid fa-camera"></i>
            <p>Upload resolution proof image</p>
          </div>
          <input type="file" id="resolve-proof" accept="image/*" style="display:none">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-emerald" onclick="OfficerView.submitResolution('${c.id}')">
          <i class="fa-solid fa-check"></i> Mark Resolved
        </button>
      </div>
    `;
    overlay.classList.add('active');
  }

  function submitResolution(id) {
    const note = document.getElementById('resolve-note').value.trim();
    if (!note) {
      App.showToast('Please add a resolution note.', 'warning');
      return;
    }
    Store.updateComplaint(id, { status: 'Resolved', resolutionNote: note });
    App.closeModal();
    App.showToast(`Complaint ${id} marked as resolved!`, 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  return { render, setFilter, refresh, updateStatus, autoAssign, viewDetail, resolveModal, submitResolution };
})();
