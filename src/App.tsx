import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play as LucidePlay, Pause as LucidePause, Shuffle as LucideShuffle, Volume2 as LucideVolume2, VolumeX as LucideVolumeX, Info as LucideInfo, Drum as LucideDrum, Music as LucideMusic, Piano as LucidePiano, Wand2 as LucideWand2, Sun as LucideSun, Moon as LucideMoon, Flame as LucideFlame, Activity as LucideActivity } from 'lucide-react';
import Piano from './components/Piano';
import WaveFX from './components/WaveFX';

const noteToMidi = (note: string): number => Tone.Midi(note).toMidi();
const midiToNote = (midi: number): string => Tone.Midi(midi).toNote();
const getChordNotes = (rootMidi: number, type: 'major' | 'minor' | 'dominant7'): string[] => {
  let intervals: number[] = [];
  switch (type) {
    case 'major': intervals = [0, 4, 7]; break;
    case 'minor': intervals = [0, 3, 7]; break;
    case 'dominant7': intervals = [0, 4, 7, 10]; break;
    default: intervals = [0, 4, 7];
  }
  return intervals.map(interval => midiToNote(rootMidi + interval));
};
const generateConsistentMelodyNote = (scale: string[], currentChordNotes: string[], octaveRange: { min: number; max: number }): string => {
  const allPossibleNotes: string[] = [];
  for (let octave = octaveRange.min; octave <= octaveRange.max; octave++) {
    scale.forEach(noteName => { allPossibleNotes.push(`${noteName}${octave}`); });
  }
  const harmonicallyCompatibleNotes = allPossibleNotes.filter(note => currentChordNotes.some(chordNote => note.slice(0, -1) === chordNote.slice(0, -1)));
  if (harmonicallyCompatibleNotes.length > 0) {
    return harmonicallyCompatibleNotes[Math.floor(Math.random() * harmonicallyCompatibleNotes.length)];
  } else {
    return allPossibleNotes[Math.floor(Math.random() * allPossibleNotes.length)];
  }
};

const soundPalettes = ['sawtooth', 'square', 'sine', 'triangle', 'Chiptune', 'Synthwave', 'Acid', 'FM Bells'] as const;
type SoundPalette = typeof soundPalettes[number];
const drumPatterns = [{ name: 'House', kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], }, { name: 'Breakbeat', kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], }, { name: 'Trap', kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hihat: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1], }, { name: 'Minimal', kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hihat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], }, { name: 'Synthwave', kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], },];
const SCALES = { 'C_major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'G_major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'], 'D_major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'], 'E_major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'], 'A_major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'], 'B_major': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'], 'C_minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], 'G_minor': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'], 'D_minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'], 'E_minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'], 'A_minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'B_minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'], 'C_harmonic_minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'], 'G_harmonic_minor': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#'], 'D_harmonic_minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#'], 'E_harmonic_minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D#'], 'A_harmonic_minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G#'], 'B_harmonic_minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A#'], };
const CHORD_PROGRESSIONS_DEFINITIONS = { 'C_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'G_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'D_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'A_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'E_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'B_major': [{ degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'V', rootOffset: 7, type: 'major' }, { degree: 'vi', rootOffset: 9, type: 'minor' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'I', rootOffset: 0, type: 'major' }, { degree: 'IV', rootOffset: 5, type: 'major' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'I', rootOffset: 0, type: 'major' }], 'C_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'G_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'D_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'A_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'E_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'B_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'III', rootOffset: 3, type: 'major' }, { degree: 'VII', rootOffset: 10, type: 'major' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'C_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'G_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'D_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'A_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'E_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], 'B_harmonic_minor': [{ degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }, { degree: 'VI', rootOffset: 8, type: 'major' }, { degree: 'iv', rootOffset: 5, type: 'minor' }, { degree: 'V7', rootOffset: 7, type: 'dominant7' }, { degree: 'i', rootOffset: 0, type: 'minor' }], } as const;
const ALL_KEYS = ['C_major', 'G_major', 'D_major', 'E_major', 'A_major', 'B_major', 'C_minor', 'G_minor', 'D_minor', 'E_minor', 'A_minor', 'B_minor', 'C_harmonic_minor', 'G_harmonic_minor', 'D_harmonic_minor', 'E_harmonic_minor', 'A_harmonic_minor', 'B_harmonic_minor',] as const;
type AllKey = typeof ALL_KEYS[number];
const ROOT_NOTES = ['C', 'D', 'E', 'G', 'A', 'B'] as const;
type RootNote = typeof ROOT_NOTES[number];
type PlaybackMode = 'loop' | 'song';
type ScaleMode = 'major' | 'minor' | 'harmonic_minor' | 'random';
type RootKeyOption = RootNote | 'random';

