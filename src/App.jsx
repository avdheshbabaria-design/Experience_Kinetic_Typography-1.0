import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Maximize, Minimize, AlertCircle, Sliders, Activity, Zap, Type, Globe, Camera, Monitor, X, Save, Bookmark, Video, StopCircle, Layers } from 'lucide-react';

// --- CSS STYLES & FONTS ---
const getGlobalStyles = (speed) => `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Bodoni+Moda:ital,opsz,wght@0,6..96,900;1,6..96,900&family=Montserrat:ital,wght@0,900;1,900&family=VT323&family=Noto+Sans+Devanagari:wght@900&family=Noto+Sans+Gujarati:wght@900&display=swap');

  .kinetic-wrapper { --speed: ${speed || 1}; }

  .font-anton { font-family: 'Anton', sans-serif; text-transform: uppercase; }
  .font-bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
  .font-bodoni { font-family: 'Bodoni Moda', serif; }
  .font-montserrat { font-family: 'Montserrat', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; }
  .font-vt323 { font-family: 'VT323', monospace; text-transform: uppercase; }
  .font-hi { font-family: 'Noto Sans Devanagari', sans-serif; font-weight: 900; }
  .font-gu { font-family: 'Noto Sans Gujarati', sans-serif; font-weight: 900; }

  .font-arial { font-family: Arial, Helvetica, sans-serif; font-weight: 900; }
  .font-times { font-family: "Times New Roman", Times, serif; font-weight: 900; }
  .font-courier { font-family: "Courier New", Courier, monospace; font-weight: bold; }
  .font-impact { font-family: Impact, sans-serif; letter-spacing: 1px; }

  @keyframes wordAppear {
    0% { transform: scale(0.2) translateZ(-500px); opacity: 0; filter: blur(30px); }
    100% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
  }

  .kinetic-word {
    position: absolute;
    top: 0; left: 0;
    transform-origin: center center;
    transition: left calc(0.8s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                top calc(0.8s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .word-inner {
    animation: wordAppear calc(0.6s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    display: inline-block;
    position: relative; 
  }

  @keyframes glitch-anim {
    0% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); }
    20% { transform: translate(-4px, 2px) skew(5deg); clip-path: inset(10% 0 60% 0); filter: hue-rotate(90deg); }
    40% { transform: translate(4px, -2px) skew(-5deg); clip-path: inset(60% 0 10% 0); }
    60% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); filter: hue-rotate(0deg); }
    100% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); }
  }

  @keyframes float-parallax {
    0% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-15px) translateX(10px); }
    100% { transform: translateY(0px) translateX(0px); }
  }

  /* POP-ART FX */
  .text-outline-fx {
    color: transparent !important;
    -webkit-text-stroke: var(--outline-width, 0.04em) var(--outline-color, #FFF);
  }

  .text-highlight-fx::before {
    content: ''; position: absolute; inset: -0.05em -0.1em;
    background-color: var(--hl-color, rgba(255,255,255,0.2)); opacity: var(--hl-op, 0.8);
    transform: rotate(var(--hl-rot, 0deg)) scale(var(--hl-sx, 1), var(--hl-sy, 1));
    border-radius: 0.1em; z-index: -1; pointer-events: none;
  }

  .camera-rig {
    transition: transform calc(0.9s / var(--speed, 1)) cubic-bezier(0.25, 1, 0.3, 1);
    transform-origin: 0 0;
    will-change: transform;
    perspective: 1000px;
  }

  /* BACKGROUND ENVIRONMENTS */
  .noise { position: absolute; inset: 0; pointer-events: none; z-index: 50; opacity: 0.06; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .vignette { box-shadow: inset 0 0 200px rgba(0,0,0,0.95); pointer-events: none; position: absolute; inset: 0; z-index: 40; }
  
  @keyframes vaporwave-pan { 0% { background-position: 0 0; } 100% { background-position: 0 50px; } }
  .vaporwave-grid { position: absolute; bottom: -20%; left: -50%; width: 200%; height: 60%; background-image: linear-gradient(rgba(255,0,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.4) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(75deg); pointer-events: none; animation: vaporwave-pan 1.5s linear infinite; }
  @keyframes plasma-spin { 100% { transform: rotate(360deg); } }
  .plasma-bg { position: absolute; inset: -50%; background: conic-gradient(from 0deg, #ff0055, #00ffcc, #7b00ff, #ff0055); filter: blur(100px); opacity: 0.3; animation: plasma-spin 12s linear infinite; pointer-events: none; }
  
  /* TEXTURE OVERLAYS */
  .texture-halftone { background-image: radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1.5px); background-size: 8px 8px; z-index: 45; pointer-events: none; position: absolute; inset: 0; mix-blend-mode: overlay; }
  .texture-crt { background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 3px, 3px 100%; z-index: 45; pointer-events: none; position: absolute; inset: 0; }
  .texture-grunge { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E"); mix-blend-mode: overlay; z-index: 45; pointer-events: none; position: absolute; inset: 0; opacity: 0.6; }

  /* CHAOS OVERDRIVE FX */
  .chaos-rgb .word-inner { text-shadow: -8px 0px 0px rgba(255,0,0,0.8), 8px 0px 0px rgba(0,255,255,0.8) !important; transition: none; }
  .chaos-invert { filter: invert(1) hue-rotate(180deg) contrast(1.5); }
  .chaos-vhs { filter: contrast(1.5) saturate(2) hue-rotate(15deg); mix-blend-mode: hard-light; }

  /* Recording Indicators */
  @keyframes recPulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
  .rec-indicator { animation: recPulse 1.5s infinite; }

  /* Custom Settings Scrollbar */
  .settings-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
  .settings-scroll::-webkit-scrollbar { width: 6px; }
  .settings-scroll::-webkit-scrollbar-track { background: transparent; }
  .settings-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
  .settings-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
`;

// --- CONFIGURATION POOLS ---
const FONTS_DYNAMIC = ['font-anton', 'font-bebas', 'font-bodoni', 'font-montserrat', 'font-vt323'];
const FONTS_ALL = [...FONTS_DYNAMIC, 'font-arial', 'font-times', 'font-courier', 'font-impact'];

const SIZES = [80, 150, 250, 400, 600, 800]; 
const COLORS_VAPOR = ['#FF00FF', '#00FFFF', '#FFB6C1', '#FFFFFF', '#39FF14', '#FDF5E6'];
const COLORS_STD = ['#FFFFFF', '#FFFFFF', '#E63946', '#F4A261', '#A8DADC'];
const COLORS_LIGHT_BG = ['#000000', '#1A1A1A', '#E63946', '#1D3557', '#457B9D'];
const ROTATIONS = [0, 0, 0, 90, -90, 5, -5, 10, -10];
const DIRECTIONS = ['right', 'bottom', 'diagonal-down', 'diagonal-up', 'overlap'];
const SHAPE_TYPES = ['circle', 'square', 'triangle', 'cross', 'asterisk'];

const LENS_OPTICS = { '18mm': 0.3, '24mm': 0.5, '35mm': 1.0, '55mm': 1.6, '85mm': 2.5, '200mm': 4.5 };

const getAutoWordsPerLine = (ratio) => {
  switch(ratio) {
    case 'tiktok': return 2;
    case 'square': return 4;
    case 'imax': return 5;
    case 'youtube': return 6;
    case 'cinema': return 8;
    default: return 5;
  }
};

const formatTextWrap = (text, wpl) => {
  if (wpl <= 0) return text;
  const wordsArr = text.split(/\s+/);
  let res = [];
  for (let i = 0; i < wordsArr.length; i += wpl) {
    res.push(wordsArr.slice(i, i + wpl).join(' '));
  }
  return res.join('\n');
};

