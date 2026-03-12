/* ============================================
   PrajaNetra AI - Multilingual Chatbot
   Supports Telugu, Hindi, English
   ============================================ */

const Chatbot = (() => {
  let currentLang = 'en';
  let conversationState = 'idle'; // idle, awaiting_issue, awaiting_mobile, awaiting_location, confirming
  let pendingComplaint = {};

  const translations = {
    en: {
      welcome: "Welcome to PrajaNetra AI! 🏛️ I'm your civic assistant. How can I help you today?\n\n1. Register a complaint\n2. Check complaint status\n3. Information about services",
      askIssue: "Please describe your civic issue in detail. What problem are you facing?",
      askMobile: "Thank you for reporting. Please provide your mobile number so we can track your complaint.",
      askLocation: "Please share the location or area where this issue exists.",
      confirming: "I've analyzed your complaint:\n\n📋 Category: {category}\n🏢 Department: {department}\n⚠️ Priority: {priority}\n📍 Location: {location}\n\nWould you like me to submit this complaint? (yes/no)",
      submitted: "✅ Your complaint has been registered successfully!\n\n🔖 Complaint ID: {id}\n\nPlease save this ID for tracking. You can check your complaint status anytime.",
      askTrackId: "Please provide your Complaint ID (e.g., PRN-2026-0001) or mobile number to check status.",
      notFound: "❌ No complaints found with the provided details. Please check and try again.",
      statusResult: "📋 Complaint: {id}\n📊 Status: {status}\n📂 Category: {category}\n🏢 Department: {department}\n📅 Filed: {date}",
      invalid: "I didn't understand that. Please type 1, 2, or 3 to continue.",
      services: "PrajaNetra AI provides:\n\n🔹 Civic complaint registration\n🔹 Real-time complaint tracking\n🔹 Multilingual support\n🔹 Voice complaint submission\n\nType 1 to register a complaint or 2 to check status.",
      invalidMobile: "Please enter your mobile number.",
      yes: "yes",
      no: "no",
      cancelled: "Complaint submission cancelled. Type 1 to start over or ask me anything!",
    },
    hi: {
      welcome: "प्रजानेत्र AI में आपका स्वागत है! 🏛️ मैं आपका नागरिक सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?\n\n1. शिकायत दर्ज करें\n2. शिकायत की स्थिति जाँचें\n3. सेवाओं की जानकारी",
      askIssue: "कृपया अपनी नागरिक समस्या का विस्तार से वर्णन करें। आप किस समस्या का सामना कर रहे हैं?",
      askMobile: "रिपोर्ट करने के लिए धन्यवाद। कृपया अपना मोबाइल नंबर दें ताकि हम आपकी शिकायत को ट्रैक कर सकें।",
      askLocation: "कृपया वह स्थान या क्षेत्र बताएं जहाँ यह समस्या है।",
      confirming: "मैंने आपकी शिकायत का विश्लेषण किया:\n\n📋 श्रेणी: {category}\n🏢 विभाग: {department}\n⚠️ प्राथमिकता: {priority}\n📍 स्थान: {location}\n\nक्या आप चाहते हैं कि मैं यह शिकायत दर्ज करूँ? (हाँ/नहीं)",
      submitted: "✅ आपकी शिकायत सफलतापूर्वक दर्ज हो गई है!\n\n🔖 शिकायत ID: {id}\n\nकृपया इस ID को ट्रैकिंग के लिए सहेजें।",
      askTrackId: "कृपया अपनी शिकायत ID (जैसे: PRN-2026-0001) या मोबाइल नंबर दें।",
      notFound: "❌ दिए गए विवरण से कोई शिकायत नहीं मिली। कृपया जाँचें और पुनः प्रयास करें।",
      statusResult: "📋 शिकायत: {id}\n📊 स्थिति: {status}\n📂 श्रेणी: {category}\n🏢 विभाग: {department}\n📅 दर्ज: {date}",
      invalid: "मैं समझ नहीं पाया। कृपया जारी रखने के लिए 1, 2, या 3 टाइप करें।",
      services: "प्रजानेत्र AI प्रदान करता है:\n\n🔹 नागरिक शिकायत पंजीकरण\n🔹 रियल-टाइम शिकायत ट्रैकिंग\n🔹 बहुभाषी सहायता\n🔹 वॉइस शिकायत\n\n1 टाइप करें या 2 टाइप करें।",
      invalidMobile: "कृपया अपना मोबाइल नंबर दर्ज करें।",
      yes: "हाँ",
      no: "नहीं",
      cancelled: "शिकायत रद्द कर दी गई। 1 टाइप करके फिर से शुरू करें!",
    },
    te: {
      welcome: "ప్రజానేత్ర AI కి స్వాగతం! 🏛️ నేను మీ పౌర సహాయకుడిని. నేను మీకు ఎలా సహాయం చేయగలను?\n\n1. ఫిర్యాదు నమోదు చేయండి\n2. ఫిర్యాదు స్థితి తనిఖీ చేయండి\n3. సేవల గురించి సమాచారం",
      askIssue: "దయచేసి మీ పౌర సమస్యను వివరంగా వివరించండి. మీరు ఏ సమస్యను ఎదుర్కొంటున్నారు?",
      askMobile: "నివేదించినందుకు ధన్యవాదాలు. దయచేసి మీ మొబైల్ నంబర్ అందించండి.",
      askLocation: "దయచేసి ఈ సమస్య ఉన్న ప్రదేశం లేదా ప్రాంతాన్ని పంచుకోండి.",
      confirming: "నేను మీ ఫిర్యాదును విశ్లేషించాను:\n\n📋 వర్గం: {category}\n🏢 విభాగం: {department}\n⚠️ ప్రాధాన్యత: {priority}\n📍 ప్రదేశం: {location}\n\nఈ ఫిర్యాదు సమర్పించాలా? (అవును/కాదు)",
      submitted: "✅ మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది!\n\n🔖 ఫిర్యాదు ID: {id}\n\nదయచేసి ట్రాకింగ్ కోసం ఈ ID ని భద్రపరచండి.",
      askTrackId: "దయచేసి మీ ఫిర్యాదు ID (ఉదా: PRN-2026-0001) లేదా మొబైల్ నంబర్ అందించండి.",
      notFound: "❌ ఇచ్చిన వివరాలతో ఫిర్యాదులు కనుగొనబడలేదు. దయచేసి తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
      statusResult: "📋 ఫిర్యాదు: {id}\n📊 స్థితి: {status}\n📂 వర్గం: {category}\n🏢 విభాగం: {department}\n📅 నమోదు: {date}",
      invalid: "నాకు అర్థం కాలేదు. కొనసాగించడానికి 1, 2, లేదా 3 టైప్ చేయండి.",
      services: "ప్రజానేత్ర AI అందిస్తుంది:\n\n🔹 పౌర ఫిర్యాదు నమోదు\n🔹 రియల్-టైమ్ ఫిర్యాదు ట్రాకింగ్\n🔹 బహుభాషా మద్దతు\n🔹 వాయిస్ ఫిర్యాదు\n\n1 టైప్ చేయండి లేదా 2 టైప్ చేయండి.",
      invalidMobile: "దయచేసి మీ మొబైల్ నంబర్ నమోదు చేయండి.",
      yes: "అవును",
      no: "కాదు",
      cancelled: "ఫిర్యాదు రద్దు చేయబడింది. 1 టైప్ చేసి మళ్ళీ ప్రారంభించండి!",
    },
  };

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
  }

  function setLanguage(lang) {
    currentLang = lang;
    conversationState = 'idle';
    pendingComplaint = {};
  }

  function getLanguage() { return currentLang; }

  function processMessage(userMessage) {
    const msg = userMessage.trim();
    if (!msg) return t('invalid');

    switch (conversationState) {
      case 'idle':
        return handleIdle(msg);
      case 'awaiting_issue':
        return handleIssue(msg);
      case 'awaiting_mobile':
        return handleMobile(msg);
      case 'awaiting_location':
        return handleLocation(msg);
      case 'confirming':
        return handleConfirm(msg);
      case 'tracking':
        return handleTracking(msg);
      default:
        conversationState = 'idle';
        return t('welcome');
    }
  }

  function handleIdle(msg) {
    if (msg === '1' || msg.toLowerCase().includes('complaint') || msg.toLowerCase().includes('register') ||
        msg.includes('शिकायत') || msg.includes('ఫిర్యాదు') || msg.includes('समस्या') || msg.includes('సమస్య')) {
      conversationState = 'awaiting_issue';
      return t('askIssue');
    }
    if (msg === '2' || msg.toLowerCase().includes('status') || msg.toLowerCase().includes('track') ||
        msg.includes('स्थिति') || msg.includes('స్థితి')) {
      conversationState = 'tracking';
      return t('askTrackId');
    }
    if (msg === '3' || msg.toLowerCase().includes('service') || msg.toLowerCase().includes('info') ||
        msg.includes('सेवा') || msg.includes('సేవ')) {
      return t('services');
    }
    return t('invalid');
  }

  function handleIssue(msg) {
    pendingComplaint.description = msg;
    conversationState = 'awaiting_mobile';
    return t('askMobile');
  }

  function handleMobile(msg) {
    const cleaned = msg.replace(/[\s-]/g, '');
    if (!cleaned) {
      return t('invalidMobile');
    }
    pendingComplaint.mobile = cleaned;
    conversationState = 'awaiting_location';
    return t('askLocation');
  }

  function handleLocation(msg) {
    pendingComplaint.location = msg;

    // Run AI analysis
    const analysis = AIEngine.analyzeComplaint(pendingComplaint.description, pendingComplaint.location);
    pendingComplaint.category = analysis.category;
    pendingComplaint.department = analysis.department;
    pendingComplaint.priority = analysis.priority;
    pendingComplaint.urgencyScore = analysis.urgencyScore;

    conversationState = 'confirming';

    const deptName = AIEngine.getDepartmentName(analysis.category);
    return t('confirming')
      .replace('{category}', analysis.category)
      .replace('{department}', deptName)
      .replace('{priority}', analysis.priority)
      .replace('{location}', pendingComplaint.location);
  }

  function handleConfirm(msg) {
    const lower = msg.toLowerCase();
    const yesWords = ['yes', 'y', 'हाँ', 'हां', 'अवును', 'అవును', 'ok', 'submit', '1'];
    const noWords = ['no', 'n', 'नहीं', 'కాదు', 'cancel', '0'];

    if (yesWords.some(w => lower.includes(w))) {
      const complaint = Store.addComplaint(pendingComplaint);
      conversationState = 'idle';
      pendingComplaint = {};
      return t('submitted').replace('{id}', complaint.id);
    }
    if (noWords.some(w => lower.includes(w))) {
      conversationState = 'idle';
      pendingComplaint = {};
      return t('cancelled');
    }
    return t('confirming')
      .replace('{category}', pendingComplaint.category)
      .replace('{department}', AIEngine.getDepartmentName(pendingComplaint.category))
      .replace('{priority}', pendingComplaint.priority)
      .replace('{location}', pendingComplaint.location);
  }

  function handleTracking(msg) {
    const cleaned = msg.trim();
    const results = Store.searchComplaint(
      cleaned.replace(/\D/g, '').length === 10 ? cleaned.replace(/\D/g, '') : null,
      cleaned.toUpperCase().startsWith('PRN') ? cleaned : null
    );

    conversationState = 'idle';

    if (results.length === 0) {
      return t('notFound');
    }

    return results.map(c => {
      return t('statusResult')
        .replace('{id}', c.id)
        .replace('{status}', c.status)
        .replace('{category}', c.category)
        .replace('{department}', (Store.getDepartment(c.department) || {}).name || 'N/A')
        .replace('{date}', new Date(c.createdAt).toLocaleDateString());
    }).join('\n\n---\n\n');
  }

  function getWelcomeMessage() {
    return t('welcome');
  }

  // TTS
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[📋🏢⚠️📍✅🔖❌📊📂📅🔹]/g, '').replace(/\n/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  return {
    setLanguage, getLanguage,
    processMessage, getWelcomeMessage,
    speak,
  };
})();
