import * as Tone from 'tone';

export type PresetCategory =
  | 'Pianos & Keys'
  | 'Synths & Leads'
  | 'Pads & Ambient'
  | 'Organs & Mallets'
  | 'Retro & 8-Bit'
  | 'Raw Waves';

export interface SoundPreset {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  icon: string;
  createSynth: () => Tone.PolySynth;
  defaultReverb: number;
  defaultVibrato: number;
}

export interface DemoNoteEvent {
  time: number; // ms from start
  notes: string[]; // multi-voice polyphonic notes (bass + chords + melody)
  duration: string; // Tone.js duration
  velocity?: number;
}

export interface DemoMelody {
  id: string;
  name: string;
  genre: string;
  recommendedPreset: string;
  totalDurationMs: number;
  events: DemoNoteEvent[];
}

export interface KeyOption {
  semitones: number;
  label: string;
  name: string;
}

export const ROOT_KEY_OPTIONS: KeyOption[] = [
  { semitones: 0, label: 'C', name: 'C (Natural / Standard)' },
  { semitones: 1, label: 'C# / Db', name: 'C# / Db (+1 st)' },
  { semitones: 2, label: 'D', name: 'D (+2 st)' },
  { semitones: 3, label: 'D# / Eb', name: 'D# / Eb (+3 st)' },
  { semitones: 4, label: 'E', name: 'E (+4 st)' },
  { semitones: 5, label: 'F', name: 'F (+5 st)' },
  { semitones: 6, label: 'F# / Gb', name: 'F# / Gb (+6 st)' },
  { semitones: -5, label: 'G', name: 'G (-5 st)' },
  { semitones: -4, label: 'G# / Ab', name: 'G# / Ab (-4 st)' },
  { semitones: -3, label: 'A', name: 'A (-3 st)' },
  { semitones: -2, label: 'A# / Bb', name: 'A# / Bb (-2 st)' },
  { semitones: -1, label: 'B', name: 'B (-1 st)' },
];

export interface TuningPreset {
  hz: number;
  name: string;
  shortName: string;
  description: string;
  cents: number; // 1200 * Math.log2(hz / 440)
}

export const TUNING_PRESETS: TuningPreset[] = [
  {
    hz: 440,
    name: '440 Hz — Standard Concert',
    shortName: '440 Hz',
    description: 'Modern standard concert pitch (ISO 16 standard)',
    cents: 0,
  },
  {
    hz: 432,
    name: '432 Hz — Verdi / Natural',
    shortName: '432 Hz',
    description: 'Verdi natural tuning, warm harmonic acoustic resonance',
    cents: -31.77,
  },
  {
    hz: 418,
    name: '418 Hz — Deep Earth Harmonic',
    shortName: '418 Hz',
    description: 'Low earthy resonant frequency, deep relaxing timbre',
    cents: -88.94,
  },
  {
    hz: 415,
    name: '415 Hz — Baroque Pitch (A415)',
    shortName: '415 Hz',
    description: 'Authentic 18th century European baroque pitch (half step down)',
    cents: -101.37,
  },
  {
    hz: 444,
    name: '444 Hz — Solfeggio / C528',
    shortName: '444 Hz',
    description: 'Bright high-resonance pitch creating 528 Hz C5 Solfeggio',
    cents: 15.65,
  },
  {
    hz: 442,
    name: '442 Hz — European Orchestral',
    shortName: '442 Hz',
    description: 'Vienna & European symphony orchestra concert pitch',
    cents: 7.85,
  },
];

