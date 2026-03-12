/* ============================================
   PrajaNetra AI - Main Application Controller
   SPA Router, Sidebar, Header, Utilities
   ============================================ */

const App = (() => {
  let currentView = 'citizen';
  let currentRole = 'citizen';
  let clockInterval = null;
  let chatbotOpen = false;

  // ── Route Map ──
  const routes = {
    citizen: { title: 'Citizen Portal', icon: 'fa-users', render: () => CitizenView.render(), init: () => CitizenView.initLocationMap(), destroy: null },
    officer: { title: 'Officer Dashboard', icon: 'fa-user-shield', render: () => OfficerView.render(), init: null, destroy: null },
    corporator: { title: 'Corporator Dashboard', icon: 'fa-landmark', render: () => CorporatorView.render(), init: null, destroy: null },
    tahsildar: { title: 'Tahsildar Dashboard', icon: 'fa-building-columns', render: () => TahsildarView.render(), init: null, destroy: null },
    collector: { title: 'Command Center', icon: 'fa-chess-king', render: () => CollectorView.render(), init: () => CollectorView.initCharts(), destroy: () => CollectorView.destroy() },
    admin: { title: 'Admin Panel', icon: 'fa-gear', render: () => AdminView.render(), init: null, destroy: null },
    analytics: { title: 'Civic Analytics', icon: 'fa-chart-line', render: () => AnalyticsView.render(), init: () => AnalyticsView.initCharts(), destroy: () => AnalyticsView.destroy() },
  };

  // ── Role-based Navigation ──
  const roleNavItems = {
    citizen: [
      { section: 'Citizen Services', items: [
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
    officer: [
      { section: 'Officer Workspace', items: [
        { id: 'officer', icon: 'fa-user-shield', label: 'My Dashboard' },
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
    corporator: [
      { section: 'Corporator Workspace', items: [
        { id: 'corporator', icon: 'fa-landmark', label: 'Ward Dashboard' },
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
    tahsildar: [
      { section: 'Tahsildar Workspace', items: [
        { id: 'tahsildar', icon: 'fa-building-columns', label: 'Zone Dashboard' },
        { id: 'officer', icon: 'fa-user-shield', label: 'Officer View' },
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
    collector: [
      { section: 'Collector Command', items: [
        { id: 'collector', icon: 'fa-chess-king', label: 'Command Center' },
        { id: 'analytics', icon: 'fa-chart-line', label: 'Civic Analytics' },
        { id: 'tahsildar', icon: 'fa-building-columns', label: 'Tahsildar View' },
        { id: 'officer', icon: 'fa-user-shield', label: 'Officer View' },
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
    admin: [
      { section: 'Administration', items: [
        { id: 'admin', icon: 'fa-gear', label: 'Admin Panel' },
      ]},
      { section: 'All Dashboards', items: [
        { id: 'collector', icon: 'fa-chess-king', label: 'Command Center' },
        { id: 'analytics', icon: 'fa-chart-line', label: 'Civic Analytics' },
        { id: 'tahsildar', icon: 'fa-building-columns', label: 'Tahsildar' },
        { id: 'corporator', icon: 'fa-landmark', label: 'Corporator' },
        { id: 'officer', icon: 'fa-user-shield', label: 'Officer' },
        { id: 'citizen', icon: 'fa-users', label: 'Citizen Portal' },
      ]},
    ],
  };

  // ── Init ──
  function init() {
    // Initialize Firebase
    FirebaseService.init();

    // Check if user is already logged in
    const user = FirebaseService.getCurrentUser();
    if (user) {
      currentRole = user.role;
      enterApp();
      // Sync from Firestore in background
      FirebaseService.syncFirestoreToLocal().catch(() => {});
    } else {
      // Show login screen
      showLoginScreen();
    }
  }

  function enterApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';

    const user = FirebaseService.getCurrentUser();
    if (user) {
      document.getElementById('user-info').style.display = 'block';
      document.getElementById('user-display-name').textContent = user.name;
      document.getElementById('role-selector-logged-in').style.display = 'none';
    } else {
      document.getElementById('user-info').style.display = 'none';
      document.getElementById('role-selector-logged-in').style.display = 'flex';
    }

    renderSidebar();
    startClock();
    setupRoleSelector();
    navigateTo(getDefaultViewForRole(currentRole));
    setupModalClose();
  }

  function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
  }

  function getDefaultViewForRole(role) {
    const defaults = { citizen: 'citizen', officer: 'officer', corporator: 'corporator', tahsildar: 'tahsildar', collector: 'collector', admin: 'admin' };
    return defaults[role] || 'citizen';
  }

  // ── Sidebar ──
  function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    const sections = roleNavItems[currentRole] || roleNavItems.citizen;
    const stats = Store.getStats();
    nav.innerHTML = sections.map(section => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${section.section}</div>
        <div class="sidebar-nav">
          ${section.items.map(item => `
            <div class="nav-item ${currentView === item.id ? 'active' : ''}" onclick="App.navigateTo('${item.id}')" id="nav-${item.id}">
              <i class="fa-solid ${item.icon}"></i>
              <span>${item.label}</span>
              ${item.id === 'officer' && stats.pending > 0 ? `<span class="nav-badge">${stats.pending}</span>` : ''}
              ${item.id === 'collector' && stats.critical > 0 ? `<span class="nav-badge" style="background: var(--priority-critical);">${stats.critical}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // ── Navigation ──
  function navigateTo(viewId) {
    const route = routes[viewId];
    if (!route) return;

    // Destroy previous
    const prevRoute = routes[currentView];
    if (prevRoute && prevRoute.destroy) prevRoute.destroy();

    currentView = viewId;
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = route.render();

    // Init new view
    if (route.init) route.init();

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update header
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.textContent = route.title;

    const breadcrumb = document.getElementById('header-breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML = `<span>PrajaNetra AI</span><span class="sep">/</span><span>${route.title}</span>`;
    }

    // Update hash
    window.location.hash = viewId;
  }

  // ── Clock ──
  function startClock() {
    function update() {
      const now = new Date();
      const el = document.getElementById('header-clock');
      if (el) {
        el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      }
      const dateEl = document.getElementById('header-date');
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
    update();
    clockInterval = setInterval(update, 1000);
  }

  // ── Role Selector ──
  function setupRoleSelector() {
    const sel = document.getElementById('role-select');
    if (sel) {
      sel.value = currentRole;
      sel.addEventListener('change', (e) => {
        currentRole = e.target.value;
        renderSidebar();
        navigateTo(getDefaultViewForRole(currentRole));
      });
    }
  }

  // ── Modal ──
  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function setupModalClose() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }
  }

  // ── Toast ──
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span class="toast-message">${message}</span>
      <span class="toast-dismiss" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></span>
    `;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
  }

  // ── Chatbot Toggle ──
  function toggleChatbot(forceOpen) {
    const panel = document.getElementById('chatbot-panel');
    if (!panel) return;
    chatbotOpen = forceOpen !== undefined ? forceOpen : !chatbotOpen;
    panel.classList.toggle('open', chatbotOpen);
    if (chatbotOpen) {
      initChatbotUI();
    }
  }

  function initChatbotUI() {
    const messages = document.getElementById('chatbot-messages');
    if (messages && messages.children.length === 0) {
      const welcomeMsg = Chatbot.getWelcomeMessage();
      addBotMessage(welcomeMsg);
      Chatbot.speak(welcomeMsg);
    }
  }

  function sendChatMessage() {
    const input = document.getElementById('chatbot-input-field');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    
    addUserMessage(msg);
    input.value = '';

    // Small delay for natural feel
    setTimeout(() => {
      const response = Chatbot.processMessage(msg);
      addBotMessage(response);
      Chatbot.speak(response);
    }, 400);
  }

  function addBotMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-message bot';
    div.innerHTML = `
      <div class="chat-msg-icon"><i class="fa-solid fa-robot"></i></div>
      <div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addUserMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-message user';
    div.innerHTML = `
      <div class="chat-msg-icon"><i class="fa-solid fa-user"></i></div>
      <div class="chat-bubble">${text}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function setChatLanguage(lang) {
    Chatbot.setLanguage(lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    // Clear and show welcome
    const messages = document.getElementById('chatbot-messages');
    if (messages) {
      messages.innerHTML = '';
      const welcomeMsg = Chatbot.getWelcomeMessage();
      addBotMessage(welcomeMsg);
      Chatbot.speak(welcomeMsg);
    }
  }

  // ── Voice Modal ──
  function openVoiceModal() {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal-container');
    const supported = VoiceModule.isSupported();
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fa-solid fa-microphone" style="color: var(--priority-critical);"></i> Voice Complaint</div>
        <div class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <div class="modal-body">
        ${!supported ? '<div class="empty-state"><i class="fa-solid fa-microphone-slash"></i><h3>Not Supported</h3><p>Your browser does not support speech recognition. Please use Chrome.</p></div>' : `
        <div class="voice-panel">
          <div class="lang-selector" style="justify-content: center; margin-bottom: var(--space-4);">
            <button class="lang-btn active" data-vlang="en" onclick="App.setVoiceLang('en')">English</button>
            <button class="lang-btn" data-vlang="hi" onclick="App.setVoiceLang('hi')">हिंदी</button>
            <button class="lang-btn" data-vlang="te" onclick="App.setVoiceLang('te')">తెలుగు</button>
          </div>
          <div class="voice-circle" id="voice-circle" onclick="App.toggleVoiceRecording()">
            <i class="fa-solid fa-microphone"></i>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);" id="voice-status">Tap the microphone to start recording</p>
          <div class="voice-waves" id="voice-waves" style="display: none;">
            <div class="voice-wave-bar"></div><div class="voice-wave-bar"></div><div class="voice-wave-bar"></div>
            <div class="voice-wave-bar"></div><div class="voice-wave-bar"></div><div class="voice-wave-bar"></div>
            <div class="voice-wave-bar"></div>
          </div>
          <div class="voice-transcript" id="voice-transcript" style="display: none;"></div>
          <button class="btn btn-emerald btn-lg" id="voice-submit-btn" style="display: none; margin-top: var(--space-4);" onclick="App.submitVoiceComplaint()">
            <i class="fa-solid fa-paper-plane"></i> Submit as Complaint
          </button>
        </div>
        `}
      </div>
    `;
    overlay.classList.add('active');

    if (supported) {
      VoiceModule.init();
      VoiceModule.setOnTranscriptUpdate((text, isFinal) => {
        const transcript = document.getElementById('voice-transcript');
        if (transcript) {
          transcript.style.display = 'block';
          transcript.textContent = text || 'Listening...';
        }
        if (isFinal && text.trim()) {
          const submitBtn = document.getElementById('voice-submit-btn');
          if (submitBtn) submitBtn.style.display = 'inline-flex';
        }
      });
      VoiceModule.setOnRecordingStateChange((isRecording) => {
        const circle = document.getElementById('voice-circle');
        const waves = document.getElementById('voice-waves');
        const status = document.getElementById('voice-status');
        if (circle) circle.classList.toggle('recording', isRecording);
        if (waves) waves.style.display = isRecording ? 'flex' : 'none';
        if (status) status.textContent = isRecording ? 'Listening... Speak your complaint' : 'Tap the microphone to start recording';
      });
    }
  }

  let voiceLang = 'en';
  function setVoiceLang(lang) {
    voiceLang = lang;
    document.querySelectorAll('[data-vlang]').forEach(b => b.classList.remove('active'));
    const active = document.querySelector(`[data-vlang="${lang}"]`);
    if (active) active.classList.add('active');
  }

  function toggleVoiceRecording() {
    if (VoiceModule.getIsRecording()) {
      VoiceModule.stop();
    } else {
      VoiceModule.start(voiceLang);
    }
  }

  function submitVoiceComplaint() {
    const text = VoiceModule.getTranscript();
    if (!text) { showToast('No speech detected.', 'warning'); return; }
    VoiceModule.stop();
    closeModal();
    // Navigate to citizen view and pre-fill
    navigateTo('citizen');
    setTimeout(() => {
      const descEl = document.getElementById('comp-desc');
      if (descEl) {
        descEl.value = text;
        showToast('Voice complaint transcribed! Please fill mobile number and submit.', 'success');
      }
    }, 200);
  }

  // ── Hash routing ──
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && routes[hash]) {
      navigateTo(hash);
    }
  }

  // ── Lifecycle ──
  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('DOMContentLoaded', init);

  // ── Login Handlers ──
  function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
      errorEl.textContent = 'Please enter both username and password.';
      errorEl.style.display = 'block';
      return;
    }

    const result = FirebaseService.login(username, password);
    if (result.success) {
      currentRole = result.user.role;
      errorEl.style.display = 'none';
      enterApp();
      showToast(`Welcome, ${result.user.name}!`, 'success');
      // Sync from Firestore
      FirebaseService.syncFirestoreToLocal().catch(() => {});
    } else {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      document.getElementById('login-password').value = '';
    }
  }

  function handleLogout() {
    FirebaseService.logout();
    currentRole = 'citizen';
    currentView = 'citizen';
    showLoginScreen();
    // Clear chatbot messages
    const messages = document.getElementById('chatbot-messages');
    if (messages) messages.innerHTML = '';
  }

  function fillLogin(username, password) {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = password;
    document.getElementById('login-error').style.display = 'none';
  }

  function continueAsCitizen() {
    currentRole = 'citizen';
    FirebaseService.logout(); // Ensure no stale session
    enterApp();
  }

  return {
    navigateTo, showToast, closeModal,
    toggleChatbot, sendChatMessage, setChatLanguage,
    openVoiceModal, setVoiceLang, toggleVoiceRecording, submitVoiceComplaint,
    handleLogin, handleLogout, fillLogin, continueAsCitizen,
  };
})();

// ── Auth Functions (outside IIFE for onclick access) ──
(function() {
  const origReturn = App;

  // Attach login handlers to App if not already present
  if (!App.handleLogin) {
    // These are already added in the return statement above
  }
})();
