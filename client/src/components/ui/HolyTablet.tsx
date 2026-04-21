import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Save, Download, Trash2, Volume2, ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AuthModal } from '@/components/AuthModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SavedSong } from '@shared/schema';
import tabletBg from '@assets/0BC0EC31-EF14-4D49-984B-92619DBCC236_1773402086433.png';

const STEPS = 16;
const PAD_NAMES = [
  'KICK', 'SNARE', 'CLAP', 'HI-HAT',
  'OPEN HH', 'TOM HI', 'TOM LO', 'RIM',
  'COWBELL', 'SHAKER', 'PERC', 'SUB',
  'FX RISE', 'FX DOWN', 'CHORD', 'BASS'
];
const PAD_KEYS = [
  '1','2','3','4',
  '5','6','7','8',
  'Q','W','E','R',
  'A','S','D','F'
];
const HIEROGLYPHS = ['𓀀','𓀁','𓁀','𓁐','𓂀','𓂋','𓃀','𓃭','𓄂','𓅃','𓆏','𓆣','𓇋','𓇳','𓈖','𓉐','𓊃','𓋴','𓌳','𓍯','𓎡','𓏏','𓏤','𓐍'];

type Pattern = boolean[][];

interface PadSettings {
  volume: number;
  decay: number;
  pitch: number;
}

const DEFAULT_PAD_SETTINGS: PadSettings[] = PAD_NAMES.map(() => ({ volume: 80, decay: 100, pitch: 100 }));

function loadPadSettings(): PadSettings[] {
  try {
    const saved = localStorage.getItem('holytablet_pad_settings');
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length === 16) return p; }
  } catch {}
  return DEFAULT_PAD_SETTINGS.map(s => ({ ...s }));
}

function savePadSettings(settings: PadSettings[]) {
  localStorage.setItem('holytablet_pad_settings', JSON.stringify(settings));
}

function createEmptyPattern(): Pattern {
  return PAD_NAMES.map(() => Array(STEPS).fill(false));
}

function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function synthSound(ctx: AudioContext, type: number, time: number, dest?: AudioNode, settings?: PadSettings) {
  const now = time || ctx.currentTime;
  const target = dest || ctx.destination;
  const vol = (settings?.volume ?? 80) / 100;
  const decayMul = (settings?.decay ?? 100) / 100;
  const pitchMul = (settings?.pitch ?? 100) / 100;
  switch (type) {
    case 0: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 * pitchMul, now);
      osc.frequency.exponentialRampToValueAtTime(40 * pitchMul, now + 0.12 * decayMul);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 * decayMul);
      osc.connect(gain).connect(target);
      osc.start(now); osc.stop(now + 0.3 * decayMul);
      break;
    }
    case 1: {
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15 * decayMul, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000 * pitchMul;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 * decayMul);
      noise.connect(bp).connect(gain).connect(target);
      const osc = ctx.createOscillator(); const og = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(200 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(60 * pitchMul, now + 0.05 * decayMul);
      og.gain.setValueAtTime(0.6 * vol, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.07 * decayMul);
      osc.connect(og).connect(target);
      noise.start(now); osc.start(now); osc.stop(now + 0.15 * decayMul);
      break;
    }
    case 2: {
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12 * decayMul, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500 * pitchMul;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12 * decayMul);
      noise.connect(hp).connect(gain).connect(target); noise.start(now);
      break;
    }
    case 3: {
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05 * decayMul, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000 * pitchMul;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 * decayMul);
      noise.connect(hp).connect(gain).connect(target); noise.start(now);
      break;
    }
    case 4: {
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2 * decayMul, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000 * pitchMul;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 * decayMul);
      noise.connect(hp).connect(gain).connect(target); noise.start(now);
      break;
    }
    case 5: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(300 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(120 * pitchMul, now + 0.12 * decayMul);
      gain.gain.setValueAtTime(0.6 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.15 * decayMul);
      break;
    }
    case 6: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(180 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(60 * pitchMul, now + 0.18 * decayMul);
      gain.gain.setValueAtTime(0.7 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.22 * decayMul);
      break;
    }
    case 7: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(800 * pitchMul, now);
      gain.gain.setValueAtTime(0.3 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.03 * decayMul);
      break;
    }
    case 8: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(900 * pitchMul, now);
      gain.gain.setValueAtTime(0.35 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.08 * decayMul);
      break;
    }
    case 9: {
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06 * decayMul, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000 * pitchMul;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06 * decayMul);
      noise.connect(hp).connect(gain).connect(target); noise.start(now);
      break;
    }
    case 10: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(600 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(400 * pitchMul, now + 0.08 * decayMul);
      gain.gain.setValueAtTime(0.4 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.1 * decayMul);
      break;
    }
    case 11: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(60 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(25 * pitchMul, now + 0.4 * decayMul);
      gain.gain.setValueAtTime(vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.5 * decayMul);
      break;
    }
    case 12: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(1200 * pitchMul, now + 0.4 * decayMul);
      gain.gain.setValueAtTime(0.15 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.5 * decayMul);
      break;
    }
    case 13: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800 * pitchMul, now); osc.frequency.exponentialRampToValueAtTime(100 * pitchMul, now + 0.35 * decayMul);
      gain.gain.setValueAtTime(0.15 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 * decayMul);
      osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.4 * decayMul);
      break;
    }
    case 14: {
      [1, 1.26, 1.5].forEach(ratio => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(220 * ratio * pitchMul, now);
        gain.gain.setValueAtTime(0.15 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 * decayMul);
        osc.connect(gain).connect(target); osc.start(now); osc.stop(now + 0.6 * decayMul);
      });
      break;
    }
    case 15: {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(55 * pitchMul, now);
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400 * pitchMul, now);
      gain.gain.setValueAtTime(0.5 * vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 * decayMul);
      osc.connect(filter).connect(gain).connect(target); osc.start(now); osc.stop(now + 0.25 * decayMul);
      break;
    }
  }
}

function renderOffline(pattern: Pattern, bpm: number, stemIndex?: number): Promise<AudioBuffer> {
  const stepDuration = 60 / bpm / 4;
  const totalDuration = STEPS * stepDuration + 1;
  const sampleRate = 44100;
  const offCtx = new OfflineAudioContext(1, Math.ceil(totalDuration * sampleRate), sampleRate);
  const rows = stemIndex !== undefined ? [stemIndex] : pattern.map((_, i) => i);
  for (const r of rows) {
    for (let s = 0; s < STEPS; s++) {
      if (pattern[r][s]) synthSound(offCtx as any, r, s * stepDuration);
    }
  }
  return offCtx.startRendering();
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = 1, sr = buffer.sampleRate, data = buffer.getChannelData(0), bps = 16;
  const byteRate = sr * numCh * bps / 8, blockAlign = numCh * bps / 8, dataSize = data.length * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize), v = new DataView(ab);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4,36+dataSize,true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,numCh,true);
  v.setUint32(24,sr,true); v.setUint32(28,byteRate,true); v.setUint16(32,blockAlign,true);
  v.setUint16(34,bps,true); ws(36,'data'); v.setUint32(40,dataSize,true);
  let off = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

