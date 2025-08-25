import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play as LucidePlay, Pause as LucidePause, Shuffle as LucideShuffle, Volume2 as LucideVolume2, VolumeX as LucideVolumeX, Info as LucideInfo } from 'lucide-react';

// --- Utility Functions for Music Theory ---

// Converts a note name (e.g., "C4") to its MIDI number
const noteToMidi = (note: string): number => Tone.Midi(note).toMidi();

// Converts a MIDI number to a note name (e.g., 60 to "C3")
const midiToNote = (midi: number): string => Tone.Midi(midi).toNote();

// Function to get notes for a chord based on a root note and type
const getChordNotes = (rootMidi: number, type: 'major' | 'minor' | 'dominant7'): string[] => {
  let intervals: number[] = [];
  switch (type) {
    case 'major':
      intervals = [0, 4, 7]; // Root, Major 3rd, Perfect 5th
      break;
    case 'minor':
      intervals = [0, 3, 7]; // Root, Minor 3rd, Perfect 5th
      break;
    case 'dominant7':
      intervals = [0, 4, 7, 10]; // Root, Major 3rd, Perfect 5th, Minor 7th
      break;
    default:
      intervals = [0, 4, 7]; // Default to major
  }
  return intervals.map(interval => midiToNote(rootMidi + interval));
};

// Function to generate a random note from a given scale and octave range,
// favoring notes within a current chord for consistency
const generateConsistentMelodyNote = (
  scale: string[],
  currentChordNotes: string[],
  octaveRange: { min: number; max: number }
): string => {
  const allPossibleNotes: string[] = [];

  // Add notes from the scale within the octave range
  for (let octave = octaveRange.min; octave <= octaveRange.max; octave++) {
    scale.forEach(noteName => {
      allPossibleNotes.push(`${noteName}${octave}`);
    });
  }

  // Filter possible notes to be within the current chord if possible, or close to it
  const harmonicallyCompatibleNotes = allPossibleNotes.filter(note =>
    // Check if the raw note name (e.g., 'C' from 'C4') is present in any of the chord notes' names
    currentChordNotes.some(chordNote => note.slice(0, -1) === chordNote.slice(0, -1))
  );

  if (harmonicallyCompatibleNotes.length > 0) {
    // Pick a harmonically compatible note
    return harmonicallyCompatibleNotes[Math.floor(Math.random() * harmonicallyCompatibleNotes.length)];
  } else {
    // Fallback to any scale note if no direct harmonic compatibility found in the range
    return allPossibleNotes[Math.floor(Math.random() * allPossibleNotes.length)];
  }
};

// Define available waveforms
const waveforms = ['sine', 'square', 'sawtooth', 'triangle'] as const;
type Waveform = typeof waveforms[number];

// --- Music Data Definitions ---
const SCALES = {
  'C_major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'G_major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'D_major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'E_major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'A_major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'B_major': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],

  'C_minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // C Natural Minor
  'G_minor': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'], // G Natural Minor
  'D_minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'], // D Natural Minor
  'E_minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'], // E Natural Minor
  'A_minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // A Natural Minor
  'B_minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'], // B Natural Minor

  'C_harmonic_minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'], // C Harmonic Minor
  'G_harmonic_minor': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#'], // G Harmonic Minor
  'D_harmonic_minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#'], // D Harmonic Minor
  'E_harmonic_minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D#'], // E Harmonic Minor
  'A_harmonic_minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G#'], // A Harmonic Minor
  'B_harmonic_minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A#'], // B Harmonic Minor
};

// Common chord progressions in Roman numerals, mapped to absolute notes later
const CHORD_PROGRESSIONS_DEFINITIONS = {
  'C_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],
  'G_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],
  'D_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],
  'E_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],
  'A_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],
  'B_major': [
    { degree: 'I', rootOffset: 0, type: 'major' },
    { degree: 'IV', rootOffset: 5, type: 'major' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'I', rootOffset: 0, type: 'major' },
  ],

  'C_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'G_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'D_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'E_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'A_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'B_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],

  'C_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'G_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'D_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'E_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'A_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
  'B_harmonic_minor': [
    { degree: 'i', rootOffset: 0, type: 'minor' },
    { degree: 'iv', rootOffset: 5, type: 'minor' },
    { degree: 'V7', rootOffset: 7, type: 'dominant7' },
    { degree: 'i', rootOffset: 0, type: 'minor' },
  ],
} as const;

