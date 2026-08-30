import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  BarChart3,
  Orbit,
  Download,
  Radio,
  Sliders,
} from 'lucide-react';

interface WaveGenRXProps {
  theme: 'light' | 'dark' | 'branded';
}
type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';
type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';
type LfoTarget = 'none' | 'pitch' | 'filter' | 'tremolo';
type VisualizerMode = 'oscilloscope' | 'spectrum' | 'lissajous';

interface SoundPreset {
  id: string;
  name: string;
  category: 'Synth FX' | 'Solfeggio' | 'Brainwaves' | 'Test Tones';
  description: string;
  waveType: WaveType;
  frequency: number;
  subType: WaveType | 'off';
  subVolume: number;
  noiseType: 'off' | 'white' | 'pink';
  noiseVolume: number;
  filterType: FilterType;
  filterCutoff: number;
  filterQ: number;
  lfoTarget: LfoTarget;
  lfoRate: number;
  lfoDepth: number;
  distortion: number;
  delayWet: number;
  reverbWet: number;
}

const PRESETS: SoundPreset[] = [
  // Synth FX
  {
    id: 'analogLead',
    name: 'Analog Warm Lead',
    category: 'Synth FX',
    description: 'Warm analog synthesizer lead with resonant lowpass filter and sub bass',
    waveType: 'sawtooth',
    frequency: 220,
    subType: 'square',
    subVolume: -10,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 1800,
    filterQ: 4,
    lfoTarget: 'pitch',
    lfoRate: 4.5,
    lfoDepth: 0.15,
    distortion: 0.2,
    delayWet: 0.25,
    reverbWet: 0.3,
  },
  {
    id: 'subBass808',
    name: 'Deep 808 Sub Bass',
    category: 'Synth FX',
    description: 'Powerful clean sub-bass with low-end saturation and sine sub',
    waveType: 'sine',
    frequency: 55,
    subType: 'triangle',
    subVolume: -4,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 400,
    filterQ: 2,
    lfoTarget: 'none',
    lfoRate: 1,
    lfoDepth: 0,
    distortion: 0.15,
    delayWet: 0,
    reverbWet: 0.05,
  },
  {
    id: 'laserBlaster',
    name: '8-Bit Laser Blaster',
    category: 'Synth FX',
    description: 'Fast retro arcade laser sound with resonant frequency sweep',
    waveType: 'square',
    frequency: 880,
    subType: 'off',
    subVolume: -40,
    noiseType: 'white',
    noiseVolume: -18,
    filterType: 'bandpass',
    filterCutoff: 2400,
    filterQ: 8,
    lfoTarget: 'pitch',
    lfoRate: 12,
    lfoDepth: 0.7,
    distortion: 0.4,
    delayWet: 0.35,
    reverbWet: 0.2,
  },
  {
    id: 'sciFiTheremin',
    name: 'Sci-Fi Theremin / UFO',
    category: 'Synth FX',
    description: 'Ethereal gliding theremin tone with lush space vibrato and delay',
    waveType: 'sine',
    frequency: 587.33, // D5
    subType: 'sine',
    subVolume: -14,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 4000,
    filterQ: 1,
    lfoTarget: 'pitch',
    lfoRate: 5.5,
    lfoDepth: 0.3,
    distortion: 0,
    delayWet: 0.4,
    reverbWet: 0.45,
  },
  {
    id: 'cosmicDrone',
    name: 'Cosmic Ambient Drone',
    category: 'Synth FX',
    description: 'Deep evolving soundscape with pink noise and slow filter modulation',
    waveType: 'triangle',
    frequency: 110, // A2
    subType: 'sine',
    subVolume: -6,
    noiseType: 'pink',
    noiseVolume: -16,
    filterType: 'lowpass',
    filterCutoff: 900,
    filterQ: 5,
    lfoTarget: 'filter',
    lfoRate: 0.3,
    lfoDepth: 0.6,
    distortion: 0.1,
    delayWet: 0.5,
    reverbWet: 0.6,
  },

  // Solfeggio Frequencies
  {
    id: 'solfeggio528',
    name: '528 Hz — Transformation (DNA)',
    category: 'Solfeggio',
    description: 'Famous miracle Solfeggio frequency for healing, clarity, and harmony',
    waveType: 'sine',
    frequency: 528,
    subType: 'sine',
    subVolume: -16,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 8000,
    filterQ: 1,
    lfoTarget: 'none',
    lfoRate: 1,
    lfoDepth: 0,
    distortion: 0,
    delayWet: 0.15,
    reverbWet: 0.35,
  },
  {
    id: 'solfeggio432',
    name: '432 Hz — Natural Harmony',
    category: 'Solfeggio',
    description: 'Verdi natural tuning frequency associated with acoustic warmth and peace',
    waveType: 'sine',
    frequency: 432,
    subType: 'sine',
    subVolume: -18,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 6000,
    filterQ: 1,
    lfoTarget: 'none',
    lfoRate: 1,
    lfoDepth: 0,
    distortion: 0,
    delayWet: 0.1,
    reverbWet: 0.3,
  },
  {
    id: 'solfeggio396',
    name: '396 Hz — Liberation & Peace',
    category: 'Solfeggio',
    description: 'Grounding frequency for releasing negative blockages and tension',
    waveType: 'triangle',
    frequency: 396,
    subType: 'sine',
    subVolume: -12,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 5000,
    filterQ: 1,
    lfoTarget: 'tremolo',
    lfoRate: 0.5,
    lfoDepth: 0.2,
    distortion: 0,
    delayWet: 0.2,
    reverbWet: 0.4,
  },

  // Brainwaves (Binaural pulse foundations)
  {
    id: 'alphaWave',
    name: 'Alpha State (10 Hz Focus Pulse)',
    category: 'Brainwaves',
    description: '10 Hz amplitude modulation for relaxed focus, learning, and calm alertness',
    waveType: 'sine',
    frequency: 200,
    subType: 'sine',
    subVolume: -12,
    noiseType: 'pink',
    noiseVolume: -22,
    filterType: 'lowpass',
    filterCutoff: 1200,
    filterQ: 1,
    lfoTarget: 'tremolo',
    lfoRate: 10,
    lfoDepth: 0.5,
    distortion: 0,
    delayWet: 0.1,
    reverbWet: 0.25,
  },
  {
    id: 'thetaWave',
    name: 'Theta State (6 Hz Meditation)',
    category: 'Brainwaves',
    description: '6 Hz deep relaxation pulse for meditation, visualization, and flow state',
    waveType: 'triangle',
    frequency: 144,
    subType: 'sine',
    subVolume: -8,
    noiseType: 'pink',
    noiseVolume: -20,
    filterType: 'lowpass',
    filterCutoff: 800,
    filterQ: 2,
    lfoTarget: 'tremolo',
    lfoRate: 6,
    lfoDepth: 0.6,
    distortion: 0,
    delayWet: 0.2,
    reverbWet: 0.4,
  },

  // Test Tones
  {
    id: 'test1000',
    name: '1000 Hz Standard Test Tone',
    category: 'Test Tones',
    description: 'Standard audio engineering calibration reference (1 kHz pure sine)',
    waveType: 'sine',
    frequency: 1000,
    subType: 'off',
    subVolume: -40,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 15000,
    filterQ: 1,
    lfoTarget: 'none',
    lfoRate: 1,
    lfoDepth: 0,
    distortion: 0,
    delayWet: 0,
    reverbWet: 0,
  },
  {
    id: 'test440',
    name: '440 Hz Concert Pitch (A4)',
    category: 'Test Tones',
    description: 'ISO 16 standard orchestral tuning reference frequency',
    waveType: 'sine',
    frequency: 440,
    subType: 'off',
    subVolume: -40,
    noiseType: 'off',
    noiseVolume: -40,
    filterType: 'lowpass',
    filterCutoff: 15000,
    filterQ: 1,
    lfoTarget: 'none',
    lfoRate: 1,
    lfoDepth: 0,
    distortion: 0,
    delayWet: 0,
    reverbWet: 0,
  },
];