export const SOUND_PRESETS: SoundPreset[] = [
  // ==================== PIANOS & KEYS ====================
  {
    id: 'grandPiano',
    name: 'Concert Grand Piano',
    category: 'Pianos & Keys',
    description: 'Rich acoustic grand piano with warm resonant bass and crystal treble',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fattriangle', count: 3, spread: 18 },
        envelope: { attack: 0.005, decay: 2.2, sustain: 0.35, release: 1.2 },
      }),
    defaultReverb: 0.25,
    defaultVibrato: 0,
  },
  {
    id: 'rhodes',
    name: 'Vintage Rhodes Mk I',
    category: 'Pianos & Keys',
    description: 'Warm electric piano with signature bell tine harmonics and deep body',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 1.0,
        modulationIndex: 4.0,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 1.8, sustain: 0.3, release: 1.0 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.005, decay: 0.8, sustain: 0.15, release: 0.6 },
      }),
    defaultReverb: 0.2,
    defaultVibrato: 0.08,
  },
  {
    id: 'wurlitzer',
    name: 'Wurlitzer 200A',
    category: 'Pianos & Keys',
    description: 'Classic reed electric piano with bite, bark, and warmth',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2.0,
        modulationIndex: 4.5,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.008, decay: 1.4, sustain: 0.35, release: 0.8 },
        modulation: { type: 'sawtooth' },
        modulationEnvelope: { attack: 0.01, decay: 0.6, sustain: 0.2, release: 0.5 },
      }),
    defaultReverb: 0.18,
    defaultVibrato: 0.05,
  },
  {
    id: 'dreamyEP',
    name: 'Dreamy Electric Keys',
    category: 'Pianos & Keys',
    description: 'Lush ambient electric piano with ethereal harmonic sustain',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 1.5,
        oscillator: { type: 'fattriangle', count: 3, spread: 20 },
        envelope: { attack: 0.02, decay: 2.0, sustain: 0.45, release: 1.6 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.05, decay: 1.0, sustain: 0.35, release: 1.2 },
      }),
    defaultReverb: 0.35,
    defaultVibrato: 0.15,
  },
  {
    id: 'honkyTonk',
    name: 'Honky-Tonk Upright',
    category: 'Pianos & Keys',
    description: 'Lively detuned acoustic saloon piano full of character',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 22 },
        envelope: { attack: 0.005, decay: 1.5, sustain: 0.15, release: 0.6 },
      }),
    defaultReverb: 0.15,
    defaultVibrato: 0.04,
  },
  {
    id: 'harpsichord',
    name: 'Baroque Harpsichord',
    category: 'Pianos & Keys',
    description: 'Crisp plucked acoustic strings with rapid bright transient',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.002, decay: 0.6, sustain: 0.03, release: 0.25 },
      }),
    defaultReverb: 0.15,
    defaultVibrato: 0,
  },
  {
    id: 'clavinet',
    name: 'Funky Clavinet D6',
    category: 'Pianos & Keys',
    description: 'Percussive 70s funk electric keyboard with snappy bite',
    icon: '🎹',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.0,
        modulationIndex: 8,
        oscillator: { type: 'square' },
        envelope: { attack: 0.003, decay: 0.4, sustain: 0.05, release: 0.15 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
      }),
    defaultReverb: 0.1,
    defaultVibrato: 0,
  },

  // ==================== SYNTHS & LEADS ====================
  {
    id: 'default',
    name: 'Classic Poly Synth',
    category: 'Synths & Leads',
    description: 'Rich analog polyphonic synthesizer with fatsawtooth warmth',
    icon: '⚡',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
        envelope: { attack: 0.05, decay: 0.25, sustain: 0.7, release: 0.8 },
      }),
    defaultReverb: 0.15,
    defaultVibrato: 0.05,
  },
  {
    id: 'synthwave80s',
    name: '80s Synthwave Brass',
    category: 'Synths & Leads',
    description: 'Iconic wide detuned poly synth brass for retro chords',
    icon: '⚡',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 28 },
        envelope: { attack: 0.04, decay: 0.5, sustain: 0.65, release: 0.9 },
      }),
    defaultReverb: 0.3,
    defaultVibrato: 0.12,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077 Lead',
    category: 'Synths & Leads',
    description: 'Aggressive cutting sawtooth synth lead with heavy presence',
    icon: '⚡',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.6 },
      }),
    defaultReverb: 0.2,
    defaultVibrato: 0.1,
  },
  {
    id: 'superSaw',
    name: 'EDM SuperSaw',
    category: 'Synths & Leads',
    description: 'Stacked multi-oscillator hypersaw for huge modern anthems',
    icon: '⚡',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 5, spread: 35 },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.8, release: 0.7 },
      }),
    defaultReverb: 0.3,
    defaultVibrato: 0.05,
  },
  {
    id: 'polyPluck',
    name: 'Snappy Poly Pluck',
    category: 'Synths & Leads',
    description: 'Crisp percussive synth pluck for energetic melodic lines',
    icon: '⚡',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fattriangle', count: 2, spread: 15 },
        envelope: { attack: 0.002, decay: 0.35, sustain: 0.05, release: 0.4 },
      }),
    defaultReverb: 0.25,
    defaultVibrato: 0,
  },

  // ==================== PADS & AMBIENT ====================
  {
    id: 'dreamyPad',
    name: 'Celestial Dream Pad',
    category: 'Pads & Ambient',
    description: 'Warm evolving atmospheric pad with lush bloom and infinite sustain',
    icon: '🌌',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
        envelope: { attack: 0.4, decay: 1.5, sustain: 0.85, release: 2.2 },
      }),
    defaultReverb: 0.45,
    defaultVibrato: 0.18,
  },
  {
    id: 'amSynth',
    name: 'Cosmic Glass Bell',
    category: 'Pads & Ambient',
    description: 'Ethereal crystalline FM/AM bells echoing through deep space',
    icon: '🌌',
    createSynth: () =>
      new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2.5,
        detune: 0,
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.8, sustain: 0.2, release: 1.6 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.8 },
      }),
    defaultReverb: 0.35,
    defaultVibrato: 0.1,
  },
  {
    id: 'glassCelestial',
    name: 'Crystal Celeste Chime',
    category: 'Pads & Ambient',
    description: 'Shimmering delicate glass chime with sparkling harmonics',
    icon: '🌌',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 4.5,
        modulationIndex: 14,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 1.4, sustain: 0.1, release: 1.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 },
      }),
    defaultReverb: 0.4,
    defaultVibrato: 0.08,
  },
  {
    id: 'synthChoir',
    name: 'Vocal Synth Choir',
    category: 'Pads & Ambient',
    description: 'Ethereal vowel-like synthetic vocal chorus pad',
    icon: '🌌',
    createSynth: () =>
      new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 1.0,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 1.0, sustain: 0.8, release: 1.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.2, decay: 0.5, sustain: 0.6, release: 1.2 },
      }),
    defaultReverb: 0.4,
    defaultVibrato: 0.15,
  },
  {
    id: 'nebulaAtmos',
    name: 'Nebula Soundscape',
    category: 'Pads & Ambient',
    description: 'Deep evolving cinematic texture for ambient exploration',
    icon: '🌌',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 0.5,
        modulationIndex: 8,
        oscillator: { type: 'fatsine' },
        envelope: { attack: 0.5, decay: 2.0, sustain: 0.9, release: 2.5 },
        modulation: { type: 'sawtooth' },
        modulationEnvelope: { attack: 0.3, decay: 1.0, sustain: 0.7, release: 1.5 },
      }),
    defaultReverb: 0.5,
    defaultVibrato: 0.2,
  },

  // ==================== ORGANS & MALLETS ====================
  {
    id: 'jazzOrgan',
    name: 'Hammond B3 Jazz Organ',
    category: 'Organs & Mallets',
    description: 'Warm rotary Leslie drawbar organ with fast vibrato swirl',
    icon: '🪵',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsine', count: 3, spread: 12 },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.95, release: 0.2 },
      }),
    defaultReverb: 0.2,
    defaultVibrato: 0.25,
  },
  {
    id: 'cathedralOrgan',
    name: 'Cathedral Pipe Organ',
    category: 'Organs & Mallets',
    description: 'Majestic church organ with grand acoustic presence and deep bass',
    icon: '⛪',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 4, spread: 18 },
        envelope: { attack: 0.05, decay: 0.35, sustain: 1.0, release: 0.7 },
      }),
    defaultReverb: 0.45,
    defaultVibrato: 0,
  },
  {
    id: 'marimba',
    name: 'Concert Marimba',
    category: 'Organs & Mallets',
    description: 'Organic wooden mallet percussion with warm resonance',
    icon: '🪵',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.5,
        modulationIndex: 5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.35 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.15 },
      }),
    defaultReverb: 0.2,
    defaultVibrato: 0,
  },
  {
    id: 'vibraphone',
    name: 'Jazz Vibraphone',
    category: 'Organs & Mallets',
    description: 'Resonant metal bar vibes with rotary motor modulation',
    icon: '🪵',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2.0,
        modulationIndex: 3,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.002, decay: 1.8, sustain: 0.2, release: 1.5 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.002, decay: 0.8, sustain: 0.1, release: 0.5 },
      }),
    defaultReverb: 0.25,
    defaultVibrato: 0.22,
  },
  {
    id: 'musicBox',
    name: 'Music Box / Kalimba',
    category: 'Organs & Mallets',
    description: 'Nostalgic sweet metallic chime with charming acoustic ring',
    icon: '✨',
    createSynth: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 5.0,
        modulationIndex: 12,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 1.0, sustain: 0.02, release: 1.2 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 },
      }),
    defaultReverb: 0.3,
    defaultVibrato: 0.05,
  },

  // ==================== RETRO & 8-BIT ====================
  {
    id: 'chiptune',
    name: '8-Bit Game Boy',
    category: 'Retro & 8-Bit',
    description: 'Classic NES / Game Boy pulse wave with instant retro bite',
    icon: '👾',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        volume: -4,
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.35, release: 0.12 },
      }),
    defaultReverb: 0.05,
    defaultVibrato: 0,
  },
  {
    id: 'keygenNostalgia',
    name: '90s Keygen Nostalgia',
    category: 'Retro & 8-Bit',
    description: 'Iconic tracker / demoscene chiptune lead synth',
    icon: '👾',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        volume: -3,
        oscillator: { type: 'pulse', width: 0.25 },
        envelope: { attack: 0.005, decay: 0.14, sustain: 0.45, release: 0.25 },
      }),
    defaultReverb: 0.1,
    defaultVibrato: 0,
  },
  {
    id: 'arcadeBlip',
    name: 'Arcade 1984',
    category: 'Retro & 8-Bit',
    description: 'Snappy retro arcade tone with punchy fast envelope',
    icon: '👾',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        volume: -4,
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.08, release: 0.18 },
      }),
    defaultReverb: 0.08,
    defaultVibrato: 0,
  },

  // ==================== RAW WAVES ====================
  {
    id: 'sawtooth',
    name: 'Pure Sawtooth',
    category: 'Raw Waves',
    description: 'Unfiltered geometric sawtooth waveform',
    icon: '〰️',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.8, release: 0.3 },
      }),
    defaultReverb: 0,
    defaultVibrato: 0,
  },
  {
    id: 'square',
    name: 'Pure Square',
    category: 'Raw Waves',
    description: 'Pure hollow square waveform with odd harmonics',
    icon: '〰️',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.8, release: 0.3 },
      }),
    defaultReverb: 0,
    defaultVibrato: 0,
  },
  {
    id: 'sine',
    name: 'Pure Sine',
    category: 'Raw Waves',
    description: 'Pure fundamental sine tone with zero harmonics',
    icon: '〰️',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.4 },
      }),
    defaultReverb: 0,
    defaultVibrato: 0,
  },
  {
    id: 'triangle',
    name: 'Pure Triangle',
    category: 'Raw Waves',
    description: 'Warm, soft geometric triangle waveform',
    icon: '〰️',
    createSynth: () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.3 },
      }),
    defaultReverb: 0,
    defaultVibrato: 0,
  },
];

