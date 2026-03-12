/* ============================================
   PrajaNetra AI - Citizen Portal View
   ============================================ */

const CitizenView = (() => {
  function render() {
    return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <h2 class="page-title"><i class="fa-solid fa-users"></i> Citizen Service Portal</h2>
            <p class="page-subtitle">Submit and track your civic complaints easily</p>
          </div>
        </div>

        <!-- Action Cards -->
        <div class="grid-3 mb-6" id="citizen-actions">
          <div class="action-card" onclick="CitizenView.openChatbot()">
            <div class="action-icon" style="background: rgba(59, 130, 246, 0.15); color: var(--accent-primary);">
              <i class="fa-solid fa-robot"></i>
            </div>
            <h3>AI Chatbot</h3>
            <p>Chat with our multilingual AI assistant in Telugu, Hindi, or English</p>
          </div>
          <div class="action-card" onclick="CitizenView.openVoice()">
            <div class="action-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--priority-critical);">
              <i class="fa-solid fa-microphone"></i>
            </div>
            <h3>Voice Complaint</h3>
            <p>Speak your complaint using voice input - perfect for all citizens</p>
          </div>
          <div class="action-card" onclick="CitizenView.showForm()">
            <div class="action-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
            <h3>Written Complaint</h3>
            <p>Fill out a simple form to register your civic grievance</p>
          </div>
        </div>

        <!-- Tabs: Form / Track -->
        <div class="tabs" id="citizen-tabs">
          <div class="tab active" data-tab="form" onclick="CitizenView.switchTab('form')">
            <i class="fa-solid fa-plus"></i> Register Complaint
          </div>
          <div class="tab" data-tab="track" onclick="CitizenView.switchTab('track')">
            <i class="fa-solid fa-search"></i> Track Complaint
          </div>
          <div class="tab" data-tab="recent" onclick="CitizenView.switchTab('recent')">
            <i class="fa-solid fa-clock-rotate-left"></i> Recent Complaints
          </div>
        </div>

        <!-- Form Tab -->
        <div id="tab-form" class="card">
          <h3 style="margin-bottom: var(--space-4); color: var(--text-primary);">
            <i class="fa-solid fa-file-lines" style="color: var(--accent-primary);"></i> Complaint Registration Form
          </h3>
          <div class="grid-2">
            <div>
              <div class="form-group">
                <label class="form-label">Mobile Number *</label>
                <input type="tel" class="form-input" id="comp-mobile" placeholder="Enter your mobile number">
              </div>
              <div class="form-group">
                <label class="form-label">Complaint Description *</label>
                <textarea class="form-textarea" id="comp-desc" placeholder="Describe your civic issue in detail..." rows="4"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label"><i class="fa-solid fa-map-location-dot" style="color: var(--accent-primary);"></i> Location / Area *</label>
                <input type="text" class="form-input" id="comp-location" placeholder="Click on the map or type address" readonly style="cursor: pointer; background: var(--bg-input);">
                <input type="hidden" id="comp-lat">
                <input type="hidden" id="comp-lng">
                <div id="location-map" style="width: 100%; height: 250px; border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle); margin-top: var(--space-2); cursor: crosshair;"></div>
                <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);"><i class="fa-solid fa-hand-pointer"></i> Click on the map to pin complaint location</p>
              </div>
            </div>
            <div>
              <div class="form-group">
                <label class="form-label">Ward (Optional)</label>
                <select class="form-select" id="comp-ward">
                  <option value="">Auto-detect</option>
                  ${Store.getWards().map(w => `<option value="${w}">${w}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Upload Image (Optional)</label>
                <div class="file-upload" id="comp-image-upload" onclick="document.getElementById('comp-image').click()">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                  <p>Click to upload an image</p>
                  <p style="font-size: var(--text-xs); color: var(--text-muted);">JPG, PNG up to 5MB</p>
                </div>
                <input type="file" id="comp-image" accept="image/*" style="display:none" onchange="CitizenView.handleImageUpload(event)">
                <div id="comp-image-preview" class="hidden" style="margin-top: var(--space-2);"></div>
              </div>

              <!-- AI Analysis Preview -->
              <div id="ai-analysis-preview" class="hidden" style="margin-top: var(--space-3);">
                <div class="card" style="border-left: 3px solid var(--accent-primary); padding: var(--space-4);">
                  <h4 style="font-size: var(--text-sm); color: var(--accent-primary); margin-bottom: var(--space-2);">
                    <i class="fa-solid fa-brain"></i> AI Analysis
                  </h4>
                  <div id="ai-analysis-content"></div>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: var(--space-5); display: flex; gap: var(--space-3);">
            <button class="btn btn-primary btn-lg" onclick="CitizenView.analyzeComplaint()">
              <i class="fa-solid fa-magnifying-glass-chart"></i> Analyze & Preview
            </button>
            <button class="btn btn-emerald btn-lg" id="btn-submit-complaint" onclick="CitizenView.submitComplaint()">
              <i class="fa-solid fa-paper-plane"></i> Submit Complaint
            </button>
          </div>
        </div>

        <!-- Track Tab -->
        <div id="tab-track" class="card hidden">
          <h3 style="margin-bottom: var(--space-4); color: var(--text-primary);">
            <i class="fa-solid fa-magnifying-glass" style="color: var(--accent-primary);"></i> Track Your Complaint
          </h3>
          <div class="grid-2" style="max-width: 700px;">
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="tel" class="form-input" id="track-mobile" placeholder="Your mobile number">
            </div>
            <div class="form-group">
              <label class="form-label">Complaint ID</label>
              <input type="text" class="form-input" id="track-id" placeholder="e.g., PRN-2026-0001">
            </div>
          </div>
          <button class="btn btn-primary" onclick="CitizenView.trackComplaint()">
            <i class="fa-solid fa-search"></i> Search
          </button>
          <div id="track-results" style="margin-top: var(--space-5);"></div>
        </div>

        <!-- Recent Tab -->
        <div id="tab-recent" class="hidden">
          ${renderRecentComplaints()}
        </div>
      </div>
    `;
  }

  function renderRecentComplaints() {
    const complaints = Store.getComplaints().slice(0, 10);
    if (complaints.length === 0) {
      return `<div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>No complaints yet</h3><p>Submit your first complaint using the form above.</p></div>`;
    }
    return `
      <div class="data-table-wrapper">
        <div class="data-table-header">
          <div class="data-table-title"><i class="fa-solid fa-list"></i> Recent Complaints</div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Category</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map(c => `
              <tr onclick="CitizenView.showComplaintDetail('${c.id}')" style="cursor:pointer;">
                <td><span class="complaint-id">${c.id}</span></td>
                <td>${c.category}</td>
                <td>${c.location || 'N/A'}</td>
                <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
                <td><span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span></td>
                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function switchTab(tab) {
    document.querySelectorAll('#citizen-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('tab-form').classList.toggle('hidden', tab !== 'form');
    document.getElementById('tab-track').classList.toggle('hidden', tab !== 'track');
    document.getElementById('tab-recent').classList.toggle('hidden', tab !== 'recent');
  }

  function analyzeComplaint() {
    const desc = document.getElementById('comp-desc').value.trim();
    const location = document.getElementById('comp-location').value.trim();
    if (!desc) {
      App.showToast('Please enter a complaint description.', 'warning');
      return;
    }
    const analysis = AIEngine.analyzeComplaint(desc, location);
    const deptName = AIEngine.getDepartmentName(analysis.category);
    const preview = document.getElementById('ai-analysis-preview');
    const content = document.getElementById('ai-analysis-content');
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); font-size: var(--text-sm);">
        <div><span style="color: var(--text-muted);">Category:</span> <strong>${analysis.category}</strong></div>
        <div><span style="color: var(--text-muted);">Department:</span> <strong>${deptName}</strong></div>
        <div><span style="color: var(--text-muted);">Priority:</span> <span class="badge badge-${analysis.priority.toLowerCase()}">${analysis.priority}</span></div>
        <div><span style="color: var(--text-muted);">Urgency Score:</span> <strong style="color: var(--accent-secondary);">${analysis.urgencyScore}/100</strong></div>
        <div><span style="color: var(--text-muted);">Confidence:</span> <strong>${analysis.confidence}%</strong></div>
        ${analysis.locationBoost ? '<div><span class="badge badge-high"><i class="fa-solid fa-location-dot"></i> Location Priority Boost</span></div>' : ''}
      </div>
    `;
    preview.classList.remove('hidden');
  }

  function submitComplaint() {
    const mobile = document.getElementById('comp-mobile').value.trim();
    const desc = document.getElementById('comp-desc').value.trim();
    const location = document.getElementById('comp-location').value.trim();
    const ward = document.getElementById('comp-ward').value;

    if (!mobile) {
      App.showToast('Please enter your mobile number.', 'warning');
      return;
    }
    if (!desc) {
      App.showToast('Please describe your complaint.', 'warning');
      return;
    }

    const analysis = AIEngine.analyzeComplaint(desc, location);
    const lat = document.getElementById('comp-lat').value || null;
    const lng = document.getElementById('comp-lng').value || null;
    const complaint = Store.addComplaint({
      mobile: mobile,
      description: desc,
      location: location || 'Not specified',
      ward: ward || undefined,
      category: analysis.category,
      department: analysis.department,
      priority: analysis.priority,
      urgencyScore: analysis.urgencyScore,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });

    // Show success modal
    showSubmissionSuccess(complaint);
    
    // Clear form
    document.getElementById('comp-mobile').value = '';
    document.getElementById('comp-desc').value = '';
    document.getElementById('comp-location').value = '';
    document.getElementById('comp-lat').value = '';
    document.getElementById('comp-lng').value = '';
    document.getElementById('comp-ward').value = '';
    document.getElementById('ai-analysis-preview').classList.add('hidden');
    const imgPreview = document.getElementById('comp-image-preview');
    if (imgPreview) { imgPreview.innerHTML = ''; imgPreview.classList.add('hidden'); }
  }

  function showSubmissionSuccess(complaint) {
    const deptName = AIEngine.getDepartmentName(complaint.category);
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i> Complaint Registered</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body" style="text-align: center;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-5);">
          <i class="fa-solid fa-check" style="font-size: 2rem; color: var(--accent-emerald);"></i>
        </div>
        <h3 style="color: var(--text-primary); margin-bottom: var(--space-2);">Complaint Submitted Successfully!</h3>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">Your complaint has been registered and will be processed shortly.</p>
        <div class="card" style="text-align: left; border-left: 3px solid var(--accent-emerald);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); font-size: var(--text-sm);">
            <div><span style="color: var(--text-muted);">Complaint ID:</span><br><strong class="complaint-id" style="font-size: var(--text-lg);">${complaint.id}</strong></div>
            <div><span style="color: var(--text-muted);">Status:</span><br><span class="badge badge-submitted">Submitted</span></div>
            <div><span style="color: var(--text-muted);">Category:</span><br><strong>${complaint.category}</strong></div>
            <div><span style="color: var(--text-muted);">Department:</span><br><strong>${deptName}</strong></div>
            <div><span style="color: var(--text-muted);">Priority:</span><br><span class="badge badge-${complaint.priority.toLowerCase()}">${complaint.priority}</span></div>
            <div><span style="color: var(--text-muted);">Filed:</span><br><strong>${new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-4);">
          <i class="fa-solid fa-info-circle"></i> Save your Complaint ID for future tracking
        </p>
      </div>
    `;
    overlay.classList.add('active');
  }

  function trackComplaint() {
    const mobile = document.getElementById('track-mobile').value.trim();
    const compId = document.getElementById('track-id').value.trim();
    if (!mobile && !compId) {
      App.showToast('Please enter mobile number or complaint ID.', 'warning');
      return;
    }
    const results = Store.searchComplaint(
      mobile.replace(/\D/g, '').length === 10 ? mobile.replace(/\D/g, '') : null,
      compId || null
    );

    const container = document.getElementById('track-results');
    if (results.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding: var(--space-6);"><i class="fa-solid fa-search"></i><h3>No complaints found</h3><p>Please check your mobile number or complaint ID and try again.</p></div>`;
      return;
    }
    container.innerHTML = results.map(c => renderComplaintCard(c)).join('');
  }

  function renderComplaintCard(c) {
    const statusSteps = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
    const currentIdx = statusSteps.indexOf(c.status);
    const deptName = (Store.getDepartment(c.department) || {}).name || 'N/A';
    return `
      <div class="card" style="margin-bottom: var(--space-4); border-left: 3px solid var(--status-${c.status.toLowerCase().replace(/\s/g, '')});">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-3);">
          <div>
            <span class="complaint-id" style="font-size: var(--text-lg);">${c.id}</span>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1);">${c.description.substring(0, 100)}...</p>
          </div>
          <span class="badge badge-${c.status.toLowerCase().replace(/\s/g, '')}">${c.status}</span>
        </div>
        <div class="status-timeline">
          ${statusSteps.map((step, i) => `
            <div class="timeline-step ${i < currentIdx ? 'completed' : ''} ${i === currentIdx ? 'active' : ''}">
              <div class="timeline-dot">
                ${i < currentIdx ? '<i class="fa-solid fa-check"></i>' : (i === currentIdx ? '<i class="fa-solid fa-clock"></i>' : (i + 1))}
              </div>
              <span class="timeline-label">${step}</span>
            </div>
          `).join('')}
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-top: var(--space-3); font-size: var(--text-sm);">
          <div><span style="color: var(--text-muted);">Category:</span> ${c.category}</div>
          <div><span style="color: var(--text-muted);">Department:</span> ${deptName}</div>
          <div><span style="color: var(--text-muted);">Priority:</span> <span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></div>
        </div>
        ${c.resolutionNote ? `<div style="margin-top: var(--space-3); padding: var(--space-3); background: rgba(16, 185, 129, 0.08); border-radius: var(--border-radius-md); font-size: var(--text-sm);"><i class="fa-solid fa-check-circle" style="color: var(--accent-emerald);"></i> <strong>Resolution:</strong> ${c.resolutionNote}</div>` : ''}
      </div>
    `;
  }

  function showComplaintDetail(id) {
    const c = Store.getComplaint(id);
    if (!c) return;
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-file-lines"></i> ${c.id}</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        ${renderComplaintCard(c)}
      </div>
    `;
    overlay.classList.add('active');
  }

  function openChatbot() {
    App.toggleChatbot(true);
  }

  function openVoice() {
    App.openVoiceModal();
  }

  function showForm() {
    switchTab('form');
    document.getElementById('comp-desc').focus();
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('comp-image-preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle);">`;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  // ── Leaflet Map Location Picker ──
  let locationMap = null;
  let locationMarker = null;

  function initLocationMap() {
    setTimeout(() => {
      const mapEl = document.getElementById('location-map');
      if (!mapEl || typeof L === 'undefined') return;
      if (locationMap) { locationMap.remove(); locationMap = null; }

      locationMap = L.map('location-map').setView([17.385, 78.4867], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(locationMap);

      locationMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (locationMarker) {
          locationMarker.setLatLng(e.latlng);
        } else {
          locationMarker = L.marker(e.latlng, {
            icon: L.divIcon({
              className: 'location-pin',
              html: '<i class="fa-solid fa-location-dot" style="font-size: 28px; color: #dc2626;"></i>',
              iconSize: [28, 28],
              iconAnchor: [14, 28],
            })
          }).addTo(locationMap);
        }
        document.getElementById('comp-lat').value = lat.toFixed(6);
        document.getElementById('comp-lng').value = lng.toFixed(6);
        reverseGeocode(lat, lng);
      });

      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          locationMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
        }, () => { /* ignore errors */ });
      }
    }, 200);
  }

  function reverseGeocode(lat, lng) {
    const locationInput = document.getElementById('comp-location');
    locationInput.value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Loading...)`;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data.display_name) {
          const short = data.display_name.split(',').slice(0, 3).join(', ');
          locationInput.value = short;
        } else {
          locationInput.value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }
      })
      .catch(() => {
        locationInput.value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      });
  }

  return { render, switchTab, analyzeComplaint, submitComplaint, trackComplaint, showComplaintDetail, openChatbot, openVoice, showForm, handleImageUpload, initLocationMap };
})();