type AppMode = 'beatrx' | 'piano' | 'wavefx';
type Theme = 'light' | 'dark' | 'branded';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('beatrx');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<'random' | 'manual'>('random');
  const [soundPalette, setSoundPalette] = useState<SoundPalette>('sawtooth');
  const [tempo, setTempo] = useState(90);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [randomKey, setRandomKey] = useState<AllKey>('C_major');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('loop');
  const [currentRootKey, setCurrentRootKey] = useState<RootKeyOption>('random');
  const [currentScaleMode, setCurrentScaleMode] = useState<ScaleMode>('random');
  const [currentRandomProgression, setCurrentRandomProgression] = useState<string[][]>([]);
  const [currentRandomMelody, setCurrentRandomMelody] = useState<string[]>([]);
  const [isArpeggiatorOn, setIsArpeggiatorOn] = useState(false);
  const [currentDrumPatternIndex, setCurrentDrumPatternIndex] = useState(0);
  const notesForManualSequence = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
  const [manualSequence, setManualSequence] = useState<boolean[][]>(
    Array(notesForManualSequence.length).fill(0).map(() => Array(16).fill(false))
  );

  const synthRef = useRef<Tone.PolySynth | Tone.MonoSynth | null>(null);
  const bassSynthRef = useRef<Tone.Synth | Tone.FMSynth | null>(null);
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.NoiseSynth | Tone.MetalSynth | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const chiptuneMelodyNoteRef = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const switchToPianoMode = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    if (synthRef.current && synthRef.current instanceof Tone.PolySynth) {
      synthRef.current.releaseAll();
    }
    bassSynthRef.current?.triggerRelease();
    chiptuneMelodyNoteRef.current = null;

    setTimeout(() => {
      setAppMode('piano');
    }, 50);
  };

  const switchToWaveFXMode = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    if (synthRef.current && synthRef.current instanceof Tone.PolySynth) {
      synthRef.current.releaseAll();
    }
    bassSynthRef.current?.triggerRelease();
    chiptuneMelodyNoteRef.current = null;

    setTimeout(() => {
      setAppMode('wavefx');
    }, 50);
  };

  useEffect(() => {
    synthRef.current?.dispose();
    bassSynthRef.current?.dispose();
    kickSynthRef.current?.dispose();
    snareSynthRef.current?.dispose();
    hihatSynthRef.current?.dispose();

    if (!reverbRef.current) reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0 }).toDestination();
    if (!delayRef.current) delayRef.current = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.5, wet: 0 }).toDestination();
    if (!chorusRef.current) chorusRef.current = new Tone.Chorus(4, 2.5, 0.7).toDestination();
    if (!analyserRef.current) {
      analyserRef.current = new Tone.Analyser('waveform', 2048);
      Tone.Destination.connect(analyserRef.current);
    }

    reverbRef.current.wet.value = 0;
    delayRef.current.wet.value = 0;
    chorusRef.current.wet.value = 0;

    switch (soundPalette) {
      case 'Synthwave':
        chorusRef.current.wet.value = 0.5;
        reverbRef.current.wet.value = 0.2;
        synthRef.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.8 } }).chain(chorusRef.current, reverbRef.current);
        bassSynthRef.current = new Tone.FMSynth({ harmonicity: 0.5, envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 1 } }).toDestination();
        break;
      case 'Acid':
        synthRef.current = new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, filter: { type: 'lowpass', rolloff: -24, Q: 8 }, filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5, baseFrequency: 200, octaves: 3 } }).toDestination();
        bassSynthRef.current = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 } }).toDestination();
        break;
      case 'FM Bells':
        delayRef.current.wet.value = 0.4;
        synthRef.current = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3, modulationIndex: 15, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 1.5 } }).connect(delayRef.current);
        bassSynthRef.current = new Tone.FMSynth({ harmonicity: 0.5, envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 1 } }).toDestination();
        break;
      case 'Chiptune':
        synthRef.current = new Tone.PolySynth(Tone.Synth, { volume: -12, oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.05, sustain: 1, release: 0.1 }, }).toDestination();
        bassSynthRef.current = new Tone.Synth({ volume: -10, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.5 }, }).toDestination();
        break;
      default:
        synthRef.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: soundPalette }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }, }).toDestination();
        bassSynthRef.current = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 1.5 }, }).toDestination();
        break;
    }

    if (soundPalette === 'Chiptune') {
      kickSynthRef.current = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 4, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 } }).toDestination();
      snareSynthRef.current = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination();
      const hihatFilter = new Tone.Filter(8000, "highpass").toDestination();
      hihatSynthRef.current = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 } }).connect(hihatFilter);
    } else {
      kickSynthRef.current = new Tone.MembraneSynth({ octaves: 5, pitchDecay: 0.05, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.7 } }).toDestination();
      snareSynthRef.current = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
      hihatSynthRef.current = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.1, release: 0.05 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1 }).toDestination();
    }

    return () => { sequenceRef.current?.dispose(); };
  }, [soundPalette]);

  useEffect(() => {
    if (isMuted) { Tone.Destination.volume.value = -Infinity; } else { Tone.Destination.volume.value = volume; }
  }, [volume, isMuted]);

  useEffect(() => {
    const canvas = waveformCanvasRef.current; if (!canvas) return;
    const setCanvasDimensions = () => {
      const computedStyle = getComputedStyle(canvas);
      const displayWidth = parseFloat(computedStyle.width);
      const displayHeight = parseFloat(computedStyle.height);
      canvas.width = displayWidth; canvas.height = displayHeight;
    };
    setCanvasDimensions(); window.addEventListener('resize', setCanvasDimensions);
    return () => { window.removeEventListener('resize', setCanvasDimensions); };
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = waveformCanvasRef.current; if (!canvas || !analyserRef.current) { animationFrameId.current = null; return; }
    const ctx = canvas.getContext('2d'); if (!ctx) { animationFrameId.current = null; return; }
    const dataArray = analyserRef.current.getValue(); const bufferLength = dataArray.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 2;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#6366f1';
    ctx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength; let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] as number; const y = (v * (canvas.height / 2)) + (canvas.height / 2);
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
    animationFrameId.current = requestAnimationFrame(drawWaveform);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (animationFrameId.current === null) { animationFrameId.current = requestAnimationFrame(drawWaveform); }
    } else {
      if (animationFrameId.current !== null) { cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; }
    }
    return () => { if (animationFrameId.current !== null) { cancelAnimationFrame(animationFrameId.current); } };
  }, [isPlaying, drawWaveform]);

  const generateRandomMusicData = useCallback(() => {
    let selectedRoot: RootNote;
    if (currentRootKey === 'random') { selectedRoot = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)]; } else { selectedRoot = currentRootKey; }
    let selectedScaleType: 'major' | 'minor' | 'harmonic_minor';
    if (currentScaleMode === 'random') {
      const scaleTypes = ['major', 'minor', 'harmonic_minor'];
      selectedScaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)] as 'major' | 'minor' | 'harmonic_minor';
    } else { selectedScaleType = currentScaleMode; }
    const newKeyName: AllKey = `${selectedRoot}_${selectedScaleType}` as AllKey;
    setRandomKey(newKeyName);
    const rootMidiForProgression = noteToMidi(`${SCALES[newKeyName][0]}3`);
    const progressionDefinition = CHORD_PROGRESSIONS_DEFINITIONS[newKeyName];
    const newProgression: string[][] = progressionDefinition.map(chordDef => {
      const rootNoteForChord = midiToNote(rootMidiForProgression + chordDef.rootOffset);
      return getChordNotes(noteToMidi(`${rootNoteForChord.slice(0, -1)}3`), chordDef.type);
    });
    setCurrentRandomProgression(newProgression);
    if (playbackMode === 'loop') {
      const scale = SCALES[newKeyName];
      const octaveRange = { min: 4, max: 5 };
      const newMelody: string[] = Array(16).fill(null).map((_, i) => {
        const chordIndex = Math.floor(i / 4) % newProgression.length;
        const currentChordNotes = newProgression[chordIndex];
        return generateConsistentMelodyNote(scale, currentChordNotes, octaveRange);
      });
      setCurrentRandomMelody(newMelody);
    } else { setCurrentRandomMelody([]); }
  }, [playbackMode, currentRootKey, currentScaleMode]);

  useEffect(() => {
    generateRandomMusicData();
  }, [generateRandomMusicData, playbackMode, currentRootKey, currentScaleMode]);

  const setupSequence = useCallback(() => {
    if (sequenceRef.current) { sequenceRef.current.dispose(); sequenceRef.current = null; }
    const steps = Array(16).fill(0).map((_, i) => i);
    const currentPattern = drumPatterns[currentDrumPatternIndex];
    sequenceRef.current = new Tone.Sequence((time, step) => {
      setCurrentStep(step);
      if (activeMode === 'random' && currentRandomProgression.length > 0) {
        const chordIndex = Math.floor(step / 4) % currentRandomProgression.length;
        const currentChord = currentRandomProgression[chordIndex]; const scale = SCALES[randomKey]; const octaveRange = { min: 4, max: 5 };
        let melodyNote: string | null = null;
        if (playbackMode === 'loop' && currentRandomMelody.length > 0) { melodyNote = currentRandomMelody[step]; }
        else if (playbackMode === 'song') { melodyNote = generateConsistentMelodyNote(scale, currentChord, octaveRange); }
        if (soundPalette === 'Chiptune' && synthRef.current instanceof Tone.PolySynth) {
          if (chiptuneMelodyNoteRef.current) { synthRef.current.triggerRelease(chiptuneMelodyNoteRef.current, time); }
          if (melodyNote) { synthRef.current.triggerAttack(melodyNote, time); chiptuneMelodyNoteRef.current = melodyNote; }
          else { chiptuneMelodyNoteRef.current = null; }
        } else { if (melodyNote && synthRef.current) { synthRef.current.triggerAttackRelease(melodyNote, '8n', time); } }
        if (currentChord && step % 4 === 0 && bassSynthRef.current) { const bassNote = `${currentChord[0].slice(0, -1)}2`; bassSynthRef.current.triggerAttackRelease(bassNote, '2n', time); }
        if (currentChord && (step % 8 === 0) && synthRef.current) {
          if (isArpeggiatorOn && synthRef.current instanceof Tone.PolySynth) {
            const arpDuration = '16n'; const chordNotes = Array.isArray(currentChord) ? currentChord : [currentChord];
            chordNotes.forEach((note, index) => {
              const noteTime = Tone.Time(time).toSeconds() + (Tone.Time(arpDuration).toSeconds() * index);
              if (noteTime >= Tone.Transport.seconds) { synthRef.current?.triggerAttackRelease(note, arpDuration, noteTime); }
            });
          } else {
            if (synthRef.current instanceof Tone.PolySynth) { synthRef.current.triggerAttackRelease(currentChord, '4n', time); }
            else if (synthRef.current instanceof Tone.MonoSynth) { const rootNote = Array.isArray(currentChord) ? currentChord[0] : currentChord; synthRef.current.triggerAttackRelease(rootNote, '4n', time); }
          }
        }
      } else if (activeMode === 'manual') {
        notesForManualSequence.forEach((note, noteIndex) => {
          if (manualSequence[noteIndex][step] && synthRef.current) { synthRef.current.triggerAttackRelease(note, '8n', time); }
        });
      }
      if (kickSynthRef.current && currentPattern.kick[step]) kickSynthRef.current.triggerAttackRelease('C1', '8n', time);
      if (hihatSynthRef.current && currentPattern.hihat[step]) hihatSynthRef.current.triggerAttackRelease('8n', time);
      if (snareSynthRef.current && currentPattern.snare[step]) snareSynthRef.current.triggerAttackRelease('8n', time);
    }, steps, '16n');

    if (isPlaying) {
      Tone.start(); sequenceRef.current.start(0); Tone.Transport.start();
    } else {
      if (sequenceRef.current) { sequenceRef.current.stop(); }
      Tone.Transport.pause(); setCurrentStep(0);
    }
  }, [isPlaying, activeMode, manualSequence, currentRandomMelody, currentRandomProgression, randomKey, playbackMode, soundPalette, isArpeggiatorOn, currentDrumPatternIndex]);

  useEffect(() => {
    setupSequence();
    return () => {
      sequenceRef.current?.dispose(); setCurrentStep(0);
    };
  }, [isPlaying, activeMode, manualSequence, currentRandomMelody, currentRandomProgression, randomKey, playbackMode, setupSequence, soundPalette, isArpeggiatorOn, currentDrumPatternIndex]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start(); setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (synthRef.current instanceof Tone.PolySynth) { synthRef.current.releaseAll(); }
      chiptuneMelodyNoteRef.current = null;
    }
  };

  const handlePaletteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (synthRef.current instanceof Tone.PolySynth) { synthRef.current.releaseAll(); }
    chiptuneMelodyNoteRef.current = null;
    const newPalette = e.target.value as SoundPalette;
    setSoundPalette(newPalette);
    const newPatternIndex = drumPatterns.findIndex(p => p.name === newPalette);
    if (newPatternIndex !== -1) { setCurrentDrumPatternIndex(newPatternIndex); }
  };

  const handleCycleDrums = () => {
    setCurrentDrumPatternIndex(prevIndex => (prevIndex + 1) % drumPatterns.length);
  };

  const handleEvolve = () => {
    if (playbackMode !== 'loop' || currentRandomMelody.length === 0) return;
    const newMelody = [...currentRandomMelody];
    const changes = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < changes; i++) {
      const indexToChange = Math.floor(Math.random() * newMelody.length);
      const scale = SCALES[randomKey];
      const chordIndex = Math.floor(indexToChange / 4) % currentRandomProgression.length;
      const currentChordNotes = currentRandomProgression[chordIndex];
      newMelody[indexToChange] = generateConsistentMelodyNote(scale, currentChordNotes, { min: 4, max: 5 });
    }
    setCurrentRandomMelody(newMelody);
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newTempo = parseInt(e.target.value); setTempo(newTempo); Tone.Transport.bpm.value = newTempo; };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newVolume = parseInt(e.target.value); setVolume(newVolume); if (!isMuted) { Tone.Destination.volume.value = newVolume; } };
  const handleToggleMute = () => { setIsMuted(!isMuted); };
  const handleManualSequenceToggle = (noteIndex: number, stepIndex: number) => {
    setManualSequence(prev => {
      const newSequence = [...prev]; newSequence[noteIndex] = [...newSequence[noteIndex]]; newSequence[noteIndex][stepIndex] = !newSequence[noteIndex][stepIndex];
      return newSequence;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter p-4 flex flex-col items-center justify-center transition-colors duration-300">
      {appMode === 'beatrx' ? (
        <div className="w-full max-w-6xl bg-[var(--bg-ui)] rounded-xl shadow-lg p-6 space-y-6 transition-colors duration-300">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2 order-2 xl:order-1">
              <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-control)] text-[var(--text-secondary)]'}`}><LucideSun size={18} /></button>
              <button onClick={() => setTheme('dark')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-control)] text-[var(--text-secondary)]'}`}><LucideMoon size={18} /></button>
              <button onClick={() => setTheme('branded')} className={`p-2 rounded-full transition-colors ${theme === 'branded' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-control)] text-[var(--text-secondary)]'}`}><LucideFlame size={18} /></button>
            </div>

            <div className="text-center w-full px-4 order-1 xl:order-2 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-accent)] leading-tight">BeatRX K-GEN Music Generator</h1>
              <p className="text-sm text-[var(--text-secondary)] text-center mt-1">Create unique procedural music</p>
            </div>

            <div className="flex items-center gap-2 order-3 xl:order-3">
              <button
                onClick={switchToWaveFXMode}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'branded' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95`}
                aria-label="Switch to WaveFX Mode"
              >
                <LucideActivity className="w-5 h-5" />
                <span>WaveFX</span>
              </button>
              <button
                onClick={switchToPianoMode}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'branded' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'} font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95`}
                aria-label="Switch to Piano Mode"
              >
                <LucidePiano className="w-5 h-5" />
                <span>BeatRX Piano</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={handlePlayPause} className={`flex items-center justify-center p-3 ${theme === 'branded' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-full shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto`} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <LucidePause className="w-5 h-5" /> : <LucidePlay className="w-5 h-5" />}
              </button>
              {activeMode === 'random' && (
                <>
                  <button onClick={generateRandomMusicData} className={`flex items-center justify-center p-3 ${theme === 'branded' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto`} aria-label="Randomize Melody">
                    <LucideShuffle className="w-5 h-5" />
                  </button>
                  <button onClick={handleEvolve} className={`flex items-center justify-center p-3 ${theme === 'branded' ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-600 hover:bg-pink-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto`} aria-label="Evolve Melody">
                    <LucideWand2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleCycleDrums} className={`flex items-center justify-center p-3 ${theme === 'branded' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto`} aria-label="Cycle Drums">
                    <LucideDrum className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-[var(--text-secondary)] font-mono">Drums: {currentDrumPatternIndex + 1}/{drumPatterns.length}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mt-4 md:mt-0 flex-grow">
              <select id="mode-select" value={activeMode} onChange={(e) => setActiveMode(e.target.value as 'random' | 'manual')} className="px-4 py-2 bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors duration-200 text-sm flex-grow sm:flex-grow-0">
                <option value="random">Random</option>
                <option value="manual">Manual</option>
              </select>
              <select id="palette-select" value={soundPalette} onChange={handlePaletteChange} className="px-4 py-2 bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors duration-200 text-sm flex-grow sm:flex-grow-0">
                {soundPalettes.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
              </select>
              {activeMode === 'random' && (
                <>
                  <select id="playback-mode-select" value={playbackMode} onChange={(e) => setPlaybackMode(e.target.value as PlaybackMode)} className="px-4 py-2 bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors duration-200 text-sm flex-grow sm:flex-grow-0">
                    <option value="loop">Loop</option>
                    <option value="song">Song (Continuous)</option>
                  </select>
                  <select id="key-select" value={currentRootKey} onChange={(e) => setCurrentRootKey(e.target.value as RootKeyOption)} className="px-4 py-2 bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors duration-200 text-sm flex-grow sm:flex-grow-0">
                    <option value="random">Random</option>
                    {ROOT_NOTES.map(root => (<option key={root} value={root}>{root}</option>))}
                  </select>
                  <select id="scale-mode-select" value={currentScaleMode} onChange={(e) => setCurrentScaleMode(e.target.value as ScaleMode)} className="px-4 py-2 bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors duration-200 text-sm flex-grow sm:flex-grow-0">
                    <option value="random">Random</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="harmonic_minor">H. Minor</option>
                  </select>
                  <div className="flex items-center justify-center bg-[var(--bg-control)] border border-[var(--border-color)] rounded-lg px-3 py-1.5">
                    <label htmlFor="arp-toggle" className="text-sm font-medium text-[var(--text-primary)] mr-2">Arp</label>
                    <input id="arp-toggle" type="checkbox" checked={isArpeggiatorOn} onChange={e => setIsArpeggiatorOn(e.target.checked)} className="w-4 h-4 text-[var(--accent-color)] bg-gray-600 border-gray-500 rounded focus:ring-[var(--accent-color)]" />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
            <div className="flex items-center w-full gap-2">
              <label htmlFor="tempo-slider" className="text-lg font-medium text-[var(--text-primary)] min-w-[100px]">Tempo: {tempo} BPM</label>
              <input id="tempo-slider" type="range" min="40" max="140" value={tempo} onChange={handleTempoChange} className="flex-grow h-2 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer range-sm accent-[var(--accent-color)]" />
            </div>
            <div className="flex items-center w-full gap-2">
              <label htmlFor="volume-slider" className="text-lg font-medium text-[var(--text-primary)] min-w-[100px]">Volume: {isMuted ? 'Muted' : `${volume} dB`}</label>
              <input id="volume-slider" type="range" min="-40" max="0" value={volume} onChange={handleVolumeChange} disabled={isMuted} className="flex-grow h-2 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer range-sm accent-[var(--accent-color)]" />
              <button onClick={handleToggleMute} className="p-2 rounded-full bg-[var(--bg-control)] hover:bg-opacity-80 transition-colors duration-200">
                {isMuted ? <LucideVolumeX className="w-5 h-5 text-[var(--text-primary)]" /> : <LucideVolume2 className="w-5 h-5 text-[var(--text-primary)]" />}
              </button>
            </div>
          </div>
          {activeMode === 'manual' && (
            <div className="mt-8">
              <div className="flex items-center justify-center mb-4">
                <h2 className="text-2xl font-semibold text-[var(--text-accent)] text-center mr-2">Manual Sequencer</h2>
                <button onClick={() => setShowManualGuide(true)} className="p-1 rounded-full bg-[var(--bg-control)] hover:bg-opacity-80 transition-colors duration-200" aria-label="Show Manual Mode Guide">
                  <LucideInfo className="w-5 h-5 text-[var(--text-primary)]" />
                </button>
              </div>
              <div className="overflow-x-auto p-2 bg-[var(--bg-control)] rounded-lg shadow-inner">
                <div className="grid gap-1 pb-1" style={{ gridTemplateColumns: `auto repeat(${16}, minmax(0, 1fr))` }}>
                  <div></div>
                  {Array(16).fill(0).map((_, i) => (<div key={`step-header-${i}`} className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded-sm ${currentStep === i ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)]'}`}>{i + 1}</div>))}
                  {notesForManualSequence.map((note, noteIndex) => (
                    <React.Fragment key={`note-row-${noteIndex}`}>
                      <div className="text-right pr-2 py-1 text-sm font-semibold text-[var(--text-primary)] flex items-center justify-end">{note}</div>
                      {manualSequence[noteIndex].map((isActive, stepIndex) => (<button key={`cell-${noteIndex}-${stepIndex}`} onClick={() => handleManualSequenceToggle(noteIndex, stepIndex)} className={`w-6 h-6 rounded-sm transition-all duration-100 ease-in-out ${isActive ? 'bg-green-500' : 'bg-gray-600'} ${currentStep === stepIndex ? 'border-2 border-[var(--accent-color)] scale-105' : 'border-gray-500'} hover:scale-105 active:scale-95`} aria-label={`Toggle note ${note} at step ${stepIndex + 1}`}></button>))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
          {showManualGuide && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-[var(--bg-ui)] rounded-xl p-6 max-w-lg w-full shadow-lg"><h3 className="text-2xl font-bold text-[var(--text-accent)] mb-4">Manual Mode Guide</h3><p className="text-[var(--text-primary)] mb-4">In **Manual Mode**, you can compose your own 16-step melody! The grid represents musical notes (rows) over time (columns, 1 to 16 steps).</p><ul className="list-disc list-inside text-[var(--text-primary)] space-y-2 mb-4"><li>**Notes (Rows)**: Each row corresponds to a specific musical note, from `C5` (highest) down to `C4` (lowest).</li><li>**Steps (Columns)**: Each column is a 16th note step in a 4/4 bar (total of 16 steps for one bar). The highlighted column shows the current playback position.</li><li>**Adding Notes**: Click on a cell to toggle a note `on` (green) or `off` at that specific step.</li><li>**Making Chords**: To play a chord, activate multiple notes in the same column (step). For example, activate `C4`, `E4`, and `G4` in the same column for a C Major chord.</li><li>**Rhythm**: Experiment with placing notes at different steps to create various rhythms.</li></ul><p className="text-[var(--text-primary)] mb-4">The drums will continue to play a basic pattern to accompany your melody. Have fun composing!</p><button onClick={() => setShowManualGuide(false)} className="w-full px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-colors duration-200">Got It!</button></div></div>)}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-[var(--text-accent)] mb-4 text-center">Real-time Waveform</h2>
            <div className="bg-[var(--bg-control)] rounded-lg p-2 shadow-inner">
              <canvas ref={waveformCanvasRef} className="w-full h-56 bg-[var(--bg-waveform)] rounded-md border border-[var(--border-color)]"></canvas>
            </div>
          </div>
        </div>

      ) : appMode === 'piano' ? (
        <div className="w-full max-w-7xl bg-[var(--bg-ui)] rounded-xl shadow-lg p-6 space-y-6 transition-colors duration-300">
          <div className="relative mb-2 text-center">
            <div />
            <button
              onClick={() => setAppMode('beatrx')}
              className={`absolute top-0 right-0 flex items-center gap-2 px-4 py-2 ${theme === 'branded' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95`}
              aria-label="Switch to BeatRX Mode"
            >
              <LucideMusic className="w-5 h-5" />
              <span>BeatRX KMG</span>
            </button>
          </div>
          <Piano />
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-[var(--bg-ui)] rounded-xl shadow-lg p-6 space-y-6 transition-colors duration-300">
          <div className="relative mb-2 text-center">
            <div />
            <button
              onClick={() => setAppMode('beatrx')}
              className={`absolute top-0 right-0 flex items-center gap-2 px-4 py-2 ${theme === 'branded' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95`}
              aria-label="Switch to BeatRX Mode"
            >
              <LucideMusic className="w-5 h-5" />
              <span>BeatRX KMG</span>
            </button>
          </div>
          <WaveFX theme={theme} />
        </div>
      )}
      <p className="text-center text-[var(--text-secondary)] text-sm mt-8 opacity-70">
        Made by justgl with Gemini AI
      </p>
    </div>
  );
};

export default App;