// ==================== 16 ACCURATE POLYPHONIC DEMO MASTERPIECES ====================
export const DEMO_MELODIES: DemoMelody[] = [
  // 1. BEETHOVEN — FÜR ELISE (Authentic Classical 3/8 Score & Flowing Arpeggios)
  {
    id: 'furElise',
    name: 'Für Elise (L. v. Beethoven)',
    genre: 'Classical Piano Masterpiece',
    recommendedPreset: 'grandPiano',
    totalDurationMs: 20000,
    events: [
      // Pickup Bar: Anacrusis on beat 3& (160ms per 16th note in 3/8 time)
      { time: 0, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 160, notes: ['D#5'], duration: '16n', velocity: 0.8 },

      // Measure 1: Motif (E-D#-E-B-D-C)
      { time: 320, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 480, notes: ['D#5'], duration: '16n', velocity: 0.8 },
      { time: 640, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 800, notes: ['B4'], duration: '16n', velocity: 0.8 },
      { time: 960, notes: ['D5'], duration: '16n', velocity: 0.8 },
      { time: 1120, notes: ['C5'], duration: '16n', velocity: 0.8 },

      // Measure 2: A Minor Entry (Right hand A4 held, Left hand A2-E3-A3-C4-E4 arpeggio)
      { time: 1280, notes: ['A2', 'A4'], duration: '4n', velocity: 0.95 },
      { time: 1440, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 1600, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 1760, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 1920, notes: ['E4'], duration: '16n', velocity: 0.7 },
      { time: 2080, notes: ['B4'], duration: '16n', velocity: 0.85 },

      // Measure 3: E7 Harmony (Right hand B4 held, Left hand E2-E3-G#3-B3-E4 arpeggio)
      { time: 2240, notes: ['E2', 'B4'], duration: '4n', velocity: 0.95 },
      { time: 2400, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 2560, notes: ['G#3'], duration: '16n', velocity: 0.7 },
      { time: 2720, notes: ['B3'], duration: '16n', velocity: 0.7 },
      { time: 2880, notes: ['E4'], duration: '16n', velocity: 0.7 },
      { time: 3040, notes: ['C5'], duration: '16n', velocity: 0.85 },

      // Measure 4: A Minor Harmony (Right hand C5 held, Left hand A2-E3-A3-C4-E4 arpeggio)
      { time: 3200, notes: ['A2', 'C5'], duration: '4n', velocity: 0.95 },
      { time: 3360, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 3520, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 3680, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 3840, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 4000, notes: ['D#5'], duration: '16n', velocity: 0.8 },

      // Measure 5: Repeat Motif (E-D#-E-B-D-C)
      { time: 4160, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 4320, notes: ['D#5'], duration: '16n', velocity: 0.8 },
      { time: 4480, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 4640, notes: ['B4'], duration: '16n', velocity: 0.8 },
      { time: 4800, notes: ['D5'], duration: '16n', velocity: 0.8 },
      { time: 4960, notes: ['C5'], duration: '16n', velocity: 0.8 },

      // Measure 6: Cadence Preparation (Right hand A4 held, Left hand A2-E3-A3-C4-E4)
      { time: 5120, notes: ['A2', 'A4'], duration: '4n', velocity: 0.95 },
      { time: 5280, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 5440, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 5600, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 5760, notes: ['E4'], duration: '16n', velocity: 0.7 },
      { time: 5920, notes: ['C5'], duration: '16n', velocity: 0.85 },

      // Measure 7: Cadence Resolution (E2-E3 with B4-A4)
      { time: 6080, notes: ['E2', 'B4'], duration: '8n', velocity: 0.9 },
      { time: 6240, notes: ['E3', 'A4'], duration: '8n', velocity: 0.85 },
      { time: 6400, notes: ['G#3'], duration: '16n', velocity: 0.7 },
      { time: 6560, notes: ['B3'], duration: '16n', velocity: 0.7 },

      // Measure 8: Full A Minor Cadence Chord (Resonating with fermata)
      { time: 6720, notes: ['A2', 'E3', 'A3', 'C4', 'E4', 'A4'], duration: '2n', velocity: 1.0 },

      // Section B: Beautiful C Major & G Major Waltz (Starts with breath at t = 7800ms)
      { time: 7800, notes: ['C3', 'G4', 'C5', 'E5'], duration: '8n', velocity: 0.95 },
      { time: 8040, notes: ['G3', 'E4', 'G4', 'G5'], duration: '4n', velocity: 0.9 },
      { time: 8400, notes: ['F5'], duration: '16n', velocity: 0.8 },
      { time: 8560, notes: ['E5'], duration: '16n', velocity: 0.8 },

      // G Major phrase
      { time: 8720, notes: ['G2', 'F4', 'B4', 'D5'], duration: '8n', velocity: 0.95 },
      { time: 8960, notes: ['D3', 'F4', 'F5'], duration: '4n', velocity: 0.9 },
      { time: 9320, notes: ['E5'], duration: '16n', velocity: 0.8 },
      { time: 9480, notes: ['D5'], duration: '16n', velocity: 0.8 },

      // A Minor phrase
      { time: 9640, notes: ['A2', 'E4', 'A4', 'C5'], duration: '8n', velocity: 0.95 },
      { time: 9880, notes: ['E3', 'C4', 'E5'], duration: '4n', velocity: 0.9 },
      { time: 10240, notes: ['D5'], duration: '16n', velocity: 0.8 },
      { time: 10400, notes: ['C5'], duration: '16n', velocity: 0.8 },

      // E7 Dominant Transition with rich fermata
      { time: 10560, notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4', 'G#4', 'B4'], duration: '2n', velocity: 1.0 },

      // Return to Theme (Flawless flowing tempo)
      { time: 11800, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 11960, notes: ['D#5'], duration: '16n', velocity: 0.8 },
      { time: 12120, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 12280, notes: ['D#5'], duration: '16n', velocity: 0.8 },
      { time: 12440, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 12600, notes: ['B4'], duration: '16n', velocity: 0.8 },
      { time: 12760, notes: ['D5'], duration: '16n', velocity: 0.8 },
      { time: 12920, notes: ['C5'], duration: '16n', velocity: 0.8 },

      // A Minor Arpeggio Return
      { time: 13080, notes: ['A2', 'A4'], duration: '4n', velocity: 0.95 },
      { time: 13240, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 13400, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 13560, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 13720, notes: ['E4'], duration: '16n', velocity: 0.7 },
      { time: 13880, notes: ['B4'], duration: '16n', velocity: 0.85 },

      // E7 Return
      { time: 14040, notes: ['E2', 'B4'], duration: '4n', velocity: 0.95 },
      { time: 14200, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 14360, notes: ['G#3'], duration: '16n', velocity: 0.7 },
      { time: 14520, notes: ['B3'], duration: '16n', velocity: 0.7 },
      { time: 14680, notes: ['E4'], duration: '16n', velocity: 0.7 },
      { time: 14840, notes: ['C5'], duration: '16n', velocity: 0.85 },

      // Final Grand Cadence
      { time: 15000, notes: ['A2', 'C5'], duration: '4n', velocity: 0.95 },
      { time: 15160, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 15320, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 15480, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 15640, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 15800, notes: ['D#5'], duration: '16n', velocity: 0.8 },

      { time: 15960, notes: ['E5'], duration: '16n', velocity: 0.85 },
      { time: 16120, notes: ['B4'], duration: '16n', velocity: 0.8 },
      { time: 16280, notes: ['D5'], duration: '16n', velocity: 0.8 },
      { time: 16440, notes: ['C5'], duration: '16n', velocity: 0.8 },

      { time: 16600, notes: ['A2', 'A4'], duration: '4n', velocity: 0.95 },
      { time: 16760, notes: ['E3'], duration: '16n', velocity: 0.65 },
      { time: 16920, notes: ['A3'], duration: '16n', velocity: 0.7 },
      { time: 17080, notes: ['C4'], duration: '16n', velocity: 0.7 },
      { time: 17240, notes: ['C5'], duration: '16n', velocity: 0.85 },
      { time: 17400, notes: ['B4'], duration: '16n', velocity: 0.85 },

      // Final Triumphant A Minor Resolution Chord
      { time: 17560, notes: ['A2', 'E3', 'A3', 'C4', 'E4', 'A4'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 2. INTERSTELLAR
  {
    id: 'interstellarTheme',
    name: 'Interstellar — First Step (Hans Zimmer)',
    genre: 'Cinematic Space Soundscape',
    recommendedPreset: 'dreamyEP',
    totalDurationMs: 20000,
    events: [
      { time: 0, notes: ['F#2', 'C#3', 'F#3'], duration: '2n', velocity: 0.95 },
      { time: 0, notes: ['A4'], duration: '8n', velocity: 0.8 },
      { time: 340, notes: ['C#5'], duration: '8n', velocity: 0.85 },
      { time: 680, notes: ['F#5'], duration: '8n', velocity: 0.9 },
      { time: 1020, notes: ['E5'], duration: '8n', velocity: 0.85 },
      { time: 1360, notes: ['C#5'], duration: '8n', velocity: 0.8 },
      { time: 1700, notes: ['A4'], duration: '8n', velocity: 0.8 },
      { time: 2040, notes: ['F#4'], duration: '4n', velocity: 0.85 },
      { time: 2600, notes: ['D2', 'A2', 'D3'], duration: '2n', velocity: 0.95 },
      { time: 2600, notes: ['F#4'], duration: '8n', velocity: 0.8 },
      { time: 2940, notes: ['A4'], duration: '8n', velocity: 0.85 },
      { time: 3280, notes: ['D5'], duration: '8n', velocity: 0.9 },
      { time: 3620, notes: ['C#5'], duration: '8n', velocity: 0.85 },
      { time: 3960, notes: ['A4'], duration: '8n', velocity: 0.8 },
      { time: 4300, notes: ['F#4'], duration: '8n', velocity: 0.8 },
      { time: 4640, notes: ['D4'], duration: '4n', velocity: 0.85 },
      { time: 5200, notes: ['A2', 'E3', 'A3'], duration: '2n', velocity: 0.95 },
      { time: 5200, notes: ['E4'], duration: '8n', velocity: 0.8 },
      { time: 5540, notes: ['A4'], duration: '8n', velocity: 0.85 },
      { time: 5880, notes: ['C#5'], duration: '8n', velocity: 0.9 },
      { time: 6220, notes: ['E5'], duration: '8n', velocity: 0.9 },
      { time: 6560, notes: ['C#5'], duration: '8n', velocity: 0.85 },
      { time: 6900, notes: ['A4'], duration: '8n', velocity: 0.8 },
      { time: 7240, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 7800, notes: ['E2', 'B2', 'E3'], duration: '2n', velocity: 0.95 },
      { time: 7800, notes: ['G#4'], duration: '8n', velocity: 0.8 },
      { time: 8140, notes: ['B4'], duration: '8n', velocity: 0.85 },
      { time: 8480, notes: ['E5'], duration: '8n', velocity: 0.95 },
      { time: 8820, notes: ['D#5'], duration: '8n', velocity: 0.9 },
      { time: 9160, notes: ['B4'], duration: '8n', velocity: 0.85 },
      { time: 9500, notes: ['G#4'], duration: '8n', velocity: 0.8 },
      { time: 9840, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 10600, notes: ['F#2', 'C#3', 'F#3', 'A4', 'C#5', 'F#5'], duration: '2n', velocity: 1.0 },
      { time: 11200, notes: ['G#5'], duration: '8n', velocity: 0.9 },
      { time: 11540, notes: ['A5'], duration: '4n', velocity: 1.0 },
      { time: 12100, notes: ['G#5'], duration: '8n', velocity: 0.85 },
      { time: 12440, notes: ['F#5'], duration: '8n', velocity: 0.85 },
      { time: 13000, notes: ['D2', 'A2', 'D3', 'F#4', 'A4', 'D5', 'F#5'], duration: '2n', velocity: 1.0 },
      { time: 13600, notes: ['E5'], duration: '8n', velocity: 0.9 },
      { time: 13940, notes: ['F#5'], duration: '4n', velocity: 1.0 },
      { time: 14500, notes: ['E5'], duration: '8n', velocity: 0.85 },
      { time: 14840, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 15400, notes: ['A2', 'E3', 'A3', 'E4', 'A4', 'C#5', 'E5'], duration: '2n', velocity: 1.0 },
      { time: 16000, notes: ['D5'], duration: '8n', velocity: 0.9 },
      { time: 16340, notes: ['E5'], duration: '4n', velocity: 1.0 },
      { time: 16900, notes: ['C#5'], duration: '8n', velocity: 0.85 },
      { time: 17240, notes: ['A4'], duration: '8n', velocity: 0.85 },
      { time: 17800, notes: ['E2', 'B2', 'E3', 'G#4', 'B4', 'E5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 3. NUVOLE BIANCHE
  {
    id: 'nuvoleBianche',
    name: 'Nuvole Bianche (Ludovico Einaudi)',
    genre: 'Emotional Contemporary Piano',
    recommendedPreset: 'grandPiano',
    totalDurationMs: 22000,
    events: [
      { time: 0, notes: ['F2', 'C3', 'F3'], duration: '2n', velocity: 0.95 },
      { time: 0, notes: ['Ab4', 'C5'], duration: '4n', velocity: 0.85 },
      { time: 450, notes: ['Eb5'], duration: '4n', velocity: 0.9 },
      { time: 900, notes: ['C5'], duration: '4n', velocity: 0.85 },
      { time: 1350, notes: ['Ab4'], duration: '4n', velocity: 0.8 },
      { time: 1800, notes: ['Db2', 'Ab2', 'Db3'], duration: '2n', velocity: 0.95 },
      { time: 1800, notes: ['F4', 'Ab4'], duration: '4n', velocity: 0.85 },
      { time: 2250, notes: ['Db5'], duration: '4n', velocity: 0.9 },
      { time: 2700, notes: ['Ab4'], duration: '4n', velocity: 0.85 },
      { time: 3150, notes: ['F4'], duration: '4n', velocity: 0.8 },
      { time: 3600, notes: ['Ab2', 'Eb3', 'Ab3'], duration: '2n', velocity: 0.95 },
      { time: 3600, notes: ['Eb4', 'Ab4'], duration: '4n', velocity: 0.85 },
      { time: 4050, notes: ['C5'], duration: '4n', velocity: 0.9 },
      { time: 4500, notes: ['Ab4'], duration: '4n', velocity: 0.85 },
      { time: 4950, notes: ['Eb4'], duration: '4n', velocity: 0.8 },
      { time: 5400, notes: ['Eb2', 'Bb2', 'Eb3'], duration: '2n', velocity: 0.95 },
      { time: 5400, notes: ['G4', 'Bb4'], duration: '4n', velocity: 0.85 },
      { time: 5850, notes: ['Eb5'], duration: '4n', velocity: 0.9 },
      { time: 6300, notes: ['Bb4'], duration: '4n', velocity: 0.85 },
      { time: 6750, notes: ['G4'], duration: '4n', velocity: 0.8 },
      { time: 7600, notes: ['F2', 'C3', 'F3', 'C5', 'F5'], duration: '4n', velocity: 1.0 },
      { time: 8050, notes: ['G5'], duration: '8n', velocity: 0.9 },
      { time: 8350, notes: ['Ab5'], duration: '4n', velocity: 0.95 },
      { time: 8800, notes: ['G5'], duration: '8n', velocity: 0.85 },
      { time: 9100, notes: ['F5'], duration: '8n', velocity: 0.85 },
      { time: 9400, notes: ['Db2', 'Ab2', 'Db3', 'F5'], duration: '4n', velocity: 1.0 },
      { time: 9850, notes: ['Eb5'], duration: '4n', velocity: 0.9 },
      { time: 10300, notes: ['Db5'], duration: '4n', velocity: 0.85 },
      { time: 10750, notes: ['C5'], duration: '4n', velocity: 0.8 },
      { time: 11200, notes: ['Ab2', 'Eb3', 'Ab3', 'C5', 'Eb5'], duration: '2n', velocity: 1.0 },
      { time: 12100, notes: ['Eb2', 'Bb2', 'Eb3', 'Bb4', 'Eb5', 'G5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 4. STRANGER SYNTH (80s SYNTHWAVE)
  {
    id: 'synthwaveAnthem',
    name: '80s Synthwave / Stranger Synth',
    genre: 'Retro Analog Synthwave',
    recommendedPreset: 'synthwave80s',
    totalDurationMs: 16000,
    events: [
      { time: 0, notes: ['A1', 'A2', 'A3', 'C4', 'E4'], duration: '8n', velocity: 1.0 },
      { time: 200, notes: ['A2', 'E5'], duration: '16n', velocity: 0.85 },
      { time: 400, notes: ['A1', 'A4'], duration: '16n', velocity: 0.85 },
      { time: 600, notes: ['A2', 'C5'], duration: '16n', velocity: 0.9 },
      { time: 800, notes: ['A1', 'E5'], duration: '16n', velocity: 0.95 },
      { time: 1000, notes: ['A2', 'G5'], duration: '16n', velocity: 1.0 },
      { time: 1200, notes: ['A1', 'E5'], duration: '16n', velocity: 0.9 },
      { time: 1400, notes: ['A2', 'C5'], duration: '16n', velocity: 0.85 },
      { time: 1700, notes: ['F1', 'F2', 'F3', 'A3', 'C4'], duration: '8n', velocity: 1.0 },
      { time: 1900, notes: ['F2', 'A4'], duration: '16n', velocity: 0.85 },
      { time: 2100, notes: ['F1', 'C5'], duration: '16n', velocity: 0.9 },
      { time: 2300, notes: ['F2', 'F5'], duration: '16n', velocity: 1.0 },
      { time: 2500, notes: ['F1', 'E5'], duration: '16n', velocity: 0.95 },
      { time: 2700, notes: ['F2', 'C5'], duration: '16n', velocity: 0.9 },
      { time: 2900, notes: ['F1', 'A4'], duration: '16n', velocity: 0.85 },
      { time: 3100, notes: ['F2', 'F4'], duration: '16n', velocity: 0.8 },
      { time: 3400, notes: ['G1', 'G2', 'G3', 'B3', 'D4'], duration: '8n', velocity: 1.0 },
      { time: 3600, notes: ['G2', 'B4'], duration: '16n', velocity: 0.85 },
      { time: 3800, notes: ['G1', 'D5'], duration: '16n', velocity: 0.9 },
      { time: 4000, notes: ['G2', 'G5'], duration: '16n', velocity: 1.0 },
      { time: 4200, notes: ['G1', 'F#5'], duration: '16n', velocity: 0.95 },
      { time: 4400, notes: ['G2', 'D5'], duration: '16n', velocity: 0.9 },
      { time: 4600, notes: ['G1', 'B4'], duration: '16n', velocity: 0.85 },
      { time: 5000, notes: ['E1', 'E2', 'G3', 'B3', 'E4'], duration: '8n', velocity: 1.0 },
      { time: 5250, notes: ['E2', 'B4'], duration: '16n', velocity: 0.85 },
      { time: 5500, notes: ['E1', 'E5'], duration: '16n', velocity: 0.95 },
      { time: 5750, notes: ['E2', 'G5'], duration: '16n', velocity: 1.0 },
      { time: 6200, notes: ['A1', 'A2', 'E4', 'A4', 'C5', 'E5'], duration: '4n', velocity: 1.0 },
      { time: 6600, notes: ['G5'], duration: '8n', velocity: 0.95 },
      { time: 6900, notes: ['E5'], duration: '8n', velocity: 0.9 },
      { time: 7300, notes: ['F1', 'F2', 'C4', 'F4', 'A4', 'C5'], duration: '4n', velocity: 1.0 },
      { time: 7700, notes: ['A5'], duration: '8n', velocity: 0.95 },
      { time: 8000, notes: ['F5'], duration: '8n', velocity: 0.9 },
      { time: 8400, notes: ['G1', 'G2', 'D4', 'G4', 'B4', 'D5'], duration: '4n', velocity: 1.0 },
      { time: 8800, notes: ['B5'], duration: '8n', velocity: 1.0 },
      { time: 9100, notes: ['G5'], duration: '8n', velocity: 0.9 },
      { time: 9500, notes: ['E1', 'E2', 'B3', 'E4', 'G4', 'B4', 'E5'], duration: '2n', velocity: 1.0 },
      { time: 10400, notes: ['A1', 'A2', 'C3', 'E3', 'A3', 'C4', 'E4', 'A4', 'C5', 'E5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 5. MEGALOVANIA
  {
    id: 'megalovania',
    name: 'Megalovania (8-Bit Boss Theme)',
    genre: 'Chiptune / Game Music',
    recommendedPreset: 'chiptune',
    totalDurationMs: 15000,
    events: [
      { time: 0, notes: ['D4'], duration: '16n', velocity: 0.9 },
      { time: 160, notes: ['D4'], duration: '16n', velocity: 0.9 },
      { time: 320, notes: ['D5'], duration: '8n', velocity: 1.0 },
      { time: 640, notes: ['A4'], duration: '8n', velocity: 0.9 },
      { time: 960, notes: ['G#4'], duration: '8n', velocity: 0.85 },
      { time: 1280, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 1600, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 1920, notes: ['D4'], duration: '16n', velocity: 0.85 },
      { time: 2080, notes: ['F4'], duration: '16n', velocity: 0.85 },
      { time: 2240, notes: ['G4'], duration: '16n', velocity: 0.9 },
      { time: 2600, notes: ['C4'], duration: '16n', velocity: 0.9 },
      { time: 2760, notes: ['C4'], duration: '16n', velocity: 0.9 },
      { time: 2920, notes: ['D5'], duration: '8n', velocity: 1.0 },
      { time: 3240, notes: ['A4'], duration: '8n', velocity: 0.9 },
      { time: 3560, notes: ['G#4'], duration: '8n', velocity: 0.85 },
      { time: 3880, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 4200, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 4520, notes: ['D4'], duration: '16n', velocity: 0.85 },
      { time: 4680, notes: ['F4'], duration: '16n', velocity: 0.85 },
      { time: 4840, notes: ['G4'], duration: '16n', velocity: 0.9 },
      { time: 5200, notes: ['B3'], duration: '16n', velocity: 0.9 },
      { time: 5360, notes: ['B3'], duration: '16n', velocity: 0.9 },
      { time: 5520, notes: ['D5'], duration: '8n', velocity: 1.0 },
      { time: 5840, notes: ['A4'], duration: '8n', velocity: 0.9 },
      { time: 6160, notes: ['G#4'], duration: '8n', velocity: 0.85 },
      { time: 6480, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 6800, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 7120, notes: ['D4'], duration: '16n', velocity: 0.85 },
      { time: 7280, notes: ['F4'], duration: '16n', velocity: 0.85 },
      { time: 7440, notes: ['G4'], duration: '16n', velocity: 0.9 },
      { time: 7800, notes: ['A#3'], duration: '16n', velocity: 0.9 },
      { time: 7960, notes: ['A#3'], duration: '16n', velocity: 0.9 },
      { time: 8120, notes: ['D5'], duration: '8n', velocity: 1.0 },
      { time: 8440, notes: ['A4'], duration: '8n', velocity: 0.9 },
      { time: 8760, notes: ['G#4'], duration: '8n', velocity: 0.85 },
      { time: 9080, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 9400, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 9720, notes: ['D4'], duration: '16n', velocity: 0.85 },
      { time: 9880, notes: ['F4'], duration: '16n', velocity: 0.85 },
      { time: 10040, notes: ['G4'], duration: '16n', velocity: 0.9 },
      { time: 10500, notes: ['D3', 'D4', 'F4', 'A4', 'D5'], duration: '8n', velocity: 1.0 },
      { time: 10800, notes: ['A4', 'F5'], duration: '8n', velocity: 0.95 },
      { time: 11100, notes: ['G#4', 'E5'], duration: '8n', velocity: 0.9 },
      { time: 11400, notes: ['G4', 'D5'], duration: '8n', velocity: 0.9 },
      { time: 11700, notes: ['C3', 'C4', 'E4', 'G4', 'C5'], duration: '8n', velocity: 1.0 },
      { time: 12000, notes: ['D4', 'F5'], duration: '8n', velocity: 0.95 },
      { time: 12300, notes: ['G4', 'G5'], duration: '8n', velocity: 1.0 },
      { time: 12600, notes: ['B2', 'B3', 'D4', 'F4', 'B4'], duration: '8n', velocity: 1.0 },
      { time: 12900, notes: ['A#2', 'A#3', 'D4', 'F4', 'A#4'], duration: '4n', velocity: 1.0 },
      { time: 13400, notes: ['C3', 'C4', 'E4', 'G4', 'C5'], duration: '4n', velocity: 1.0 },
      { time: 13900, notes: ['D2', 'D3', 'A3', 'D4', 'F4', 'A4', 'D5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 6. SUPER MARIO BROS
  {
    id: 'superMario',
    name: 'Super Mario Bros — Main Theme (Koji Kondo)',
    genre: 'Retro 8-Bit Nintendo Classic',
    recommendedPreset: 'arcadeBlip',
    totalDurationMs: 14000,
    events: [
      { time: 0, notes: ['E5'], duration: '16n', velocity: 0.9 },
      { time: 180, notes: ['E5'], duration: '16n', velocity: 0.9 },
      { time: 420, notes: ['E5'], duration: '16n', velocity: 0.9 },
      { time: 660, notes: ['C5'], duration: '16n', velocity: 0.85 },
      { time: 840, notes: ['E5'], duration: '16n', velocity: 0.9 },
      { time: 1140, notes: ['G5'], duration: '8n', velocity: 1.0 },
      { time: 1600, notes: ['G4'], duration: '8n', velocity: 0.95 },
      { time: 2200, notes: ['C3', 'C5'], duration: '8n', velocity: 0.95 },
      { time: 2600, notes: ['G2', 'G4'], duration: '8n', velocity: 0.9 },
      { time: 3000, notes: ['E2', 'E4'], duration: '8n', velocity: 0.85 },
      { time: 3400, notes: ['A2', 'A4'], duration: '8n', velocity: 0.9 },
      { time: 3750, notes: ['B2', 'B4'], duration: '8n', velocity: 0.9 },
      { time: 4100, notes: ['A#2', 'A#4'], duration: '16n', velocity: 0.85 },
      { time: 4300, notes: ['A2', 'A4'], duration: '8n', velocity: 0.85 },
      { time: 4700, notes: ['G2', 'G4'], duration: '8n', velocity: 0.9 },
      { time: 5050, notes: ['E5'], duration: '8n', velocity: 0.9 },
      { time: 5400, notes: ['G5'], duration: '8n', velocity: 0.95 },
      { time: 5750, notes: ['A5'], duration: '4n', velocity: 1.0 },
      { time: 6200, notes: ['F5'], duration: '8n', velocity: 0.85 },
      { time: 6500, notes: ['G5'], duration: '8n', velocity: 0.9 },
      { time: 6900, notes: ['E5'], duration: '4n', velocity: 0.9 },
      { time: 7350, notes: ['C5'], duration: '8n', velocity: 0.85 },
      { time: 7650, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 7950, notes: ['B4'], duration: '4n', velocity: 0.9 },
      { time: 8600, notes: ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 7. ZELDA — SONG OF STORMS
  {
    id: 'zeldaSongOfStorms',
    name: 'The Legend of Zelda — Song of Storms',
    genre: 'Fantasy RPG Classic',
    recommendedPreset: 'musicBox',
    totalDurationMs: 16000,
    events: [
      { time: 0, notes: ['D3', 'A3', 'D4'], duration: '8n', velocity: 0.9 },
      { time: 240, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 480, notes: ['D5'], duration: '2n', velocity: 1.0 },
      { time: 1300, notes: ['D3', 'A3', 'D4'], duration: '8n', velocity: 0.9 },
      { time: 1540, notes: ['F4'], duration: '8n', velocity: 0.9 },
      { time: 1780, notes: ['D5'], duration: '2n', velocity: 1.0 },
      { time: 2600, notes: ['E5'], duration: '4n', velocity: 0.9 },
      { time: 3100, notes: ['F5'], duration: '8n', velocity: 0.9 },
      { time: 3350, notes: ['E5'], duration: '8n', velocity: 0.85 },
      { time: 3600, notes: ['F5'], duration: '8n', velocity: 0.9 },
      { time: 3850, notes: ['E5'], duration: '8n', velocity: 0.85 },
      { time: 4100, notes: ['C5'], duration: '8n', velocity: 0.85 },
      { time: 4350, notes: ['A4'], duration: '2n', velocity: 0.95 },
      { time: 5400, notes: ['D3', 'A3'], duration: '4n', velocity: 0.9 },
      { time: 5400, notes: ['A4'], duration: '4n', velocity: 0.9 },
      { time: 5850, notes: ['D4'], duration: '4n', velocity: 0.85 },
      { time: 6300, notes: ['F4'], duration: '8n', velocity: 0.85 },
      { time: 6600, notes: ['G4'], duration: '8n', velocity: 0.9 },
      { time: 6900, notes: ['A2', 'E3', 'A4'], duration: '2n', velocity: 1.0 },
      { time: 8000, notes: ['D2', 'A2', 'D3', 'F4', 'A4', 'D5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 8. DAFT PUNK — GET LUCKY
  {
    id: 'daftPunkFunk',
    name: 'Get Lucky / Around the World (Daft Punk)',
    genre: 'French Disco Funk',
    recommendedPreset: 'clavinet',
    totalDurationMs: 16000,
    events: [
      { time: 0, notes: ['B1', 'B2', 'D4', 'F#4', 'A4'], duration: '8n', velocity: 1.0 },
      { time: 240, notes: ['F#4', 'A4'], duration: '16n', velocity: 0.8 },
      { time: 480, notes: ['D4', 'F#4'], duration: '16n', velocity: 0.85 },
      { time: 720, notes: ['F#4', 'A4', 'B4'], duration: '8n', velocity: 0.9 },
      { time: 1100, notes: ['D2', 'D3', 'F#4', 'A4', 'C#5'], duration: '8n', velocity: 1.0 },
      { time: 1340, notes: ['A4', 'C#5'], duration: '16n', velocity: 0.8 },
      { time: 1580, notes: ['F#4', 'A4'], duration: '16n', velocity: 0.85 },
      { time: 1820, notes: ['A4', 'C#5', 'D5'], duration: '8n', velocity: 0.9 },
      { time: 2200, notes: ['F#1', 'F#2', 'A3', 'C#4', 'E4'], duration: '8n', velocity: 1.0 },
      { time: 2440, notes: ['C#4', 'E4'], duration: '16n', velocity: 0.8 },
      { time: 2680, notes: ['A3', 'C#4'], duration: '16n', velocity: 0.85 },
      { time: 2920, notes: ['C#4', 'E4', 'F#4'], duration: '8n', velocity: 0.9 },
      { time: 3300, notes: ['E1', 'E2', 'G#3', 'B3', 'D4'], duration: '8n', velocity: 1.0 },
      { time: 3540, notes: ['B3', 'D4'], duration: '16n', velocity: 0.8 },
      { time: 3780, notes: ['G#3', 'B3'], duration: '16n', velocity: 0.85 },
      { time: 4020, notes: ['B3', 'D4', 'E4'], duration: '8n', velocity: 0.9 },
      { time: 4500, notes: ['B1', 'B2', 'F#4', 'B4', 'D5'], duration: '4n', velocity: 1.0 },
      { time: 4900, notes: ['C#5'], duration: '8n', velocity: 0.9 },
      { time: 5200, notes: ['B4'], duration: '8n', velocity: 0.85 },
      { time: 5600, notes: ['D2', 'D3', 'A4', 'D5', 'F#5'], duration: '4n', velocity: 1.0 },
      { time: 6000, notes: ['E5'], duration: '8n', velocity: 0.9 },
      { time: 6300, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 6700, notes: ['F#1', 'F#2', 'C#5', 'F#5', 'A5'], duration: '4n', velocity: 1.0 },
      { time: 7100, notes: ['G#5'], duration: '8n', velocity: 0.95 },
      { time: 7400, notes: ['F#5'], duration: '8n', velocity: 0.9 },
      { time: 7800, notes: ['E1', 'E2', 'B4', 'E5', 'G#5'], duration: '2n', velocity: 1.0 },
    ],
  },

  // 9. CYBERPUNK 2077
  {
    id: 'cyberpunkDrive',
    name: 'Cyberpunk 2077 — Night City Drive',
    genre: 'Dark Electro & Industrial',
    recommendedPreset: 'cyberpunk',
    totalDurationMs: 15000,
    events: [
      { time: 0, notes: ['C2', 'C3', 'G3', 'C4'], duration: '8n', velocity: 1.0 },
      { time: 180, notes: ['C3', 'D#4'], duration: '16n', velocity: 0.85 },
      { time: 360, notes: ['C2', 'G4'], duration: '16n', velocity: 0.9 },
      { time: 540, notes: ['C3', 'A#4'], duration: '16n', velocity: 0.95 },
      { time: 720, notes: ['C2', 'C5'], duration: '8n', velocity: 1.0 },
      { time: 1000, notes: ['A#4'], duration: '8n', velocity: 0.9 },
      { time: 1200, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 1500, notes: ['G#1', 'G#2', 'D#3', 'G#3'], duration: '8n', velocity: 1.0 },
      { time: 1680, notes: ['G#2', 'C4'], duration: '16n', velocity: 0.85 },
      { time: 1860, notes: ['G#1', 'D#4'], duration: '16n', velocity: 0.9 },
      { time: 2040, notes: ['G#2', 'G#4'], duration: '16n', velocity: 0.95 },
      { time: 2220, notes: ['G#1', 'G4'], duration: '8n', velocity: 0.9 },
      { time: 2500, notes: ['F4'], duration: '8n', velocity: 0.85 },
      { time: 2900, notes: ['A#1', 'A#2', 'F3', 'A#3'], duration: '8n', velocity: 1.0 },
      { time: 3080, notes: ['A#2', 'D4'], duration: '16n', velocity: 0.85 },
      { time: 3260, notes: ['A#1', 'F4'], duration: '16n', velocity: 0.9 },
      { time: 3440, notes: ['A#2', 'A#4'], duration: '16n', velocity: 0.95 },
      { time: 3700, notes: ['G4'], duration: '8n', velocity: 0.9 },
      { time: 4100, notes: ['C2', 'C3', 'G3', 'C4', 'D#4', 'G4', 'C5'], duration: '2n', velocity: 1.0 },
    ],
  },

  // 10. EDM FESTIVAL ANTHEM
  {
    id: 'edmFestival',
    name: 'Levels & Anthems (Avicii / EDM)',
    genre: 'Progressive House Supersaw',
    recommendedPreset: 'superSaw',
    totalDurationMs: 16000,
    events: [
      { time: 0, notes: ['C#2', 'C#3', 'G#3', 'C#4', 'E4', 'G#4'], duration: '8n', velocity: 1.0 },
      { time: 250, notes: ['G#4', 'C#5'], duration: '8n', velocity: 0.9 },
      { time: 500, notes: ['B4', 'E5'], duration: '4n', velocity: 1.0 },
      { time: 1000, notes: ['G#4', 'C#5'], duration: '8n', velocity: 0.9 },
      { time: 1300, notes: ['A1', 'A2', 'E3', 'A3', 'C#4', 'E4'], duration: '8n', velocity: 1.0 },
      { time: 1550, notes: ['E4', 'A4'], duration: '8n', velocity: 0.9 },
      { time: 1800, notes: ['G#4', 'C#5'], duration: '4n', velocity: 1.0 },
      { time: 2300, notes: ['F#4', 'B4'], duration: '8n', velocity: 0.9 },
      { time: 2600, notes: ['E1', 'E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], duration: '8n', velocity: 1.0 },
      { time: 2850, notes: ['B3', 'E4'], duration: '8n', velocity: 0.9 },
      { time: 3100, notes: ['G#4', 'B4', 'E5'], duration: '4n', velocity: 1.0 },
      { time: 3600, notes: ['F#4', 'D#5'], duration: '8n', velocity: 0.9 },
      { time: 3900, notes: ['B1', 'B2', 'F#3', 'B3', 'D#4', 'F#4'], duration: '8n', velocity: 1.0 },
      { time: 4150, notes: ['F#4', 'B4'], duration: '8n', velocity: 0.9 },
      { time: 4400, notes: ['D#5', 'F#5'], duration: '4n', velocity: 1.0 },
      { time: 4900, notes: ['C#5', 'E5'], duration: '8n', velocity: 0.95 },
      { time: 5300, notes: ['C#2', 'C#3', 'E3', 'G#3', 'C#4', 'E4', 'G#4', 'C#5', 'E5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 11. CANON IN D
  {
    id: 'canonInD',
    name: 'Canon in D (J. Pachelbel)',
    genre: 'Baroque Masterpiece',
    recommendedPreset: 'harpsichord',
    totalDurationMs: 20000,
    events: [
      { time: 0, notes: ['D3', 'F#4', 'A4', 'D5'], duration: '2n', velocity: 0.95 },
      { time: 900, notes: ['F#5'], duration: '4n', velocity: 0.85 },
      { time: 1350, notes: ['E5'], duration: '4n', velocity: 0.85 },
      { time: 1800, notes: ['A2', 'E4', 'A4', 'C#5'], duration: '2n', velocity: 0.95 },
      { time: 2700, notes: ['D5'], duration: '4n', velocity: 0.85 },
      { time: 3150, notes: ['C#5'], duration: '4n', velocity: 0.85 },
      { time: 3600, notes: ['B2', 'D4', 'F#4', 'B4'], duration: '2n', velocity: 0.95 },
      { time: 4500, notes: ['B4'], duration: '4n', velocity: 0.85 },
      { time: 4950, notes: ['A4'], duration: '4n', velocity: 0.85 },
      { time: 5400, notes: ['F#2', 'C#4', 'F#4', 'A4'], duration: '2n', velocity: 0.95 },
      { time: 6300, notes: ['G4'], duration: '4n', velocity: 0.85 },
      { time: 6750, notes: ['F#4'], duration: '4n', velocity: 0.85 },
      { time: 7200, notes: ['G2', 'D4', 'G4', 'B4'], duration: '2n', velocity: 0.95 },
      { time: 8100, notes: ['G4'], duration: '4n', velocity: 0.85 },
      { time: 8550, notes: ['F#4'], duration: '4n', velocity: 0.85 },
      { time: 9000, notes: ['D3', 'D4', 'F#4', 'A4'], duration: '2n', velocity: 0.95 },
      { time: 9900, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 10350, notes: ['D4'], duration: '4n', velocity: 0.85 },
      { time: 10800, notes: ['G2', 'B3', 'D4', 'G4'], duration: '2n', velocity: 0.95 },
      { time: 11700, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 12150, notes: ['F#4'], duration: '4n', velocity: 0.85 },
      { time: 12600, notes: ['A2', 'C#4', 'E4', 'G4'], duration: '2n', velocity: 1.0 },
      { time: 13500, notes: ['G4'], duration: '4n', velocity: 0.85 },
      { time: 13950, notes: ['A4'], duration: '4n', velocity: 0.85 },
      { time: 14400, notes: ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 12. TOCCATA IN D MINOR
  {
    id: 'toccataDm',
    name: 'Toccata in D minor (J.S. Bach)',
    genre: 'Cathedral Organ Classic',
    recommendedPreset: 'cathedralOrgan',
    totalDurationMs: 18000,
    events: [
      { time: 0, notes: ['A4'], duration: '8n', velocity: 1.0 },
      { time: 250, notes: ['G4'], duration: '16n', velocity: 0.9 },
      { time: 450, notes: ['A4'], duration: '2n', velocity: 1.0 },
      { time: 1400, notes: ['G4'], duration: '16n', velocity: 0.85 },
      { time: 1600, notes: ['F4'], duration: '16n', velocity: 0.85 },
      { time: 1800, notes: ['E4'], duration: '16n', velocity: 0.85 },
      { time: 2000, notes: ['D4'], duration: '16n', velocity: 0.85 },
      { time: 2200, notes: ['C#4'], duration: '16n', velocity: 0.85 },
      { time: 2400, notes: ['D4'], duration: '2n', velocity: 1.0 },
      { time: 3500, notes: ['D1', 'D2', 'D3', 'F3', 'A3', 'D4'], duration: '2n', velocity: 1.0 },
      { time: 5100, notes: ['E3'], duration: '8n', velocity: 0.95 },
      { time: 5350, notes: ['D3'], duration: '16n', velocity: 0.9 },
      { time: 5550, notes: ['E3'], duration: '2n', velocity: 1.0 },
      { time: 6500, notes: ['D3'], duration: '16n', velocity: 0.85 },
      { time: 6700, notes: ['C#3'], duration: '16n', velocity: 0.85 },
      { time: 6900, notes: ['B2'], duration: '16n', velocity: 0.85 },
      { time: 7100, notes: ['A2'], duration: '16n', velocity: 0.85 },
      { time: 7300, notes: ['G#2'], duration: '16n', velocity: 0.85 },
      { time: 7500, notes: ['A2'], duration: '2n', velocity: 1.0 },
      { time: 8500, notes: ['A1', 'A2', 'E3', 'A3', 'C#4', 'E4'], duration: '2n', velocity: 1.0 },
      { time: 10200, notes: ['C#2', 'G2', 'A#2', 'C#3', 'E3', 'G3', 'A#3', 'C#4', 'E4', 'G4'], duration: '2n', velocity: 1.0 },
      { time: 12200, notes: ['D1', 'D2', 'A2', 'D3', 'F3', 'A3', 'D4', 'F4', 'A4', 'D5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 13. CHOPIN NOCTURNE
  {
    id: 'chopinNocturne',
    name: 'Nocturne Op. 9 No. 2 (F. Chopin)',
    genre: 'Romantic Classical Piano',
    recommendedPreset: 'grandPiano',
    totalDurationMs: 22000,
    events: [
      { time: 0, notes: ['Eb2', 'Bb2', 'Eb3'], duration: '2n', velocity: 0.95 },
      { time: 0, notes: ['Bb4'], duration: '4n', velocity: 0.9 },
      { time: 600, notes: ['G4'], duration: '8n', velocity: 0.8 },
      { time: 900, notes: ['Ab4'], duration: '8n', velocity: 0.85 },
      { time: 1200, notes: ['Bb4'], duration: '4n', velocity: 0.9 },
      { time: 1800, notes: ['C5'], duration: '4n', velocity: 0.95 },
      { time: 2400, notes: ['C3', 'G3', 'C4'], duration: '2n', velocity: 0.95 },
      { time: 2400, notes: ['Eb5'], duration: '4n', velocity: 1.0 },
      { time: 3000, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 3300, notes: ['C5'], duration: '8n', velocity: 0.85 },
      { time: 3600, notes: ['Bb4'], duration: '2n', velocity: 0.9 },
      { time: 4800, notes: ['Ab2', 'Eb3', 'Ab3'], duration: '2n', velocity: 0.95 },
      { time: 4800, notes: ['Ab4'], duration: '4n', velocity: 0.85 },
      { time: 5400, notes: ['F4'], duration: '8n', velocity: 0.8 },
      { time: 5700, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 6000, notes: ['Ab4'], duration: '4n', velocity: 0.9 },
      { time: 6600, notes: ['C5'], duration: '4n', velocity: 0.95 },
      { time: 7200, notes: ['Bb2', 'F3', 'Bb3'], duration: '2n', velocity: 0.95 },
      { time: 7200, notes: ['Bb4'], duration: '4n', velocity: 0.9 },
      { time: 7800, notes: ['Ab4'], duration: '8n', velocity: 0.85 },
      { time: 8100, notes: ['G4'], duration: '8n', velocity: 0.85 },
      { time: 8400, notes: ['F4'], duration: '2n', velocity: 0.9 },
      { time: 9600, notes: ['Eb2', 'Bb2', 'Eb3', 'G4', 'Bb4', 'Eb5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 14. ERIK SATIE — GYMNOPÉDIE NO. 1
  {
    id: 'gymnopedie',
    name: 'Gymnopédie No. 1 (Erik Satie)',
    genre: 'Impressionist Ambient Piano',
    recommendedPreset: 'rhodes',
    totalDurationMs: 20000,
    events: [
      { time: 0, notes: ['G2'], duration: '2n', velocity: 0.95 },
      { time: 600, notes: ['B3', 'D4', 'F#4'], duration: '2n', velocity: 0.75 },
      { time: 1400, notes: ['B4'], duration: '2n', velocity: 0.85 },
      { time: 2400, notes: ['A4'], duration: '4n', velocity: 0.8 },
      { time: 3000, notes: ['G4'], duration: '4n', velocity: 0.8 },
      { time: 3600, notes: ['F#4'], duration: '2n', velocity: 0.85 },
      { time: 4600, notes: ['D2'], duration: '2n', velocity: 0.95 },
      { time: 5200, notes: ['F#3', 'A3', 'C#4'], duration: '2n', velocity: 0.75 },
      { time: 6000, notes: ['C#5'], duration: '2n', velocity: 0.85 },
      { time: 7000, notes: ['B4'], duration: '4n', velocity: 0.8 },
      { time: 7600, notes: ['C#5'], duration: '4n', velocity: 0.8 },
      { time: 8200, notes: ['D5'], duration: '2n', velocity: 0.9 },
      { time: 9400, notes: ['B4'], duration: '2n', velocity: 0.85 },
      { time: 10600, notes: ['G2', 'D3', 'G3', 'B3', 'D4', 'F#4', 'B4'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 15. THE GODFATHER THEME
  {
    id: 'godfatherTheme',
    name: 'The Godfather Theme (Nino Rota)',
    genre: 'Cinema Classic Noir',
    recommendedPreset: 'honkyTonk',
    totalDurationMs: 18000,
    events: [
      { time: 0, notes: ['C3', 'G3', 'C4'], duration: '2n', velocity: 0.95 },
      { time: 0, notes: ['C5'], duration: '4n', velocity: 0.9 },
      { time: 500, notes: ['F5'], duration: '4n', velocity: 0.9 },
      { time: 1000, notes: ['Ab5'], duration: '8n', velocity: 0.95 },
      { time: 1350, notes: ['G5'], duration: '8n', velocity: 0.85 },
      { time: 1700, notes: ['F5'], duration: '4n', velocity: 0.9 },
      { time: 2200, notes: ['Ab5'], duration: '4n', velocity: 0.95 },
      { time: 2700, notes: ['G5'], duration: '8n', velocity: 0.85 },
      { time: 3050, notes: ['F5'], duration: '8n', velocity: 0.85 },
      { time: 3400, notes: ['Eb5'], duration: '4n', velocity: 0.9 },
      { time: 3900, notes: ['D5'], duration: '2n', velocity: 0.9 },
      { time: 4800, notes: ['G2', 'D3', 'G3'], duration: '2n', velocity: 0.95 },
      { time: 4800, notes: ['G4'], duration: '4n', velocity: 0.85 },
      { time: 5300, notes: ['C5'], duration: '4n', velocity: 0.9 },
      { time: 5800, notes: ['Eb5'], duration: '8n', velocity: 0.9 },
      { time: 6150, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 6500, notes: ['C5'], duration: '4n', velocity: 0.9 },
      { time: 7000, notes: ['Eb5'], duration: '4n', velocity: 0.95 },
      { time: 7500, notes: ['D5'], duration: '8n', velocity: 0.85 },
      { time: 7850, notes: ['C5'], duration: '8n', velocity: 0.85 },
      { time: 8200, notes: ['B4'], duration: '4n', velocity: 0.9 },
      { time: 8700, notes: ['C5'], duration: '2n', velocity: 1.0 },
      { time: 9600, notes: ['C2', 'G2', 'C3', 'Eb3', 'G3', 'C4', 'Eb4', 'C5'], duration: '1n', velocity: 1.0 },
    ],
  },

  // 16. SMOOTH JAZZ (AUTUMN LEAVES)
  {
    id: 'smoothJazz',
    name: 'Autumn Leaves & Blue Bossa (Smooth Jazz)',
    genre: 'Jazz Standards & Swing',
    recommendedPreset: 'jazzOrgan',
    totalDurationMs: 20000,
    events: [
      { time: 0, notes: ['C3', 'G3', 'C4'], duration: '2n', velocity: 0.9 },
      { time: 0, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 450, notes: ['F#4'], duration: '4n', velocity: 0.85 },
      { time: 900, notes: ['G4'], duration: '4n', velocity: 0.9 },
      { time: 1350, notes: ['C5'], duration: '2n', velocity: 1.0 },
      { time: 2400, notes: ['F2', 'C3', 'Eb3', 'A3'], duration: '2n', velocity: 0.95 },
      { time: 2400, notes: ['D4'], duration: '4n', velocity: 0.85 },
      { time: 2850, notes: ['E4'], duration: '4n', velocity: 0.85 },
      { time: 3300, notes: ['F4'], duration: '4n', velocity: 0.9 },
      { time: 3750, notes: ['B4'], duration: '2n', velocity: 1.0 },
      { time: 4800, notes: ['Bb1', 'F2', 'D3', 'Ab3'], duration: '2n', velocity: 0.95 },
      { time: 4800, notes: ['C4'], duration: '4n', velocity: 0.85 },
      { time: 5250, notes: ['D4'], duration: '4n', velocity: 0.85 },
      { time: 5700, notes: ['Eb4'], duration: '4n', velocity: 0.9 },
      { time: 6150, notes: ['A4'], duration: '2n', velocity: 1.0 },
      { time: 7200, notes: ['Eb2', 'Bb2', 'G3', 'Db4'], duration: '2n', velocity: 0.95 },
      { time: 7200, notes: ['G4'], duration: '2n', velocity: 0.95 },
      { time: 8200, notes: ['A2', 'E3', 'G3', 'C4'], duration: '2n', velocity: 0.95 },
      { time: 8200, notes: ['F#4'], duration: '2n', velocity: 0.95 },
      { time: 9200, notes: ['D2', 'A2', 'F#3', 'C4'], duration: '2n', velocity: 0.95 },
      { time: 9200, notes: ['E4'], duration: '2n', velocity: 0.9 },
      { time: 10200, notes: ['G1', 'D2', 'F3', 'B3', 'E4'], duration: '1n', velocity: 1.0 },
    ],
  },
];
