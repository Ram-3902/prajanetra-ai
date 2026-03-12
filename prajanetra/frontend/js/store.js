/* ============================================
   PrajaNetra AI - Data Store
   Centralized client-side data with localStorage
   ============================================ */

const Store = (() => {
  const STORAGE_KEY = 'prajanetra_data';

  // ── Departments ──
  const defaultDepartments = [
    { id: 'DEPT01', name: 'Municipal Sanitation Department', shortName: 'Sanitation', icon: 'fa-broom', color: '#10b981' },
    { id: 'DEPT02', name: 'Roads & Infrastructure Department', shortName: 'Roads', icon: 'fa-road', color: '#3b82f6' },
    { id: 'DEPT03', name: 'Streetlight Maintenance Department', shortName: 'Streetlights', icon: 'fa-lightbulb', color: '#f59e0b' },
    { id: 'DEPT04', name: 'Water Supply Department', shortName: 'Water Supply', icon: 'fa-droplet', color: '#06b6d4' },
    { id: 'DEPT05', name: 'Drainage & Sewage Department', shortName: 'Drainage', icon: 'fa-water', color: '#8b5cf6' },
    { id: 'DEPT06', name: 'Public Safety Department', shortName: 'Public Safety', icon: 'fa-shield-halved', color: '#ef4444' },
  ];

  // ── Officers ──
  const defaultOfficers = [
    { id: 'OFF01', name: 'Venkata Ramesh', role: 'officer', department: 'DEPT01', ward: 'Ward 12', phone: '9876543210', active: true },
    { id: 'OFF02', name: 'Priya Sharma', role: 'officer', department: 'DEPT02', ward: 'Ward 5', phone: '9876543211', active: true },
    { id: 'OFF03', name: 'Ravi Kumar', role: 'officer', department: 'DEPT03', ward: 'Ward 8', phone: '9876543212', active: true },
    { id: 'OFF04', name: 'Lakshmi Devi', role: 'officer', department: 'DEPT04', ward: 'Ward 3', phone: '9876543213', active: true },
    { id: 'OFF05', name: 'Suresh Reddy', role: 'officer', department: 'DEPT05', ward: 'Ward 15', phone: '9876543214', active: true },
    { id: 'OFF06', name: 'Anjali Rao', role: 'officer', department: 'DEPT06', ward: 'Ward 1', phone: '9876543215', active: true },
    { id: 'OFF07', name: 'Kiran Patel', role: 'corporator', department: null, ward: 'Ward 12', phone: '9876543216', active: true },
    { id: 'OFF08', name: 'Sita Naidu', role: 'corporator', department: null, ward: 'Ward 5', phone: '9876543217', active: true },
    { id: 'OFF09', name: 'Rajesh Gupta', role: 'tahsildar', department: null, ward: 'Zone A', phone: '9876543218', active: true },
    { id: 'OFF10', name: 'Collector Sharma', role: 'collector', department: null, ward: 'District HQ', phone: '9876543219', active: true },
  ];

  // ── Wards ──
  const wards = [
    'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
    'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10',
    'Ward 11', 'Ward 12', 'Ward 13', 'Ward 14', 'Ward 15'
  ];

  const zones = {
    'Zone A': ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'],
    'Zone B': ['Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10'],
    'Zone C': ['Ward 11', 'Ward 12', 'Ward 13', 'Ward 14', 'Ward 15'],
  };

  // ── Seed Complaints ──
  const seedComplaints = [
    {
      id: 'PRN-2026-0001', mobile: '9001234567', description: 'Garbage not collected for 3 days near City Hospital, causing severe health hazard and bad smell.', category: 'Sanitation', department: 'DEPT01', priority: 'High', urgencyScore: 85,
      status: 'Resolved', ward: 'Ward 12', location: 'City Hospital Area', lat: 17.4400, lng: 78.4983, assignedTo: 'OFF01', createdAt: '2026-02-15T08:30:00', resolvedAt: '2026-02-17T14:20:00',
      resolutionNote: 'Area cleaned and sanitized by sanitation team.', image: null
    },
    {
      id: 'PRN-2026-0002', mobile: '9001234568', description: 'Large pothole on main road near Jubilee Bus Station causing vehicle damage.', category: 'Road Infrastructure', department: 'DEPT02', priority: 'Critical', urgencyScore: 92,
      status: 'In Progress', ward: 'Ward 5', location: 'Jubilee Bus Station Road', lat: 17.4530, lng: 78.4710, assignedTo: 'OFF02', createdAt: '2026-02-18T10:15:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0003', mobile: '9001234569', description: 'Street lights not working on entire stretch of MG Road for a week.', category: 'Streetlights', department: 'DEPT03', priority: 'Medium', urgencyScore: 55,
      status: 'Assigned', ward: 'Ward 8', location: 'MG Road', lat: 17.4380, lng: 78.4840, assignedTo: 'OFF03', createdAt: '2026-02-20T16:45:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0004', mobile: '9001234570', description: 'No water supply since yesterday morning in the entire colony near Government School.', category: 'Water Supply', department: 'DEPT04', priority: 'High', urgencyScore: 80,
      status: 'In Progress', ward: 'Ward 3', location: 'Srinagar Colony', lat: 17.4450, lng: 78.5090, assignedTo: 'OFF04', createdAt: '2026-02-22T07:00:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0005', mobile: '9001234571', description: 'Drain overflowing near residential area, sewage water entering houses.', category: 'Drainage', department: 'DEPT05', priority: 'Critical', urgencyScore: 95,
      status: 'Submitted', ward: 'Ward 15', location: 'Laxmi Nagar', lat: 17.4250, lng: 78.4650, assignedTo: null, createdAt: '2026-02-25T09:30:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0006', mobile: '9001234572', description: 'Stray dog menace near children park in Ward 1, multiple attacks reported.', category: 'Public Safety', department: 'DEPT06', priority: 'High', urgencyScore: 78,
      status: 'Assigned', ward: 'Ward 1', location: 'Nehru Park', lat: 17.4600, lng: 78.4750, assignedTo: 'OFF06', createdAt: '2026-02-26T11:20:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0007', mobile: '9001234573', description: 'Broken water pipeline leaking gallons of water on the road near railway station.', category: 'Water Supply', department: 'DEPT04', priority: 'Critical', urgencyScore: 90,
      status: 'Resolved', ward: 'Ward 5', location: 'Railway Station Road', lat: 17.4340, lng: 78.5010, assignedTo: 'OFF04', createdAt: '2026-03-01T06:00:00', resolvedAt: '2026-03-02T18:30:00',
      resolutionNote: 'Pipeline repaired and water restored.', image: null
    },
    {
      id: 'PRN-2026-0008', mobile: '9001234574', description: 'Garbage dump near school creating health issues for children.', category: 'Sanitation', department: 'DEPT01', priority: 'High', urgencyScore: 88,
      status: 'In Progress', ward: 'Ward 12', location: 'Government High School', lat: 17.4420, lng: 78.4920, assignedTo: 'OFF01', createdAt: '2026-03-02T08:45:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0009', mobile: '9001234575', description: 'Road badly damaged due to recent rains, making it impossible for vehicles to pass.', category: 'Road Infrastructure', department: 'DEPT02', priority: 'Medium', urgencyScore: 60,
      status: 'Submitted', ward: 'Ward 8', location: 'Old City Road', lat: 17.4490, lng: 78.4880, assignedTo: null, createdAt: '2026-03-04T14:30:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0010', mobile: '9001234576', description: 'Open manhole cover missing on public footpath, serious risk for pedestrians.', category: 'Drainage', department: 'DEPT05', priority: 'Critical', urgencyScore: 93,
      status: 'Assigned', ward: 'Ward 3', location: 'Market Road', lat: 17.4370, lng: 78.5050, assignedTo: 'OFF05', createdAt: '2026-03-05T10:00:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0011', mobile: '9001234577', description: 'Multiple streetlights flickering on and off near Collectorate building.', category: 'Streetlights', department: 'DEPT03', priority: 'High', urgencyScore: 72,
      status: 'Resolved', ward: 'Ward 1', location: 'Collectorate Road', lat: 17.4550, lng: 78.4800, assignedTo: 'OFF03', createdAt: '2026-03-06T17:15:00', resolvedAt: '2026-03-08T09:00:00',
      resolutionNote: 'All faulty lights replaced with LED fixtures.', image: null
    },
    {
      id: 'PRN-2026-0012', mobile: '9001234578', description: 'Illegal dumping of construction waste blocking drainage channel.', category: 'Drainage', department: 'DEPT05', priority: 'Medium', urgencyScore: 58,
      status: 'In Progress', ward: 'Ward 15', location: 'Industrial Area', lat: 17.4280, lng: 78.4690, assignedTo: 'OFF05', createdAt: '2026-03-07T09:20:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0013', mobile: '9001234579', description: 'Water contamination reported in Ward 12, residents falling ill.', category: 'Water Supply', department: 'DEPT04', priority: 'Critical', urgencyScore: 97,
      status: 'In Progress', ward: 'Ward 12', location: 'Ambedkar Colony', lat: 17.4410, lng: 78.4960, assignedTo: 'OFF04', createdAt: '2026-03-08T07:30:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0014', mobile: '9001234580', description: 'Broken road divider causing traffic confusion near bus stop.', category: 'Road Infrastructure', department: 'DEPT02', priority: 'Low', urgencyScore: 35,
      status: 'Submitted', ward: 'Ward 8', location: 'Central Bus Stop', lat: 17.4510, lng: 78.4850, assignedTo: null, createdAt: '2026-03-09T12:00:00', resolvedAt: null,
      resolutionNote: null, image: null
    },
    {
      id: 'PRN-2026-0015', mobile: '9001234581', description: 'Uncollected trash overflowing from community bins near Tahsildar office.', category: 'Sanitation', department: 'DEPT01', priority: 'Medium', urgencyScore: 50,
      status: 'Resolved', ward: 'Ward 5', location: 'Tahsildar Office Area', lat: 17.4460, lng: 78.4740, assignedTo: 'OFF01', createdAt: '2026-03-10T08:00:00', resolvedAt: '2026-03-11T16:00:00',
      resolutionNote: 'Extra collection vehicles deployed. Bins sanitized.', image: null
    },
  ];

  let data = null;

  // ── Load/Save ──
  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        data = JSON.parse(stored);
        // Ensure structure
        if (!data.complaints || !data.departments || !data.officers) {
          data = getDefaultData();
        }
      } else {
        data = getDefaultData();
      }
    } catch (e) {
      data = getDefaultData();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('PrajaNetra: localStorage save error', e);
    }
  }

  function getDefaultData() {
    return {
      complaints: [...seedComplaints],
      departments: [...defaultDepartments],
      officers: [...defaultOfficers],
      complaintCounter: 15,
      activityLog: [
        { id: 1, text: 'Complaint PRN-2026-0015 resolved by Sanitation Dept', type: 'resolved', time: '2026-03-11T16:00:00' },
        { id: 2, text: 'Complaint PRN-2026-0013 escalated to Critical priority', type: 'escalation', time: '2026-03-08T07:30:00' },
        { id: 3, text: 'New complaint PRN-2026-0014 submitted for Road Infrastructure', type: 'new', time: '2026-03-09T12:00:00' },
        { id: 4, text: 'Officer Ravi Kumar resolved Streetlight issue in Ward 1', type: 'resolved', time: '2026-03-08T09:00:00' },
        { id: 5, text: 'Water contamination alert raised for Ward 12', type: 'alert', time: '2026-03-08T07:30:00' },
      ],
    };
  }

  // ── Complaints CRUD ──
  function generateId() {
    data.complaintCounter++;
    save();
    return `PRN-2026-${String(data.complaintCounter).padStart(4, '0')}`;
  }

  function addComplaint(complaint) {
    const id = generateId();
    const record = {
      id,
      mobile: complaint.mobile || '',
      description: complaint.description || '',
      category: complaint.category || 'Uncategorized',
      department: complaint.department || null,
      priority: complaint.priority || 'Medium',
      urgencyScore: complaint.urgencyScore || 50,
      status: 'Submitted',
      ward: complaint.ward || wards[Math.floor(Math.random() * wards.length)],
      location: complaint.location || 'Unknown',
      lat: complaint.lat || (17.43 + Math.random() * 0.04),
      lng: complaint.lng || (78.46 + Math.random() * 0.06),
      assignedTo: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolutionNote: null,
      image: complaint.image || null,
    };
    data.complaints.unshift(record);
    addActivity(`New complaint ${id} submitted: ${record.category}`, 'new');
    save();
    // Sync to Firestore
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isInitialized()) {
      FirebaseService.saveComplaint(record);
    }
    return record;
  }

  function updateComplaint(id, updates) {
    const idx = data.complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    Object.assign(data.complaints[idx], updates);
    if (updates.status === 'Resolved') {
      data.complaints[idx].resolvedAt = new Date().toISOString();
      addActivity(`Complaint ${id} resolved`, 'resolved');
    } else if (updates.status) {
      addActivity(`Complaint ${id} status updated to ${updates.status}`, 'update');
    }
    if (updates.assignedTo && !data.complaints[idx].assignedTo) {
      addActivity(`Complaint ${id} assigned to officer`, 'assigned');
    }
    save();
    // Sync to Firestore
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isInitialized()) {
      FirebaseService.updateComplaint(id, updates);
    }
    return data.complaints[idx];
  }

  function getComplaint(id) {
    return data.complaints.find(c => c.id === id) || null;
  }

  function getComplaints(filters = {}) {
    let results = [...data.complaints];
    if (filters.status) results = results.filter(c => c.status === filters.status);
    if (filters.category) results = results.filter(c => c.category === filters.category);
    if (filters.department) results = results.filter(c => c.department === filters.department);
    if (filters.ward) results = results.filter(c => c.ward === filters.ward);
    if (filters.priority) results = results.filter(c => c.priority === filters.priority);
    if (filters.assignedTo) results = results.filter(c => c.assignedTo === filters.assignedTo);
    if (filters.mobile) results = results.filter(c => c.mobile === filters.mobile);
    if (filters.wards) results = results.filter(c => filters.wards.includes(c.ward));
    return results;
  }

  function searchComplaint(mobile, complaintId) {
    return data.complaints.filter(c =>
      (mobile && c.mobile === mobile) ||
      (complaintId && c.id.toUpperCase() === complaintId.toUpperCase())
    );
  }

  // ── Department CRUD ──
  function getDepartments() { return [...data.departments]; }
  function getDepartment(id) { return data.departments.find(d => d.id === id) || null; }

  function addDepartment(dept) {
    const id = 'DEPT' + String(data.departments.length + 1).padStart(2, '0');
    data.departments.push({ id, ...dept });
    save();
    return data.departments[data.departments.length - 1];
  }

  function updateDepartment(id, updates) {
    const idx = data.departments.findIndex(d => d.id === id);
    if (idx === -1) return null;
    Object.assign(data.departments[idx], updates);
    save();
    return data.departments[idx];
  }

  function deleteDepartment(id) {
    data.departments = data.departments.filter(d => d.id !== id);
    save();
  }

  // ── Officer CRUD ──
  function getOfficers(filters = {}) {
    let results = [...data.officers];
    if (filters.role) results = results.filter(o => o.role === filters.role);
    if (filters.department) results = results.filter(o => o.department === filters.department);
    if (filters.ward) results = results.filter(o => o.ward === filters.ward);
    return results;
  }

  function getOfficer(id) { return data.officers.find(o => o.id === id) || null; }

  function addOfficer(officer) {
    const id = 'OFF' + String(data.officers.length + 1).padStart(2, '0');
    data.officers.push({ id, active: true, ...officer });
    save();
    return data.officers[data.officers.length - 1];
  }

  function updateOfficer(id, updates) {
    const idx = data.officers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    Object.assign(data.officers[idx], updates);
    save();
    return data.officers[idx];
  }

  function deleteOfficer(id) {
    data.officers = data.officers.filter(o => o.id !== id);
    save();
  }

  // ── Activity Log ──
  function addActivity(text, type = 'info') {
    if (!data.activityLog) data.activityLog = [];
    data.activityLog.unshift({
      id: Date.now(),
      text,
      type,
      time: new Date().toISOString(),
    });
    if (data.activityLog.length > 50) data.activityLog = data.activityLog.slice(0, 50);
  }

  function getActivity(limit = 10) {
    return (data.activityLog || []).slice(0, limit);
  }

  // ── Stats ──
  function getStats() {
    const complaints = data.complaints;
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status !== 'Resolved').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    const critical = complaints.filter(c => c.priority === 'Critical').length;
    const high = complaints.filter(c => c.priority === 'High').length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Avg resolution time (hours)
    const resolvedComplaints = complaints.filter(c => c.resolvedAt && c.createdAt);
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        return sum + (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    // Per-department stats
    const deptStats = {};
    data.departments.forEach(d => {
      const deptComplaints = complaints.filter(c => c.department === d.id);
      const deptResolved = deptComplaints.filter(c => c.status === 'Resolved').length;
      deptStats[d.id] = {
        total: deptComplaints.length,
        resolved: deptResolved,
        pending: deptComplaints.length - deptResolved,
        rate: deptComplaints.length > 0 ? Math.round((deptResolved / deptComplaints.length) * 100) : 0,
      };
    });

    // Category distribution
    const categoryDist = {};
    complaints.forEach(c => {
      categoryDist[c.category] = (categoryDist[c.category] || 0) + 1;
    });

    // Ward distribution
    const wardDist = {};
    complaints.forEach(c => {
      wardDist[c.ward] = (wardDist[c.ward] || 0) + 1;
    });

    return { total, resolved, pending, inProgress, submitted, assigned, critical, high, resolutionRate, avgResolutionHours, deptStats, categoryDist, wardDist };
  }

  // ── Accessors ──
  function getWards() { return [...wards]; }
  function getZones() { return { ...zones }; }

  // ── Reset ──
  function resetData() {
    data = getDefaultData();
    save();
  }

  // ── Merge (for Firebase sync) ──
  function mergeComplaints(remoteComplaints) {
    const existingIds = new Set(data.complaints.map(c => c.id));
    let added = 0;
    for (const rc of remoteComplaints) {
      if (!existingIds.has(rc.id)) {
        data.complaints.push(rc);
        added++;
      } else {
        // Update local with remote if remote is newer
        const localIdx = data.complaints.findIndex(c => c.id === rc.id);
        if (localIdx !== -1 && rc.updatedAt && data.complaints[localIdx].updatedAt) {
          if (new Date(rc.updatedAt) > new Date(data.complaints[localIdx].updatedAt)) {
            Object.assign(data.complaints[localIdx], rc);
          }
        }
      }
    }
    // Sort by createdAt desc
    data.complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    save();
    return added;
  }

  // Initialize
  load();

  return {
    addComplaint, updateComplaint, getComplaint, getComplaints, searchComplaint, generateId,
    getDepartments, getDepartment, addDepartment, updateDepartment, deleteDepartment,
    getOfficers, getOfficer, addOfficer, updateOfficer, deleteOfficer,
    getActivity, addActivity,
    getStats, getWards, getZones,
    resetData, mergeComplaints,
  };
})();