const ALL_KEYS = [
  'C_major', 'G_major', 'D_major', 'E_major', 'A_major', 'B_major',
  'C_minor', 'G_minor', 'D_minor', 'E_minor', 'A_minor', 'B_minor',
  'C_harmonic_minor', 'G_harmonic_minor', 'D_harmonic_minor', 'E_harmonic_minor', 'A_harmonic_minor', 'B_harmonic_minor',
] as const;
type AllKey = typeof ALL_KEYS[number];

const ROOT_NOTES = ['C', 'D', 'E', 'G', 'A', 'B'] as const;
type RootNote = typeof ROOT_NOTES[number];

type PlaybackMode = 'loop' | 'song';
type ScaleMode = 'major' | 'minor' | 'harmonic_minor' | 'random';
type RootKeyOption = RootNote | 'random';


// --- React Component ---
const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<'random' | 'manual'>('random');
  const [currentWaveform, setCurrentWaveform] = useState<Waveform>('sawtooth');
  const [tempo, setTempo] = useState(90); // Default tempo to 90
  const [volume, setVolume] = useState(0); // -60 to 0 dB
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showManualGuide, setShowManualGuide] = useState(false);

  // States for Random Mode music data
  const [randomKey, setRandomKey] = useState<AllKey>('C_major');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('loop');
  const [currentRootKey, setCurrentRootKey] = useState<RootKeyOption>('random');
  const [currentScaleMode, setCurrentScaleMode] = useState<ScaleMode>('random');
  const [currentRandomProgression, setCurrentRandomProgression] = useState<string[][]>([]);
  const [currentRandomMelody, setCurrentRandomMelody] = useState<string[]>([]);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const bassSynthRef = useRef<Tone.Synth | null>(null);
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  // Manual sequencer state
  const notesForManualSequence = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
  const [manualSequence, setManualSequence] = useState<boolean[][]>(
    Array(notesForManualSequence.length).fill(0).map(() => Array(16).fill(false))
  );

  // --- Initialization of Tone.js Components ---
  useEffect(() => {
    // Synth for melody and chords (PolySynth for multiple notes)
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: currentWaveform },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    // Synth for bass notes
    bassSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.5,
        release: 1.5,
      },
    }).toDestination();

    // Drum synths
    kickSynthRef.current = new Tone.MembraneSynth({
      octaves: 5,
      pitchDecay: 0.05,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.7 },
    }).toDestination();

    snareSynthRef.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();

    hihatSynthRef.current = new Tone.MetalSynth({
      //frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1,
    }).toDestination();

    // Analyser for waveform visualization
    analyserRef.current = new Tone.Analyser('waveform', 2048);
    // Connect the analyser to the master output
    Tone.Destination.connect(analyserRef.current);

    return () => {
      // Clean up Tone.js components
      synthRef.current?.dispose();
      bassSynthRef.current?.dispose();
      kickSynthRef.current?.dispose();
      snareSynthRef.current?.dispose();
      hihatSynthRef.current?.dispose();
      analyserRef.current?.dispose();
      sequenceRef.current?.dispose();
    };
  }, [currentWaveform]);

  // --- Update Master Volume ---
  useEffect(() => {
    if (isMuted) {
      Tone.Destination.volume.value = -Infinity;
    } else {
      Tone.Destination.volume.value = volume;
    }
  }, [volume, isMuted]);

  // --- Canvas Resizing for Waveform Visualization ---
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const setCanvasDimensions = () => {
      const computedStyle = getComputedStyle(canvas);
      const displayWidth = parseFloat(computedStyle.width);
      const displayHeight = parseFloat(computedStyle.height);
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  // --- Waveform Drawing Loop ---
  const drawWaveform = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !analyserRef.current) {
      animationFrameId.current = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameId.current = null;
      return;
    }

    const dataArray = analyserRef.current.getValue();
    const bufferLength = dataArray.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#6366f1'; // Indigo 500
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] as number;
      const y = (v * (canvas.height / 2)) + (canvas.height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameId.current = requestAnimationFrame(drawWaveform);
  }, []);

  // Effect to start/stop waveform drawing
  useEffect(() => {
    if (isPlaying) {
      if (animationFrameId.current === null) {
        animationFrameId.current = requestAnimationFrame(drawWaveform);
      }
    } else {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, drawWaveform]);


  // --- Music Generation Functions (for Random Mode) ---
  const generateRandomMusicData = useCallback(() => {
    let selectedRoot: RootNote;
    if (currentRootKey === 'random') {
      selectedRoot = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
    } else {
      selectedRoot = currentRootKey;
    }

    let selectedScaleType: 'major' | 'minor' | 'harmonic_minor';
    if (currentScaleMode === 'random') {
      const scaleTypes = ['major', 'minor', 'harmonic_minor'];
      selectedScaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)] as 'major' | 'minor' | 'harmonic_minor';
    } else {
      selectedScaleType = currentScaleMode;
    }

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
    } else {
      setCurrentRandomMelody([]);
    }

  }, [playbackMode, currentRootKey, currentScaleMode]);

  useEffect(() => {
    generateRandomMusicData();
  }, [generateRandomMusicData, playbackMode, currentRootKey, currentScaleMode]);

  // --- Main Sequencer Logic ---
  const setupSequence = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }

    const steps = Array(16).fill(0).map((_, i) => i);

    sequenceRef.current = new Tone.Sequence((time, step) => {
      setCurrentStep(step);

      if (activeMode === 'random') {
        const chordIndex = Math.floor(step / 4) % currentRandomProgression.length;
        const currentChord = currentRandomProgression[chordIndex];
        const scale = SCALES[randomKey];
        const octaveRange = { min: 4, max: 5 };

        if (playbackMode === 'loop') {
          const melodyNote = currentRandomMelody[step];
          if (melodyNote && synthRef.current) {
            synthRef.current.triggerAttackRelease(melodyNote, '8n', time);
          }
        } else if (playbackMode === 'song') {
          if (currentChord && synthRef.current) {
            const dynamicMelodyNote = generateConsistentMelodyNote(scale, currentChord, octaveRange);
            synthRef.current.triggerAttackRelease(dynamicMelodyNote, '8n', time);
          }
        }

        if (currentChord && step % 4 === 0 && bassSynthRef.current) {
          const bassNote = `${currentChord[0].slice(0, -1)}2`;
          bassSynthRef.current.triggerAttackRelease(bassNote, '2n', time);
        }

        if (currentChord && (step % 8 === 0) && synthRef.current) {
          synthRef.current.triggerAttackRelease(currentChord, '4n', time);
        }

      } else { // Manual mode
        notesForManualSequence.forEach((note, noteIndex) => {
          if (manualSequence[noteIndex][step] && synthRef.current) {
            synthRef.current.triggerAttackRelease(note, '8n', time);
          }
        });
      }

      // Drum pattern (common for both modes for now)
      if (kickSynthRef.current) {
        if (step % 4 === 0) kickSynthRef.current.triggerAttackRelease('C1', '8n', time);
      }
      if (hihatSynthRef.current) {
        if (step % 2 === 0) hihatSynthRef.current.triggerAttackRelease('8n', time);
      }
      if (snareSynthRef.current) {
        if (step % 4 === 2) snareSynthRef.current.triggerAttackRelease('8n', time);
      }

    }, steps, '16n');

    if (isPlaying) {
      Tone.start();
      sequenceRef.current.start(0);
      Tone.Transport.start();
    } else {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
      }
      Tone.Transport.pause();
      setCurrentStep(0);
    }
  }, [isPlaying, activeMode, manualSequence, currentRandomMelody, currentRandomProgression, randomKey, playbackMode, currentWaveform]);

  useEffect(() => {
    setupSequence();

    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      setCurrentStep(0);
    };
  }, [isPlaying, activeMode, manualSequence, currentRandomMelody, currentRandomProgression, randomKey, playbackMode, setupSequence, currentWaveform]);


  // --- Event Handlers ---
  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWaveform = e.target.value as Waveform;
    setCurrentWaveform(newWaveform);
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    setTempo(newTempo);
    Tone.Transport.bpm.value = newTempo;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (!isMuted) {
      Tone.Destination.volume.value = newVolume;
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleManualSequenceToggle = (noteIndex: number, stepIndex: number) => {
    setManualSequence(prev => {
      const newSequence = [...prev];
      newSequence[noteIndex] = [...newSequence[noteIndex]];
      newSequence[noteIndex][stepIndex] = !newSequence[noteIndex][stepIndex];
      return newSequence;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-4xl font-bold text-center text-indigo-400 mb-2">
          BeatRX Keygen Music Generator
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">Create unique procedural music</p>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4"> {/* Group Play/Pause and Randomize button */}
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <LucidePause className="w-5 h-5" /> : <LucidePlay className="w-5 h-5" />}
            </button>
            {activeMode === 'random' && (
              <button
                onClick={generateRandomMusicData}
                className="flex items-center justify-center p-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 w-auto"
                aria-label="Randomize Melody"
              >
                <LucideShuffle className="w-5 h-5" />
              </button>
            )}
          </div>


          {/* This div contains ALL other controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 mt-4 md:mt-0 flex-grow">

            {/* Mode select */}
            <label htmlFor="mode-select" className="sr-only">Mode</label>
            <select
              id="mode-select"
              value={activeMode}
              onChange={(e) => setActiveMode(e.target.value as 'random' | 'manual')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm flex-grow sm:flex-grow-0"
            >
              <option value="random">Random</option>
              <option value="manual">Manual</option>
            </select>

            {/* Waveform select */}
            <label htmlFor="waveform-select" className="sr-only">Waveform</label>
            <select
              id="waveform-select"
              value={currentWaveform}
              onChange={handleWaveformChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm flex-grow sm:flex-grow-0"
            >
              {waveforms.map((wf) => (
                <option key={wf} value={wf}>{wf.charAt(0).toUpperCase() + wf.slice(1)}</option>
              ))}
            </select>

            {activeMode === 'random' && (
              <>
                {/* Playback Mode select */}
                <label htmlFor="playback-mode-select" className="sr-only">Playback Mode</label>
                <select
                  id="playback-mode-select"
                  value={playbackMode}
                  onChange={(e) => setPlaybackMode(e.target.value as PlaybackMode)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm flex-grow sm:flex-grow-0"
                >
                  <option value="loop">Loop</option>
                  <option value="song">Song (Continuous)</option>
                </select>

                {/* Key Selector */}
                <label htmlFor="key-select" className="sr-only">Key</label>
                <select
                  id="key-select"
                  value={currentRootKey}
                  onChange={(e) => setCurrentRootKey(e.target.value as RootKeyOption)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm flex-grow sm:flex-grow-0"
                >
                  <option value="random">Random</option>
                  {ROOT_NOTES.map(root => (
                    <option key={root} value={root}>{root}</option>
                  ))}
                </select>

                {/* Scale Mode Selector */}
                <label htmlFor="scale-mode-select" className="sr-only">Scale Mode</label>
                <select
                  id="scale-mode-select"
                  value={currentScaleMode}
                  onChange={(e) => setCurrentScaleMode(e.target.value as ScaleMode)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm flex-grow sm:flex-grow-0"
                >
                  <option value="random">Random</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="harmonic_minor">H. Minor</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Sliders for Tempo and Volume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
          {/* Tempo Slider */}
          <div className="flex items-center w-full gap-2">
            <label htmlFor="tempo-slider" className="text-lg font-medium text-gray-300 min-w-[100px]">
              Tempo: {tempo} BPM
            </label>
            <input
              id="tempo-slider"
              type="range"
              min="40"
              max="140"
              value={tempo}
              onChange={handleTempoChange}
              className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-indigo-500"
            />
          </div>

          {/* Volume Slider */}
          <div className="flex items-center w-full gap-2">
            <label htmlFor="volume-slider" className="text-lg font-medium text-gray-300 min-w-[100px]">
              Volume: {isMuted ? 'Muted' : `${volume} dB`}
            </label>
            <input
              id="volume-slider"
              type="range"
              min="-40"
              max="0"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
              className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-indigo-500"
            />
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              {isMuted ? <LucideVolumeX className="w-5 h-5 text-gray-300" /> : <LucideVolume2 className="w-5 h-5 text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Manual Sequencer (conditionally rendered) */}
        {activeMode === 'manual' && (
          <div className="mt-8">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-2xl font-semibold text-indigo-300 text-center mr-2">Manual Sequencer</h2>
              <button
                onClick={() => setShowManualGuide(true)}
                className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                aria-label="Show Manual Mode Guide"
              >
                <LucideInfo className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="overflow-x-auto p-2 bg-gray-700 rounded-lg shadow-inner">
              {/* Main grid for sequencer, including header row for numbers */}
              <div className="grid gap-1 pb-1" style={{ gridTemplateColumns: `auto repeat(${16}, minmax(0, 1fr))` }}>
                {/* Empty cell for the first column of the header (aligns with note labels) */}
                <div></div>
                {/* Header numbers for steps */}
                {Array(16).fill(0).map((_, i) => (
                  <div key={`step-header-${i}`} className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded-sm ${currentStep === i ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                    {i + 1}
                  </div>
                ))}
                {/* Note rows */}
                {notesForManualSequence.map((note, noteIndex) => (
                  <React.Fragment key={`note-row-${noteIndex}`}>
                    {/* Note label column */}
                    <div className="text-right pr-2 py-1 text-sm font-semibold text-gray-300 flex items-center justify-end">
                      {note}
                    </div>
                    {/* Sequencer buttons */}
                    {manualSequence[noteIndex].map((isActive, stepIndex) => (
                      <button
                        key={`cell-${noteIndex}-${stepIndex}`}
                        onClick={() => handleManualSequenceToggle(noteIndex, stepIndex)}
                        className={`w-6 h-6 rounded-sm transition-all duration-100 ease-in-out
                          ${isActive ? 'bg-green-500' : 'bg-gray-600'}
                          ${currentStep === stepIndex ? 'border-2 border-indigo-400 scale-105' : 'border border-gray-500'}
                          hover:scale-105 active:scale-95`}
                        aria-label={`Toggle note ${note} at step ${stepIndex + 1}`}
                      >
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Mode Guide Modal */}
        {showManualGuide && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-lg">
              <h3 className="2xl font-bold text-indigo-400 mb-4">Manual Mode Guide</h3>
              <p className="text-gray-300 mb-4">
                In **Manual Mode**, you can compose your own 16-step melody!
                The grid represents musical notes (rows) over time (columns, 1 to 16 steps).
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>
                  **Notes (Rows)**: Each row corresponds to a specific musical note, from `C5` (highest) down to `C4` (lowest).
                </li>
                <li>
                  **Steps (Columns)**: Each column is a 16th note step in a 4/4 bar (total of 16 steps for one bar). The highlighted column shows the current playback position.
                </li>
                <li>
                  **Adding Notes**: Click on a cell to toggle a note `on` (green) or `off` at that specific step.
                </li>
                <li>
                  **Making Chords**: To play a chord, activate multiple notes in the same column (step). For example, activate `C4`, `E4`, and `G4` in the same column for a C Major chord.
                </li>
                <li>
                  **Rhythm**: Experiment with placing notes at different steps to create various rhythms.
                </li>
              </ul>
              <p className="text-gray-300 mb-4">
                The drums will continue to play a basic pattern to accompany your melody. Have fun composing!
              </p>
              <button
                onClick={() => setShowManualGuide(false)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Got It!
              </button>
            </div>
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="mt-8">
          <h2 className="2xl font-semibold text-indigo-300 mb-4 text-center">Real-time Waveform</h2>
          <div className="bg-gray-700 rounded-lg p-2 shadow-inner">
            <canvas ref={waveformCanvasRef} className="w-full h-48 bg-gray-900 rounded-md border border-gray-600"></canvas>
          </div>
        </div>

        {/* Branding Footer */}
        <p className="text-center text-gray-500 text-sm mt-8 opacity-70">
          Made by justgl with Gemini AI
        </p>
      </div>
    </div>
  );
};

export default App;

