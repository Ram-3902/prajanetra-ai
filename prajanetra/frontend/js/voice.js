/* ============================================
   PrajaNetra AI - Voice Complaint Module
   Web Speech API integration
   ============================================ */

const VoiceModule = (() => {
  let recognition = null;
  let isRecording = false;
  let transcript = '';
  let onTranscriptUpdate = null;
  let onRecordingStateChange = null;

  const langCodes = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
  };

  function isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  function init() {
    if (!isSupported()) return false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interimTranscript += t;
        }
      }
      if (finalTranscript) {
        transcript += finalTranscript;
      }
      if (onTranscriptUpdate) {
        onTranscriptUpdate(transcript + interimTranscript, !!finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        stop();
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Auto-restart if still in recording mode
        try { recognition.start(); } catch (e) {}
      } else {
        if (onRecordingStateChange) onRecordingStateChange(false);
      }
    };

    return true;
  }

  function start(lang = 'en') {
    if (!recognition) {
      if (!init()) return false;
    }
    transcript = '';
    recognition.lang = langCodes[lang] || 'en-IN';
    try {
      recognition.start();
      isRecording = true;
      if (onRecordingStateChange) onRecordingStateChange(true);
      return true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
      return false;
    }
  }

  function stop() {
    isRecording = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
    if (onRecordingStateChange) onRecordingStateChange(false);
    return transcript.trim();
  }

  function getTranscript() {
    return transcript.trim();
  }

  function setOnTranscriptUpdate(cb) { onTranscriptUpdate = cb; }
  function setOnRecordingStateChange(cb) { onRecordingStateChange = cb; }
  function getIsRecording() { return isRecording; }

  return {
    isSupported, init, start, stop,
    getTranscript, getIsRecording,
    setOnTranscriptUpdate, setOnRecordingStateChange,
  };
})();