interface PadMapping {
  key: string;
  keyLabel: string;
  midiNote: number | null;
  midiChannel: number | null;
  gamepadButton: number | null;
}

const DEFAULT_KEY_MAP: Record<string, number> = {
  '1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,
  'q':8,'w':9,'e':10,'r':11,'a':12,'s':13,'d':14,'f':15
};

const DEFAULT_MAPPINGS: PadMapping[] = PAD_NAMES.map((_, i) => ({
  key: Object.entries(DEFAULT_KEY_MAP).find(([,v]) => v === i)?.[0] || '',
  keyLabel: PAD_KEYS[i],
  midiNote: 36 + i,
  midiChannel: null,
  gamepadButton: i < 16 ? i : null,
}));

function loadMappings(): PadMapping[] {
  try {
    const saved = localStorage.getItem('holytablet_mappings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 16) return parsed;
    }
  } catch {}
  return DEFAULT_MAPPINGS.map(m => ({ ...m }));
}

function saveMappings(mappings: PadMapping[]) {
  localStorage.setItem('holytablet_mappings', JSON.stringify(mappings));
}

function keyDisplayName(code: string): string {
  if (code.length === 1) return code.toUpperCase();
  const names: Record<string, string> = {
    'space': 'SPACE', 'enter': 'ENTER', 'tab': 'TAB', 'escape': 'ESC',
    'arrowup': '↑', 'arrowdown': '↓', 'arrowleft': '←', 'arrowright': '→',
    'backspace': '⌫', 'delete': 'DEL', 'shift': 'SHIFT', 'control': 'CTRL',
    'alt': 'ALT', 'meta': 'CMD', 'capslock': 'CAPS',
    'numpad0':'NUM0','numpad1':'NUM1','numpad2':'NUM2','numpad3':'NUM3',
    'numpad4':'NUM4','numpad5':'NUM5','numpad6':'NUM6','numpad7':'NUM7',
    'numpad8':'NUM8','numpad9':'NUM9','numpaddecimal':'NUM.',
    'numpadadd':'NUM+','numpadsubtract':'NUM-','numpadmultiply':'NUM*','numpaddivide':'NUM/',
    'numpadenter':'NUMENTER',
  };
  return names[code.toLowerCase()] || code.toUpperCase();
}

interface HolyTabletProps {
  onClose: () => void;
  initialSong?: SavedSong | null;
  onBackToBrowser?: () => void;
}

