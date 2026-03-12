/* ============================================
   PrajaNetra AI - Complaint Processing Engine
   NLP Classification, Priority Detection, Routing
   ============================================ */

const AIEngine = (() => {
  // ── Category Keywords ──
  const categoryKeywords = {
    'Sanitation': [
      'garbage', 'trash', 'waste', 'dump', 'sanitation', 'cleaning', 'smell', 'stink',
      'litter', 'filth', 'dirty', 'hygiene', 'sweeping', 'bin', 'dustbin', 'rubbish',
      'कचरा', 'गंदगी', 'सफाई', 'कूड़ा', 'बदबू', 'स्वच्छता',
      'చెత్త', 'మురికి', 'పారిశుద్ధ్యం', 'దుర్వాసన', 'శుభ్రం'
    ],
    'Road Infrastructure': [
      'road', 'pothole', 'crack', 'asphalt', 'tar', 'highway', 'bridge', 'footpath',
      'divider', 'speed breaker', 'pavement', 'sidewalk', 'traffic', 'signal',
      'सड़क', 'गड्ढा', 'पुल', 'फुटपाथ', 'यातायात',
      'రోడ్డు', 'గుంట', 'వంతెన', 'ట్రాఫిక్', 'రహదారి'
    ],
    'Streetlights': [
      'streetlight', 'street light', 'lamp', 'bulb', 'lighting', 'dark', 'pole',
      'light not working', 'no light', 'broken light', 'dim light', 'electric pole',
      'बिजली', 'लाइट', 'बत्ती', 'अंधेरा', 'खंभा',
      'దీపం', 'లైటు', 'చీకటి', 'స్తంభం', 'విద్యుత్'
    ],
    'Water Supply': [
      'water', 'pipeline', 'tap', 'supply', 'leaking', 'burst', 'contamination',
      'bore', 'borewell', 'tank', 'tanker', 'drinking water', 'no water', 'water pressure',
      'पानी', 'नल', 'पाइप', 'जल', 'लीक', 'टंकी',
      'నీరు', 'నల్ల', 'పైపు', 'సరఫరా', 'లీకు', 'ట్యాంకు'
    ],
    'Drainage': [
      'drain', 'drainage', 'sewer', 'sewage', 'manhole', 'clog', 'overflow',
      'flood', 'waterlogging', 'gutter', 'nala', 'canal', 'blocked drain',
      'नाला', 'सीवर', 'मैनहोल', 'जलभराव', 'नाली',
      'కాలువ', 'మ్యాన్‌హోల్', 'మురుగు', 'నీటి నిల్వ', 'డ్రైనేజి'
    ],
    'Public Safety': [
      'safety', 'stray', 'dog', 'theft', 'crime', 'vandalism', 'attack',
      'accident', 'fire', 'hazard', 'danger', 'encroachment', 'illegal',
      'security', 'police', 'fight', 'violence',
      'सुरक्षा', 'आवारा', 'चोरी', 'अपराध', 'खतरा', 'पुलिस',
      'భద్రత', 'దొంగతనం', 'ప్రమాదం', 'వీధి కుక్కలు', 'నేరం'
    ],
  };

  // ── Department Mapping ──
  const categoryDepartmentMap = {
    'Sanitation': 'DEPT01',
    'Road Infrastructure': 'DEPT02',
    'Streetlights': 'DEPT03',
    'Water Supply': 'DEPT04',
    'Drainage': 'DEPT05',
    'Public Safety': 'DEPT06',
  };

  // ── Priority Location Keywords ──
  const highPriorityLocations = [
    'hospital', 'clinic', 'medical', 'health center',
    'bus station', 'railway station', 'metro', 'airport', 'transport hub',
    'government', 'collectorate', 'tahsildar', 'municipal', 'court',
    'school', 'college', 'university', 'institute',
    'temple', 'mosque', 'church', 'gurudwara',
    'market', 'mall', 'commercial area',
    'ఆసుపత్రి', 'బస్ స్టేషన్', 'రైల్వే', 'ప్రభుత్వ', 'పాఠశాల',
    'अस्पताल', 'बस स्टेशन', 'रेलवे', 'सरकारी', 'स्कूल',
  ];

  // ── Urgency Keywords ──
  const urgencyBoostKeywords = [
    'urgent', 'emergency', 'critical', 'severe', 'dangerous', 'hazard',
    'health risk', 'children', 'elderly', 'attack', 'accident',
    'contamination', 'overflow', 'collapse', 'flooding', 'fire',
    'multiple', 'entire', 'whole colony', 'whole area',
    'तुरंत', 'आपातकालीन', 'गंभीर', 'खतरनाक',
    'అత్యవసరం', 'ప్రమాదకరం', 'తీవ్రమైన',
  ];

  // ── Analyze Complaint ──
  function analyzeComplaint(text, location = '') {
    const lowerText = (text || '').toLowerCase();
    const lowerLocation = (location || '').toLowerCase();
    const combined = lowerText + ' ' + lowerLocation;

    // Detect category
    let bestCategory = 'Sanitation'; // default
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (combined.includes(keyword.toLowerCase())) {
          score += keyword.length > 4 ? 2 : 1;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    // Determine department
    const department = categoryDepartmentMap[bestCategory] || 'DEPT01';

    // Calculate urgency score (0–100)
    let urgencyScore = 40; // base

    // Boost by category
    if (bestCategory === 'Drainage' || bestCategory === 'Water Supply') urgencyScore += 10;
    if (bestCategory === 'Public Safety') urgencyScore += 15;

    // Boost by urgency keywords
    urgencyBoostKeywords.forEach(kw => {
      if (combined.includes(kw.toLowerCase())) urgencyScore += 8;
    });

    // Boost by high-priority location
    let locationBoost = false;
    highPriorityLocations.forEach(loc => {
      if (combined.includes(loc.toLowerCase())) {
        urgencyScore += 12;
        locationBoost = true;
      }
    });

    // Cap at 100
    urgencyScore = Math.min(100, urgencyScore);

    // Determine priority
    let priority = 'Low';
    if (urgencyScore >= 85) priority = 'Critical';
    else if (urgencyScore >= 65) priority = 'High';
    else if (urgencyScore >= 45) priority = 'Medium';

    // If location is a high-priority zone, minimum High
    if (locationBoost && priority === 'Low') priority = 'Medium';
    if (locationBoost && priority === 'Medium') priority = 'High';

    return {
      category: bestCategory,
      department,
      priority,
      urgencyScore,
      locationBoost,
      confidence: bestScore > 0 ? Math.min(95, 50 + bestScore * 10) : 30,
    };
  }

  // ── Get Department Name ──
  function getDepartmentName(category) {
    const names = {
      'Sanitation': 'Municipal Sanitation Department',
      'Road Infrastructure': 'Roads & Infrastructure Department',
      'Streetlights': 'Streetlight Maintenance Department',
      'Water Supply': 'Water Supply Department',
      'Drainage': 'Drainage & Sewage Department',
      'Public Safety': 'Public Safety Department',
    };
    return names[category] || 'General Administration';
  }

  // ── Predictive Insights ──
  function generateInsights(complaints) {
    const insights = [];

    // Recurring area issues
    const areaCounts = {};
    complaints.forEach(c => {
      const key = `${c.ward}-${c.category}`;
      areaCounts[key] = (areaCounts[key] || 0) + 1;
    });
    for (const [key, count] of Object.entries(areaCounts)) {
      if (count >= 2) {
        const [ward, category] = key.split('-');
        insights.push({
          type: 'Recurring Issue',
          text: `${ward} has ${count} repeated ${category} complaints. Proactive maintenance recommended.`,
          severity: count >= 3 ? 'high' : 'medium',
          metric: `${count} occurrences`,
        });
      }
    }

    // High-density zones
    const wardCounts = {};
    complaints.forEach(c => { wardCounts[c.ward] = (wardCounts[c.ward] || 0) + 1; });
    const sortedWards = Object.entries(wardCounts).sort(([, a], [, b]) => b - a);
    if (sortedWards.length > 0) {
      insights.push({
        type: 'Hotspot Alert',
        text: `${sortedWards[0][0]} is the most complaint-prone area with ${sortedWards[0][1]} complaints. Consider allocating additional resources.`,
        severity: 'high',
        metric: `${sortedWards[0][1]} complaints`,
      });
    }

    // Seasonal pattern hint
    const drainageComplaints = complaints.filter(c => c.category === 'Drainage');
    if (drainageComplaints.length >= 2) {
      insights.push({
        type: 'Seasonal Prediction',
        text: 'Drainage complaints tend to spike during monsoon season (June-September). Pre-emptive drain clearing recommended.',
        severity: 'medium',
        metric: `${drainageComplaints.length} drainage complaints logged`,
      });
    }

    // Infrastructure maintenance
    const roadComplaints = complaints.filter(c => c.category === 'Road Infrastructure');
    if (roadComplaints.length >= 2) {
      insights.push({
        type: 'Infrastructure Alert',
        text: `${roadComplaints.length} road infrastructure complaints detected. Systematic road survey advised for preventive maintenance.`,
        severity: 'medium',
        metric: `${roadComplaints.length} road complaints`,
      });
    }

    // Unresolved critical complaints
    const unresolvedCritical = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved');
    if (unresolvedCritical.length > 0) {
      insights.push({
        type: 'Urgent Attention',
        text: `${unresolvedCritical.length} critical complaint(s) remain unresolved. Immediate action required to prevent escalation.`,
        severity: 'critical',
        metric: `${unresolvedCritical.length} critical pending`,
      });
    }

    return insights;
  }

  return {
    analyzeComplaint,
    getDepartmentName,
    generateInsights,
  };
})();
