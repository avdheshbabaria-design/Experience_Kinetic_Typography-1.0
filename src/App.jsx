import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Maximize, Minimize, AlertCircle, Sliders, Activity, Zap, Type, Globe, Camera, Monitor, X, Save, Bookmark, Video, StopCircle, Layers, Palette, FolderDown, RotateCcw } from 'lucide-react';

// 🔥 Dual-Vault Deduplication Engine
const mergeTranscripts = (base, addition) => {
  const bText = (base || '').trim();
  const aText = (addition || '').trim();
  if (!bText) return aText;
  if (!aText) return bText;

  const bWords = bText.split(/\s+/);
  const aWords = aText.split(/\s+/);
  
  const cleanB = bText.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);
  const cleanA = aText.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);

  const searchStart = Math.max(0, cleanB.length - 20);
  
  let bestMatchIndex = -1;
  let maxMatchLen = 0;

  for (let i = searchStart; i < cleanB.length; i++) {
    let matchLen = 0;
    while (
      i + matchLen < cleanB.length && 
      matchLen < cleanA.length && 
      cleanB[i + matchLen] === cleanA[matchLen]
    ) {
      matchLen++;
    }
    
    if (matchLen > 0 && (matchLen === cleanA.length || i + matchLen === cleanB.length)) {
      if (matchLen > maxMatchLen) {
         maxMatchLen = matchLen;
         bestMatchIndex = i;
      }
    }
  }

  if (bestMatchIndex !== -1) {
    const newWords = aWords.slice(maxMatchLen);
    if (newWords.length > 0) {
       return bText + ' ' + newWords.join(' ');
    } else {
       return bText;
    }
  }

  return bText + ' ' + aText;
};

// --- CSS STYLES & FONTS ---
const getGlobalStyles = (speed, customFonts = []) => `
  ${customFonts.map(f => `@import url('https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}&display=swap');`).join('\n')}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Bodoni+Moda:ital,opsz,wght@0,6..96,900;1,6..96,900&family=Montserrat:ital,wght@0,900;1,900&family=VT323&family=Noto+Sans+Devanagari:wght@900&family=Noto+Sans+Gujarati:wght@900&display=swap');

  .kinetic-wrapper { --speed: ${speed || 1}; }

  /* MODERN UI FONT */
  .ui-font { font-family: 'Inter', sans-serif; }
  
  /* SLEEK GLASS SLIDERS */
  .glass-slider {
    -webkit-appearance: none; background: transparent; height: 24px; width: 100%; outline: none; margin: 4px 0; touch-action: none;
  }
  .glass-slider::-webkit-slider-runnable-track {
    height: 4px; background: rgba(255, 255, 255, 0.15); border-radius: 2px; width: 100%; transition: background 0.2s;
  }
  .glass-slider:hover::-webkit-slider-runnable-track {
    background: rgba(255, 255, 255, 0.3);
  }
  .glass-slider::-webkit-slider-thumb {
    -webkit-appearance: none; height: 16px; width: 16px; background: #ffffff;
    border-radius: 50%; cursor: pointer; margin-top: -6px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); 
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .glass-slider:active::-webkit-slider-thumb { transform: scale(0.9); cursor: grabbing; }

  .glass-slider::-moz-range-track {
    height: 4px; background: rgba(255, 255, 255, 0.15); border-radius: 2px; width: 100%;
  }
  .glass-slider::-moz-range-thumb {
    height: 16px; width: 16px; background: #ffffff; border: none;
    border-radius: 50%; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-slider::-moz-range-thumb:hover { transform: scale(1.2); }
  .glass-slider:active::-moz-range-thumb { transform: scale(0.9); }

  /* KINETIC MOGRAPH ENGINE FX */
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .gradient-text-fx { background: linear-gradient(90deg, var(--c1), var(--c2), var(--c3), var(--c1)); background-size: 300% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 8s linear infinite; }

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

  @keyframes wordAppear { 0% { transform: scale(0.2) translateZ(-500px); opacity: 0; filter: blur(30px); } 100% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); } }
  .kinetic-word { position: absolute; top: 0; left: 0; transform-origin: center center; transition: left calc(0.8s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275), top calc(0.8s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .word-inner { animation: wordAppear calc(0.6s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; display: inline-block; position: relative; }

  @keyframes glitch-anim { 0% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); } 20% { transform: translate(-4px, 2px) skew(5deg); clip-path: inset(10% 0 60% 0); filter: hue-rotate(90deg); } 40% { transform: translate(4px, -2px) skew(-5deg); clip-path: inset(60% 0 10% 0); } 60% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); filter: hue-rotate(0deg); } 100% { transform: translate(0) skew(0deg); clip-path: inset(0 0 0 0); } }
  @keyframes float-parallax { 0% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-15px) translateX(10px); } 100% { transform: translateY(0px) translateX(0px); } }

  .text-outline-fx { color: transparent !important; -webkit-text-stroke: var(--outline-width, 0.04em) var(--outline-color, #FFF); }
  .text-highlight-fx::before { content: ''; position: absolute; inset: -0.05em -0.1em; background-color: var(--hl-color, rgba(255,255,255,0.2)); opacity: var(--hl-op, 0.8); transform: rotate(var(--hl-rot, 0deg)) scale(var(--hl-sx, 1), var(--hl-sy, 1)); border-radius: 0.1em; z-index: -1; pointer-events: none; }
  .camera-rig { transition: transform calc(0.9s / var(--speed, 1)) cubic-bezier(0.25, 1, 0.3, 1); transform-origin: 0 0; will-change: transform; perspective: 1000px; }

  /* GENERATIVE ENGINE FX */
  @keyframes float-up { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 100% { transform: translate(calc(-50% + var(--driftX, 0px)), -500px) scale(0); opacity: 0; } }
  @keyframes blob-morph { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }
  @keyframes pulse-line { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; box-shadow: 0 0 10px currentColor; } }

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

  @keyframes recPulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
  .rec-indicator { animation: recPulse 1.5s infinite; }

  /* Custom Settings Scrollbar */
  .settings-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
  .settings-scroll::-webkit-scrollbar { width: 6px; }
  .settings-scroll::-webkit-scrollbar-track { background: transparent; }
  .settings-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
  .settings-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
`;

