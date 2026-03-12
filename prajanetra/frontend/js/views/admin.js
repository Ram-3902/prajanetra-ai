/* ============================================
   PrajaNetra AI - Admin Panel View
   ============================================ */

const AdminView = (() => {
  let activeTab = 'departments';

  function render() {
    const stats = Store.getStats();
    const activity = Store.getActivity(10);

    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-gear"></i> Administration Panel</h2>
            <p class="page-subtitle">Manage departments, officers, and platform configuration</p>
          </div>
          <div class="flex gap-3">
            <button class="btn btn-danger btn-sm" onclick="AdminView.resetData()">
              <i class="fa-solid fa-rotate-left"></i> Reset Data
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="kpi-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-building"></i></div>
            <div class="stat-value">${Store.getDepartments().length}</div>
            <div class="stat-label">Departments</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon emerald"><i class="fa-solid fa-users"></i></div>
            <div class="stat-value">${Store.getOfficers().length}</div>
            <div class="stat-label">Officers</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Complaints</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i class="fa-solid fa-chart-line"></i></div>
            <div class="stat-value">${stats.resolutionRate}%</div>
            <div class="stat-label">Resolution Rate</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <div class="tab ${activeTab === 'departments' ? 'active' : ''}" onclick="AdminView.setTab('departments')">
            <i class="fa-solid fa-building"></i> Departments
          </div>
          <div class="tab ${activeTab === 'officers' ? 'active' : ''}" onclick="AdminView.setTab('officers')">
            <i class="fa-solid fa-user-tie"></i> Officers
          </div>
          <div class="tab ${activeTab === 'activity' ? 'active' : ''}" onclick="AdminView.setTab('activity')">
            <i class="fa-solid fa-timeline"></i> Activity Log
          </div>
        </div>

        <div id="admin-tab-content">
          ${activeTab === 'departments' ? renderDepartments() : activeTab === 'officers' ? renderOfficers() : renderActivityLog()}
        </div>
      </div>
    `;
  }

  function renderDepartments() {
    const depts = Store.getDepartments();
    const stats = Store.getStats();
    return `
      <div class="data-table-wrapper">
        <div class="data-table-header">
          <div class="data-table-title"><i class="fa-solid fa-building"></i> Department Management</div>
          <button class="btn btn-primary btn-sm" onclick="AdminView.addDeptModal()">
            <i class="fa-solid fa-plus"></i> Add Department
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Short Name</th>
              <th>Total</th>
              <th>Resolved</th>
              <th>Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${depts.map(d => {
              const ds = stats.deptStats[d.id] || { total: 0, resolved: 0, rate: 0 };
              return `
              <tr>
                <td><span class="complaint-id">${d.id}</span></td>
                <td><i class="fa-solid ${d.icon}" style="color: ${d.color}; margin-right: var(--space-2);"></i>${d.name}</td>
                <td>${d.shortName}</td>
                <td>${ds.total}</td>
                <td>${ds.resolved}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <div class="progress-bar" style="width: 60px;"><div class="progress-fill" style="width: ${ds.rate}%;"></div></div>
                    <span style="font-family: var(--font-mono); font-size: var(--text-xs);">${ds.rate}%</span>
                  </div>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-icon" onclick="AdminView.editDept('${d.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-ghost btn-icon" onclick="AdminView.deleteDept('${d.id}')"><i class="fa-solid fa-trash" style="color: var(--priority-critical);"></i></button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderOfficers() {
    const officers = Store.getOfficers();
    const depts = Store.getDepartments();
    return `
      <div class="data-table-wrapper">
        <div class="data-table-header">
          <div class="data-table-title"><i class="fa-solid fa-user-tie"></i> Officer Management</div>
          <button class="btn btn-primary btn-sm" onclick="AdminView.addOfficerModal()">
            <i class="fa-solid fa-plus"></i> Add Officer
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Ward / Zone</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${officers.map(o => {
              const dept = o.department ? depts.find(d => d.id === o.department) : null;
              return `
              <tr>
                <td><span class="complaint-id">${o.id}</span></td>
                <td>${o.name}</td>
                <td><span class="badge badge-blue">${o.role}</span></td>
                <td>${dept ? dept.shortName : '—'}</td>
                <td>${o.ward || '—'}</td>
                <td style="font-family: var(--font-mono); font-size: var(--text-xs);">${o.phone || '—'}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-icon" onclick="AdminView.editOfficer('${o.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-ghost btn-icon" onclick="AdminView.deleteOfficer('${o.id}')"><i class="fa-solid fa-trash" style="color: var(--priority-critical);"></i></button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderActivityLog() {
    const activity = Store.getActivity(20);
    return `
      <div class="card">
        <div class="activity-feed">
          ${activity.length === 0 ? '<p style="text-align:center; color: var(--text-muted);">No activity recorded yet.</p>' :
            activity.map(a => `
            <div class="activity-item">
              <div class="activity-dot ${a.type === 'resolved' ? 'emerald' : a.type === 'alert' || a.type === 'escalation' ? 'red' : a.type === 'new' ? 'blue' : 'gold'}"></div>
              <div class="activity-content">
                <div class="activity-text">${a.text}</div>
                <div class="activity-time">${new Date(a.time).toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function setTab(tab) {
    activeTab = tab;
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function addDeptModal() {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-plus"></i> Add Department</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Department Name *</label>
          <input type="text" class="form-input" id="dept-name" placeholder="e.g., Parks & Gardens Department">
        </div>
        <div class="form-group">
          <label class="form-label">Short Name *</label>
          <input type="text" class="form-input" id="dept-short" placeholder="e.g., Parks">
        </div>
        <div class="form-group">
          <label class="form-label">Icon (Font Awesome class)</label>
          <input type="text" class="form-input" id="dept-icon" placeholder="e.g., fa-tree" value="fa-building">
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <input type="color" class="form-input" id="dept-color" value="#3b82f6" style="height: 40px; padding: 4px;">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminView.saveDept()"><i class="fa-solid fa-save"></i> Save</button>
      </div>
    `;
    overlay.classList.add('active');
  }

  function saveDept() {
    const name = document.getElementById('dept-name').value.trim();
    const shortName = document.getElementById('dept-short').value.trim();
    const icon = document.getElementById('dept-icon').value.trim();
    const color = document.getElementById('dept-color').value;
    if (!name || !shortName) { App.showToast('Name and short name are required.', 'warning'); return; }
    Store.addDepartment({ name, shortName, icon, color });
    App.closeModal();
    App.showToast('Department added successfully!', 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function editDept(id) {
    const d = Store.getDepartment(id);
    if (!d) return;
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-pen"></i> Edit Department</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="dept-name" value="${d.name}"></div>
        <div class="form-group"><label class="form-label">Short Name</label><input type="text" class="form-input" id="dept-short" value="${d.shortName}"></div>
        <div class="form-group"><label class="form-label">Icon</label><input type="text" class="form-input" id="dept-icon" value="${d.icon}"></div>
        <div class="form-group"><label class="form-label">Color</label><input type="color" class="form-input" id="dept-color" value="${d.color}" style="height:40px; padding:4px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminView.updateDept('${id}')"><i class="fa-solid fa-save"></i> Update</button>
      </div>
    `;
    overlay.classList.add('active');
  }

  function updateDept(id) {
    Store.updateDepartment(id, {
      name: document.getElementById('dept-name').value.trim(),
      shortName: document.getElementById('dept-short').value.trim(),
      icon: document.getElementById('dept-icon').value.trim(),
      color: document.getElementById('dept-color').value,
    });
    App.closeModal();
    App.showToast('Department updated.', 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function deleteDept(id) {
    if (confirm('Delete this department?')) {
      Store.deleteDepartment(id);
      App.showToast('Department deleted.', 'success');
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = render();
    }
  }

  function addOfficerModal() {
    const depts = Store.getDepartments();
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-plus"></i> Add Officer</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name *</label><input type="text" class="form-input" id="off-name" placeholder="Officer name"></div>
        <div class="form-group"><label class="form-label">Role *</label>
          <select class="form-select" id="off-role">
            <option value="officer">Officer</option>
            <option value="corporator">Corporator</option>
            <option value="tahsildar">Tahsildar</option>
            <option value="collector">Collector</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Department</label>
          <select class="form-select" id="off-dept">
            <option value="">None</option>
            ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Ward / Zone</label><input type="text" class="form-input" id="off-ward" placeholder="e.g., Ward 5"></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="off-phone" placeholder="10-digit mobile"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminView.saveOfficer()"><i class="fa-solid fa-save"></i> Save</button>
      </div>
    `;
    overlay.classList.add('active');
  }

  function saveOfficer() {
    const name = document.getElementById('off-name').value.trim();
    const role = document.getElementById('off-role').value;
    const department = document.getElementById('off-dept').value || null;
    const ward = document.getElementById('off-ward').value.trim();
    const phone = document.getElementById('off-phone').value.trim();
    if (!name) { App.showToast('Name is required.', 'warning'); return; }
    Store.addOfficer({ name, role, department, ward, phone });
    App.closeModal();
    App.showToast('Officer added!', 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function editOfficer(id) {
    const o = Store.getOfficer(id);
    if (!o) return;
    const depts = Store.getDepartments();
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-pen"></i> Edit Officer</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="off-name" value="${o.name}"></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-select" id="off-role">
            <option value="officer" ${o.role === 'officer' ? 'selected' : ''}>Officer</option>
            <option value="corporator" ${o.role === 'corporator' ? 'selected' : ''}>Corporator</option>
            <option value="tahsildar" ${o.role === 'tahsildar' ? 'selected' : ''}>Tahsildar</option>
            <option value="collector" ${o.role === 'collector' ? 'selected' : ''}>Collector</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Department</label>
          <select class="form-select" id="off-dept">
            <option value="">None</option>
            ${depts.map(d => `<option value="${d.id}" ${o.department === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Ward</label><input type="text" class="form-input" id="off-ward" value="${o.ward || ''}"></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="off-phone" value="${o.phone || ''}"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminView.updateOfficer('${id}')"><i class="fa-solid fa-save"></i> Update</button>
      </div>
    `;
    overlay.classList.add('active');
  }

  function updateOfficer(id) {
    Store.updateOfficer(id, {
      name: document.getElementById('off-name').value.trim(),
      role: document.getElementById('off-role').value,
      department: document.getElementById('off-dept').value || null,
      ward: document.getElementById('off-ward').value.trim(),
      phone: document.getElementById('off-phone').value.trim(),
    });
    App.closeModal();
    App.showToast('Officer updated.', 'success');
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = render();
  }

  function deleteOfficer(id) {
    if (confirm('Delete this officer?')) {
      Store.deleteOfficer(id);
      App.showToast('Officer removed.', 'success');
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = render();
    }
  }

  function resetData() {
    if (confirm('Reset ALL data to defaults? This cannot be undone.')) {
      Store.resetData();
      App.showToast('Data reset to defaults.', 'success');
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = render();
    }
  }

  return { render, setTab, addDeptModal, saveDept, editDept, updateDept, deleteDept, addOfficerModal, saveOfficer, editOfficer, updateOfficer, deleteOfficer, resetData };
})();