// --- BASE SETTINGS ---
const DEFAULT_BASE_SETTINGS = {
  languages: ['en-US'],
  aspectRatio: 'fullscreen',
  cameraLens: '35mm', cameraMode: 'auto',
  manualPanX: 0, manualPanY: 0, manualRotX: 0, manualRotY: 0, manualRotZ: 0,
  manualZoom: 1.0, spawnAnchorX: 0, spawnAnchorY: 0,
  fontMode: 'dynamic', manualFont: 'font-anton',
  textScale: 1.0, wordSpacing: 1.0, lineSpacing: 0.85, wordsPerLine: 0, textAlign: 'center',
  fadeRate: 0.15, blurIntensity: 4, glitchLevel: 2, wordGrouping: 1, animationSpeed: 1.0,
  physicsEnabled: true, momentumEnabled: true, strobeFlicker: false, neonGlow: true,
  fxOutline: false, fxShadow: false, fxHighlight: false, bgMode: 'dark',
  manualTextColor: '#FFFFFF', manualShadowColor: '#FF00FF', manualShadowOpacity: 0.8,
  customSystemFont: 'Arial',
  chaosRgbLevel: 0, chaosVhsLevel: 0, chaosInvertLevel: 0, chaosShakeLevel: 0, 
  textureOverlay: 'none', 
  iconEngine: false, 
  customBgUrl: '', customBgType: '' 
};