export function HolyTablet({ onClose, initialSong, onBackToBrowser }: HolyTabletProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pattern, setPattern] = useState<Pattern>(createEmptyPattern);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [songTitle, setSongTitle] = useState('Untitled');
  const [showSaved, setShowSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSequencer, setShowSequencer] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [volume, setVolume] = useState(80);
  const [padSettings, setPadSettings] = useState<PadSettings[]>(loadPadSettings);
  const [showFx, setShowFx] = useState(false);
  const [selectedFxPad, setSelectedFxPad] = useState<number>(0);

  const [padSampleNames, setPadSampleNames] = useState<(string | null)[]>(() => Array(16).fill(null));
  const padSamplesRef = useRef<(AudioBuffer | null)[]>(Array(16).fill(null));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importTargetPad, setImportTargetPad] = useState<number | null>(null);

  const [padMappings, setPadMappings] = useState<PadMapping[]>(loadMappings);
  const [mappingPad, setMappingPad] = useState<number | null>(null);
  const [mappingType, setMappingType] = useState<'key' | 'midi' | 'gamepad'>('key');
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [midiConnected, setMidiConnected] = useState(false);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [lastMidiInput, setLastMidiInput] = useState<string | null>(null);
  const [lastGamepadInput, setLastGamepadInput] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveAnimRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(-1);
  const patternRef = useRef<Pattern>(pattern);
  const padSettingsRef = useRef<PadSettings[]>(padSettings);
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const gamepadPollRef = useRef<number | null>(null);
  const prevGamepadButtons = useRef<boolean[]>([]);
  const touchedRef = useRef(false);

  const { data: savedSongs = [] } = useQuery<SavedSong[]>({
    queryKey: ['/api/saved-songs'],
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; bpm: number; pattern: string }) => {
      const res = await apiRequest('POST', '/api/saved-songs', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/saved-songs'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest('DELETE', `/api/saved-songs/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/saved-songs'] }),
  });

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = volume / 100;
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.7;
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, [volume]);

  useEffect(() => {
    if (gainNodeRef.current) gainNodeRef.current.gain.value = volume / 100;
  }, [volume]);

  useEffect(() => { padSettingsRef.current = padSettings; }, [padSettings]);

  useEffect(() => {
    if (initialSong) {
      setSongTitle(initialSong.title);
      setBpm(initialSong.bpm);
      try {
        const parsed = JSON.parse(initialSong.pattern);
        const full = PAD_NAMES.map((_, i) => parsed[i] || Array(STEPS).fill(false));
        setPattern(full);
      } catch { setPattern(createEmptyPattern()); }
    }
    const timer = setTimeout(() => {
      const canvas = waveCanvasRef.current;
      if (canvas) {
        const c = canvas.getContext('2d');
        if (c) {
          c.fillStyle = '#0d0b08';
          c.fillRect(0, 0, canvas.width, canvas.height);
          c.strokeStyle = '#5a4d3a';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(0, canvas.height / 2);
          c.lineTo(canvas.width, canvas.height / 2);
          c.stroke();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = waveCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    const bufLen = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufLen);

    const draw = () => {
      waveAnimRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      const w = canvas.width, h = canvas.height;
      canvasCtx.fillStyle = 'rgba(13,11,8,0.3)';
      canvasCtx.fillRect(0, 0, w, h);
      canvasCtx.lineWidth = 1.5;
      canvasCtx.strokeStyle = '#c4956a';
      canvasCtx.shadowColor = '#c4956a';
      canvasCtx.shadowBlur = 4;
      canvasCtx.beginPath();
      const sliceWidth = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(w, h / 2);
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0;
    };
    draw();
  }, []);

  const handleFileImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || importTargetPad === null) return;
    try {
      const ctx = getCtx();
      const arrayBuf = await file.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      padSamplesRef.current[importTargetPad] = audioBuf;
      setPadSampleNames(prev => { const next = [...prev]; next[importTargetPad] = file.name; return next; });
    } catch (err) {
      console.error('Failed to decode audio file:', err);
    }
    setImportTargetPad(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [importTargetPad, getCtx]);

  const clearPadSample = useCallback((idx: number) => {
    padSamplesRef.current[idx] = null;
    setPadSampleNames(prev => { const next = [...prev]; next[idx] = null; return next; });
  }, []);

  const playSampleSound = useCallback((ctx: AudioContext, idx: number, time: number, dest?: AudioNode, settings?: PadSettings) => {
    const buf = padSamplesRef.current[idx];
    if (!buf) return;
    const source = ctx.createBufferSource();
    source.buffer = buf;
    const pitchMul = (settings?.pitch ?? 100) / 100;
    source.playbackRate.value = pitchMul;
    const gain = ctx.createGain();
    const vol = (settings?.volume ?? 80) / 100;
    const decayMul = (settings?.decay ?? 100) / 100;
    gain.gain.setValueAtTime(vol, time);
    const dur = buf.duration / pitchMul;
    gain.gain.setValueAtTime(vol, time + dur * decayMul * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * decayMul);
    source.connect(gain).connect(dest || ctx.destination);
    source.start(time);
  }, []);

  const playPad = useCallback((idx: number) => {
    const ctx = getCtx();
    const settings = padSettingsRef.current[idx];
    if (padSamplesRef.current[idx]) {
      playSampleSound(ctx, idx, ctx.currentTime, gainNodeRef.current || undefined, settings);
    } else {
      synthSound(ctx, idx, ctx.currentTime, gainNodeRef.current || undefined, settings);
    }
    setActivePad(idx);
    setSelectedFxPad(idx);
    setTimeout(() => setActivePad(null), 120);
    if (!waveAnimRef.current) drawWaveform();
  }, [getCtx, drawWaveform, playSampleSound]);

  useEffect(() => { patternRef.current = pattern; }, [pattern]);

  const toggleStep = useCallback((row: number, step: number) => {
    setPattern(prev => { const next = prev.map(r => [...r]); next[row][step] = !next[row][step]; return next; });
  }, []);

  const startPlayback = useCallback(() => {
    const ctx = getCtx();
    setIsPlaying(true);
    stepRef.current = -1;
    const interval = (60 / bpm / 4) * 1000;
    timerRef.current = window.setInterval(() => {
      stepRef.current = (stepRef.current + 1) % STEPS;
      setCurrentStep(stepRef.current);
      const p = patternRef.current;
      const ps = padSettingsRef.current;
      for (let r = 0; r < p.length; r++) {
        if (p[r][stepRef.current]) {
          if (padSamplesRef.current[r]) {
            playSampleSound(ctx, r, ctx.currentTime, gainNodeRef.current || undefined, ps[r]);
          } else {
            synthSound(ctx, r, ctx.currentTime, gainNodeRef.current || undefined, ps[r]);
          }
        }
      }
    }, interval);
  }, [bpm, getCtx]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false); setCurrentStep(-1); stepRef.current = -1;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const handleSave = useCallback(() => {
    if (!user) { setShowAuthModal(true); return; }
    saveMutation.mutate({ title: songTitle, bpm, pattern: JSON.stringify(pattern) });
  }, [user, songTitle, bpm, pattern, saveMutation]);

  const loadSong = useCallback((song: SavedSong) => {
    stopPlayback();
    setSongTitle(song.title);
    setBpm(song.bpm);
    try {
      const parsed = JSON.parse(song.pattern);
      const full = PAD_NAMES.map((_, i) => parsed[i] || Array(STEPS).fill(false));
      setPattern(full);
    } catch { setPattern(createEmptyPattern()); }
    setShowSaved(false);
  }, [stopPlayback]);

  const exportSong = useCallback(async () => {
    setExporting(true);
    try {
      const buf = await renderOffline(pattern, bpm);
      downloadBlob(audioBufferToWav(buf), `${songTitle}.wav`);
    } finally { setExporting(false); }
  }, [pattern, bpm, songTitle]);

  const exportStems = useCallback(async () => {
    setExporting(true);
    try {
      const activeRows = pattern.map((row, i) => ({ row, i })).filter(({ row }) => row.some(Boolean));
      for (const { i } of activeRows) {
        const buf = await renderOffline(pattern, bpm, i);
        downloadBlob(audioBufferToWav(buf), `${songTitle}_${PAD_NAMES[i].replace(/\s/g, '_')}.wav`);
        await new Promise(r => setTimeout(r, 200));
      }
    } finally { setExporting(false); }
  }, [pattern, bpm, songTitle]);

  const advanceMappingPad = useCallback((current: number) => {
    const next = current + 1;
    setMappingPad(next < 16 ? next : null);
  }, []);

  const updateMapping = useCallback((padIdx: number, updates: Partial<PadMapping>) => {
    setPadMappings(prev => {
      const next = prev.map((m, i) => i === padIdx ? { ...m, ...updates } : m);
      saveMappings(next);
      return next;
    });
    advanceMappingPad(padIdx);
  }, [advanceMappingPad]);

  const resetMappings = useCallback(() => {
    const fresh = DEFAULT_MAPPINGS.map(m => ({ ...m }));
    setPadMappings(fresh);
    saveMappings(fresh);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (mappingPad !== null && mappingType === 'key') {
        e.preventDefault();
        const keyVal = e.key.length === 1 ? e.key.toLowerCase() : e.code;
        updateMapping(mappingPad, { key: keyVal, keyLabel: keyDisplayName(keyVal) });
        return;
      }

      if (e.code === 'Space') { e.preventDefault(); isPlaying ? stopPlayback() : startPlayback(); return; }
      if (e.code === 'Escape' && mappingPad !== null) { setMappingPad(null); return; }

      const keyLower = e.key.length === 1 ? e.key.toLowerCase() : e.code;
      const idx = padMappings.findIndex(m => m.key === keyLower);
      if (idx !== -1) { e.preventDefault(); playPad(idx); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playPad, startPlayback, stopPlayback, padMappings, mappingPad, mappingType, updateMapping]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    let cancelled = false;

    navigator.requestMIDIAccess({ sysex: false }).then(access => {
      if (cancelled) return;
      midiAccessRef.current = access;

      const updateDevices = () => {
        const names: string[] = [];
        access.inputs.forEach(input => { if (input.name) names.push(input.name); });
        setMidiDevices(names);
        setMidiConnected(names.length > 0);
      };
      updateDevices();
      access.onstatechange = () => updateDevices();

      const handleMidiMessage = (e: MIDIMessageEvent) => {
        const [status, note, velocity] = e.data!;
        const command = status & 0xf0;
        const channel = status & 0x0f;

        if (command === 0x90 && velocity > 0) {
          setLastMidiInput(`Note ${note} Ch ${channel + 1}`);

          if (mappingPad !== null && mappingType === 'midi') {
            const currentPad = mappingPad;
            setPadMappings(prev => {
              const next = prev.map((m, i) => i === currentPad ? { ...m, midiNote: note, midiChannel: channel } : m);
              saveMappings(next);
              return next;
            });
            advanceMappingPad(currentPad);
            return;
          }

          const idx = padMappings.findIndex(m => m.midiNote === note && (m.midiChannel === null || m.midiChannel === channel));
          if (idx !== -1) playPad(idx);
        }
      };

      access.inputs.forEach(input => { input.onmidimessage = handleMidiMessage; });
      access.onstatechange = () => {
        updateDevices();
        access.inputs.forEach(input => { input.onmidimessage = handleMidiMessage; });
      };
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [playPad, padMappings, mappingPad, mappingType]);

  useEffect(() => {
    const onConnect = () => setGamepadConnected(true);
    const onDisconnect = () => {
      const gps = navigator.getGamepads();
      setGamepadConnected(Array.from(gps).some(g => g !== null));
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);

    const poll = () => {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        gp.buttons.forEach((btn, btnIdx) => {
          const wasPressed = prevGamepadButtons.current[btnIdx] || false;
          if (btn.pressed && !wasPressed) {
            if (btnIdx === 9) {
              if (mappingPad !== null) {
                setMappingPad(null);
              } else if (showMapping) {
                setShowMapping(false);
              } else {
                isPlaying ? stopPlayback() : startPlayback();
              }
              prevGamepadButtons.current[btnIdx] = btn.pressed;
              return;
            }

            setLastGamepadInput(`Button ${btnIdx}`);

            if (mappingPad !== null && mappingType === 'gamepad') {
              const currentPad = mappingPad;
              setPadMappings(prev => {
                const next = prev.map((m, i) => i === currentPad ? { ...m, gamepadButton: btnIdx } : m);
                saveMappings(next);
                return next;
              });
              advanceMappingPad(currentPad);
            } else {
              const idx = padMappings.findIndex(m => m.gamepadButton === btnIdx);
              if (idx !== -1) playPad(idx);
            }
          }
          prevGamepadButtons.current[btnIdx] = btn.pressed;
        });
      }
      gamepadPollRef.current = requestAnimationFrame(poll);
    };

    gamepadPollRef.current = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
      if (gamepadPollRef.current) cancelAnimationFrame(gamepadPollRef.current);
    };
  }, [playPad, padMappings, mappingPad, mappingType, isPlaying, startPlayback, stopPlayback, showMapping, advanceMappingPad]);

  const updatePadSetting = useCallback((padIdx: number, key: keyof PadSettings, value: number) => {
    setPadSettings(prev => {
      const next = prev.map((s, i) => i === padIdx ? { ...s, [key]: value } : s);
      savePadSettings(next);
      return next;
    });
  }, []);

  const resetPadSettings = useCallback(() => {
    const fresh = DEFAULT_PAD_SETTINGS.map(s => ({ ...s }));
    setPadSettings(fresh);
    savePadSettings(fresh);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
    };
  }, []);

  const cinzel = { fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Palatino, serif" };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
        data-testid="holytablet-overlay"
        style={{
          background: 'radial-gradient(ellipse at center, #2a1f14 0%, #0d0906 70%, #000 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url(${tabletBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px) saturate(0.3)',
          }}
        />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl h-[96vh] sm:h-[92vh] overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(145deg, #8B7355 0%, #A0896C 15%, #9C8868 30%, #8B7355 50%, #7A6548 70%, #6B5A3E 85%, #5C4E35 100%)',
            borderRadius: '12px',
            boxShadow: 'inset 0 2px 4px rgba(190,170,140,0.4), inset 0 -3px 6px rgba(40,30,15,0.5), 0 20px 60px rgba(0,0,0,0.8), 0 0 100px rgba(139,115,85,0.15)',
            border: '2px solid rgba(110,90,60,0.6)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.08] rounded-[12px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none flex justify-center items-center gap-1 opacity-[0.15] overflow-hidden text-[10px]"
            style={{ color: '#4a3d2a' }}
          >
            {HIEROGLYPHS.map((h, i) => <span key={i} className="inline-block">{h}</span>)}
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between px-3 sm:px-4 pt-2 sm:pt-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-20" style={{ color: '#3d2f1c' }}>𓂀</span>
                    <h2 className="text-sm sm:text-lg font-bold tracking-[0.25em] uppercase"
                      style={{
                        ...cinzel,
                        color: '#2a1f14',
                        textShadow: '0 1px 0 rgba(190,170,140,0.6)',
                      }}
                    >
                      BASSGAWD's HOLYTABLET
                    </h2>
                    <span className="text-[10px] opacity-20" style={{ color: '#3d2f1c' }}>𓅃</span>
                  </div>
                  <p className="text-[8px] tracking-[0.3em] uppercase mt-0.5 ml-7"
                    style={{ ...cinzel, color: '#5a4d3a' }}
                  >
                    Divine Percussion Engine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onBackToBrowser && (
                  <button
                    data-testid="button-back-to-browser"
                    onClick={() => { stopPlayback(); onBackToBrowser(); }}
                    className="h-8 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    style={{
                      ...cinzel,
                      background: 'radial-gradient(circle, #7a6a52 0%, #5c4e35 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(190,170,140,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                      color: '#3d2f1c',
                      fontSize: '8px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    <ArrowLeft size={10} /> Songs
                  </button>
                )}
                <button
                  data-testid="button-close-holytablet"
                  onClick={() => { stopPlayback(); onClose(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'radial-gradient(circle, #7a6a52 0%, #5c4e35 100%)',
                    boxShadow: 'inset 0 1px 2px rgba(190,170,140,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                    color: '#3d2f1c',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="mx-3 sm:mx-4 mb-1 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap"
              style={{
                background: 'linear-gradient(180deg, #1a1510 0%, #0f0c08 50%, #1a1510 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), inset 0 -1px 3px rgba(0,0,0,0.4), 0 1px 0 rgba(190,170,140,0.15)',
                border: '1px solid #2a2218',
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  data-testid="button-play-holytablet"
                  onClick={isPlaying ? stopPlayback : startPlayback}
                  className="transition-all"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isPlaying
                      ? 'radial-gradient(circle, #c4956a 0%, #8b6540 100%)'
                      : 'radial-gradient(circle, #4a3d2a 0%, #2a1f14 100%)',
                    boxShadow: isPlaying
                      ? '0 0 20px rgba(196,149,106,0.4), inset 0 1px 2px rgba(255,220,180,0.3)'
                      : 'inset 0 1px 2px rgba(80,65,45,0.3), 0 1px 3px rgba(0,0,0,0.5)',
                    color: isPlaying ? '#1a1510' : '#8b7355',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isPlaying ? <Square size={12} /> : <Play size={12} />}
                </button>
                <div className="flex flex-col">
                  <span className="text-[7px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>BPM</span>
                  <input
                    data-testid="input-bpm"
                    type="number" min={60} max={200} value={bpm}
                    onChange={e => setBpm(Math.max(60, Math.min(200, parseInt(e.target.value) || 120)))}
                    className="w-12 text-center text-sm font-bold bg-transparent border-none outline-none"
                    style={{ ...cinzel, color: '#c4956a', textShadow: '0 0 8px rgba(196,149,106,0.3)' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[7px] tracking-wider uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>
                  {isPlaying && currentStep >= 0 ? `STEP ${currentStep + 1}` : 'READY'}
                </span>
                <div className="flex gap-[2px] ml-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-3 rounded-[1px] transition-all duration-75"
                      style={{
                        background: currentStep === i
                          ? '#c4956a'
                          : i % 4 === 0 ? '#2a2218' : '#1f1a12',
                        boxShadow: currentStep === i ? '0 0 6px rgba(196,149,106,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <input
                data-testid="input-song-title"
                type="text" value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
                className="bg-transparent border-none outline-none text-right text-xs max-w-[120px] truncate"
                style={{ ...cinzel, color: '#8b7355' }}
                placeholder="Song title"
              />
            </div>

            <div className="mx-3 sm:mx-4 mb-1 rounded-md overflow-hidden" style={{ background: '#0d0b08', border: '1px solid rgba(90,77,58,0.2)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)' }}>
              <canvas ref={waveCanvasRef} width={600} height={30} className="w-full h-[30px] block" />
            </div>

            <input ref={fileInputRef} type="file" accept="audio/*,.wav,.mp3,.ogg,.flac,.aac,.m4a" className="hidden" onChange={handleFileImport} />

            <div className="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 pb-2">
              <div className="flex gap-3 sm:gap-3 h-full">
                <div className="hidden sm:flex flex-col items-center gap-2 pt-1 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[7px] tracking-widest uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>VOL</span>
                    <div className="relative w-7 h-20 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #6B5A3E 0%, #5C4E35 50%, #4a3d2a 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(190,170,140,0.15)',
                      }}
                    >
                      <input
                        type="range" min={0} max={100} value={volume}
                        onChange={e => setVolume(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
                      />
                      <div className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                        style={{
                          height: `${volume}%`,
                          background: 'linear-gradient(180deg, #c4956a, #8b6540)',
                          boxShadow: '0 0 8px rgba(196,149,106,0.3)',
                        }}
                      />
                    </div>
                    <span className="text-[8px]" style={{ color: '#8b7355' }}>{volume}</span>
                  </div>

                  <div className="w-8 h-8 rounded-full cursor-pointer"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #9C8868 0%, #7a6548 40%, #5C4E35 100%)',
                      boxShadow: 'inset 0 2px 4px rgba(190,170,140,0.3), inset 0 -2px 4px rgba(40,30,15,0.4), 0 3px 6px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-1 h-3 rounded-full" style={{ background: '#4a3d2a' }} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 min-h-0" style={{ gridTemplateRows: 'repeat(4, 1fr)' }}>
                    {PAD_NAMES.map((name, idx) => (
                      <button
                        key={idx}
                        data-testid={`pad-${idx}`}
                        onMouseDown={() => {
                          if (touchedRef.current) { touchedRef.current = false; return; }
                          if (showMapping && mappingPad === null) {
                            setMappingPad(idx);
                          } else if (mappingPad === null) {
                            playPad(idx);
                          }
                        }}
                        onTouchStart={e => {
                          e.preventDefault();
                          touchedRef.current = true;
                          if (showMapping && mappingPad === null) {
                            setMappingPad(idx);
                          } else if (mappingPad === null) {
                            playPad(idx);
                          }
                        }}
                        className="relative select-none transition-all duration-75"
                        style={{
                          background: activePad === idx
                            ? 'linear-gradient(145deg, #c4a882 0%, #b09670 50%, #9c8460 100%)'
                            : selectedFxPad === idx
                              ? 'linear-gradient(145deg, #a89060 0%, #9a8258 30%, #8a7248 70%, #7a6438 100%)'
                              : 'linear-gradient(145deg, #9C8868 0%, #8B7355 30%, #7a6548 70%, #6B5A3E 100%)',
                          borderRadius: '4px',
                          boxShadow: activePad === idx
                            ? 'inset 0 1px 2px rgba(40,30,15,0.3), 0 1px 2px rgba(0,0,0,0.3), 0 0 20px rgba(196,149,106,0.3)'
                            : selectedFxPad === idx
                              ? 'inset 0 1px 2px rgba(190,170,140,0.25), inset 0 -2px 4px rgba(40,30,15,0.3), 0 0 12px rgba(196,149,106,0.25), 0 3px 6px rgba(0,0,0,0.4)'
                              : 'inset 0 1px 2px rgba(190,170,140,0.25), inset 0 -2px 4px rgba(40,30,15,0.3), 0 3px 6px rgba(0,0,0,0.4)',
                          transform: activePad === idx ? 'scale(0.96) translateY(1px)' : 'none',
                          border: selectedFxPad === idx
                            ? '2px solid rgba(196,149,106,0.6)'
                            : '1px solid rgba(110,90,60,0.3)',
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                          {padSampleNames[idx] ? (
                            <span className="text-[5px] sm:text-[6px] tracking-wider uppercase font-medium leading-tight text-center px-0.5 truncate max-w-full"
                              style={{ ...cinzel, color: '#c4956a', textShadow: '0 0 4px rgba(196,149,106,0.3)' }}
                            >
                              {padSampleNames[idx]!.replace(/\.[^.]+$/, '').slice(0, 10)}
                            </span>
                          ) : (
                            <span className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase font-medium leading-tight text-center px-1"
                              style={{ ...cinzel, color: '#3d2f1c', textShadow: '0 1px 0 rgba(190,170,140,0.3)' }}
                            >
                              {name}
                            </span>
                          )}
                          <span className="text-[7px] uppercase tracking-wider" style={{ color: mappingPad === idx ? '#c4956a' : '#5a4d3a' }}>
                            {padMappings[idx]?.keyLabel || PAD_KEYS[idx]}
                          </span>
                        </div>
                        {activePad === idx && (
                          <motion.div
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 rounded-[4px]"
                            style={{ background: 'radial-gradient(circle, rgba(196,149,106,0.4), transparent 70%)' }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-center gap-1.5 pt-1 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 40% 35%, #A0896C 0%, #8B7355 30%, #6B5A3E 80%, #5C4E35 100%)',
                      boxShadow: 'inset 0 3px 6px rgba(190,170,140,0.3), inset 0 -3px 6px rgba(40,30,15,0.4), 0 4px 8px rgba(0,0,0,0.5)',
                      border: '2px solid rgba(90,77,58,0.5)',
                    }}
                  />

                  <div className="flex flex-col gap-1 mt-1">
                    {[
                      { label: 'SEQ', action: () => setShowSequencer(!showSequencer), active: showSequencer },
                      { label: 'FX', action: () => setShowFx(!showFx), active: showFx },
                      { label: 'SMP', action: () => { setImportTargetPad(selectedFxPad); fileInputRef.current?.click(); }, active: false },
                      { label: 'MAP', action: () => { setShowMapping(!showMapping); setMappingPad(null); }, active: showMapping },
                      { label: 'SAVE', action: handleSave, active: false },
                      { label: 'LOAD', action: () => { if (!user) setShowAuthModal(true); else setShowSaved(!showSaved); }, active: showSaved },
                      { label: 'EXP', action: () => setShowExport(!showExport), active: showExport },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        data-testid={`button-${btn.label.toLowerCase()}`}
                        onClick={btn.action}
                        className="w-10 py-1 rounded-[3px] text-[7px] tracking-[0.15em] uppercase transition-all"
                        style={{
                          ...cinzel,
                          background: btn.active
                            ? 'linear-gradient(180deg, #c4956a, #8b6540)'
                            : 'linear-gradient(180deg, #7a6548, #5C4E35)',
                          boxShadow: btn.active
                            ? '0 0 10px rgba(196,149,106,0.3), inset 0 1px 1px rgba(255,220,180,0.2)'
                            : 'inset 0 1px 1px rgba(190,170,140,0.2), 0 2px 3px rgba(0,0,0,0.4)',
                          color: btn.active ? '#1a1510' : '#a09070',
                          border: '1px solid rgba(90,77,58,0.4)',
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex sm:hidden gap-1.5 mt-2 justify-center flex-wrap">
                {[
                  { label: 'SEQ', icon: '𓇳', action: () => setShowSequencer(!showSequencer), active: showSequencer },
                  { label: 'FX', icon: '𓄂', action: () => setShowFx(!showFx), active: showFx },
                  { label: 'SMP', icon: '𓂝', action: () => { setImportTargetPad(selectedFxPad); fileInputRef.current?.click(); }, active: false },
                  { label: 'MAP', icon: '𓂋', action: () => { setShowMapping(!showMapping); setMappingPad(null); }, active: showMapping },
                  { label: 'SAVE', icon: '𓏏', action: handleSave, active: false },
                  { label: 'SONGS', icon: '𓊃', action: () => { if (!user) setShowAuthModal(true); else setShowSaved(!showSaved); }, active: showSaved },
                  { label: 'EXP', icon: '𓋴', action: () => setShowExport(!showExport), active: showExport },
                ].map(btn => (
                  <button
                    key={btn.label}
                    onClick={btn.action}
                    className="px-2 py-1 rounded-[3px] text-[7px] tracking-[0.1em] uppercase transition-all"
                    style={{
                      ...cinzel,
                      background: btn.active
                        ? 'linear-gradient(180deg, #c4956a, #8b6540)'
                        : 'linear-gradient(180deg, #6B5A3E, #5C4E35)',
                      color: btn.active ? '#1a1510' : '#a09070',
                      boxShadow: 'inset 0 1px 1px rgba(190,170,140,0.15), 0 2px 3px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(90,77,58,0.3)',
                    }}
                  >
                    <span className="mr-0.5">{btn.icon}</span>{btn.label}
                  </button>
                ))}
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <button data-testid="button-clear-pattern" onClick={() => { stopPlayback(); setPattern(createEmptyPattern()); }}
                  className="text-[7px] tracking-[0.12em] uppercase hover:brightness-150 transition-all"
                  style={{ ...cinzel, color: '#5a4d3a' }}
                >
                  𓏤 Clear
                </button>
                <div className="flex items-center gap-2 text-[6px] tracking-widest uppercase" style={{ color: '#4a3d2a' }}>
                  <span>Space: Play/Stop</span>
                  <span>|</span>
                  <span>MAP: Remap</span>
                </div>
              </div>

              <AnimatePresence>
                {(showExport || showFx || showSaved || showSequencer || showMapping) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex items-end justify-center p-3 sm:p-4"
                    style={{ background: 'rgba(13,9,6,0.85)', backdropFilter: 'blur(4px)' }}
                    onClick={() => { setShowExport(false); setShowFx(false); setShowSaved(false); setShowSequencer(false); setShowMapping(false); }}
                  >
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 30, opacity: 0 }}
                      className="w-full max-h-[70%] overflow-y-auto rounded-lg p-3"
                      style={{ background: 'linear-gradient(180deg, #2a2218 0%, #1a1510 100%)', border: '1px solid rgba(90,77,58,0.4)', boxShadow: '0 -8px 30px rgba(0,0,0,0.6)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {showExport && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>𓋴 Export</span>
                            <button onClick={() => setShowExport(false)} className="text-[9px]" style={{ color: '#5a4d3a' }}>✕</button>
                          </div>
                          <div className="flex gap-2">
                            <button data-testid="button-export-wav" onClick={exportSong} disabled={exporting}
                              className="px-4 py-2 rounded-[3px] text-[9px] tracking-[0.12em] uppercase transition-all disabled:opacity-40"
                              style={{ ...cinzel, background: 'linear-gradient(180deg, #6B5A3E, #4a3d2a)', color: '#c4956a', border: '1px solid rgba(90,77,58,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                            >
                              {exporting ? '𓇳 Rendering...' : '𓋴 Export Full Mix (.wav)'}
                            </button>
                            <button data-testid="button-export-stems" onClick={exportStems} disabled={exporting}
                              className="px-4 py-2 rounded-[3px] text-[9px] tracking-[0.12em] uppercase transition-all disabled:opacity-40"
                              style={{ ...cinzel, background: 'linear-gradient(180deg, #6B5A3E, #4a3d2a)', color: '#c4956a', border: '1px solid rgba(90,77,58,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                            >
                              {exporting ? '𓇳 Rendering...' : '𓂀 Export Stems (.wav each)'}
                            </button>
                          </div>
                        </div>
                      )}

                      {showFx && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>
                              𓄂 Pad FX & Levels
                            </span>
                            <div className="flex items-center gap-2">
                              <button onClick={resetPadSettings} className="text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 rounded" style={{ ...cinzel, color: '#8b4040', border: '1px solid rgba(139,64,64,0.3)' }}>
                                Reset All
                              </button>
                              <button onClick={() => setShowFx(false)} className="text-[9px]" style={{ color: '#5a4d3a' }}>✕</button>
                            </div>
                          </div>

                          <div className="flex gap-1 mb-3 flex-wrap">
                            {PAD_NAMES.map((name, i) => (
                              <button key={i} onClick={() => { setSelectedFxPad(i); const ctx = getCtx(); synthSound(ctx, i, ctx.currentTime, gainNodeRef.current || undefined, padSettings[i]); if (!waveAnimRef.current) drawWaveform(); }}
                                className="px-1.5 py-1 rounded text-[6px] tracking-wider uppercase transition-all"
                                style={{
                                  ...cinzel,
                                  background: selectedFxPad === i ? 'linear-gradient(180deg, #c4956a, #8b6540)' : 'rgba(40,30,15,0.4)',
                                  color: selectedFxPad === i ? '#1a1510' : '#5a4d3a',
                                  border: selectedFxPad === i ? '1px solid rgba(196,149,106,0.4)' : '1px solid rgba(40,30,15,0.3)',
                                }}
                              >{name}</button>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] tracking-[0.15em] uppercase w-14 flex-shrink-0" style={{ ...cinzel, color: '#5a4d3a' }}>Volume</span>
                              <input type="range" min={0} max={150} value={padSettings[selectedFxPad].volume}
                                onChange={e => updatePadSetting(selectedFxPad, 'volume', Number(e.target.value))}
                                className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                                style={{ background: `linear-gradient(to right, #c4956a ${padSettings[selectedFxPad].volume / 1.5}%, #2a2218 ${padSettings[selectedFxPad].volume / 1.5}%)` }}
                              />
                              <span className="text-[8px] w-8 text-right" style={{ ...cinzel, color: '#8b7355' }}>{padSettings[selectedFxPad].volume}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] tracking-[0.15em] uppercase w-14 flex-shrink-0" style={{ ...cinzel, color: '#5a4d3a' }}>Length</span>
                              <input type="range" min={10} max={300} value={padSettings[selectedFxPad].decay}
                                onChange={e => updatePadSetting(selectedFxPad, 'decay', Number(e.target.value))}
                                className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                                style={{ background: `linear-gradient(to right, #c4956a ${padSettings[selectedFxPad].decay / 3}%, #2a2218 ${padSettings[selectedFxPad].decay / 3}%)` }}
                              />
                              <span className="text-[8px] w-8 text-right" style={{ ...cinzel, color: '#8b7355' }}>{padSettings[selectedFxPad].decay}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] tracking-[0.15em] uppercase w-14 flex-shrink-0" style={{ ...cinzel, color: '#5a4d3a' }}>Pitch</span>
                              <input type="range" min={25} max={200} value={padSettings[selectedFxPad].pitch}
                                onChange={e => updatePadSetting(selectedFxPad, 'pitch', Number(e.target.value))}
                                className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                                style={{ background: `linear-gradient(to right, #c4956a ${padSettings[selectedFxPad].pitch / 2}%, #2a2218 ${padSettings[selectedFxPad].pitch / 2}%)` }}
                              />
                              <span className="text-[8px] w-8 text-right" style={{ ...cinzel, color: '#8b7355' }}>{padSettings[selectedFxPad].pitch}%</span>
                            </div>
                          </div>

                          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(90,77,58,0.15)' }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[7px] tracking-[0.12em] uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>
                                Selected: {PAD_NAMES[selectedFxPad]}
                              </span>
                              <span className="text-[7px]" style={{ color: '#4a3d2a' }}>
                                Tap a pad to preview with FX
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setImportTargetPad(selectedFxPad); fileInputRef.current?.click(); }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[7px] tracking-[0.12em] uppercase transition-all hover:brightness-125"
                                style={{ ...cinzel, background: 'rgba(196,149,106,0.12)', color: '#c4956a', border: '1px solid rgba(196,149,106,0.2)' }}
                              >
                                <Upload size={9} /> Import Sample
                              </button>
                              {padSampleNames[selectedFxPad] && (
                                <>
                                  <span className="text-[7px] truncate max-w-[100px]" style={{ color: '#8b7355' }}>
                                    {padSampleNames[selectedFxPad]}
                                  </span>
                                  <button onClick={() => clearPadSample(selectedFxPad)}
                                    className="text-[7px] px-1.5 py-0.5 rounded transition-all hover:brightness-125"
                                    style={{ ...cinzel, color: '#8b4040', border: '1px solid rgba(139,64,64,0.3)' }}
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {showSaved && user && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>𓊃 Saved Songs</span>
                            <button onClick={() => setShowSaved(false)} className="text-[9px]" style={{ color: '#5a4d3a' }}>✕</button>
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {savedSongs.length === 0 ? (
                              <p className="text-[10px] tracking-[0.15em] uppercase text-center" style={{ ...cinzel, color: '#5a4d3a' }}>
                                𓏏 No sacred recordings yet 𓏏
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {savedSongs.map(song => (
                                  <div key={song.id} className="flex items-center justify-between group">
                                    <button data-testid={`button-load-song-${song.id}`} onClick={() => loadSong(song)}
                                      className="text-xs hover:brightness-125 transition-all truncate text-left flex-1"
                                      style={{ ...cinzel, color: '#c4956a' }}
                                    >
                                      𓊃 {song.title} <span className="text-[9px]" style={{ color: '#5a4d3a' }}>{song.bpm} BPM</span>
                                    </button>
                                    <button data-testid={`button-delete-song-${song.id}`} onClick={() => deleteMutation.mutate(song.id)}
                                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#8b4040' }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {showSequencer && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>𓇳 Sequencer</span>
                            <button onClick={() => setShowSequencer(false)} className="text-[9px]" style={{ color: '#5a4d3a' }}>✕</button>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="flex items-center gap-1 mb-1.5">
                              <span className="text-[7px] tracking-[0.2em] uppercase w-14 sm:w-16 flex-shrink-0" style={{ ...cinzel, color: '#5a4d3a' }}>
                                Steps
                              </span>
                              <div className="flex-1 flex">
                                {Array.from({ length: STEPS }).map((_, s) => (
                                  <div key={s} className="flex-1 text-center text-[7px] transition-all"
                                    style={{ color: currentStep === s ? '#c4956a' : '#2a2218', textShadow: currentStep === s ? '0 0 6px rgba(196,149,106,0.5)' : 'none' }}
                                  >
                                    {s + 1}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {PAD_NAMES.map((name, row) => (
                              <div key={row} className="flex items-center gap-1 mb-[2px]">
                                <span className="text-[6px] sm:text-[7px] tracking-wider uppercase w-14 sm:w-16 truncate flex-shrink-0" style={{ ...cinzel, color: '#5a4d3a' }}>
                                  {name}
                                </span>
                                <div className="flex-1 flex gap-[1px]">
                                  {Array.from({ length: STEPS }).map((_, step) => (
                                    <button key={step} data-testid={`step-${row}-${step}`} onClick={() => toggleStep(row, step)}
                                      className="flex-1 h-3.5 sm:h-4 rounded-[1px] transition-all"
                                      style={{
                                        background: pattern[row][step]
                                          ? currentStep === step
                                            ? 'linear-gradient(180deg, #e0b88a, #c4956a)'
                                            : 'linear-gradient(180deg, #c4956a, #8b6540)'
                                          : currentStep === step
                                            ? '#2a2218'
                                            : step % 4 === 0 ? '#1f1a12' : '#17130d',
                                        boxShadow: pattern[row][step]
                                          ? currentStep === step
                                            ? '0 0 8px rgba(196,149,106,0.5), inset 0 1px 1px rgba(255,220,180,0.2)'
                                            : 'inset 0 1px 1px rgba(255,220,180,0.1)'
                                          : 'inset 0 1px 2px rgba(0,0,0,0.3)',
                                        border: `1px solid ${pattern[row][step] ? 'rgba(196,149,106,0.3)' : 'rgba(40,30,15,0.4)'}`,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {showMapping && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>
                              𓂋 Controller Mapping
                            </span>
                            <div className="flex gap-2 items-center">
                              {midiConnected && <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: '#2a3a1a', color: '#7ab55c', border: '1px solid #3a5a2a' }}>MIDI ●</span>}
                              {gamepadConnected && <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: '#1a2a3a', color: '#5c9ab5', border: '1px solid #2a3a5a' }}>GAMEPAD ●</span>}
                              <button onClick={resetMappings} className="text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 rounded" style={{ ...cinzel, color: '#8b4040', border: '1px solid rgba(139,64,64,0.3)' }}>
                                Reset
                              </button>
                              <button onClick={() => setShowMapping(false)} className="text-[9px]" style={{ color: '#5a4d3a' }}>✕</button>
                            </div>
                          </div>

                          {mappingPad !== null && (
                            <div className="mb-2 p-2 rounded text-center" style={{ background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.3)' }}>
                              <p className="text-[9px] tracking-[0.15em] uppercase mb-1.5" style={{ ...cinzel, color: '#c4956a' }}>
                                Mapping: {PAD_NAMES[mappingPad]}
                              </p>
                              <div className="flex gap-2 justify-center mb-1.5">
                                {(['key', 'midi', 'gamepad'] as const).map(t => (
                                  <button key={t} onClick={() => setMappingType(t)}
                                    className="px-2 py-0.5 rounded text-[7px] tracking-[0.12em] uppercase"
                                    style={{ ...cinzel, background: mappingType === t ? '#c4956a' : 'transparent', color: mappingType === t ? '#1a1510' : '#5a4d3a', border: '1px solid rgba(90,77,58,0.3)' }}
                                  >{t}</button>
                                ))}
                              </div>
                              <p className="text-[8px]" style={{ color: '#7a6d58' }}>
                                {mappingType === 'key' && 'Press any key to assign...'}
                                {mappingType === 'midi' && (midiConnected ? 'Press a MIDI pad/key...' : 'No MIDI device connected')}
                                {mappingType === 'gamepad' && (gamepadConnected ? 'Press a gamepad button...' : 'No gamepad connected')}
                              </p>
                              <button onClick={() => setMappingPad(null)} className="text-[7px] mt-1 uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>ESC to cancel</button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                            {PAD_NAMES.map((name, i) => (
                              <button key={i} onClick={() => setMappingPad(i)}
                                className="p-1.5 rounded text-left transition-all"
                                style={{
                                  background: mappingPad === i ? 'rgba(196,149,106,0.15)' : 'rgba(40,30,15,0.3)',
                                  border: mappingPad === i ? '1px solid rgba(196,149,106,0.4)' : '1px solid rgba(40,30,15,0.3)',
                                }}
                              >
                                <div className="text-[7px] tracking-wider uppercase truncate" style={{ ...cinzel, color: '#a09070' }}>{name}</div>
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  <span className="text-[6px] px-1 rounded" style={{ background: '#1f1a12', color: '#c4956a', border: '1px solid rgba(90,77,58,0.2)' }}>
                                    {padMappings[i].keyLabel}
                                  </span>
                                  {padMappings[i].midiNote !== null && (
                                    <span className="text-[6px] px-1 rounded" style={{ background: '#1a1f12', color: '#7ab55c', border: '1px solid rgba(60,90,40,0.2)' }}>
                                      M{padMappings[i].midiNote}
                                    </span>
                                  )}
                                  {padMappings[i].gamepadButton !== null && (
                                    <span className="text-[6px] px-1 rounded" style={{ background: '#121a1f', color: '#5c9ab5', border: '1px solid rgba(40,60,90,0.2)' }}>
                                      G{padMappings[i].gamepadButton}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>

                          {midiDevices.length > 0 && (
                            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(90,77,58,0.15)' }}>
                              <span className="text-[7px] tracking-[0.12em] uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>MIDI Devices: </span>
                              <span className="text-[7px]" style={{ color: '#7a6d58' }}>{midiDevices.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