// --- UI COMPONENTS (MODERN GLASSMORPHISM) ---
const GlassBtn = ({ active, onClick, children, className = "", icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 rounded-xl text-[10px] sm:text-xs font-semibold tracking-wide px-3 py-3 sm:py-2 transition-all duration-300 focus:outline-none touch-manipulation border ${
      active 
        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
        : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/15 hover:border-white/20'
    } ${className}`}
  >
    {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
    {children}
  </button>
);

const GlassSlider = ({ label, value, min, max, step, onChange, displayVal, onReset }) => (
  <div 
    className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 transition-colors group hover:bg-white/10" 
    onClick={(e) => { if ((e.ctrlKey || e.metaKey) && onReset) onReset(); }}
    title="Ctrl+Click to Reset"
  >
    <div className="flex justify-between items-center mb-1">
       <span className="text-[10px] uppercase font-semibold tracking-wider text-white/50 group-hover:text-white/80 transition-colors">{label}</span>
       <span className="text-xs font-medium text-white/90">{displayVal !== undefined ? displayVal : value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="glass-slider w-full" />
  </div>
);


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

const POPART_ASSETS = ['⚡', '💥', '⭐', '🗯️', '💢', '✨'];
const HUD_ASSETS = ['[ ]', '┼', 'SYS.RDY', '0x8F9A', '///', 'REC', '✛', '∿', '▼'];
const EMOJI_ASSETS = ['🔥', '🚀', '✨', '💀', '💯', '👽', '👁️', '🧊', '🌀', '❤️', '👀', '💡'];

const ENGINES = [
  { id: 'geometry', label: 'Shapes' },
  { id: 'constellation', label: 'Constell.' },
  { id: 'particles', label: 'Particles' },
  { id: 'popart', label: 'Pop-Art' },
  { id: 'cyberhud', label: 'Cyber-HUD' },
  { id: 'blobs', label: 'Fluid Blobs' },
  { id: 'emoji', label: 'Emoji FX' }
];

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
  colorMode: 'auto', customColor1: '#FF00FF', customColor2: '#00FFFF', customColor3: '#39FF14',
  fadeRate: 0.15, blurIntensity: 4, glitchLevel: 2, wordGrouping: 1, animationSpeed: 1.0,
  physicsEnabled: true, momentumEnabled: true, strobeFlicker: false, neonGlow: true,
  fxOutline: false, fxShadow: false, fxHighlight: false, bgMode: 'dark',
  engineIntensities: { geometry: 0, constellation: 0, particles: 0, popart: 0, cyberhud: 0, blobs: 0, emoji: 0 },
  manualTextColor: '#FFFFFF', manualShadowColor: '#FF00FF', manualShadowOpacity: 0.8,
  customGoogleFonts: [], 
  chaosRgbLevel: 0, chaosVhsLevel: 0, chaosInvertLevel: 0, chaosShakeLevel: 0, 
  textureOverlay: 'none', 
  customBgUrl: '', customBgType: '' 
};

// --- PRESET LIBRARY ---
const PRESET_LIBRARY = {
  "Default Mograph": { ...DEFAULT_BASE_SETTINGS },
  "Subtle Natural Fade": { ...DEFAULT_BASE_SETTINGS, physicsEnabled: false, momentumEnabled: false, blurIntensity: 2, fadeRate: 0.05, animationSpeed: 0.5, fontMode: 'manual', manualFont: 'font-arial', neonGlow: false, fxShadow: false, glitchLevel: 0, cameraMode: 'manual', manualZoom: 1.1 },
  "TikTok Overdrive": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'tiktok', cameraLens: '18mm', wordGrouping: 6, wordsPerLine: 2, textScale: 1.5, physicsEnabled: false, fontMode: 'manual', manualFont: 'font-bebas', fxShadow: true, chaosShakeLevel: 6, chaosRgbLevel: 4, engineIntensities: { popart: 7, emoji: 3 } },
  "Comic Book": { ...DEFAULT_BASE_SETTINGS, fontMode: 'manual', manualFont: 'font-impact', textureOverlay: 'halftone', fxOutline: true, fxShadow: true, wordGrouping: 1, textScale: 1.5, bgMode: 'vaporwave', engineIntensities: { popart: 8 } },
  "Cinematic Trailer": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'cinema', cameraLens: '55mm', fontMode: 'manual', manualFont: 'font-bodoni', wordGrouping: 2, blurIntensity: 6, fadeRate: 0.1, textureOverlay: 'grunge', engineIntensities: { particles: 9 } },
  "Vaporwave CRT": { ...DEFAULT_BASE_SETTINGS, bgMode: 'vaporwave', fontMode: 'manual', manualFont: 'font-vt323', neonGlow: true, glitchLevel: 4, momentumEnabled: true, fxHighlight: true, textureOverlay: 'crt', chaosVhsLevel: 6, chaosRgbLevel: 3, engineIntensities: { cyberhud: 6, geometry: 3 } },
  "Hacker Terminal": { ...DEFAULT_BASE_SETTINGS, bgMode: 'dark', fontMode: 'manual', manualFont: 'font-courier', wordGrouping: 6, textAlign: 'left', manualTextColor: '#39FF14', wordsPerLine: 6, textureOverlay: 'crt', chaosVhsLevel: 4, chaosInvertLevel: 1, engineIntensities: { cyberhud: 9 } },
  "Strobe Rave": { ...DEFAULT_BASE_SETTINGS, strobeFlicker: true, neonGlow: true, bgMode: 'plasma', fxHighlight: true, wordGrouping: 2, chaosRgbLevel: 8, chaosInvertLevel: 4, chaosShakeLevel: 8, engineIntensities: { geometry: 9, emoji: 5 } },
  "Chroma Key Overlay": { ...DEFAULT_BASE_SETTINGS, bgMode: 'chroma-green', textureOverlay: 'none', chaosRgbLevel: 0, chaosVhsLevel: 0, chaosInvertLevel: 0, chaosShakeLevel: 0, fxShadow: false, fxHighlight: false, glitchLevel: 0, neonGlow: false, fontMode: 'manual', manualFont: 'font-montserrat', textScale: 1.5, wordGrouping: 6 },
  "Typewriter Doc": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', fontMode: 'manual', manualFont: 'font-courier', textAlign: 'left', wordGrouping: 6, wordsPerLine: 6, physicsEnabled: false, momentumEnabled: false, textScale: 0.8, neonGlow: false },
  "Clean Corporate": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', fontMode: 'manual', manualFont: 'font-arial', neonGlow: false, blurIntensity: 2, fadeRate: 0.1, physicsEnabled: false, manualTextColor: '#1D3557' },
  "Neon Noir": { ...DEFAULT_BASE_SETTINGS, bgMode: 'dark', fontMode: 'manual', manualFont: 'font-bodoni', fxOutline: true, fxShadow: false, neonGlow: true, blurIntensity: 8, fadeRate: 0.05, glitchLevel: 0, engineIntensities: { constellation: 9, particles: 3 } },
  "Anxiety Attack": { ...DEFAULT_BASE_SETTINGS, chaosShakeLevel: 8, chaosVhsLevel: 5, glitchLevel: 8, animationSpeed: 2.0, fadeRate: 0.3, textScale: 0.6, fontMode: 'dynamic', physicsEnabled: true },
  "Cyberpunk City": { ...DEFAULT_BASE_SETTINGS, bgMode: 'plasma', fontMode: 'manual', manualFont: 'font-anton', fxShadow: true, glitchLevel: 5, neonGlow: true, chaosRgbLevel: 4, textScale: 1.2, engineIntensities: { cyberhud: 8, particles: 6 } },
  "Zen Garden": { ...DEFAULT_BASE_SETTINGS, fontMode: 'manual', manualFont: 'font-montserrat', animationSpeed: 0.4, blurIntensity: 1, fadeRate: 0.08, momentumEnabled: true, physicsEnabled: false, neonGlow: false, glitchLevel: 0, engineIntensities: { blobs: 8, particles: 2 } },
  "Blockbuster": { ...DEFAULT_BASE_SETTINGS, aspectRatio: 'cinema', cameraLens: '85mm', textScale: 2.5, fontMode: 'manual', manualFont: 'font-impact', wordSpacing: 1.5, blurIntensity: 6, physicsEnabled: false },
  "Pop-Art Poster": { ...DEFAULT_BASE_SETTINGS, bgMode: 'white', textureOverlay: 'halftone', fxOutline: true, fxShadow: true, fontMode: 'manual', manualFont: 'font-anton', textScale: 1.8, wordGrouping: 1, engineIntensities: { popart: 8, geometry: 3 } }
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
  const [activeTab, setActiveTab] = useState('disk'); 
  const [showUI, setShowUI] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  // Settings & Presets 
  const [settings, setSettings] = useState(DEFAULT_BASE_SETTINGS);
  const [customPresets, setCustomPresets] = useState(() => {
    if (typeof window === 'undefined') return {}; 
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
  
  // Dual-Vault Speech Tracking 
  const globalTranscriptRef = useRef('');
  const sessionFinalRef = useRef('');

  const showErrorToast = (msg, duration = 6000) => {
    setError(msg);
    if (msg) setTimeout(() => setError(''), duration);
  };

  const resetParam = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  
  const resetManualCamera = () => {
    setSettings(prev => ({
      ...prev, manualPanX: 0, manualPanY: 0, manualRotX: 0, manualRotY: 0, manualRotZ: 0
    }));
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
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
    
    const safeLangs = settings.languages || ['en-US'];
    const primaryLang = safeLangs.find(l => l !== 'en-US') || 'en-US';
    recognition.lang = primaryLang;

    recognition.onstart = () => { setError(''); setIsListening(true); };
    
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') showErrorToast("Microphone access blocked.");
      else if (e.error === 'network') showErrorToast("Network error: Speech API requires internet.");
      else if (e.error === 'language-not-supported') showErrorToast(`Language ${primaryLang} not supported.`);
      else if (e.error !== 'no-speech') setIsListening(false);
    };

    recognition.onend = () => { 
      globalTranscriptRef.current = mergeTranscripts(globalTranscriptRef.current, sessionFinalRef.current);
      sessionFinalRef.current = '';
      if (isListeningRef.current) { try { recognition.start(); } catch(e) {} } 
    };

    recognition.onresult = (event) => {
      let currentSessionFinal = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentSessionFinal += transcript + ' ';
        } else {
          interimTranscript += transcript + ' ';
        }
      }
      
      sessionFinalRef.current = currentSessionFinal.trim();
      const sessionTotal = (currentSessionFinal + interimTranscript).trim();
      
      const fullTranscript = mergeTranscripts(globalTranscriptRef.current, sessionTotal);
      processTextStream(fullTranscript);
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
      globalTranscriptRef.current = ''; 
      sessionFinalRef.current = '';
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

  const handleLoadPreset = (presetName) => {
    setActivePreset(presetName);
    const library = { ...PRESET_LIBRARY, ...(customPresets || {}) };
    if (library[presetName]) {
       const selected = library[presetName];
       let mergedIntensities = { ...DEFAULT_BASE_SETTINGS.engineIntensities, ...(selected.engineIntensities || {}) };
       if (selected.bgEngine && selected.bgEngine !== 'none' && !selected.engineIntensities) mergedIntensities[selected.bgEngine] = 5;
       setSettings(prev => ({ 
         ...DEFAULT_BASE_SETTINGS, ...selected, engineIntensities: mergedIntensities, languages: prev.languages || ['en-US'] 
       }));
    }
  };

  const handleInstallFont = (fontName, inputElemId) => {
    if (!fontName || !fontName.trim()) return;
    const cleanName = fontName.trim();
    const newCustomFonts = [...(settings.customGoogleFonts || [])];
    if (!newCustomFonts.includes(cleanName)) newCustomFonts.push(cleanName);
    setSettings({...settings, customGoogleFonts: newCustomFonts, fontMode: 'manual', manualFont: cleanName});
    const inputElem = document.getElementById(inputElemId);
    if (inputElem) inputElem.value = '';
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
         showErrorToast("Screen recording not supported in this browser environment.", 6000); return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser", frameRate: { ideal: 60, max: 60 } }, audio: false });
      let options = { mimeType: 'video/webm' };
      const preferredMimeTypes = ['video/webm;codecs=h264', 'video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'];
      try {
         if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            for (const mimeType of preferredMimeTypes) {
               if (MediaRecorder.isTypeSupported(mimeType)) { options = { mimeType: mimeType, videoBitsPerSecond: 8000000 }; break; }
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
      recorder.start(100); setIsRecording(true); setShowSettings(false); setShowUI(false); 
    } catch (err) {
      console.error("Screen capture failed:", err);
      showErrorToast("Screen recording permission denied or environment restricted.", 6000);
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
        const prevConfig = wordConfigs.current[index - 1];
        const newWord = generateWordConfig(chunkObj.text, index, prevConfig);
        wordConfigs.current[index] = newWord;
        needsRender = true;

        const intensities = settingsRef.current.engineIntensities || {};
        let newShapes = [];
        const basePalette = settingsRef.current.bgMode === 'vaporwave' ? COLORS_VAPOR : COLORS_STD;
        const randomColor = () => basePalette[Math.floor(Math.random() * basePalette.length)];

        if (intensities.geometry > 0 && Math.random() < 0.15 * intensities.geometry) {
          newShapes.push({ id: Date.now()+Math.random(), type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)], x: newWord.x + (Math.random() * 600 - 300), y: newWord.y + (Math.random() * 600 - 300), size: Math.random() * 200 + 40, rotation: Math.random() * 360, color: randomColor(), opacity: Math.random() * 0.4 + 0.1 });
        }
        if (intensities.constellation > 0 && prevConfig && Math.random() < 0.15 * intensities.constellation) {
          const dx = newWord.x - prevConfig.x; const dy = newWord.y - prevConfig.y;
          const length = Math.hypot(dx, dy); const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          newShapes.push({ id: Date.now()+Math.random(), type: 'constellation', x: prevConfig.x, y: prevConfig.y, length, angle, color: newWord.color, opacity: 0.6 });
          newShapes.push({ id: Date.now()+Math.random(), type: 'node', x: newWord.x, y: newWord.y, size: 8, color: newWord.color, opacity: 0.9 });
        }
        if (intensities.particles > 0 && Math.random() < 0.2 * intensities.particles) {
          const numParticles = Math.floor(Math.random() * intensities.particles) + Math.ceil(intensities.particles / 1.5); 
          for(let p=0; p<numParticles; p++) {
             newShapes.push({ id: Date.now()+Math.random(), type: 'particle', x: newWord.x + (Math.random() * 150 - 75), y: newWord.y + (Math.random() * 150 - 75), size: Math.random() * 6 + 2, color: randomColor(), duration: (Math.random() * 2 + 1.5).toFixed(1) });
          }
        }
        if (intensities.popart > 0 && Math.random() < 0.15 * intensities.popart) {
          newShapes.push({ id: Date.now()+Math.random(), type: 'popart', symbol: POPART_ASSETS[Math.floor(Math.random()*POPART_ASSETS.length)], x: newWord.x + (Math.random() * 300 - 150), y: newWord.y + (Math.random() * 300 - 150), size: Math.random() * 80 + 40, rotation: Math.random() * 60 - 30, color: randomColor() });
        }
        if (intensities.cyberhud > 0 && Math.random() < 0.15 * intensities.cyberhud) {
          newShapes.push({ id: Date.now()+Math.random(), type: 'hud', symbol: HUD_ASSETS[Math.floor(Math.random()*HUD_ASSETS.length)], x: newWord.x + (Math.random() * 400 - 200), y: newWord.y + (Math.random() * 400 - 200), size: Math.random() * 24 + 12, rotation: Math.random() * 90, color: randomColor() });
        }
        if (intensities.blobs > 0 && Math.random() < 0.15 * intensities.blobs) {
          newShapes.push({ id: Date.now()+Math.random(), type: 'blob', x: newWord.x + (Math.random() * 400 - 200), y: newWord.y + (Math.random() * 400 - 200), size: Math.random() * 400 + 200, color: randomColor(), duration: (Math.random() * 10 + 5).toFixed(1) });
        }
        if (intensities.emoji > 0 && Math.random() < 0.15 * intensities.emoji) {
          newShapes.push({ id: Date.now()+Math.random(), type: 'emoji', symbol: EMOJI_ASSETS[Math.floor(Math.random()*EMOJI_ASSETS.length)], x: newWord.x + (Math.random() * 250 - 125), y: newWord.y + (Math.random() * 250 - 125), size: Math.random() * 50 + 30, rotation: Math.random() * 360 });
        }

        if (newShapes.length > 0) setBgShapes(prev => [...prev, ...newShapes].slice(-150)); 

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
      setWords([...wordConfigs.current.slice(-25)]);
      updateCamera(wordConfigs.current[wordConfigs.current.length - 1]);
    }
  };

  const generateWordConfig = (text, index, prevConfig) => {
    const isHindi = /[\u0900-\u097F]/.test(text); const isGujarati = /[\u0A80-\u0AFF]/.test(text);
    let baseFont = 'font-anton'; let installedCustomFont = '';
    
    if (settingsRef.current.fontMode === 'manual') {
      baseFont = settingsRef.current.manualFont;
      if (!baseFont.startsWith('font-')) { installedCustomFont = baseFont; baseFont = 'custom-imported-font'; }
    } else {
      baseFont = FONTS_DYNAMIC[Math.floor(Math.random() * FONTS_DYNAMIC.length)];
    }
    const font = isHindi ? 'font-hi' : isGujarati ? 'font-gu' : baseFont;
    const size = SIZES[Math.floor(Math.random() * SIZES.length)] * (settingsRef.current.textScale || 1.0);
    const palette = settingsRef.current.bgMode === 'vaporwave' ? COLORS_VAPOR : settingsRef.current.bgMode === 'white' ? COLORS_LIGHT_BG : COLORS_STD;
    
    let rawColor;
    if (settingsRef.current.colorMode === 'solid') { rawColor = settingsRef.current.customColor1; } 
    else if (settingsRef.current.colorMode === 'palette' || settingsRef.current.colorMode === 'gradient') {
      const customPal = [settingsRef.current.customColor1, settingsRef.current.customColor2, settingsRef.current.customColor3];
      rawColor = customPal[Math.floor(Math.random() * customPal.length)];
    } else { rawColor = palette[Math.floor(Math.random() * palette.length)]; }
    
    const isOutline = settingsRef.current.fxOutline;
    const color = isOutline && settingsRef.current.colorMode !== 'gradient' ? 'transparent' : rawColor;
    const outlineColors = settingsRef.current.bgMode === 'white' ? ['#000000', '#E63946', '#1D3557', '#000000', '#FF00FF'] : ['#FFFFFF', '#FF00FF', '#00FFFF', '#39FF14', '#E63946'];
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
      const maxChars = Math.max(0, ...formatTextWrap(text, wpl).split('\n').map(l => l.length));
      const prevMaxChars = Math.max(0, ...formatTextWrap(prevConfig.text, wpl).split('\n').map(l => l.length));
      
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

    return { id: index, text, font, customFontName: installedCustomFont, color, isOutline, outlineColor, outlineWidth, rotation, x, y, size, glitchSeed, flickerDelay, floatDuration, floatDelay, shadowStr, hlColor, hlRot, hlSx, hlSy, hlOp };
  };

  const updateCamera = (latestWord) => {
    if (!latestWord || typeof window === 'undefined') return;

    const wpl = settingsRef.current.wordsPerLine === 0 ? getAutoWordsPerLine(settingsRef.current.aspectRatio) : settingsRef.current.wordsPerLine;
    const lines = formatTextWrap(latestWord.text, wpl).split('\n');
    const maxChars = Math.max(0, ...lines.map(l => l.length));

    const estWidth = maxChars * latestWord.size * 0.6;
    const estHeight = lines.length * latestWord.size * (settingsRef.current.lineSpacing || 0.85);
    const padding = Math.max(200, latestWord.size * 1.5);
    
    const scaleX = window.innerWidth / (estWidth + padding);
    const scaleY = window.innerHeight / (estHeight + padding);
    let targetScale = Math.max(0.15, Math.min(Math.min(scaleX, scaleY), 3.0)) * (LENS_OPTICS[settingsRef.current.cameraLens] || 1.0) * (settingsRef.current.manualZoom || 1.0);
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
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(err => console.error(err)); setShowSettings(false); } 
    else { document.exitFullscreen(); }
  };

  const getAspectRatioStyle = (isWhiteBg) => {
    const borderCol = isWhiteBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    const baseStyle = { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.5s cubic-bezier(0.25, 1, 0.3, 1)' };
    switch(settings.aspectRatio) {
      case 'tiktok': return { ...baseStyle, width: 'min(100vw, 50.6vh)', height: 'min(100vh, 177vw)', border: `1px solid ${borderCol}`, borderRadius: '1rem' };
      case 'youtube': return { ...baseStyle, width: 'min(100vw, 160vh)', height: 'min(100vh, 56.25vw)', border: `1px solid ${borderCol}` };
      case 'cinema': return { ...baseStyle, width: 'min(100vw, 210vh)', height: 'min(100vh, 42.8vw)', border: `1px solid ${borderCol}` };
      case 'imax': return { ...baseStyle, width: 'min(100vw, 143vh)', height: 'min(100vh, 69.9vw)', border: `1px solid ${borderCol}` };
      case 'square': return { ...baseStyle, width: 'min(90vw, 90vh)', height: 'min(90vw, 90vh)', border: `1px solid ${borderCol}`, borderRadius: '1rem' };
      case 'fullscreen': default: return { ...baseStyle, width: '100%', height: '100%' };
    }
  };

  const handleCustomBgUpload = (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (settings.customBgUrl) { try { URL.revokeObjectURL(settings.customBgUrl); } catch(err) {} }
      const url = URL.createObjectURL(file);
      setSettings({...settings, bgMode: 'custom', customBgUrl: url, customBgType: (file.type && file.type.startsWith('video/')) ? 'video' : 'image'});
    } catch (error) { console.error("Error loading background:", error); }
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
    const baseX = s.x + (settings.spawnAnchorX || 0);
    const baseY = s.y + (settings.spawnAnchorY || 0);
    
    if (s.type === 'constellation') return <div key={s.id} style={{ position: 'absolute', left: baseX, top: baseY - 1, width: s.length, height: 1, backgroundColor: s.color, transformOrigin: '0 50%', transform: `rotate(${s.angle}deg)`, opacity: s.opacity, animation: 'pulse-line 2s infinite', zIndex: 4, pointerEvents: 'none' }} />;
    if (s.type === 'node') return <div key={s.id} style={{ position: 'absolute', left: baseX, top: baseY, width: s.size, height: s.size, backgroundColor: s.color, borderRadius: '50%', transform: `translate(-50%, -50%)`, opacity: s.opacity, zIndex: 5, pointerEvents: 'none', boxShadow: `0 0 10px ${s.color}` }} />;
    if (s.type === 'particle') return <div key={s.id} style={{ position: 'absolute', left: baseX, top: baseY, width: s.size, height: s.size, backgroundColor: s.color, borderRadius: '50%', transform: `translate(-50%, -50%)`, zIndex: 4, pointerEvents: 'none', animation: `float-up ${s.duration}s ease-out forwards`, opacity: 0.8, '--driftX': (Math.random() * 200 - 100) + 'px' }} />;
    if (s.type === 'popart') return <div key={s.id} className="font-impact" style={{ position: 'absolute', left: baseX, top: baseY, fontSize: s.size, color: s.color, transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, zIndex: 5, pointerEvents: 'none', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>{s.symbol}</div>;
    if (s.type === 'hud') return <div key={s.id} className="font-vt323" style={{ position: 'absolute', left: baseX, top: baseY, fontSize: s.size, color: s.color, transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, zIndex: 5, pointerEvents: 'none', opacity: 0.7, letterSpacing: '4px' }}>{s.symbol}</div>;
    if (s.type === 'blob') return <div key={s.id} style={{ position: 'absolute', left: baseX, top: baseY, width: s.size, height: s.size, backgroundColor: s.color, transform: `translate(-50%, -50%)`, zIndex: 1, pointerEvents: 'none', opacity: 0.25, filter: 'blur(40px)', animation: `blob-morph ${s.duration}s infinite linear` }} />;
    if (s.type === 'emoji') return <div key={s.id} style={{ position: 'absolute', left: baseX, top: baseY, fontSize: s.size, transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, zIndex: 5, pointerEvents: 'none', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>{s.symbol}</div>;
    
    const style = { position: 'absolute', left: baseX, top: baseY, transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, opacity: s.opacity, zIndex: 5, pointerEvents: 'none' };
    switch(s.type) {
      case 'circle': return <div key={s.id} style={{...style, width: s.size, height: s.size, borderRadius: '50%', border: `2px solid ${s.color}`}} />;
      case 'square': return <div key={s.id} style={{...style, width: s.size, height: s.size, border: `2px solid ${s.color}`}} />;
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
      <style>{getGlobalStyles(settings.animationSpeed, settings.customGoogleFonts)}</style>
      
      {/* Global Chaos Invert applied to Matte Box */}
      <div style={getAspectRatioStyle(isWhite)} className={`${chaos.invert && !isChroma ? 'chaos-invert' : ''}`}>
        {settings.bgMode === 'custom' && settings.customBgUrl && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {settings.customBgType === 'video' ? <video src={settings.customBgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" /> : <img src={settings.customBgUrl} className="w-full h-full object-cover opacity-80" alt="Custom BG" />}
          </div>
        )}
        {!isChroma && (
          <>
            {!isWhite && <div className="noise" />}
            {!isWhite && <div className="vignette" />}
            {settings.bgMode === 'vaporwave' && <div className="vaporwave-grid" />}
            {settings.bgMode === 'plasma' && <div className="plasma-bg" />}
            {settings.textureOverlay === 'halftone' && <div className="texture-halftone" />}
            {settings.textureOverlay === 'crt' && <div className="texture-crt" />}
            {settings.textureOverlay === 'grunge' && <div className="texture-grunge" />}
          </>
        )}
        <div className={`absolute inset-0 pointer-events-none z-40 ${chaos.vhs && !isChroma ? 'chaos-vhs bg-white/5' : ''}`}></div>

        <div className={`camera-rig absolute ${chaos.rgb && !isChroma ? 'chaos-rgb' : ''}`} style={{ transform: `scale(${safeScale}) rotateX(${safeRotX}deg) rotateY(${safeRotY}deg) rotateZ(${safeRotZ}deg) translate(${safeX + chaos.shakeX}px, ${safeY + chaos.shakeY}px)` }}>
          
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
            const finalColor = (isInfinity && !w.isOutline && settings.colorMode === 'auto') ? settings.manualTextColor : w.color;
            
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
            const isGradient = settings.colorMode === 'gradient';
            const isIndic = w.font === 'font-hi' || w.font === 'font-gu';
            const activeLineHeight = isIndic ? Math.max(1.3, settings.lineSpacing) : settings.lineSpacing;

            return (
              <div 
                key={w.id} 
                className={`kinetic-word ${w.font !== 'custom-imported-font' ? w.font : ''} ${w.isOutline ? 'text-outline-fx' : ''} ${settings.strobeFlicker && !isChroma ? 'flicker-fx' : ''}`}
                style={{ 
                  fontFamily: w.font === 'custom-imported-font' ? `"${w.customFontName}", sans-serif` : undefined,
                  fontSize: `${w.size}px`, color: finalColor, left: `${w.x + (settings.spawnAnchorX || 0)}px`, top: `${w.y + (settings.spawnAnchorY || 0)}px`, 
                  transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`, 
                  zIndex: isLatest ? 50 : 10,
                  animationDelay: `${w.flickerDelay}s`,
                  textAlign: settings.textAlign,
                  whiteSpace: settings.textAlign === 'justify' ? 'normal' : 'pre',
                  lineHeight: activeLineHeight,
                  '--outline-color': w.outlineColor, '--outline-width': w.outlineWidth,
                  '--hl-color': w.hlColor, '--hl-rot': w.hlRot, '--hl-sx': w.hlSx, '--hl-sy': w.hlSy, '--hl-op': w.hlOp,
                  '--c1': settings.customColor1, '--c2': settings.customColor2, '--c3': settings.customColor3
                }}
              >
                <div 
                   className={`word-inner ${markerClass} ${isGradient ? 'gradient-text-fx' : ''}`} 
                   style={{ 
                     opacity: targetOpacity, 
                     filter: `blur(${targetBlur}px) ${settings.neonGlow && !isChroma ? 'drop-shadow(0 0 20px currentColor)' : ''}`, 
                     textShadow: finalShadow,
                     transition: 'opacity 0.4s, filter 0.4s', 
                     width: settings.textAlign === 'justify' ? `${w.size * 5}px` : 'auto',
                     padding: isIndic ? '0.25em 0' : '0.05em 0', 
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

      {/* --- MODERN GLASSMORPHISM CONTROL PANEL --- */}
      <div className={`absolute right-4 sm:right-6 top-8 bottom-32 sm:bottom-8 bg-white/10 backdrop-blur-3xl border border-white/20 w-[calc(100vw-2rem)] sm:w-[380px] z-[60] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ui-font ${showSettings ? 'opacity-100 translate-x-0 pointer-events-auto scale-100' : 'opacity-0 translate-x-12 pointer-events-none scale-95'}`}>
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <span className="text-white/90 font-bold tracking-wider text-sm">CONTROL CENTER</span>
          <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors touch-manipulation">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Tab Navigation */}
        <div className="px-4 pt-4 pb-2">
           <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 shadow-inner">
             <button onClick={() => setActiveTab('disk')} className={`flex-1 py-2.5 rounded-xl flex justify-center items-center transition-all duration-300 ${activeTab === 'disk' ? 'bg-white/20 shadow-sm text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Bookmark className="w-4 h-4"/></button>
             <button onClick={() => setActiveTab('typo')} className={`flex-1 py-2.5 rounded-xl flex justify-center items-center transition-all duration-300 ${activeTab === 'typo' ? 'bg-white/20 shadow-sm text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Type className="w-4 h-4"/></button>
             <button onClick={() => setActiveTab('cam')} className={`flex-1 py-2.5 rounded-xl flex justify-center items-center transition-all duration-300 ${activeTab === 'cam' ? 'bg-white/20 shadow-sm text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Camera className="w-4 h-4"/></button>
             <button onClick={() => setActiveTab('fx')} className={`flex-1 py-2.5 rounded-xl flex justify-center items-center transition-all duration-300 ${activeTab === 'fx' ? 'bg-white/20 shadow-sm text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Layers className="w-4 h-4"/></button>
             <button onClick={() => setActiveTab('chaos')} className={`flex-1 py-2.5 rounded-xl flex justify-center items-center transition-all duration-300 ${activeTab === 'chaos' ? 'bg-white/20 shadow-sm text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Zap className="w-4 h-4"/></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 settings-scroll">
          
          {/* DISK MODULE */}
          {activeTab === 'disk' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><FolderDown className="w-4 h-4" /> Load Blueprint</span>
                <select value={activePreset} onChange={(e) => handleLoadPreset(e.target.value)} className="w-full bg-black/30 rounded-xl px-3 py-3 outline-none text-sm text-white border border-white/10 hover:border-white/20 transition-colors">
                  <optgroup label="System Presets" className="bg-[#141518]">
                    {Object.keys(PRESET_LIBRARY).map(p => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                  {Object.keys(customPresets).length > 0 && (
                    <optgroup label="User Tapes" className="bg-[#141518]">
                      {Object.keys(customPresets).map(p => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                  )}
                </select>
                <GlassBtn onClick={handleSavePreset} className="mt-3 w-full" icon={Save}>Save Current State</GlassBtn>
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Language Model</span>
                <div className="grid grid-cols-3 gap-2">
                   <GlassBtn active={(settings.languages || []).includes('en-US')} onClick={() => toggleLanguage('en-US')}>ENG</GlassBtn>
                   <GlassBtn active={(settings.languages || []).includes('hi-IN')} onClick={() => toggleLanguage('hi-IN')}>HIN</GlassBtn>
                   <GlassBtn active={(settings.languages || []).includes('gu-IN')} onClick={() => toggleLanguage('gu-IN')}>GUJ</GlassBtn>
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY MODULE */}
          {activeTab === 'typo' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-2">
                <GlassBtn active={settings.fontMode === 'dynamic'} onClick={() => setSettings({...settings, fontMode: 'dynamic'})}>Randomize</GlassBtn>
                <GlassBtn active={settings.fontMode === 'manual'} onClick={() => setSettings({...settings, fontMode: 'manual'})}>Specific Font</GlassBtn>
              </div>
              
              {settings.fontMode === 'manual' && (
                <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <select value={settings.manualFont} onChange={(e) => setSettings({...settings, manualFont: e.target.value})} className="w-full bg-black/30 rounded-xl px-3 py-3 outline-none text-sm text-white border border-white/10 hover:border-white/20 transition-colors mb-3">
                    {FONTS_ALL.map(f => <option key={f} value={f} className="bg-[#141518]">{f.replace('font-', '').toUpperCase()}</option>)}
                    {settings.customGoogleFonts.map(f => <option key={f} value={f} className="bg-[#141518]">{f.toUpperCase()}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                     <input type="text" id="newGoogleFontInput" placeholder="Enter Google Font Name" className="flex-1 bg-black/30 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30" onKeyDown={(e) => { if (e.key === 'Enter') handleInstallFont(e.target.value, 'newGoogleFontInput'); }} />
                     <button onClick={() => handleInstallFont(document.getElementById('newGoogleFontInput').value, 'newGoogleFontInput')} className="text-[10px] font-bold px-3 py-2.5 bg-white text-black rounded-xl hover:bg-white/90 transition-colors touch-manipulation">Fetch</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <GlassSlider label="Text Size" value={settings.textScale} min="0.3" max="3.0" step="0.1" displayVal={settings.textScale.toFixed(1)} onChange={(e) => resetParam('textScale', parseFloat(e.target.value))} onReset={() => resetParam('textScale', 1.0)} />
                <GlassSlider label="Word Gap" value={settings.wordSpacing} min="0.0" max="5.0" step="0.1" displayVal={settings.wordSpacing.toFixed(1)} onChange={(e) => resetParam('wordSpacing', parseFloat(e.target.value))} onReset={() => resetParam('wordSpacing', 1.0)} />
                <GlassSlider label="Line Gap" value={settings.lineSpacing} min="0.5" max="2.0" step="0.05" displayVal={settings.lineSpacing.toFixed(2)} onChange={(e) => resetParam('lineSpacing', parseFloat(e.target.value))} onReset={() => resetParam('lineSpacing', 0.85)} />
                <GlassSlider label="Auto-Wrap" value={settings.wordsPerLine} min="0" max="15" step="1" displayVal={settings.wordsPerLine === 0 ? 'AUTO' : settings.wordsPerLine} onChange={(e) => resetParam('wordsPerLine', parseInt(e.target.value))} onReset={() => resetParam('wordsPerLine', 0)} />
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3">Paragraph Alignment</span>
                 <div className="grid grid-cols-4 gap-2">
                    {['left', 'center', 'right', 'justify'].map(align => (
                       <GlassBtn key={align} active={settings.textAlign === align} onClick={() => resetParam('textAlign', align)} className="capitalize">{align.substring(0,4)}</GlassBtn>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Palette className="w-4 h-4"/> Color Engine</span>
                 <div className="grid grid-cols-4 gap-2 mb-4">
                    {['auto', 'solid', 'palette', 'gradient'].map(mode => (
                       <GlassBtn key={mode} active={settings.colorMode === mode} onClick={() => resetParam('colorMode', mode)} className="capitalize">{mode}</GlassBtn>
                    ))}
                 </div>
                 {settings.colorMode !== 'auto' && (
                    <div className="flex gap-3">
                       <div className="flex flex-col flex-1 items-center gap-2"><span className="text-[10px] text-white/50 font-bold">Base</span><input type="color" value={settings.customColor1} onChange={(e) => resetParam('customColor1', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none outline-none overflow-hidden" /></div>
                       {(settings.colorMode === 'palette' || settings.colorMode === 'gradient') && (
                         <div className="flex flex-col flex-1 items-center gap-2"><span className="text-[10px] text-white/50 font-bold">Mid</span><input type="color" value={settings.customColor2} onChange={(e) => resetParam('customColor2', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none outline-none overflow-hidden" /></div>
                       )}
                       {(settings.colorMode === 'palette' || settings.colorMode === 'gradient') && (
                         <div className="flex flex-col flex-1 items-center gap-2"><span className="text-[10px] text-white/50 font-bold">End</span><input type="color" value={settings.customColor3} onChange={(e) => resetParam('customColor3', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none outline-none overflow-hidden" /></div>
                       )}
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <GlassBtn active={settings.fxOutline} onClick={() => resetParam('fxOutline', !settings.fxOutline)}>Stroke</GlassBtn>
                 <GlassBtn active={settings.fxShadow} onClick={() => resetParam('fxShadow', !settings.fxShadow)}>Shadow</GlassBtn>
                 <GlassBtn active={settings.fxHighlight} onClick={() => resetParam('fxHighlight', !settings.fxHighlight)}>Marker</GlassBtn>
              </div>
            </div>
          )}

          {/* CAMERA MODULE */}
          {activeTab === 'cam' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-2">
                <GlassBtn active={settings.cameraMode === 'auto'} onClick={() => resetParam('cameraMode', 'auto')} icon={Activity}>Auto Track</GlassBtn>
                <GlassBtn active={settings.cameraMode === 'manual'} onClick={() => resetParam('cameraMode', 'manual')} icon={Sliders}>Static Rig</GlassBtn>
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Monitor className="w-4 h-4"/> Aspect Ratio</span>
                 <div className="grid grid-cols-3 gap-2">
                    {['fullscreen', 'tiktok', 'youtube', 'cinema', 'imax', 'square'].map(ratio => (
                       <GlassBtn key={ratio} active={settings.aspectRatio === ratio} onClick={() => resetParam('aspectRatio', ratio)} className="capitalize">{ratio === 'fullscreen' ? 'Full' : ratio}</GlassBtn>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Camera className="w-4 h-4"/> Optics (FOV)</span>
                 <div className="grid grid-cols-3 gap-2">
                    {Object.keys(LENS_OPTICS).map(lens => (
                       <GlassBtn key={lens} active={settings.cameraLens === lens} onClick={() => resetParam('cameraLens', lens)}>{lens}</GlassBtn>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GlassSlider label="Zoom Multiplier" value={settings.manualZoom} min="0.6" max="2.0" step="0.1" displayVal={settings.manualZoom.toFixed(1)} onChange={(e) => resetParam('manualZoom', parseFloat(e.target.value))} onReset={() => resetParam('manualZoom', 1.0)} />
                <div className="col-span-1 hidden sm:block"></div>
                <GlassSlider label="Spawn X Anchor" value={settings.spawnAnchorX} min="-1500" max="1500" step="50" onChange={(e) => resetParam('spawnAnchorX', parseInt(e.target.value))} onReset={() => resetParam('spawnAnchorX', 0)} />
                <GlassSlider label="Spawn Y Anchor" value={settings.spawnAnchorY} min="-1500" max="1500" step="50" onChange={(e) => resetParam('spawnAnchorY', parseInt(e.target.value))} onReset={() => resetParam('spawnAnchorY', 0)} />
              </div>

              {settings.cameraMode === 'manual' && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <div className="col-span-2 flex justify-between items-center mb-1">
                     <span className="text-xs font-semibold text-white/90 flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Rig Offsets</span>
                     <button onClick={resetManualCamera} className="text-[10px] uppercase font-bold text-white/50 hover:text-white transition-colors">Reset Rig</button>
                   </div>
                   <GlassSlider label="Pan X" value={settings.manualPanX} min="-2000" max="2000" step="50" onChange={(e) => resetParam('manualPanX', parseInt(e.target.value))} onReset={() => resetParam('manualPanX', 0)} />
                   <GlassSlider label="Pan Y" value={settings.manualPanY} min="-2000" max="2000" step="50" onChange={(e) => resetParam('manualPanY', parseInt(e.target.value))} onReset={() => resetParam('manualPanY', 0)} />
                   <GlassSlider label="Tilt X" value={settings.manualRotX} min="-90" max="90" step="5" onChange={(e) => resetParam('manualRotX', parseInt(e.target.value))} onReset={() => resetParam('manualRotX', 0)} />
                   <GlassSlider label="Pan Y" value={settings.manualRotY} min="-90" max="90" step="5" onChange={(e) => resetParam('manualRotY', parseInt(e.target.value))} onReset={() => resetParam('manualRotY', 0)} />
                   <GlassSlider label="Roll Z" value={settings.manualRotZ} min="-180" max="180" step="5" onChange={(e) => resetParam('manualRotZ', parseInt(e.target.value))} onReset={() => resetParam('manualRotZ', 0)} />
                </div>
              )}
            </div>
          )}

          {/* FX MODULE */}
          {activeTab === 'fx' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> Canvas Environment</span>
                 <div className="grid grid-cols-3 gap-2 mb-3">
                    {['dark', 'white', 'vaporwave', 'plasma', 'chroma-green', 'chroma-blue', 'custom'].map(bg => (
                       <GlassBtn key={bg} active={settings.bgMode === bg} onClick={() => resetParam('bgMode', bg)} className="capitalize">{bg.replace('chroma-', 'Key ')}</GlassBtn>
                    ))}
                 </div>
                 {settings.bgMode === 'custom' && (
                    <label className="flex items-center justify-center w-full py-3 mt-1 bg-black/30 border border-white/10 hover:border-white/30 rounded-xl cursor-pointer transition-colors group">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Select Media</span>
                       <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCustomBgUpload} />
                    </label>
                 )}
              </div>

              <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-xs font-semibold text-white/60 mb-3">Film Textures</span>
                 <div className="grid grid-cols-4 gap-2">
                    {['none', 'halftone', 'crt', 'grunge'].map(tex => (
                       <GlassBtn key={tex} active={settings.textureOverlay === tex} onClick={() => resetParam('textureOverlay', tex)} className="capitalize">{tex.substring(0,4)}</GlassBtn>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                 <span className="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-2"><Zap className="w-4 h-4"/> Generative Engines</span>
                 <div className="grid grid-cols-2 gap-3">
                    {ENGINES.map(eng => {
                       const val = settings.engineIntensities[eng.id] || 0;
                       return (
                          <GlassSlider key={eng.id} label={eng.label.substring(0,10)} value={val} min="0" max="10" step="1" onChange={(e) => setSettings({...settings, engineIntensities: {...settings.engineIntensities, [eng.id]: parseInt(e.target.value)}})} onReset={() => setSettings({...settings, engineIntensities: {...settings.engineIntensities, [eng.id]: 0}})} />
                       );
                    })}
                 </div>
              </div>
            </div>
          )}

          {/* CHAOS MODULE */}
          {activeTab === 'chaos' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-2">
                 <GlassBtn active={settings.physicsEnabled} onClick={() => resetParam('physicsEnabled', !settings.physicsEnabled)}>Collision Physics</GlassBtn>
                 <GlassBtn active={settings.momentumEnabled} onClick={() => resetParam('momentumEnabled', !settings.momentumEnabled)}>Momentum</GlassBtn>
                 <GlassBtn active={settings.neonGlow} onClick={() => resetParam('neonGlow', !settings.neonGlow)}>Neon Bloom</GlassBtn>
                 <GlassBtn active={settings.strobeFlicker} onClick={() => resetParam('strobeFlicker', !settings.strobeFlicker)}>Strobe Flash</GlassBtn>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <GlassSlider label="Spawn Speed" value={settings.animationSpeed} min="0.2" max="3.0" step="0.1" displayVal={settings.animationSpeed.toFixed(1)} onChange={(e) => resetParam('animationSpeed', parseFloat(e.target.value))} onReset={() => resetParam('animationSpeed', 1.0)} />
                 <GlassSlider label="Decay Rate" value={settings.fadeRate} min="0.05" max="0.5" step="0.05" displayVal={Math.round(settings.fadeRate*100)} onChange={(e) => resetParam('fadeRate', parseFloat(e.target.value))} onReset={() => resetParam('fadeRate', 0.15)} />
                 <GlassSlider label="Depth Blur" value={settings.blurIntensity} min="0" max="20" step="1" onChange={(e) => resetParam('blurIntensity', parseInt(e.target.value))} onReset={() => resetParam('blurIntensity', 4)} />
                 <GlassSlider label="Cluster Size" value={settings.wordGrouping} min="1" max="6" step="1" displayVal={settings.wordGrouping === 6 ? 'INF' : settings.wordGrouping} onChange={(e) => resetParam('wordGrouping', parseInt(e.target.value))} onReset={() => resetParam('wordGrouping', 1)} />
              </div>

              <div className="flex flex-col gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                 <span className="text-xs font-bold text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Signal Degradation</span>
                 <div className="grid grid-cols-2 gap-3">
                   <GlassSlider label="Glitch" value={settings.glitchLevel} min="0" max="10" step="1" onChange={(e) => resetParam('glitchLevel', parseInt(e.target.value))} onReset={() => resetParam('glitchLevel', 2)} />
                   <GlassSlider label="RGB Split" value={settings.chaosRgbLevel} min="0" max="10" step="1" onChange={(e) => resetParam('chaosRgbLevel', parseInt(e.target.value))} onReset={() => resetParam('chaosRgbLevel', 0)} />
                   <GlassSlider label="VHS Warp" value={settings.chaosVhsLevel} min="0" max="10" step="1" onChange={(e) => resetParam('chaosVhsLevel', parseInt(e.target.value))} onReset={() => resetParam('chaosVhsLevel', 0)} />
                   <GlassSlider label="Invert" value={settings.chaosInvertLevel} min="0" max="10" step="1" onChange={(e) => resetParam('chaosInvertLevel', parseInt(e.target.value))} onReset={() => resetParam('chaosInvertLevel', 0)} />
                   <GlassSlider label="Shake" value={settings.chaosShakeLevel} min="0" max="10" step="1" onChange={(e) => resetParam('chaosShakeLevel', parseInt(e.target.value))} onReset={() => resetParam('chaosShakeLevel', 0)} />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && !isFullscreen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/80 text-white backdrop-blur-3xl px-6 py-4 rounded-2xl flex items-center shadow-2xl z-50 ui-font w-[90vw] sm:w-auto text-center border border-red-400/50">
          <p className="text-sm font-semibold tracking-wide">{error}</p>
        </div>
      )}

      {/* --- FLOATING PILL DOCK --- */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center p-2 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-50 transition-all duration-500 ui-font ${(!isFullscreen && (showUI || showSettings)) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 pointer-events-none scale-95'}`}>
        
        <button 
          onClick={handleRecordToggle} 
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-bold transition-all touch-manipulation ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          {isRecording ? <StopCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          <span className="hidden sm:inline">{isRecording ? 'REC' : 'Record'}</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <button 
          onClick={toggleListening} 
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all touch-manipulation shadow-lg ${isListening ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          <span>{isListening ? 'Listening' : 'Start'}</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <button 
          onClick={toggleFullscreen} 
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-bold transition-all touch-manipulation ${isFullscreen ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span className="hidden sm:inline">Frame</span>
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-bold transition-all touch-manipulation ml-1 ${showSettings ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">Tune</span>
        </button>
      </div>

      {!isListening && words.length === 0 && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-40">
          <h1 className={`text-6xl md:text-8xl font-black font-montserrat tracking-tighter mb-4 opacity-80 ${isWhite ? 'text-black' : ''}`}>KINETIC<br/>VOICE</h1>
          <p className={`text-sm md:text-base font-semibold tracking-widest uppercase opacity-50 ui-font ${isWhite ? 'text-black' : ''}`}>Click Start to Begin Engine</p>
        </div>
      )}
    </div>
  );
}
