/* ============================================
   PrajaNetra AI - Firebase Integration Module
   Firestore CRUD + Auth
   ============================================ */

const FirebaseService = (() => {
  let db = null;
  let isInitialized = false;

  // ── Firebase Config ──
  const firebaseConfig = {
    apiKey: "AIzaSyACOSNM9CKyiUnTCV250jAY9ObARI0pxNw",
    authDomain: "prajanetra-47b4d.firebaseapp.com",
    projectId: "prajanetra-47b4d",
    storageBucket: "prajanetra-47b4d.firebasestorage.app",
    messagingSenderId: "759732980057",
    appId: "1:759732980057:web:4946b959d75fb6928f2448",
    measurementId: "G-5R15GYNZF2"
  };

  // ── Hardcoded Officer Credentials ──
  const credentials = {
    officer: [
      { username: 'officer1', password: 'officer123', name: 'Rajesh Kumar', role: 'officer', department: 'water', ward: 'Ward 5' },
      { username: 'officer2', password: 'officer123', name: 'Sunita Devi', role: 'officer', department: 'roads', ward: 'Ward 12' },
      { username: 'officer3', password: 'officer123', name: 'Anil Reddy', role: 'officer', department: 'sanitation', ward: 'Ward 8' },
    ],
    corporator: [
      { username: 'corporator1', password: 'corp123', name: 'Srinivas Rao', role: 'corporator', ward: 'Ward 5' },
      { username: 'corporator2', password: 'corp123', name: 'Lakshmi Bai', role: 'corporator', ward: 'Ward 12' },
    ],
    tahsildar: [
      { username: 'tahsildar1', password: 'tahs123', name: 'Venkat Rao', role: 'tahsildar', zone: 'Zone A' },
      { username: 'tahsildar2', password: 'tahs123', name: 'Priya Sharma', role: 'tahsildar', zone: 'Zone B' },
    ],
    collector: [
      { username: 'collector', password: 'collector123', name: 'Dr. S. Narasimha', role: 'collector' },
    ],
    admin: [
      { username: 'admin', password: 'admin123', name: 'System Administrator', role: 'admin' },
    ],
  };

  let currentUser = null;

  // ── Initialize Firebase ──
  function init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Running in offline mode.');
        return false;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      isInitialized = true;
      console.log('✅ Firebase initialized successfully');
      return true;
    } catch (err) {
      console.error('Firebase init error:', err);
      return false;
    }
  }

  // ── Auth ──
  function login(username, password) {
    const allCreds = Object.values(credentials).flat();
    const user = allCreds.find(c => c.username === username && c.password === password);
    if (user) {
      currentUser = { ...user };
      localStorage.setItem('prajanetra_user', JSON.stringify(currentUser));
      return { success: true, user: currentUser };
    }
    return { success: false, error: 'Invalid username or password' };
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem('prajanetra_user');
  }

  function getCurrentUser() {
    if (!currentUser) {
      const stored = localStorage.getItem('prajanetra_user');
      if (stored) {
        try { currentUser = JSON.parse(stored); } catch (e) { /* ignore */ }
      }
    }
    return currentUser;
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function getCredentials() {
    return credentials;
  }

  // ── Firestore: Complaints ──
  async function saveComplaint(complaint) {
    if (!isInitialized || !db) {
      console.warn('Firebase not available, saving locally only.');
      return null;
    }
    try {
      const docRef = db.collection('complaints').doc(complaint.id);
      await docRef.set({
        ...complaint,
        createdAt: complaint.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Complaint saved to Firestore:', complaint.id);
      return complaint.id;
    } catch (err) {
      console.error('Firestore save error:', err);
      return null;
    }
  }

  async function updateComplaint(id, updates) {
    if (!isInitialized || !db) return null;
    try {
      await db.collection('complaints').doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Complaint updated in Firestore:', id);
      return true;
    } catch (err) {
      console.error('Firestore update error:', err);
      return null;
    }
  }

  async function loadComplaints() {
    if (!isInitialized || !db) return [];
    try {
      const snapshot = await db.collection('complaints').orderBy('createdAt', 'desc').get();
      const complaints = [];
      snapshot.forEach(doc => complaints.push(doc.data()));
      console.log(`✅ Loaded ${complaints.length} complaints from Firestore`);
      return complaints;
    } catch (err) {
      console.error('Firestore load error:', err);
      return [];
    }
  }

  async function deleteComplaint(id) {
    if (!isInitialized || !db) return null;
    try {
      await db.collection('complaints').doc(id).delete();
      return true;
    } catch (err) {
      console.error('Firestore delete error:', err);
      return null;
    }
  }

  // ── Firestore: Activity Log ──
  async function logActivity(activity) {
    if (!isInitialized || !db) return;
    try {
      await db.collection('activity').add({
        ...activity,
        time: activity.time || new Date().toISOString(),
      });
    } catch (err) {
      console.error('Activity log error:', err);
    }
  }

  // ── Sync: Upload local data to Firestore ──
  async function syncLocalToFirestore() {
    if (!isInitialized || !db) return;
    const localComplaints = Store.getComplaints();
    let synced = 0;
    for (const c of localComplaints) {
      try {
        await db.collection('complaints').doc(c.id).set(c, { merge: true });
        synced++;
      } catch (err) {
        console.error('Sync error for', c.id, err);
      }
    }
    console.log(`✅ Synced ${synced}/${localComplaints.length} complaints to Firestore`);
    return synced;
  }

  // ── Sync: Download from Firestore to local ──
  async function syncFirestoreToLocal() {
    if (!isInitialized || !db) return;
    const remoteComplaints = await loadComplaints();
    if (remoteComplaints.length > 0) {
      Store.mergeComplaints(remoteComplaints);
      console.log(`✅ Merged ${remoteComplaints.length} complaints from Firestore`);
    }
  }

  return {
    init, isInitialized: () => isInitialized,
    login, logout, getCurrentUser, isLoggedIn, getCredentials,
    saveComplaint, updateComplaint, loadComplaints, deleteComplaint,
    logActivity, syncLocalToFirestore, syncFirestoreToLocal,
  };
})();