// Encode an AudioBuffer as a 16-bit PCM WAV (RIFF) Blob.
// MediaRecorder only produces webm/opus; saving that stream with a ".wav"
// extension produces a corrupt file, so we decode and re-encode here.
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const frames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels, clamp to [-1, 1]
  const channelData: Float32Array[] = [];
  for (let c = 0; c < channels; c++) {
    channelData.push(audioBuffer.getChannelData(c));
  }
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
  }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Trigger a browser download for a blob without leaving dead object URLs.
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const WaveGenRX: React.FC<WaveGenRXProps> = ({ theme }) => {
  // Play state
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('oscilloscope');
  const [isRecording, setIsRecording] = useState(false);

  // Main Oscillator State
  const [waveType, setWaveType] = useState<WaveType>('sawtooth');
  const [frequency, setFrequency] = useState<number>(220);
  const [detune, setDetune] = useState<number>(0);

  // Sub-Oscillator State
  const [subType, setSubType] = useState<WaveType | 'off'>('square');
  const [subVolume, setSubVolume] = useState<number>(-10); // dB

  // Noise Generator State
  const [noiseType, setNoiseType] = useState<'off' | 'white' | 'pink'>('off');
  const [noiseVolume, setNoiseVolume] = useState<number>(-24); // dB

  // Resonant Filter State
  const [filterType, setFilterType] = useState<FilterType>('lowpass');
  const [filterCutoff, setFilterCutoff] = useState<number>(1800); // Hz
  const [filterQ, setFilterQ] = useState<number>(4);

  // LFO Modulation State
  const [lfoTarget, setLfoTarget] = useState<LfoTarget>('pitch');
  const [lfoRate, setLfoRate] = useState<number>(4.5); // Hz
  const [lfoDepth, setLfoDepth] = useState<number>(0.15); // 0 to 1

  // Master Effects State
  const [distortion, setDistortion] = useState<number>(0.2); // 0 to 1
  const [delayWet, setDelayWet] = useState<number>(0.25); // 0 to 1
  const [reverbWet, setReverbWet] = useState<number>(0.3); // 0 to 1
  const [volume, setVolume] = useState<number>(-5); // dB
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Preset ID
  const [selectedPresetId, setSelectedPresetId] = useState<string>('analogLead');

  // Audio Node Refs
  const oscRef = useRef<Tone.Oscillator | null>(null);
  const subOscRef = useRef<Tone.Oscillator | null>(null);
  const subGainRef = useRef<Tone.Gain | null>(null);
  const noiseRef = useRef<Tone.Noise | null>(null);
  const noiseGainRef = useRef<Tone.Gain | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const distRef = useRef<Tone.Distortion | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const tremoloGainRef = useRef<Tone.Gain | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const fftAnalyserRef = useRef<Tone.Analyser | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const prevLfoTargetRef = useRef<LfoTarget>('pitch');

  // Initialize Audio Pipeline
  useEffect(() => {
    // Master Output & Protection Limiter
    const limiter = new Tone.Limiter(-0.5).toDestination();
    const vol = new Tone.Volume(volume).connect(limiter);

    // Master Effects Chain
    const rev = new Tone.Reverb({ decay: 2.5, wet: reverbWet });
    const del = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.4, wet: delayWet });
    const dist = new Tone.Distortion({ distortion, wet: distortion > 0 ? 0.75 : 0 });
    const vcf = new Tone.Filter({ frequency: filterCutoff, type: filterType, Q: filterQ });
    const tremolo = new Tone.Gain(1);

    // Analysers
    const waveformAnalyser = new Tone.Analyser('waveform', 1024);
    const fftAnalyser = new Tone.Analyser('fft', 128);

    // Audio Graph Routing: Sources -> Tremolo -> VCF -> Distortion -> Delay -> Reverb -> Volume -> Limiter -> Analysers
    tremolo.connect(vcf);
    vcf.connect(dist);
    dist.connect(del);
    del.connect(rev);
    rev.connect(vol);
    vol.connect(waveformAnalyser);
    vol.connect(fftAnalyser);

    // Main Oscillator
    const osc = new Tone.Oscillator({
      frequency,
      type: waveType,
      detune,
    }).connect(tremolo);

    // Sub-Oscillator
    const subGain = new Tone.Gain(subType === 'off' ? 0 : Tone.dbToGain(subVolume)).connect(tremolo);
    const subOsc = new Tone.Oscillator({
      frequency: frequency / 2, // Sub 1 octave down
      type: subType === 'off' ? 'sine' : subType,
    }).connect(subGain);

    // Noise Generator
    const noiseGain = new Tone.Gain(noiseType === 'off' ? 0 : Tone.dbToGain(noiseVolume)).connect(tremolo);
    const noise = new Tone.Noise({
      type: noiseType === 'off' ? 'white' : noiseType,
    }).connect(noiseGain);

    // LFO Modulation Engine
    const lfo = new Tone.LFO({
      frequency: lfoRate,
      min: 0,
      max: 1,
    });
    lfo.start();

    // Store refs
    oscRef.current = osc;
    subOscRef.current = subOsc;
    subGainRef.current = subGain;
    noiseRef.current = noise;
    noiseGainRef.current = noiseGain;
    filterRef.current = vcf;
    distRef.current = dist;
    delayRef.current = del;
    reverbRef.current = rev;
    volumeNodeRef.current = vol;
    limiterRef.current = limiter;
    lfoRef.current = lfo;
    tremoloGainRef.current = tremolo;
    analyserRef.current = waveformAnalyser;
    fftAnalyserRef.current = fftAnalyser;

    return () => {
      osc.dispose();
      subOsc.dispose();
      subGain.dispose();
      noise.dispose();
      noiseGain.dispose();
      vcf.dispose();
      dist.dispose();
      del.dispose();
      rev.dispose();
      vol.dispose();
      limiter.dispose();
      lfo.dispose();
      tremolo.dispose();
      waveformAnalyser.dispose();
      fftAnalyser.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Main Oscillator Type
  useEffect(() => {
    if (oscRef.current && oscRef.current.type !== waveType) {
      try {
        oscRef.current.type = waveType;
      } catch (err) {
        console.error('Error changing waveType', err);
      }
    }
  }, [waveType]);

  // Update Frequency
  useEffect(() => {
    if (oscRef.current) {
      try {
        oscRef.current.frequency.value = frequency;
      } catch {
        // ignore
      }
    }
    if (subOscRef.current) {
      try {
        subOscRef.current.frequency.value = frequency / 2;
      } catch {
        // ignore
      }
    }
  }, [frequency]);

  // Update Fine Detune
  useEffect(() => {
    if (oscRef.current && lfoTarget !== 'pitch') {
      try {
        oscRef.current.detune.value = detune;
      } catch {
        // ignore
      }
    }
  }, [detune, lfoTarget]);
  // Update Sub Oscillator
  useEffect(() => {
    if (subOscRef.current && subGainRef.current) {
      try {
        if (subType === 'off') {
          subGainRef.current.gain.value = 0;
        } else {
          subOscRef.current.type = subType;
          subGainRef.current.gain.value = Tone.dbToGain(subVolume);
          if (isPlaying && subOscRef.current.state !== 'started') {
            subOscRef.current.start();
          }
        }
      } catch {
        // ignore
      }
    }
  }, [subType, subVolume, isPlaying]);

  // Update Noise Generator
  useEffect(() => {
    if (noiseRef.current && noiseGainRef.current) {
      try {
        if (noiseType === 'off') {
          noiseGainRef.current.gain.value = 0;
        } else {
          noiseRef.current.type = noiseType;
          noiseGainRef.current.gain.value = Tone.dbToGain(noiseVolume);
          if (isPlaying && noiseRef.current.state !== 'started') {
            noiseRef.current.start();
          }
        }
      } catch {
        // ignore
      }
    }
  }, [noiseType, noiseVolume, isPlaying]);
  useEffect(() => {
    if (filterRef.current) {
      try {
        filterRef.current.type = filterType;
        filterRef.current.frequency.value = filterCutoff;
        filterRef.current.Q.value = filterQ;
      } catch {
        // ignore
      }
    }
  }, [filterType, filterCutoff, filterQ]);
  // Update Master Effects & Volume
  useEffect(() => {
    if (distRef.current) {
      distRef.current.distortion = distortion;
      distRef.current.wet.value = distortion > 0 ? 0.75 : 0;
    }
    if (delayRef.current) {
      delayRef.current.wet.value = delayWet;
    }
    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbWet;
    }
    if (volumeNodeRef.current) {
      volumeNodeRef.current.volume.value = isMuted ? -Infinity : volume;
    }
  }, [distortion, delayWet, reverbWet, volume, isMuted]);

  // Update LFO Modulation Connections
  useEffect(() => {
    const lfo = lfoRef.current;
    const osc = oscRef.current;
    const vcf = filterRef.current;
    const tremolo = tremoloGainRef.current;
    if (!lfo || !osc || !vcf || !tremolo) return;

    lfo.frequency.value = lfoRate;

    // Restore the previously-modulated param to its manual value before
    // reconnecting, because Tone.connectSignal() zeroes the destination param
    // (and marks Signal params as `overridden`, making further `.value` writes
    // collapse to 0 until the flag is cleared).
    const prevTarget = prevLfoTargetRef.current;
    if (prevTarget !== lfoTarget) {
      if (prevTarget === 'pitch') {
        osc.detune.overridden = false;
        osc.detune.value = detune;
      } else if (prevTarget === 'filter') {
        vcf.frequency.overridden = false;
        vcf.frequency.value = filterCutoff;
      } else if (prevTarget === 'tremolo') {
        // tremolo.gain is a plain Param (no `overridden` flag); just restore it
        tremolo.gain.value = 1;
      }
      prevLfoTargetRef.current = lfoTarget;
    }

    // Disconnect LFO before reconnecting
    try {
      lfo.disconnect();
    } catch {
      // ignore
    }

    if (lfoTarget === 'none') return;

    if (lfoTarget === 'pitch') {
      // Modulate pitch via detune in cents to avoid frequency AudioParam collisions
      const maxCents = Math.round(lfoDepth * 100);
      lfo.min = -maxCents;
      lfo.max = maxCents;
      try {
        lfo.connect(osc.detune);
      } catch {
        // ignore
      }
    } else if (lfoTarget === 'filter') {
      lfo.min = Math.max(40, filterCutoff * (1 - lfoDepth * 0.7));
      lfo.max = Math.min(18000, filterCutoff * (1 + lfoDepth * 1.5));
      try {
        lfo.connect(vcf.frequency);
      } catch {
        // ignore
      }
    } else if (lfoTarget === 'tremolo') {
      lfo.min = Math.max(0, 1 - lfoDepth);
      lfo.max = 1;
      try {
        lfo.connect(tremolo.gain);
      } catch {
        // ignore
      }
    }
  }, [lfoTarget, lfoRate, lfoDepth, filterCutoff, detune]);
  // Start/Stop Audio Playback
  const handlePlayPause = async () => {
    try {
      await Tone.start();
      if (Tone.getContext().rawContext.state === 'suspended') {
        await Tone.getContext().rawContext.resume();
      }
    } catch {
      // ignore
    }

    if (isPlaying) {
      try {
        oscRef.current?.stop();
        subOscRef.current?.stop();
        noiseRef.current?.stop();
      } catch {
        // ignore
      }
      setIsPlaying(false);
    } else {
      try {
        if (oscRef.current && oscRef.current.state !== 'started') {
          oscRef.current.start();
        }
        if (subType !== 'off' && subOscRef.current && subOscRef.current.state !== 'started') {
          subOscRef.current.start();
        }
        if (noiseType !== 'off' && noiseRef.current && noiseRef.current.state !== 'started') {
          noiseRef.current.start();
        }
      } catch {
        // ignore
      }
      setIsPlaying(true);
    }
  };

  // Apply Sound Preset and immediately start playback
  const handlePresetSelect = async (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    try {
      await Tone.start();
      if (Tone.getContext().rawContext.state === 'suspended') {
        await Tone.getContext().rawContext.resume();
      }
    } catch {
      // ignore
    }

    setSelectedPresetId(preset.id);
    setWaveType(preset.waveType);
    setFrequency(preset.frequency);
    setSubType(preset.subType);
    setSubVolume(preset.subVolume);
    setNoiseType(preset.noiseType);
    setNoiseVolume(preset.noiseVolume);
    setFilterType(preset.filterType);
    setFilterCutoff(preset.filterCutoff);
    setFilterQ(preset.filterQ);
    setLfoTarget(preset.lfoTarget);
    setLfoRate(preset.lfoRate);
    setLfoDepth(preset.lfoDepth);
    setDistortion(preset.distortion);
    setDelayWet(preset.delayWet);
    setReverbWet(preset.reverbWet);

    try {
      if (oscRef.current && oscRef.current.state !== 'started') {
        oscRef.current.start();
      }
      if (preset.subType !== 'off' && subOscRef.current && subOscRef.current.state !== 'started') {
        subOscRef.current.start();
      }
      if (preset.noiseType !== 'off' && noiseRef.current && noiseRef.current.state !== 'started') {
        noiseRef.current.start();
      }
    } catch {
      // ignore
    }
    setIsPlaying(true);
  };
  // Adjust Frequency helper
  const adjustFrequency = (delta: number) => {
    setFrequency((prev) => Math.max(20, Math.min(2500, Math.round(prev + delta))));
  };


  // Get Musical Note name for current frequency
  const currentNoteName = Tone.Frequency(frequency).toNote();

  // Export Audio WAV Sample
  const handleRecordSample = async () => {
    if (isRecording) return;
    await Tone.start();

    if (!isPlaying) {
      oscRef.current?.start();
      subOscRef.current?.start();
      noiseRef.current?.start();
      setIsPlaying(true);
    }

    try {
      const dest = Tone.Destination.context.createMediaStreamDestination();
      Tone.Destination.connect(dest);
      const mediaRecorder = new MediaRecorder(dest.stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          Tone.Destination.disconnect(dest);
        } catch {
          // ignore
        }
        const chunks = recordedChunksRef.current;
        if (chunks.length === 0) {
          setIsRecording(false);
          return;
        }
        const baseName = `wavegen-${Math.round(frequency)}Hz-${waveType}`;
        try {
          const rawBlob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' });
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioBuffer = await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);
          downloadBlob(encodeWav(audioBuffer), `${baseName}.wav`);
        } catch {
          // Decoding failed: fall back to the browser's native container
          downloadBlob(new Blob(chunks, { type: 'audio/webm' }), `${baseName}.webm`);
        }
        setIsRecording(false);
      };

      setIsRecording(true);
      mediaRecorder.start();
      recorderRef.current = mediaRecorder;

      // Record for 3.5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 3500);
    } catch (err) {
      console.error('Audio recording not supported on this browser', err);
      setIsRecording(false);
    }
  };

  // Interactive Visualizer Canvas Loop (Oscilloscope, FFT Spectrum, Lissajous Phase Scope)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    const resizeCanvas = () => {
      cssWidth = parent.clientWidth;
      cssHeight = parent.clientHeight;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const lastDpr = window.devicePixelRatio || 1;
    let dprQuery: MediaQueryList | null = null;
    try {
      // A dpr change (zoom, monitor move) does not fire window resize; watch
      // it via a resolution media query so the backing store stays sharp.
      dprQuery = window.matchMedia(`(resolution: ${lastDpr}dppx)`);
    } catch {
      // older browsers: ignore
    }
    dprQuery?.addEventListener('change', resizeCanvas);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);

      const width = cssWidth;
      const height = cssHeight;
      const halfHeight = height / 2;

      // Theme Colors
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'branded' ? '#0d0d0d' : '#111827';
      const strokeColor = theme === 'branded' ? '#ff8fab' : '#818cf8';
      const glowColor = theme === 'branded' ? 'rgba(231, 84, 128, 0.4)' : 'rgba(99, 102, 241, 0.4)';

      canvasCtx.fillStyle = bgColor;
      canvasCtx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      canvasCtx.beginPath();
      for (let x = 0; x < width; x += 40) {
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(width, y);
      }
      canvasCtx.stroke();

      if (!isPlaying) {
        // Idle baseline with gentle pulse
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, halfHeight);
        canvasCtx.lineTo(width, halfHeight);
        canvasCtx.stroke();
        return;
      }

      // Live Audio Visualization
      if (visualizerMode === 'oscilloscope' && analyserRef.current) {
        // 1. Time-Domain Oscilloscope Waveform
        const waveformValues = analyserRef.current.getValue() as Float32Array;
        canvasCtx.lineWidth = 2.5;
        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.shadowColor = glowColor;
        canvasCtx.shadowBlur = 10;

        canvasCtx.beginPath();
        const sliceWidth = width / waveformValues.length;
        let x = 0;

        for (let i = 0; i < waveformValues.length; i++) {
          const v = waveformValues[i];
          const y = halfHeight + v * (halfHeight - 12);
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        canvasCtx.stroke();
        canvasCtx.shadowBlur = 0;
      } else if (visualizerMode === 'spectrum' && fftAnalyserRef.current) {
        // 2. Frequency-Domain FFT Spectrum Bars
        const fftValues = fftAnalyserRef.current.getValue() as Float32Array;
        const barCount = 64;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const db = fftValues[i];
          const normHeight = Math.max(0, Math.min(height - 10, ((db + 100) / 100) * height));
          const hue = (i / barCount) * 260 + (theme === 'branded' ? 300 : 220);

          canvasCtx.fillStyle = `hsla(${hue}, 85%, 65%, 0.9)`;
          canvasCtx.fillRect(
            i * barWidth + 1.5,
            height - normHeight,
            barWidth - 3,
            normHeight
          );
        }
      } else if (visualizerMode === 'lissajous' && analyserRef.current) {
        // 3. Circular Lissajous / Phase Scope
        const waveformValues = analyserRef.current.getValue() as Float32Array;
        const centerX = width / 2;
        const centerY = halfHeight;
        const maxRadius = Math.min(width, height) * 0.42;

        phaseRef.current += 0.02;
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.shadowColor = glowColor;
        canvasCtx.shadowBlur = 12;

        canvasCtx.beginPath();
        for (let i = 0; i < waveformValues.length; i++) {
          const angle = (i / waveformValues.length) * Math.PI * 2 + phaseRef.current;
          const amp = 1 + (waveformValues[i] as number) * 0.75;
          const r = maxRadius * amp;
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;

          if (i === 0) {
            canvasCtx.moveTo(px, py);
          } else {
            canvasCtx.lineTo(px, py);
          }
        }
        canvasCtx.closePath();
        canvasCtx.stroke();
        canvasCtx.shadowBlur = 0;
      }
    };

    animationFrameId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      dprQuery?.removeEventListener('change', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [theme, isPlaying, visualizerMode]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 select-none">
      {/* Top Oscilloscope & Visualizer Banner */}
      <div className="w-full bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-2xl p-4 shadow-lg space-y-3">
        {/* Visualizer Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPlaying ? <Square size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Stop' : 'Start Generator'}</span>
            </button>

            {/* Current Frequency & Note Indicator */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-control)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-[var(--border-color)] font-mono">
              <span className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Output:</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-accent)]">{Math.round(frequency)} Hz</span>
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-ui)] text-[var(--text-primary)]">
                {currentNoteName}
              </span>
            </div>

            {/* Mobile WAV Export Button (visible on mobile only) */}
            <button
              onClick={handleRecordSample}
              disabled={isRecording}
              className="sm:hidden p-1.5 rounded-lg bg-[var(--bg-control)] border border-[var(--border-color)] text-[var(--text-primary)]"
              title="Export WAV Sample"
            >
              <Download size={14} />
            </button>
          </div>

          {/* Visualizer Mode Toggles */}
          <div className="flex items-center justify-center gap-1 bg-[var(--bg-control)] p-1 rounded-xl border border-[var(--border-color)] w-full sm:w-auto">
            <button
              onClick={() => setVisualizerMode('oscilloscope')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                visualizerMode === 'oscilloscope'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Time-Domain Oscilloscope Waveform"
            >
              <Activity size={12} />
              <span>Oscilloscope</span>
            </button>
            <button
              onClick={() => setVisualizerMode('spectrum')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                visualizerMode === 'spectrum'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="FFT Frequency Spectrum Analyzer"
            >
              <BarChart3 size={12} />
              <span>Spectrum</span>
            </button>
            <button
              onClick={() => setVisualizerMode('lissajous')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                visualizerMode === 'lissajous'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Circular Phase Scope / Lissajous Orbit"
            >
              <Orbit size={12} />
              <span>Lissajous</span>
            </button>
          </div>

          {/* Desktop WAV Export Button (hidden on mobile, visible on sm:) */}
          <button
            onClick={handleRecordSample}
            disabled={isRecording}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              isRecording
                ? 'bg-amber-600 border-amber-500 text-white animate-pulse'
                : 'bg-[var(--bg-control)] hover:bg-[var(--bg-ui)] border-[var(--border-color)] text-[var(--text-primary)]'
            }`}
            title="Record and download a 3.5-second audio sample as WAV"
          >
            <Download size={14} />
            <span>{isRecording ? 'Recording...' : 'Export WAV'}</span>
          </button>
        </div>

        {/* High-Resolution Interactive Canvas */}
        <div className="w-full h-48 sm:h-56 bg-[var(--bg-waveform)] rounded-xl overflow-hidden relative shadow-inner border border-[var(--border-color)]">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
      </div>

      {/* 3-Column Studio Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ================= COLUMN 1: OSCILLATORS & SOURCES ================= */}
        <div className="bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-accent)] flex items-center gap-1.5">
              <Radio size={16} />
              <span>Oscillators & Sources</span>
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">OSC 1 / SUB</span>
          </div>

          {/* Main Waveform Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">Primary Waveform</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sine', 'triangle', 'sawtooth', 'square'] as WaveType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setWaveType(type)}
                  className={`py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                    waveType === type
                      ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-sm'
                      : 'bg-[var(--bg-control)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Frequency Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-secondary)]">Frequency</span>
              <span className="font-mono text-[var(--text-accent)]">{Math.round(frequency)} Hz</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustFrequency(-10)}
                className="px-2.5 py-1 bg-[var(--bg-control)] hover:bg-[var(--bg-ui)] border border-[var(--border-color)] rounded text-xs font-bold"
                title="-10 Hz"
              >
                -10
              </button>
              <input
                type="range"
                min="20"
                max="2500"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                aria-label="Frequency"
              />
              <button
                onClick={() => adjustFrequency(10)}
                className="px-2.5 py-1 bg-[var(--bg-control)] hover:bg-[var(--bg-ui)] border border-[var(--border-color)] rounded text-xs font-bold"
                title="+10 Hz"
              >
                +10
              </button>
            </div>
          </div>

          {/* Fine Detune */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-secondary)]">Fine Detune</span>
              <span className="font-mono text-[var(--text-accent)]">{detune} cents</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={detune}
              onChange={(e) => setDetune(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              aria-label="Fine Detune"
            />
          </div>

          {/* Sub-Oscillator Control */}
          <div className="bg-[var(--bg-control)] p-3 rounded-xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)]">Sub-Oscillator (-1 Oct)</label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value as WaveType | 'off')}
                className="sound-select text-xs py-1 px-2 font-bold"
              >
                <option value="off">Disabled</option>
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
              </select>
            </div>
            {subType !== 'off' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                  <span>Sub Volume</span>
                  <span className="font-mono">{subVolume} dB</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="0"
                  step="1"
                  value={subVolume}
                  onChange={(e) => setSubVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                  aria-label="Sub Volume"
                />
              </div>
            )}
          </div>

          {/* Noise Generator */}
          <div className="bg-[var(--bg-control)] p-3 rounded-xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)]">Noise Generator</label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value as 'off' | 'white' | 'pink')}
                className="sound-select text-xs py-1 px-2 font-bold"
              >
                <option value="off">Disabled</option>
                <option value="white">White Noise</option>
                <option value="pink">Pink Noise</option>
              </select>
            </div>
            {noiseType !== 'off' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                  <span>Noise Mix</span>
                  <span className="font-mono">{noiseVolume} dB</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="-6"
                  step="1"
                  value={noiseVolume}
                  onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                  aria-label="Noise Mix"
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: VCF FILTER & LFO ================= */}
        <div className="bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-accent)] flex items-center gap-1.5">
              <Sliders size={16} />
              <span>VCF Filter & LFO Engine</span>
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">MODULATION</span>
          </div>

          {/* Filter Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">Resonant Filter Mode</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['lowpass', 'highpass', 'bandpass', 'notch'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                    filterType === type
                      ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-sm'
                      : 'bg-[var(--bg-control)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {type === 'lowpass' ? 'LP' : type === 'highpass' ? 'HP' : type === 'bandpass' ? 'BP' : 'Notch'}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Cutoff */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-secondary)]">Filter Cutoff</span>
              <span className="font-mono text-[var(--text-accent)]">{Math.round(filterCutoff)} Hz</span>
            </div>
            <input
              type="range"
              min="40"
              max="16000"
              step="10"
              value={filterCutoff}
              onChange={(e) => setFilterCutoff(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              aria-label="Filter Cutoff"
            />
          </div>

          {/* Resonance Q */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-secondary)]">Resonance (Q)</span>
              <span className="font-mono text-[var(--text-accent)]">{filterQ.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.1"
              value={filterQ}
              onChange={(e) => setFilterQ(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              aria-label="Resonance Q"
            />
          </div>

          {/* LFO Modulation Section */}
          <div className="bg-[var(--bg-control)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">LFO Destination</span>
              <select
                value={lfoTarget}
                onChange={(e) => setLfoTarget(e.target.value as LfoTarget)}
                className="sound-select text-xs py-1 px-2 font-bold"
              >
                <option value="none">Disabled</option>
                <option value="pitch">Pitch Vibrato</option>
                <option value="filter">Filter Sweep</option>
                <option value="tremolo">Tremolo Gain</option>
              </select>
            </div>

            {lfoTarget !== 'none' && (
              <>
                {/* LFO Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                    <span>LFO Speed</span>
                    <span className="font-mono">{lfoRate.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="20"
                    step="0.1"
                    value={lfoRate}
                    onChange={(e) => setLfoRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                    aria-label="LFO Speed"
                  />
                </div>

                {/* LFO Depth */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                    <span>LFO Depth</span>
                    <span className="font-mono">{Math.round(lfoDepth * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={lfoDepth}
                    onChange={(e) => setLfoDepth(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                    aria-label="LFO Depth"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: EFFECTS, PRESETS & MASTER ================= */}
        <div className="bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-accent)] flex items-center gap-1.5">
              <Sparkles size={16} />
              <span>Presets & Effects Rack</span>
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">LAB PRESETS</span>
          </div>

          {/* Presets Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">Synthesizer & Lab Presets</label>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="sound-select text-xs py-2 px-3 font-semibold w-full"
            >
              {['Synth FX', 'Solfeggio', 'Brainwaves', 'Test Tones'].map((cat) => (
                <optgroup key={cat} label={cat}>
                  {PRESETS.filter((p) => p.category === cat).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Master Effects Sliders */}
          <div className="space-y-3 bg-[var(--bg-control)] p-3.5 rounded-xl border border-[var(--border-color)]">
            {/* Distortion */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Overdrive / Distortion</span>
                <span className="font-mono text-[var(--text-accent)]">{Math.round(distortion * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={distortion}
                onChange={(e) => setDistortion(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                aria-label="Overdrive / Distortion"
              />
            </div>

            {/* Stereo Delay */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Stereo Delay Echo</span>
                <span className="font-mono text-[var(--text-accent)]">{Math.round(delayWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={delayWet}
                onChange={(e) => setDelayWet(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                aria-label="Stereo Delay Echo"
              />
            </div>

            {/* Reverb */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Space Reverb</span>
                <span className="font-mono text-[var(--text-accent)]">{Math.round(reverbWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={reverbWet}
                onChange={(e) => setReverbWet(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                aria-label="Space Reverb"
              />
            </div>

            {/* Master Volume */}
            <div className="space-y-1 pt-1 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Master Volume</span>
                <span className="font-mono text-[var(--text-accent)]">{isMuted ? 'Muted' : `${volume} dB`}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-36"
                  max="0"
                  step="1"
                  value={volume}
                  disabled={isMuted}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-ui)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                  aria-label="Master Volume"
                />
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveGenRX;