// --- PRESET LIBRARY ---
const PRESET_LIBRARY = {
  "Default Mograph": { ...DEFAULT_BASE_SETTINGS },
  "Subtle Natural Fade": { ...DEFAULT_BASE_SETTINGS, physicsEnabled: false, momentumEnabled: false, blurIntensity: 2, fadeRate: 0.05, animationSpeed: 0.5, fontMode: 'manual', manualFont: 'font-arial', neonGlow: false, fxShadow: false, glitchLevel: 0, cameraMode: 'manual', manualZoom: 1.1 },
  "TikTok Overdrive": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'tiktok', cameraLens: '18mm', wordGrouping: 6, wordsPerLine: 2, textScale: 1.5, physicsEnabled: false, fontMode: 'manual', manualFont: 'font-bebas', fxShadow: true, chaosShakeLevel: 6, chaosRgbLevel: 4, iconEngine: true },
  "Comic Book": { ...DEFAULT_BASE_SETTINGS, fontMode: 'manual', manualFont: 'font-impact', textureOverlay: 'halftone', fxOutline: true, fxShadow: true, wordGrouping: 1, textScale: 1.5, bgMode: 'vaporwave', iconEngine: true },
  "Cinematic Trailer": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'cinema', cameraLens: '55mm', fontMode: 'manual', manualFont: 'font-bodoni', wordGrouping: 2, blurIntensity: 6, fadeRate: 0.1, textureOverlay: 'grunge' },
  "Vaporwave CRT": { ...DEFAULT_BASE_SETTINGS, bgMode: 'vaporwave', fontMode: 'manual', manualFont: 'font-vt323', neonGlow: true, glitchLevel: 4, momentumEnabled: true, fxHighlight: true, textureOverlay: 'crt', chaosVhsLevel: 6, chaosRgbLevel: 3 },
  "Hacker Terminal": { ...DEFAULT_BASE_SETTINGS, bgMode: 'dark', fontMode: 'manual', manualFont: 'font-courier', wordGrouping: 6, textAlign: 'left', manualTextColor: '#39FF14', wordsPerLine: 6, textureOverlay: 'crt', chaosVhsLevel: 4, chaosInvertLevel: 1 },
  "Strobe Rave": { ...DEFAULT_BASE_SETTINGS, strobeFlicker: true, neonGlow: true, bgMode: 'plasma', fxHighlight: true, wordGrouping: 2, chaosRgbLevel: 8, chaosInvertLevel: 4, chaosShakeLevel: 8, iconEngine: true },
  "Chroma Key Overlay": { ...DEFAULT_BASE_SETTINGS, bgMode: 'chroma-green', textureOverlay: 'none', chaosRgbLevel: 0, chaosVhsLevel: 0, chaosInvertLevel: 0, chaosShakeLevel: 0, fxShadow: false, fxHighlight: false, glitchLevel: 0, neonGlow: false, fontMode: 'manual', manualFont: 'font-montserrat', textScale: 1.5, wordGrouping: 6 },
  "Typewriter Doc": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', fontMode: 'manual', manualFont: 'font-courier', textAlign: 'left', wordGrouping: 6, wordsPerLine: 6, physicsEnabled: false, momentumEnabled: false, textScale: 0.8, neonGlow: false },
  "Clean Corporate": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', fontMode: 'manual', manualFont: 'font-arial', neonGlow: false, blurIntensity: 2, fadeRate: 0.1, physicsEnabled: false, manualTextColor: '#1D3557' },
  "Neon Noir": { ...DEFAULT_BASE_SETTINGS, bgMode: 'dark', fontMode: 'manual', manualFont: 'font-bodoni', fxOutline: true, fxShadow: false, neonGlow: true, blurIntensity: 8, fadeRate: 0.05, glitchLevel: 0 },
  "Anxiety Attack": { ...DEFAULT_BASE_SETTINGS, chaosShakeLevel: 8, chaosVhsLevel: 5, glitchLevel: 8, animationSpeed: 2.0, fadeRate: 0.3, textScale: 0.6, fontMode: 'dynamic', physicsEnabled: true },
  "Cyberpunk City": { ...DEFAULT_BASE_SETTINGS, bgMode: 'plasma', fontMode: 'manual', manualFont: 'font-anton', fxShadow: true, glitchLevel: 5, neonGlow: true, chaosRgbLevel: 4, textScale: 1.2 },
  "Zen Garden": { ...DEFAULT_BASE_SETTINGS, fontMode: 'manual', manualFont: 'font-montserrat', animationSpeed: 0.4, blurIntensity: 1, fadeRate: 0.08, momentumEnabled: true, physicsEnabled: false, neonGlow: false, glitchLevel: 0 },
  "Blockbuster": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'cinema', cameraLens: '85mm', textScale: 2.5, fontMode: 'manual', manualFont: 'font-impact', wordSpacing: 1.5, blurIntensity: 6, physicsEnabled: false },
  "Pop-Art Poster": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', textureOverlay: 'halftone', fxOutline: true, fxShadow: true, fontMode: 'manual', manualFont: 'font-anton', textScale: 1.8, wordGrouping: 1 }
};

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [words, setWords] = useState([]);
  const [bgShapes, setBgShapes] = useState([]); 
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0 });
  
  // UI & Recording States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  // Settings & Presets - Hardened SSR Check for Vercel Deployments
  const [settings, setSettings] = useState(DEFAULT_BASE_SETTINGS);
  const [customPresets, setCustomPresets] = useState(() => {
    if (typeof window === 'undefined') return {}; // Prevent SSR ReferenceError
    try { 
      const parsed = JSON.parse(localStorage.getItem('kinetic_presets')); 
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch(e) { return {}; }
  });
  const [activePreset, setActivePreset] = useState("Default Mograph");
  
  // Chaos Engine State
  const [chaos, setChaos] = useState({ rgb: false, vhs: false, invert: false, shakeX: 0, shakeY: 0 });

  const recognitionRef = useRef(null);
  const wordConfigs = useRef([]);
  const isListeningRef = useRef(false);
  const settingsRef = useRef(settings);

  const showErrorToast = (msg, duration = 6000) => {
    setError(msg);
    if (msg) setTimeout(() => setError(''), duration);
  };

  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  
  useEffect(() => {
    if (wordConfigs.current.length > 0) {
      updateCamera(wordConfigs.current[wordConfigs.current.length - 1]);
    }
  }, [
    settings.cameraLens, settings.manualZoom, settings.aspectRatio, 
    settings.cameraMode, settings.manualPanX, settings.manualPanY,
    settings.manualRotX, settings.manualRotY, settings.manualRotZ
  ]);

  // --- CHAOS OVERDRIVE ENGINE ---
  useEffect(() => {
    if (settings.chaosRgbLevel === 0 && settings.chaosVhsLevel === 0 && settings.chaosInvertLevel === 0 && settings.chaosShakeLevel === 0) return;
    const interval = setInterval(() => {
      let active = false;
      let newChaos = { rgb: false, vhs: false, invert: false, shakeX: 0, shakeY: 0 };

      if (settings.chaosRgbLevel > 0 && Math.random() < settings.chaosRgbLevel / 10) { newChaos.rgb = true; active = true; }
      if (settings.chaosVhsLevel > 0 && Math.random() < settings.chaosVhsLevel / 10) { newChaos.vhs = true; active = true; }
      if (settings.chaosInvertLevel > 0 && Math.random() < (settings.chaosInvertLevel * 0.7) / 10) { newChaos.invert = true; active = true; }
      
      if (settings.chaosShakeLevel > 0 && Math.random() < settings.chaosShakeLevel / 10) {
        newChaos.shakeX = (Math.random() - 0.5) * 60 * settings.chaosShakeLevel;
        newChaos.shakeY = (Math.random() - 0.5) * 60 * settings.chaosShakeLevel;
        active = true;
      }

      if (active) {
         setChaos(newChaos);
         setTimeout(() => setChaos({ rgb: false, vhs: false, invert: false, shakeX: 0, shakeY: 0 }), 80 + Math.random() * 150);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [settings.chaosRgbLevel, settings.chaosVhsLevel, settings.chaosInvertLevel, settings.chaosShakeLevel]);

  // --- IMMERSIVE UX TIMER ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeout;
    const handleActivity = () => {
      setShowUI(true);
      clearTimeout(timeout);
      if (!showSettings && !isRecording) timeout = setTimeout(() => setShowUI(false), 3000);
    };
    handleActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [showSettings, isRecording]);

  // --- FULLSCREEN NATIVE SYNC ---
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // --- SPEECH RECOGNITION ENGINE ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showErrorToast("Web Speech API not supported. Please use Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Fallback protection if language array is somehow lost
    const safeLangs = settings.languages || ['en-US'];
    const primaryLang = safeLangs.find(l => l !== 'en-US') || 'en-US';
    recognition.lang = primaryLang;

    recognition.onstart = () => { setError(''); setIsListening(true); };
    
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') showErrorToast("Microphone access blocked.");
      else if (e.error === 'network') showErrorToast("Network error: Speech API requires internet.");
      else if (e.error === 'language-not-supported') showErrorToast(`Language ${primaryLang} not supported. Install local OS keyboard.`);
      else if (e.error !== 'no-speech') setIsListening(false);
    };

    recognition.onend = () => { if (isListeningRef.current) { try { recognition.start(); } catch(e) {} } };

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; ++i) { fullTranscript += event.results[i][0].transcript + " "; }
      processTextStream(fullTranscript.trim());
    };

    recognitionRef.current = recognition;
    if (isListeningRef.current) { try { recognition.start(); } catch(e) {} }

    return () => { 
      if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.abort(); }
    };
  }, [settings.languages]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      wordConfigs.current = []; setWords([]); setBgShapes([]); setCamera({ x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0 }); setError('');
      try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  const toggleLanguage = (code) => {
    const safeLangs = settings.languages || ['en-US'];
    let newLangs = [...safeLangs];
    if (newLangs.includes(code)) {
      newLangs = newLangs.filter(l => l !== code);
      if (newLangs.length === 0) newLangs = ['en-US']; 
    } else { newLangs.unshift(code); }
    setSettings({...settings, languages: newLangs});
  };

  const handleSliderReset = (e, key, defaultValue) => {
    if (e.ctrlKey || e.metaKey) setSettings(prev => ({ ...prev, [key]: defaultValue }));
  };

  const handleLoadPreset = (presetName) => {
    setActivePreset(presetName);
    const library = { ...PRESET_LIBRARY, ...(customPresets || {}) };
    if (library[presetName]) {
       // Spread default base settings fully to ensure no missing keys cause WSOD
       setSettings(prev => ({ ...DEFAULT_BASE_SETTINGS, ...library[presetName], languages: prev.languages || ['en-US'] }));
    }
  };

  const handleSavePreset = () => {
    const name = prompt("Enter a name for your custom preset:");
    if (name) {
      const newCustoms = { ...(customPresets || {}), [name]: { ...settings } };
      setCustomPresets(newCustoms);
      try { localStorage.setItem('kinetic_presets', JSON.stringify(newCustoms)); } catch(e) {}
      setActivePreset(name);
    }
  };

  // --- VIDEO RECORDING ENGINE ---
  const handleRecordToggle = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      return;
    }
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
         showErrorToast("Screen recording not supported in this browser environment.", 6000);
         return;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          displaySurface: "browser",
          frameRate: { ideal: 60, max: 60 }
        }, 
        audio: false 
      });
      
      let options = { mimeType: 'video/webm' };
      const preferredMimeTypes = [
        'video/webm;codecs=h264',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/webm'
      ];
      
      try {
         if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            for (const mimeType of preferredMimeTypes) {
               if (MediaRecorder.isTypeSupported(mimeType)) {
                 options = { mimeType: mimeType, videoBitsPerSecond: 8000000 }; // 8 Mbps high bitrate
                 break;
               }
            }
         }
      } catch (e) {}

      const recorder = new MediaRecorder(displayStream, options);
      const chunks = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `kinetic-mograph-${Date.now()}.webm`; a.click();
        setIsRecording(false);
        displayStream.getTracks().forEach(track => track.stop());
      };

      displayStream.getVideoTracks()[0].onended = () => { if (recorder.state !== 'inactive') recorder.stop(); };
      mediaRecorderRef.current = recorder;
      
      recorder.start(100);
      setIsRecording(true);
      setShowSettings(false);
      setShowUI(false); 
    } catch (err) {
      console.error("Screen capture failed:", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('permissions policy')) {
        showErrorToast("Embedded view restricts built-in recording. Please use an external screen recorder (like OBS/QuickTime) along with the Chroma Key background mode.", 8000);
      } else {
        showErrorToast("Screen recording permission denied or not supported by browser.", 6000);
      }
    }
  };

  // --- MOGRAPH ENGINE ---
  const processTextStream = (text) => {
    if (!text) return;
    const rawWords = text.replace(/[.,!?]/g, '').split(/\s+/).filter(w => w.length > 0);
    const chunks = [];
    let i = 0; let chunkId = 0;

    const getChunkSize = (index) => {
      const grouping = settingsRef.current.wordGrouping || 1;
      if (grouping === 6) return 999999;
      if (grouping === 1) return 1;
      const hash = Math.sin(index + 1234) * 10000;
      return Math.floor((hash - Math.floor(hash)) * grouping) + 1;
    };

    while (i < rawWords.length) {
      const size = getChunkSize(i);
      const chunk = rawWords.slice(i, i + size).join(' ');
      chunks.push({ text: chunk, id: chunkId });
      i += size; chunkId++;
    }

    let needsRender = false;

    chunks.forEach((chunkObj, index) => {
      if (!wordConfigs.current[index]) {
        const newWord = generateWordConfig(chunkObj.text, index, wordConfigs.current[index - 1]);
        wordConfigs.current[index] = newWord;
        needsRender = true;

        if (settingsRef.current.iconEngine && Math.random() > 0.4) {
          const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
          const bgShape = {
            id: Date.now() + Math.random(),
            type,
            x: newWord.x + (Math.random() * 600 - 300),
            y: newWord.y + (Math.random() * 600 - 300),
            size: Math.random() * 200 + 40,
            rotation: Math.random() * 360,
            color: settingsRef.current.bgMode === 'vaporwave' ? COLORS_VAPOR[Math.floor(Math.random()*COLORS_VAPOR.length)] : COLORS_STD[Math.floor(Math.random()*COLORS_STD.length)],
            opacity: Math.random() * 0.4 + 0.1
          };
          setBgShapes(prev => [...prev.slice(-12), bgShape]); 
        }

        if (settingsRef.current.physicsEnabled) {
          for (let p = Math.max(0, index - 20); p < index; p++) {
            const oldWord = wordConfigs.current[p];
            if (!oldWord) continue;
            const dx = oldWord.x - newWord.x; const dy = oldWord.y - newWord.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const threshold = (newWord.size + oldWord.size) * 0.7; 
            if (dist < threshold) {
              const pushForce = ((threshold - dist) / threshold) * (newWord.size * 1.2); 
              oldWord.x += (dx / dist) * pushForce; oldWord.y += (dy / dist) * pushForce;
            }
          }
        }
      } 
      else if (wordConfigs.current[index].text !== chunkObj.text) {
        wordConfigs.current[index].text = chunkObj.text; 
        needsRender = true;
      }
    });

    if (wordConfigs.current.length > chunks.length) {
      wordConfigs.current = wordConfigs.current.slice(0, chunks.length);
      needsRender = true;
    }

    if (needsRender) {
      const displayWords = wordConfigs.current.slice(-25);
      setWords([...displayWords]);
      updateCamera(wordConfigs.current[wordConfigs.current.length - 1]);
    }
  };

  const generateWordConfig = (text, index, prevConfig) => {
    const isHindi = /[\u0900-\u097F]/.test(text);
    const isGujarati = /[\u0A80-\u0AFF]/.test(text);
    
    let baseFont = 'font-anton';
    let chosenSysFont = 'Arial';
    if (settingsRef.current.fontMode === 'manual') {
      baseFont = settingsRef.current.manualFont;
    } else if (settingsRef.current.fontMode === 'system') {
      baseFont = 'custom-system-font';
      const rawSysFontString = settingsRef.current.customSystemFont || 'Arial';
      const sysFonts = rawSysFontString.split(',').map(s => s.trim()).filter(Boolean);
      chosenSysFont = sysFonts.length > 0 ? sysFonts[Math.floor(Math.random() * sysFonts.length)] : 'Arial';
    } else {
      baseFont = FONTS_DYNAMIC[Math.floor(Math.random() * FONTS_DYNAMIC.length)];
    }
    const font = isHindi ? 'font-hi' : isGujarati ? 'font-gu' : baseFont;
    
    const size = SIZES[Math.floor(Math.random() * SIZES.length)] * (settingsRef.current.textScale || 1.0);
    const palette = settingsRef.current.bgMode === 'vaporwave' ? COLORS_VAPOR : settingsRef.current.bgMode === 'white' ? COLORS_LIGHT_BG : COLORS_STD;
    let rawColor = palette[Math.floor(Math.random() * palette.length)];
    
    const isOutline = settingsRef.current.fxOutline;
    const color = isOutline ? 'transparent' : rawColor;
    
    const outlineColors = settingsRef.current.bgMode === 'white' 
        ? ['#000000', '#E63946', '#1D3557', '#000000', '#FF00FF']
        : ['#FFFFFF', '#FF00FF', '#00FFFF', '#39FF14', '#E63946'];
    const outlineColor = isOutline ? outlineColors[Math.floor(Math.random() * outlineColors.length)] : '#FFFFFF';
    const outlineWidth = (0.02 + Math.random() * 0.04).toFixed(3) + 'em';
    
    const shadowOptions = [ '0 10px 30px rgba(0,0,0,0.8)', '15px 15px 0px rgba(230,57,70,0.8)', '-15px 15px 0px rgba(0,255,255,0.8)', '10px -10px 0px rgba(57,255,20,0.8)', '0px 0px 30px rgba(255,255,255,0.6)' ];
    const shadowStr = shadowOptions[Math.floor(Math.random() * shadowOptions.length)];

    const hlColors = ['#FF00FF', '#00FFFF', '#39FF14', '#FF4500', '#F4A261'];
    const hlColor = hlColors[Math.floor(Math.random() * hlColors.length)];
    const hlRot = (Math.random() * 12 - 6).toFixed(1) + 'deg';
    const hlSx = (0.9 + Math.random() * 0.4).toFixed(2);
    const hlSy = (0.5 + Math.random() * 0.6).toFixed(2);
    const hlOp = (0.2 + Math.random() * 0.6).toFixed(2);

    const rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
    const glitchSeed = Math.random() * 10;
    const flickerDelay = Math.random() * -5;
    const floatDuration = (Math.random() * 4 + 4).toFixed(1) + 's';
    const floatDelay = (Math.random() * -5).toFixed(1) + 's';

    let x = 0; let y = 0;

    if (prevConfig) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const wpl = settingsRef.current.wordsPerLine === 0 ? getAutoWordsPerLine(settingsRef.current.aspectRatio) : settingsRef.current.wordsPerLine;
      const wrappedText = formatTextWrap(text, wpl);
      const lines = wrappedText.split('\n');
      const maxChars = Math.max(0, ...lines.map(l => l.length));
      
      const prevWpl = settingsRef.current.wordsPerLine === 0 ? getAutoWordsPerLine(settingsRef.current.aspectRatio) : settingsRef.current.wordsPerLine;
      const prevWrapped = formatTextWrap(prevConfig.text, prevWpl);
      const prevMaxChars = Math.max(0, ...prevWrapped.split('\n').map(l => l.length));
      
      const estPrevWidth = prevMaxChars * prevConfig.size * 0.55;
      const estWidth = maxChars * size * 0.55;
      const gap = Math.max(20, size * 0.25) * (settingsRef.current.wordSpacing || 1.0);
      
      switch(dir) {
        case 'right': x = prevConfig.x + (estPrevWidth / 2) + (estWidth / 2) + gap; y = prevConfig.y + (Math.random() * 60 - 30); break;
        case 'bottom': x = prevConfig.x + (Math.random() * 60 - 30); y = prevConfig.y + (prevConfig.size / 2) + (size / 2) + gap; break;
        case 'diagonal-down': x = prevConfig.x + (estPrevWidth / 2) + gap; y = prevConfig.y + (size / 2) + gap; break;
        case 'diagonal-up': x = prevConfig.x + (estPrevWidth / 2) + gap; y = prevConfig.y - (size / 2) - gap; break;
        case 'overlap': default: x = prevConfig.x + (Math.random() * 150 - 75); y = prevConfig.y + (Math.random() * 150 - 75); break;
      }
    } 

    return { id: index, text, font, customFontName: chosenSysFont, color, isOutline, outlineColor, outlineWidth, rotation, x, y, size, glitchSeed, flickerDelay, floatDuration, floatDelay, shadowStr, hlColor, hlRot, hlSx, hlSy, hlOp };
  };

  const updateCamera = (latestWord) => {
    if (!latestWord) return;

    const wpl = settingsRef.current.wordsPerLine === 0 ? getAutoWordsPerLine(settingsRef.current.aspectRatio) : settingsRef.current.wordsPerLine;
    const wrappedText = formatTextWrap(latestWord.text, wpl);
    const lines = wrappedText.split('\n');
    const maxChars = Math.max(0, ...lines.map(l => l.length));

    const estWidth = maxChars * latestWord.size * 0.6;
    const estHeight = lines.length * latestWord.size * (settingsRef.current.lineSpacing || 0.85);
    const padding = Math.max(200, latestWord.size * 1.5);
    
    // Safety check for SSR window access
    if (typeof window === 'undefined') return;

    const scaleX = window.innerWidth / (estWidth + padding);
    const scaleY = window.innerHeight / (estHeight + padding);
    let targetScale = Math.max(0.15, Math.min(Math.min(scaleX, scaleY), 3.0));
    
    const lensMultiplier = LENS_OPTICS[settingsRef.current.cameraLens] || 1.0;
    const userZoom = settingsRef.current.manualZoom || 1.0;
    targetScale = targetScale * lensMultiplier * userZoom;
    if (isNaN(targetScale) || !isFinite(targetScale)) targetScale = 1;

    let camX = isNaN(latestWord.x) ? 0 : -(latestWord.x + (settingsRef.current.spawnAnchorX || 0));
    let camY = isNaN(latestWord.y) ? 0 : -(latestWord.y + (settingsRef.current.spawnAnchorY || 0));
    let camRotX = 0; let camRotY = 0; let camRotZ = isNaN(latestWord.rotation) ? 0 : -latestWord.rotation;

    if (settingsRef.current.cameraMode === 'manual') {
      camX += settingsRef.current.manualPanX || 0; camY += settingsRef.current.manualPanY || 0;
      camRotX += settingsRef.current.manualRotX || 0; camRotY += settingsRef.current.manualRotY || 0; camRotZ += settingsRef.current.manualRotZ || 0;
    }

    setCamera({ x: camX, y: camY, scale: targetScale, rotationX: camRotX, rotationY: camRotY, rotationZ: camRotZ });
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) { 
      document.documentElement.requestFullscreen().catch(err => console.error(err)); 
      setShowSettings(false); 
    } 
    else { 
      document.exitFullscreen(); 
    }
  };

  const getAspectRatioStyle = (isWhiteBg) => {
    const borderCol = isWhiteBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    const baseStyle = { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.5s cubic-bezier(0.25, 1, 0.3, 1)' };
    switch(settings.aspectRatio) {
      case 'tiktok': return { ...baseStyle, width: 'min(100vw, 50.6vh)', height: 'min(100vh, 177vw)', borderRadius: '20px', border: `2px solid ${borderCol}` };
      case 'youtube': return { ...baseStyle, width: 'min(100vw, 160vh)', height: 'min(100vh, 56.25vw)', border: `2px solid ${borderCol}` };
      case 'cinema': return { ...baseStyle, width: 'min(100vw, 210vh)', height: 'min(100vh, 42.8vw)', border: `2px solid ${borderCol}` };
      case 'imax': return { ...baseStyle, width: 'min(100vw, 143vh)', height: 'min(100vh, 69.9vw)', border: `2px solid ${borderCol}` };
      case 'square': return { ...baseStyle, width: 'min(90vw, 90vh)', height: 'min(90vw, 90vh)', borderRadius: '10px', border: `2px solid ${borderCol}` };
      case 'fullscreen': default: return { ...baseStyle, width: '100%', height: '100%' };
    }
  };

  const resetManualCamera = () => { setSettings({...settings, manualPanX: 0, manualPanY: 0, manualRotX: 0, manualRotY: 0, manualRotZ: 0}); };

  const handleCustomBgUpload = (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (settings.customBgUrl) {
         try { URL.revokeObjectURL(settings.customBgUrl); } catch(err) {} 
      }
      const url = URL.createObjectURL(file);
      const type = (file.type && file.type.startsWith('video/')) ? 'video' : 'image';
      setSettings({...settings, bgMode: 'custom', customBgUrl: url, customBgType: type});
    } catch (error) {
      console.error("Error loading custom background:", error);
    }
  };

  const safeScale = isNaN(camera.scale) ? 1 : camera.scale;
  const safeRotX = isNaN(camera.rotationX) ? 0 : camera.rotationX;
  const safeRotY = isNaN(camera.rotationY) ? 0 : camera.rotationY;
  const safeRotZ = isNaN(camera.rotationZ) ? 0 : camera.rotationZ;
  const safeX = isNaN(camera.x) ? 0 : camera.x;
  const safeY = isNaN(camera.y) ? 0 : camera.y;

  const isChromaGreen = settings.bgMode === 'chroma-green';
  const isChromaBlue = settings.bgMode === 'chroma-blue';
  const isWhite = settings.bgMode === 'white';
  const isChroma = isChromaGreen || isChromaBlue;
  const wrapperBgColor = isChromaGreen ? '#00FF00' : isChromaBlue ? '#0000FF' : isWhite ? '#FFFFFF' : '#050505';

  const renderShape = (s) => {
    const style = { position: 'absolute', left: s.x + (settings.spawnAnchorX || 0), top: s.y + (settings.spawnAnchorY || 0), transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, opacity: s.opacity, zIndex: 5, pointerEvents: 'none' };
    switch(s.type) {
      case 'circle': return <div key={s.id} style={{...style, width: s.size, height: s.size, borderRadius: '50%', border: `4px solid ${s.color}`}} />;
      case 'square': return <div key={s.id} style={{...style, width: s.size, height: s.size, border: `4px solid ${s.color}`}} />;
      case 'triangle': return <div key={s.id} style={{...style, width: 0, height: 0, borderLeft: `${s.size/2}px solid transparent`, borderRight: `${s.size/2}px solid transparent`, borderBottom: `${s.size}px solid ${s.color}`}} />;
      case 'cross': return <div key={s.id} className="font-sans font-black" style={{...style, color: s.color, fontSize: s.size, lineHeight: 1}}>+</div>;
      case 'asterisk': return <div key={s.id} className="font-sans font-black" style={{...style, color: s.color, fontSize: s.size, lineHeight: 1}}>*</div>;
      default: return null;
    }
  };

  return (
    <div 
      className={`kinetic-wrapper relative w-full h-screen flex items-center justify-center overflow-hidden font-sans text-white select-none transition-colors duration-1000 ${(!showUI && !showSettings) || isFullscreen ? 'cursor-none' : ''}`} 
      style={{ backgroundColor: wrapperBgColor }}
      onDoubleClick={toggleFullscreen}
    >
      <style>{getGlobalStyles(settings.animationSpeed)}</style>
      
      {isRecording && !isFullscreen && (
        <div className="absolute top-6 left-6 z-[100] flex items-center bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-3 rec-indicator shadow-[0_0_10px_red]"></div>
          <span className="text-xs font-bold tracking-widest uppercase">REC (Capture Active)</span>
        </div>
      )}

      {/* Global Chaos Invert applied to Matte Box */}
      <div style={getAspectRatioStyle(isWhite)} className={`${chaos.invert && !isChroma ? 'chaos-invert' : ''}`}>
        
        {/* Custom Background Render */}
        {settings.bgMode === 'custom' && settings.customBgUrl && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {settings.customBgType === 'video' ? (
              <video src={settings.customBgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
            ) : (
              <img src={settings.customBgUrl} className="w-full h-full object-cover opacity-80" alt="Custom BG" />
            )}
          </div>
        )}

        {/* Dynamic Backgrounds */}
        {!isChroma && (
          <>
            {!isWhite && <div className="noise" />}
            {!isWhite && <div className="vignette" />}
            {settings.bgMode === 'vaporwave' && <div className="vaporwave-grid" />}
            {settings.bgMode === 'plasma' && <div className="plasma-bg" />}
            
            {/* Texture Overlays */}
            {settings.textureOverlay === 'halftone' && <div className="texture-halftone" />}
            {settings.textureOverlay === 'crt' && <div className="texture-crt" />}
            {settings.textureOverlay === 'grunge' && <div className="texture-grunge" />}
          </>
        )}

        {/* Global Chaos VHS Filter */}
        <div className={`absolute inset-0 pointer-events-none z-40 ${chaos.vhs && !isChroma ? 'chaos-vhs bg-white/5' : ''}`}></div>

        <div className={`camera-rig absolute ${chaos.rgb && !isChroma ? 'chaos-rgb' : ''}`} style={{ transform: `scale(${safeScale}) rotateX(${safeRotX}deg) rotateY(${safeRotY}deg) rotateZ(${safeRotZ}deg) translate(${safeX + chaos.shakeX}px, ${safeY + chaos.shakeY}px)` }}>
          
          {/* Abstract Geometry Engine Output */}
          {!isChroma && bgShapes.map(s => renderShape(s))}

          {words.map((w, idx) => {
            const isLatest = idx === words.length - 1;
            const age = words.length - 1 - idx;
            
            const targetOpacity = isLatest ? 1 : Math.max(0, 1 - (age * (settings.fadeRate || 0.15)));
            const targetBlur = isLatest ? 0 : age * (settings.blurIntensity || 4);
            
            const isGlitching = w.glitchSeed < (settings.glitchLevel || 0);
            const glitchStyle = isGlitching ? { animation: `glitch-anim ${1 + w.glitchSeed}s infinite` } : {};
            const momentumStyle = settings.momentumEnabled ? { animation: `float-parallax ${w.floatDuration} ease-in-out ${w.floatDelay} infinite` } : {};
            const markerClass = settings.fxHighlight && w.hlOp > 0.4 && !isChroma ? 'text-highlight-fx' : '';
            
            const isInfinity = settings.wordGrouping === 6;
            const finalColor = (isInfinity && !w.isOutline) ? settings.manualTextColor : w.color;
            
            let finalShadow = 'none';
            if (settings.fxShadow) {
              if (isInfinity) {
                const hex = settings.manualShadowColor || '#000000';
                const r = parseInt(hex.slice(1, 3), 16) || 0; const g = parseInt(hex.slice(3, 5), 16) || 0; const b = parseInt(hex.slice(5, 7), 16) || 0;
                finalShadow = `8px 8px 0px rgba(${r},${g},${b},${settings.manualShadowOpacity || 0.8})`;
              } else { finalShadow = w.shadowStr; }
            }
            
            const displayWpl = settings.wordsPerLine === 0 ? getAutoWordsPerLine(settings.aspectRatio) : settings.wordsPerLine;
            const finalText = formatTextWrap(w.text, displayWpl);

            return (
              <div 
                key={w.id} 
                className={`kinetic-word ${w.font !== 'custom-system-font' ? w.font : ''} ${w.isOutline ? 'text-outline-fx' : ''} ${settings.strobeFlicker && !isChroma ? 'flicker-fx' : ''}`}
                style={{ 
                  fontFamily: w.font === 'custom-system-font' ? w.customFontName : undefined,
                  fontSize: `${w.size}px`, color: finalColor, left: `${w.x + (settings.spawnAnchorX || 0)}px`, top: `${w.y + (settings.spawnAnchorY || 0)}px`, 
                  transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`, 
                  zIndex: isLatest ? 50 : 10,
                  animationDelay: `${w.flickerDelay}s`,
                  textAlign: settings.textAlign,
                  whiteSpace: settings.textAlign === 'justify' ? 'normal' : 'pre',
                  lineHeight: settings.lineSpacing,
                  '--outline-color': w.outlineColor, '--outline-width': w.outlineWidth,
                  '--hl-color': w.hlColor, '--hl-rot': w.hlRot, '--hl-sx': w.hlSx, '--hl-sy': w.hlSy, '--hl-op': w.hlOp
                }}
              >
                {/* Fixed Highlight Frenzy by placing markerClass on inner container */}
                <div 
                   className={`word-inner ${markerClass}`} 
                   style={{ 
                     opacity: targetOpacity, 
                     filter: `blur(${targetBlur}px) ${settings.neonGlow && !isChroma ? 'drop-shadow(0 0 20px currentColor)' : ''}`, 
                     textShadow: finalShadow,
                     transition: 'opacity 0.4s, filter 0.4s', 
                     width: settings.textAlign === 'justify' ? `${w.size * 5}px` : 'auto',
                     ...glitchStyle, ...momentumStyle
                   }}
                >
                  {finalText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Panel Overlay - BULLETPROOF SCROLL FIX & HIGH CONTRAST */}
      <div className={`absolute right-6 top-8 bottom-28 bg-black/95 backdrop-blur-3xl border border-white/20 rounded-3xl w-80 z-[60] shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col ${showSettings ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
        
        {/* Fixed Header & Close Button (Does not scroll) */}
        <div className="flex-shrink-0 pt-6 px-6 pb-4 relative z-10 border-b border-white/5">
          <button onClick={() => setShowSettings(false)} className="absolute top-4 left-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg p-2 text-center text-[9px] font-bold text-blue-200 tracking-wider uppercase mt-8">
            Tip: Ctrl+Click any slider to reset
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 pt-4 flex flex-col gap-6 settings-scroll overscroll-contain">
          
          {/* --- PRESET MANAGER --- */}
          <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
            <label className="text-xs opacity-80 font-bold uppercase flex items-center text-yellow-400"><Bookmark className="w-4 h-4 mr-2"/> Preset Library</label>
            <div className="flex gap-2">
              <select 
                value={activePreset} 
                onChange={(e) => handleLoadPreset(e.target.value)}
                className="flex-1 bg-gray-900 border border-white/20 rounded-lg text-[10px] font-bold uppercase p-2 focus:outline-none text-white truncate"
              >
                <optgroup label="Built-in Mograph" className="bg-gray-900 text-white">
                  {Object.keys(PRESET_LIBRARY).map(p => <option key={p} value={p} className="bg-gray-900 text-white">{p}</option>)}
                </optgroup>
                {Object.keys(customPresets).length > 0 && (
                  <optgroup label="My Custom Presets" className="bg-gray-900 text-white">
                    {Object.keys(customPresets).map(p => <option key={p} value={p} className="bg-gray-900 text-white">{p}</option>)}
                  </optgroup>
                )}
              </select>
              <button onClick={handleSavePreset} className="bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 p-2 rounded-lg text-yellow-400 transition-colors" title="Save Current as Preset">
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* --- TYPOGRAPHY TRANSFORM --- */}
          <div className="flex flex-col gap-3">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Type className="w-4 h-4 mr-2"/> Typography Transform</label>
            
            <div className="flex flex-col gap-1">
               <div className="flex gap-2 mb-1">
                  <button onClick={() => setSettings({...settings, fontMode: 'dynamic'})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.fontMode === 'dynamic' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Dynamic</button>
                  <button onClick={() => setSettings({...settings, fontMode: 'manual'})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.fontMode === 'manual' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Manual</button>
                  <button onClick={() => setSettings({...settings, fontMode: 'system'})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.fontMode === 'system' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>System</button>
               </div>
               {settings.fontMode === 'manual' && (
                  <select value={settings.manualFont} onChange={(e) => setSettings({...settings, manualFont: e.target.value})} className="w-full bg-gray-900 border border-white/20 rounded text-[10px] p-1.5 text-white">
                    {FONTS_ALL.map(f => <option key={f} value={f} className="bg-gray-900 text-white">{f.replace('font-', '').toUpperCase()}</option>)}
                  </select>
               )}
               {settings.fontMode === 'system' && (
                  <input 
                    type="text" 
                    value={settings.customSystemFont || ''} 
                    onChange={(e) => setSettings({...settings, customSystemFont: e.target.value})} 
                    placeholder="e.g. Arial, Impact, Comic Sans MS" 
                    title="Enter a comma-separated list of fonts"
                    className="w-full bg-black/50 border border-white/20 rounded text-[10px] p-1.5 text-white focus:outline-none focus:border-white/50 placeholder-white/40" 
                  />
               )}
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-green-400">Text Scale</span><span className="text-[10px] opacity-60 font-bold text-green-400">{settings.textScale.toFixed(1)}x</span></div>
              <input type="range" min="0.3" max="3.0" step="0.1" value={settings.textScale} onChange={(e) => setSettings({...settings, textScale: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'textScale', 1.0)} className="w-full accent-green-400" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-green-400">Word Spacing</span><span className="text-[10px] opacity-60 font-bold text-green-400">{settings.wordSpacing.toFixed(1)}x</span></div>
              <input type="range" min="0.0" max="5.0" step="0.1" value={settings.wordSpacing} onChange={(e) => setSettings({...settings, wordSpacing: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'wordSpacing', 1.0)} className="w-full accent-green-400" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-green-400">Line Spacing</span><span className="text-[10px] opacity-60 font-bold text-green-400">{settings.lineSpacing.toFixed(2)}x</span></div>
              <input type="range" min="0.5" max="2.0" step="0.05" value={settings.lineSpacing} onChange={(e) => setSettings({...settings, lineSpacing: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'lineSpacing', 0.85)} className="w-full accent-green-400" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-green-400">Words Per Line</span><span className="text-[10px] opacity-60 font-bold text-green-400">{settings.wordsPerLine === 0 ? 'Auto' : settings.wordsPerLine}</span></div>
              <input type="range" min="0" max="15" step="1" value={settings.wordsPerLine} onChange={(e) => setSettings({...settings, wordsPerLine: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'wordsPerLine', 0)} className="w-full accent-green-400" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
               <label className="text-[10px] opacity-60 font-bold uppercase">Alignment</label>
               <div className="flex gap-1">
                  {['left', 'center', 'right', 'justify'].map(align => (
                     <button key={align} onClick={() => setSettings({...settings, textAlign: align})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.textAlign === align ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{align}</button>
                  ))}
               </div>
            </div>
          </div>

          {/* --- CAMERA OPTICS & FRAMING --- */}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Camera className="w-4 h-4 mr-2"/> Transform & 3D Camera</label>
            
            <div className="flex gap-2">
              <button onClick={() => setSettings({...settings, cameraMode: 'auto'})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.cameraMode === 'auto' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Auto Track</button>
              <button onClick={() => setSettings({...settings, cameraMode: 'manual'})} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.cameraMode === 'manual' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Manual Edit</button>
            </div>

            {settings.cameraMode === 'manual' && (
               <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] opacity-80 uppercase font-bold text-blue-400">Relative Offsets</span>
                     <button onClick={resetManualCamera} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[8px] font-bold uppercase transition-colors text-white">Reset Center</button>
                  </div>
                  <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold">Pan X</span><span className="text-[10px] opacity-60 font-bold">{settings.manualPanX}px</span></div>
                  <input type="range" min="-2000" max="2000" step="50" value={settings.manualPanX} onChange={(e)=>setSettings({...settings, manualPanX: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualPanX', 0)} className="accent-white" />
                  <div className="flex justify-between mt-1"><span className="text-[10px] opacity-60 uppercase font-bold">Pan Y</span><span className="text-[10px] opacity-60 font-bold">{settings.manualPanY}px</span></div>
                  <input type="range" min="-2000" max="2000" step="50" value={settings.manualPanY} onChange={(e)=>setSettings({...settings, manualPanY: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualPanY', 0)} className="accent-white" />
                  <div className="flex justify-between mt-1"><span className="text-[10px] opacity-60 uppercase font-bold">Rot X (Tilt)</span><span className="text-[10px] opacity-60 font-bold">{settings.manualRotX}°</span></div>
                  <input type="range" min="-90" max="90" step="5" value={settings.manualRotX} onChange={(e)=>setSettings({...settings, manualRotX: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualRotX', 0)} className="accent-white" />
                  <div className="flex justify-between mt-1"><span className="text-[10px] opacity-60 uppercase font-bold">Rot Y (Pan)</span><span className="text-[10px] opacity-60 font-bold">{settings.manualRotY}°</span></div>
                  <input type="range" min="-90" max="90" step="5" value={settings.manualRotY} onChange={(e)=>setSettings({...settings, manualRotY: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualRotY', 0)} className="accent-white" />
                  <div className="flex justify-between mt-1"><span className="text-[10px] opacity-60 uppercase font-bold">Rot Z (Roll)</span><span className="text-[10px] opacity-60 font-bold">{settings.manualRotZ}°</span></div>
                  <input type="range" min="-180" max="180" step="5" value={settings.manualRotZ} onChange={(e)=>setSettings({...settings, manualRotZ: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualRotZ', 0)} className="accent-white" />
               </div>
            )}

            <div className="flex flex-col gap-1 mt-1">
               <label className="text-[10px] opacity-60 font-bold uppercase">Spawn Anchor (X, Y)</label>
               <input type="range" min="-1500" max="1500" step="50" value={settings.spawnAnchorX} onChange={(e)=>setSettings({...settings, spawnAnchorX: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'spawnAnchorX', 0)} className="accent-white mb-1" />
               <input type="range" min="-1500" max="1500" step="50" value={settings.spawnAnchorY} onChange={(e)=>setSettings({...settings, spawnAnchorY: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'spawnAnchorY', 0)} className="accent-white" />
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-[10px] opacity-60 font-bold uppercase">Aspect Ratio Output</label>
              <div className="grid grid-cols-3 gap-1">
                {['fullscreen', 'tiktok', 'youtube', 'cinema', 'imax', 'square'].map(ratio => (
                  <button key={ratio} onClick={() => setSettings({...settings, aspectRatio: ratio})} className={`py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.aspectRatio === ratio ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{ratio === 'fullscreen' ? 'Full' : ratio}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] opacity-60 font-bold uppercase">Camera Lens (FOV)</label>
              <div className="grid grid-cols-3 gap-1">
                {Object.keys(LENS_OPTICS).map(lens => (
                  <button key={lens} onClick={() => setSettings({...settings, cameraLens: lens})} className={`py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.cameraLens === lens ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{lens}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-blue-400">Manual Zoom</span><span className="text-[10px] opacity-60 font-bold text-blue-400">{settings.manualZoom.toFixed(1)}x</span></div>
              <input type="range" min="0.6" max="2.0" step="0.1" value={settings.manualZoom} onChange={(e) => setSettings({...settings, manualZoom: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualZoom', 1.0)} className="w-full accent-blue-400" />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Monitor className="w-4 h-4 mr-2"/> Environment & Export</label>
            <div className="grid grid-cols-5 gap-1 mb-1">
              {['dark', 'white', 'vaporwave', 'plasma', 'custom'].map(bg => (
                <button key={bg} onClick={() => setSettings({...settings, bgMode: bg})} className={`py-2 text-[8px] font-bold uppercase rounded transition-all ${settings.bgMode === bg ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{bg}</button>
              ))}
            </div>
            
            {settings.bgMode === 'custom' && (
               <label className="flex items-center justify-center w-full py-2 mt-1 mb-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded cursor-pointer transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-2 text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 <span className="text-[9px] font-bold uppercase text-white">{settings.customBgUrl ? 'Change Background' : 'Upload Image / Video'}</span>
                 <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCustomBgUpload} />
               </label>
            )}

            <div className="grid grid-cols-2 gap-1">
              <button onClick={() => setSettings({...settings, bgMode: 'chroma-green'})} className={`py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.bgMode === 'chroma-green' ? 'bg-[#00FF00] text-black shadow-[0_0_10px_#00FF00]' : 'bg-white/10 hover:bg-white/20'}`}>Chroma Green</button>
              <button onClick={() => setSettings({...settings, bgMode: 'chroma-blue'})} className={`py-1.5 text-[9px] font-bold uppercase rounded transition-all ${settings.bgMode === 'chroma-blue' ? 'bg-[#0000FF] text-white shadow-[0_0_10px_#0000FF]' : 'bg-white/10 hover:bg-white/20'}`}>Chroma Blue</button>
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-[10px] opacity-60 font-bold uppercase flex items-center"><Layers className="w-3 h-3 mr-1"/> Texture Overlay</label>
              <div className="grid grid-cols-4 gap-1">
                {['none', 'halftone', 'crt', 'grunge'].map(tex => (
                  <button key={tex} onClick={() => setSettings({...settings, textureOverlay: tex})} className={`py-1.5 text-[8px] font-bold uppercase rounded transition-all ${settings.textureOverlay === tex ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{tex}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Zap className="w-4 h-4 mr-2"/> Kinetic FX</label>
            
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setSettings({...settings, physicsEnabled: !settings.physicsEnabled})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.physicsEnabled ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>PHYSICS</button>
               <button onClick={() => setSettings({...settings, momentumEnabled: !settings.momentumEnabled})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.momentumEnabled ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>MOMENTUM</button>
               <button onClick={() => setSettings({...settings, neonGlow: !settings.neonGlow})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.neonGlow ? 'bg-[#FF00FF] text-white border-[#FF00FF] shadow-[0_0_15px_#FF00FF]' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>NEON GLOW</button>
               <button onClick={() => setSettings({...settings, strobeFlicker: !settings.strobeFlicker})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.strobeFlicker ? 'bg-[#00FFFF] text-black border-[#00FFFF] shadow-[0_0_15px_#00FFFF]' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>STROBE</button>
               <button onClick={() => setSettings({...settings, iconEngine: !settings.iconEngine})} className={`col-span-2 py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.iconEngine ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_#FACC15]' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>GEOMETRY ENGINE</button>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-red-400">Glitch Intensity</span><span className="text-[10px] opacity-60 font-bold text-red-400">{settings.glitchLevel}</span></div>
              <input type="range" min="0" max="10" value={settings.glitchLevel} onChange={(e) => setSettings({...settings, glitchLevel: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'glitchLevel', 2)} className="w-full accent-red-400" />
            </div>

            {/* 🔥 Granular Chaos Engine */}
            <div className="flex flex-col gap-2 mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex justify-between items-center border-b border-red-500/30 pb-1.5 mb-1">
                <span className="text-[10px] opacity-80 uppercase font-bold text-red-400">Chaos Engine</span>
                <span className="text-[8px] opacity-60 font-bold text-red-300">CTRL+CLICK TO RESET</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span className="text-[9px] opacity-70 uppercase font-bold text-red-300">RGB Split</span><span className="text-[9px] opacity-70 font-bold text-red-300">{settings.chaosRgbLevel}</span></div>
                  <input type="range" min="0" max="10" step="1" value={settings.chaosRgbLevel} onChange={(e) => setSettings({...settings, chaosRgbLevel: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'chaosRgbLevel', 0)} className="w-full accent-red-500" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span className="text-[9px] opacity-70 uppercase font-bold text-red-300">VHS Track</span><span className="text-[9px] opacity-70 font-bold text-red-300">{settings.chaosVhsLevel}</span></div>
                  <input type="range" min="0" max="10" step="1" value={settings.chaosVhsLevel} onChange={(e) => setSettings({...settings, chaosVhsLevel: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'chaosVhsLevel', 0)} className="w-full accent-red-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span className="text-[9px] opacity-70 uppercase font-bold text-red-300">Invert</span><span className="text-[9px] opacity-70 font-bold text-red-300">{settings.chaosInvertLevel}</span></div>
                  <input type="range" min="0" max="10" step="1" value={settings.chaosInvertLevel} onChange={(e) => setSettings({...settings, chaosInvertLevel: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'chaosInvertLevel', 0)} className="w-full accent-red-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span className="text-[9px] opacity-70 uppercase font-bold text-red-300">Shake</span><span className="text-[9px] opacity-70 font-bold text-red-300">{settings.chaosShakeLevel}</span></div>
                  <input type="range" min="0" max="10" step="1" value={settings.chaosShakeLevel} onChange={(e) => setSettings({...settings, chaosShakeLevel: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'chaosShakeLevel', 0)} className="w-full accent-red-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Type className="w-4 h-4 mr-2"/> Pop-Art Text FX</label>
            <div className="grid grid-cols-3 gap-2">
               <button onClick={() => setSettings({...settings, fxOutline: !settings.fxOutline})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.fxOutline ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>OUTLINE</button>
               <button onClick={() => setSettings({...settings, fxShadow: !settings.fxShadow})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.fxShadow ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>SHADOW</button>
               <button onClick={() => setSettings({...settings, fxHighlight: !settings.fxHighlight})} className={`py-2 text-[10px] font-bold tracking-wider rounded-lg transition-colors border ${settings.fxHighlight ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/20 hover:text-white'}`}>MARKER</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase flex items-center"><Globe className="w-4 h-4 mr-2"/> Languages</label>
            <div className="flex gap-2">
               <button onClick={() => toggleLanguage('en-US')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border ${(settings.languages || []).includes('en-US') ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:bg-white/10'}`}>ENG</button>
               <button onClick={() => toggleLanguage('hi-IN')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border ${(settings.languages || []).includes('hi-IN') ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:bg-white/10'}`}>HIN</button>
               <button onClick={() => toggleLanguage('gu-IN')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border ${(settings.languages || []).includes('gu-IN') ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:bg-white/10'}`}>GUJ</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <label className="text-xs opacity-60 font-bold uppercase">Focus & Pacing</label>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold text-yellow-400">Anim Speed</span><span className="text-[10px] opacity-60 font-bold text-yellow-400">{(settings.animationSpeed || 1).toFixed(1)}x</span></div>
              <input type="range" min="0.2" max="3.0" step="0.1" value={settings.animationSpeed} onChange={(e) => setSettings({...settings, animationSpeed: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'animationSpeed', 1.0)} className="w-full accent-yellow-400" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold">Fade Rate</span><span className="text-[10px] opacity-60 font-bold">{Math.round((settings.fadeRate || 0.15) * 100)}%</span></div>
              <input type="range" min="0.05" max="0.5" step="0.05" value={settings.fadeRate} onChange={(e) => setSettings({...settings, fadeRate: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'fadeRate', 0.15)} className="w-full accent-white" />
            </div>
            
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold">Focus Blur</span><span className="text-[10px] opacity-60 font-bold">{settings.blurIntensity}px</span></div>
              <input type="range" min="0" max="20" step="1" value={settings.blurIntensity} onChange={(e) => setSettings({...settings, blurIntensity: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'blurIntensity', 4)} className="w-full accent-white" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between"><span className="text-[10px] opacity-60 uppercase font-bold">Word Grouping</span><span className="text-[10px] opacity-60 font-bold">{settings.wordGrouping === 6 ? 'Infinity' : settings.wordGrouping}</span></div>
              <input type="range" min="1" max="6" step="1" value={settings.wordGrouping} onChange={(e) => setSettings({...settings, wordGrouping: parseInt(e.target.value)})} onClick={(e) => handleSliderReset(e, 'wordGrouping', 1)} className="w-full accent-white" />
            </div>

            {settings.wordGrouping === 6 && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                 <span className="text-[10px] opacity-80 uppercase font-bold text-yellow-400 mb-1">Infinity Mode Styling</span>
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] opacity-60 uppercase font-bold">Text Color</span>
                   <input type="color" value={settings.manualTextColor} onChange={(e) => setSettings({...settings, manualTextColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] opacity-60 uppercase font-bold">Shadow Color</span>
                   <input type="color" value={settings.manualShadowColor} onChange={(e) => setSettings({...settings, manualShadowColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                 </div>
                 <div className="flex flex-col gap-1 mt-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] opacity-60 uppercase font-bold">Shadow Opacity</span>
                     <span className="text-[10px] opacity-60 font-bold">{(settings.manualShadowOpacity || 0.8).toFixed(1)}</span>
                   </div>
                   <input type="range" min="0" max="1" step="0.1" value={settings.manualShadowOpacity} onChange={(e) => setSettings({...settings, manualShadowOpacity: parseFloat(e.target.value)})} onClick={(e) => handleSliderReset(e, 'manualShadowOpacity', 0.8)} className="w-full accent-yellow-400" />
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && !isFullscreen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded-xl flex items-center shadow-2xl z-50 backdrop-blur-md border border-red-500/50">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-bold tracking-wide">{error}</p>
        </div>
      )}

      {/* UI Bottom Controls */}
      <div className={`absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-6 z-50 transition-all duration-500 ${(!isFullscreen && (showUI || showSettings)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
        <button onClick={handleRecordToggle} title="Record Transparent Video" className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all ${isRecording ? 'bg-red-600 border-red-500 text-white animate-pulse' : isWhite ? 'bg-black/5 hover:bg-black/10 border-black/20 text-black hover:text-red-600' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-red-400'}`}>
          {isRecording ? <StopCircle className="w-4 h-4" /> : <Video className="w-5 h-5" />}
        </button>

        <button onClick={toggleListening} className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'bg-red-600 hover:bg-red-500 scale-110 animate-pulse text-white' : isWhite ? 'bg-black/5 hover:bg-black/10 backdrop-blur-md border border-black/20 text-black' : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white'}`}>
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button onClick={toggleFullscreen} className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all ${isWhite ? 'bg-black/5 hover:bg-black/10 border-black/20 text-black' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}>
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all ${showSettings ? 'bg-white text-black border-white' : isWhite ? 'bg-black/5 hover:bg-black/10 border-black/20 text-black' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}>
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {!isListening && words.length === 0 && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-40">
          <h1 className={`text-6xl md:text-8xl font-black font-montserrat tracking-tighter mb-4 opacity-80 ${isWhite ? 'text-black' : ''}`}>KINETIC<br/>VOICE</h1>
          <p className={`text-xl font-bold font-inter tracking-widest uppercase opacity-50 ${isWhite ? 'text-black' : ''}`}>Click Mic to Start Mograph</p>
        </div>
      )}
    </div>
  );
}
