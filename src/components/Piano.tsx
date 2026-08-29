import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import './Piano.css';
import {
  SOUND_PRESETS,
  DEMO_MELODIES,
  ROOT_KEY_OPTIONS,
  TUNING_PRESETS,
  type SoundPreset,
  type PresetCategory,
  type DemoMelody,
} from './pianoPresets';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Music,
  Sliders,
  Info,
} from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  velocity: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface MonsterItem {
  element: HTMLDivElement;
  inUse: boolean;
  note: string | null;
}

const CATEGORIES: ('All' | PresetCategory)[] = [
  'All',
  'Pianos & Keys',
  'Synths & Leads',
  'Pads & Ambient',
  'Organs & Mallets',
  'Retro & 8-Bit',
  'Raw Waves',
];

const BASE_KEY_NOTE_MAP: Record<string, string> = {
  KeyZ: 'C3',
  KeyS: 'C#3',
  KeyX: 'D3',
  KeyD: 'D#3',
  KeyC: 'E3',
  KeyV: 'F3',
  KeyG: 'F#3',
  KeyB: 'G3',
  KeyH: 'G#3',
  KeyN: 'A3',
  KeyJ: 'A#3',
  KeyM: 'B3',
  Comma: 'C4',
  Period: 'D4',
  Slash: 'E4',
  KeyL: 'C#4',
  Semicolon: 'D#4',
  KeyQ: 'C4',
  Digit2: 'C#4',
  KeyW: 'D4',
  Digit3: 'D#4',
  KeyE: 'E4',
  KeyR: 'F4',
  Digit5: 'F#4',
  KeyT: 'G4',
  Digit6: 'G#4',
  KeyY: 'A4',
  Digit7: 'A#4',
  KeyU: 'B4',
  KeyI: 'C5',
  Digit9: 'C#5',
  KeyO: 'D5',
  Digit0: 'D#5',
  KeyP: 'E5',
  BracketLeft: 'F5',
  Equal: 'F#5',
  BracketRight: 'G5',
  Backspace: 'G#5',
  Backslash: 'A5',
};

const VISUAL_KEYS = [
  'KeyZ',
  'KeyS',
  'KeyX',
  'KeyD',
  'KeyC',
  'KeyV',
  'KeyG',
  'KeyB',
  'KeyH',
  'KeyN',
  'KeyJ',
  'KeyM',
  'KeyQ',
  'Digit2',
  'KeyW',
  'Digit3',
  'KeyE',
  'KeyR',
  'Digit5',
  'KeyT',
  'Digit6',
  'KeyY',
  'Digit7',
  'KeyU',
  'KeyI',
  'Digit9',
  'KeyO',
  'Digit0',
  'KeyP',
  'BracketLeft',
  'Equal',
  'BracketRight',
  'Backspace',
  'Backslash',
];

const KEY_ALIAS_MAP: Record<string, string> = {
  Comma: 'KeyQ',
  Period: 'KeyW',
  Slash: 'KeyE',
  KeyL: 'Digit2',
  Semicolon: 'Digit3',
};

const isBlackKey = (note: string) => note.includes('#');

const getKeyLabel = (keyCode: string): string => {
  if (keyCode.startsWith('Key')) return keyCode.substring(3);
  if (keyCode.startsWith('Digit')) return keyCode.substring(5);
  if (keyCode === 'BracketLeft') return '[';
  if (keyCode === 'BracketRight') return ']';
  if (keyCode === 'Equal') return '=';
  if (keyCode === 'Backslash') return '\\';
  if (keyCode === 'Backspace') return '⌫';
  if (keyCode === 'Comma') return ',';
  if (keyCode === 'Period') return '.';
  if (keyCode === 'Slash') return '/';
  if (keyCode === 'Semicolon') return ';';
  return '';
};

// Transpose note by octave shift and root key semitones
const transposeNoteWithKey = (
  baseNote: string,
  octaveShift: number,
  keyShiftSemitones: number
): string => {
  try {
    const baseMidi = Tone.Midi(baseNote).toMidi();
    const targetMidi = Math.max(
      12,
      Math.min(108, baseMidi + octaveShift * 12 + keyShiftSemitones)
    );
    return Tone.Midi(targetMidi).toNote();
  } catch {
    return baseNote;
  }
};

const Piano: React.FC = () => {
  const monsterStageRef = useRef<HTMLDivElement>(null);
  const pianoContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialMessageRef = useRef<HTMLDivElement>(null);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const vibratoRef = useRef<Tone.Vibrato | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const compressorRef = useRef<Tone.Compressor | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const audioStartedRef = useRef(false);
  const monstersRef = useRef<MonsterItem[]>([]);
  const pressedKeysRef = useRef<Set<string>>(new Set<string>());
  const animationFrameIdRef = useRef<number | null>(null);
  const notePositionsRef = useRef<Record<string, { left: string; bottom: string }>>({});
  const lastNotePlayedRef = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const demoTimeoutsRef = useRef<number[]>([]);

  // State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('grandPiano');
  const [selectedCategory, setSelectedCategory] = useState<'All' | PresetCategory>('All');
  const [octaveShift, setOctaveShift] = useState<number>(0);
  const [keyShift, setKeyShift] = useState<number>(0); // Semitone transpose (-5 to +6)
  const [tuningHz, setTuningHz] = useState<number>(440); // 440, 432, 418, 415, 444, 442
  const [reverbAmount, setReverbAmount] = useState<number>(0.25);
  const [vibratoAmount, setVibratoAmount] = useState<number>(0);
  const [volume, setVolume] = useState<number>(-4);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Demo playback state
  const [selectedDemoId, setSelectedDemoId] = useState<string>('furElise');
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [demoProgressText, setDemoProgressText] = useState<string>('');
  const [showKeyGuide, setShowKeyGuide] = useState<boolean>(false);

  // Synchronization refs for event listeners
  const octaveShiftRef = useRef<number>(octaveShift);
  const keyShiftRef = useRef<number>(keyShift);
  const tuningHzRef = useRef<number>(tuningHz);
  const playNoteByCodeRef = useRef<(keyCode: string, velocity?: number) => void>(() => {});
  const stopNoteByCodeRef = useRef<(keyCode: string) => void>(() => {});

  useEffect(() => {
    octaveShiftRef.current = octaveShift;
  }, [octaveShift]);

  useEffect(() => {
    keyShiftRef.current = keyShift;
  }, [keyShift]);

  useEffect(() => {
    tuningHzRef.current = tuningHz;
    const tuning = TUNING_PRESETS.find((t) => t.hz === tuningHz) || TUNING_PRESETS[0];
    if (synthRef.current) {
      try {
        synthRef.current.set({ detune: tuning.cents });
      } catch {
        // ignore
      }
    }
  }, [tuningHz]);

  const currentPreset: SoundPreset =
    SOUND_PRESETS.find((p) => p.id === selectedPresetId) || SOUND_PRESETS[0];

  const currentTuning =
    TUNING_PRESETS.find((t) => t.hz === tuningHz) || TUNING_PRESETS[0];

  const currentKey =
    ROOT_KEY_OPTIONS.find((k) => k.semitones === keyShift) || ROOT_KEY_OPTIONS[0];

  const filteredPresets =
    selectedCategory === 'All'
      ? SOUND_PRESETS
      : SOUND_PRESETS.filter((p) => p.category === selectedCategory);

  // Start Audio Context helper
  const startAudio = useCallback(async () => {
    if (!audioStartedRef.current) {
      await Tone.start();
      audioStartedRef.current = true;
      if (initialMessageRef.current) {
        initialMessageRef.current.classList.add('fade-out');
      }
    }
  }, []);

  // Update Reverb
  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbAmount;
    }
  }, [reverbAmount]);

  // Update Vibrato
  useEffect(() => {
    if (vibratoRef.current) {
      vibratoRef.current.depth.value = vibratoAmount;
    }
  }, [vibratoAmount]);

  // Update Volume
  useEffect(() => {
    if (volumeNodeRef.current) {
      volumeNodeRef.current.volume.value = isMuted ? -Infinity : volume;
    }
  }, [volume, isMuted]);

  // Spawn visual particles
  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    particlesRef.current.push({
      x: (Math.random() - 0.5) * (canvas.width * 0.5),
      y: (Math.random() - 0.5) * (canvas.height * 0.5),
      radius: 1.5,
      velocity: 0.6 + Math.random() * 0.8,
      hue: Math.random() * 360,
      life: 70,
      maxLife: 70,
    });
  }, []);

  // Play a note by keyCode
  const playNoteByCode = useCallback(
    (keyCode: string, velocity = 0.8) => {
      if (!synthRef.current) return;
      const baseNote = BASE_KEY_NOTE_MAP[keyCode];
      if (!baseNote) return;

      const note = transposeNoteWithKey(
        baseNote,
        octaveShiftRef.current,
        keyShiftRef.current
      );
      if (!pressedKeysRef.current.has(keyCode)) {
        pressedKeysRef.current.add(keyCode);
        try {
          synthRef.current.triggerAttack(note, Tone.now(), velocity);
        } catch {
          // ignore
        }

        const visualKeyCode = KEY_ALIAS_MAP[keyCode] || keyCode;
        const keyElement = pianoContainerRef.current?.querySelector(
          `[data-key="${visualKeyCode}"]`
        );
        if (keyElement) keyElement.classList.add('active');

        // Animate Monster
        const availableMonster = monstersRef.current.find((m) => !m.inUse);
        if (availableMonster) {
          availableMonster.inUse = true;
          availableMonster.note = note;
          let position = notePositionsRef.current[note];
          if (note !== lastNotePlayedRef.current || !position) {
            position = {
              left: `${Math.random() * (90 - 10) + 10}%`,
              bottom: `${Math.random() * 35 + 15}%`,
            };
            notePositionsRef.current[note] = position;
          }
          lastNotePlayedRef.current = note;
          availableMonster.element.style.left = position.left;
          availableMonster.element.style.bottom = position.bottom;
          availableMonster.element.classList.add('singing');
        }

        spawnParticles();
      }
    },
    [spawnParticles]
  );

  // Stop a note by keyCode
  const stopNoteByCode = useCallback((keyCode: string) => {
    const baseNote = BASE_KEY_NOTE_MAP[keyCode];
    if (!baseNote || !synthRef.current) return;

    const note = transposeNoteWithKey(
      baseNote,
      octaveShiftRef.current,
      keyShiftRef.current
    );
    pressedKeysRef.current.delete(keyCode);

    const visualKeyCode = KEY_ALIAS_MAP[keyCode] || keyCode;
    const keyElement = pianoContainerRef.current?.querySelector(
      `[data-key="${visualKeyCode}"]`
    );
    if (keyElement) keyElement.classList.remove('active');

    try {
      synthRef.current.triggerRelease(note, Tone.now());
    } catch {
      // ignore
    }

    const monsterToStop = monstersRef.current.find(
      (m) => m.inUse && m.note === note
    );
    if (monsterToStop) {
      monsterToStop.inUse = false;
      monsterToStop.note = null;
      monsterToStop.element.classList.remove('singing');
    }
  }, []);

  useEffect(() => {
    playNoteByCodeRef.current = playNoteByCode;
  }, [playNoteByCode]);

  useEffect(() => {
    stopNoteByCodeRef.current = stopNoteByCode;
  }, [stopNoteByCode]);

  // Transpose Octave Handler
  const changeOctave = (delta: number) => {
    setOctaveShift((prev) => {
      const next = Math.max(-2, Math.min(2, prev + delta));
      if (next !== prev && synthRef.current) {
        synthRef.current.releaseAll();
        pressedKeysRef.current.clear();
        pianoContainerRef.current?.querySelectorAll('.key.active').forEach((el) => {
          el.classList.remove('active');
        });
      }
      return next;
    });
  };

  // Change Root Key Handler
  const handleKeyChange = (semitones: number) => {
    setKeyShift(semitones);
    if (synthRef.current) {
      synthRef.current.releaseAll();
      pressedKeysRef.current.clear();
      pianoContainerRef.current?.querySelectorAll('.key.active').forEach((el) => {
        el.classList.remove('active');
      });
    }
  };

  // Switch sound preset
  const handlePresetSelect = (presetId: string) => {
    const preset = SOUND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setReverbAmount(preset.defaultReverb);
    setVibratoAmount(preset.defaultVibrato);

    // Swap Synth Node
    if (synthRef.current) {
      synthRef.current.releaseAll();
      synthRef.current.dispose();
    }

    const newSynth = preset.createSynth();
    newSynth.maxPolyphony = 24;
    newSynth.volume.value = -8;

    const activeTuning =
      TUNING_PRESETS.find((t) => t.hz === tuningHz) || TUNING_PRESETS[0];
    try {
      newSynth.set({ detune: activeTuning.cents });
    } catch {
      // ignore
    }

    if (vibratoRef.current && reverbRef.current && volumeNodeRef.current) {
      newSynth.connect(vibratoRef.current);
      vibratoRef.current.connect(reverbRef.current);
      reverbRef.current.connect(volumeNodeRef.current);
    }

    synthRef.current = newSynth;
  };

  // Switch category filter and auto-select first preset if current is not in category
  const handleCategorySelect = (category: 'All' | PresetCategory) => {
    setSelectedCategory(category);
    if (category !== 'All') {
      const presetsInCat = SOUND_PRESETS.filter((p) => p.category === category);
      if (presetsInCat.length > 0 && !presetsInCat.some((p) => p.id === selectedPresetId)) {
        handlePresetSelect(presetsInCat[0].id);
      }
    }
  };

  // Next / Previous Preset Navigation
  const handleNextPreset = () => {
    const currentIndex = SOUND_PRESETS.findIndex((p) => p.id === selectedPresetId);
    const nextIndex = (currentIndex + 1) % SOUND_PRESETS.length;
    handlePresetSelect(SOUND_PRESETS[nextIndex].id);
  };

  const handlePrevPreset = () => {
    const currentIndex = SOUND_PRESETS.findIndex((p) => p.id === selectedPresetId);
    const prevIndex = (currentIndex - 1 + SOUND_PRESETS.length) % SOUND_PRESETS.length;
    handlePresetSelect(SOUND_PRESETS[prevIndex].id);
  };

  // Stop Demo Melodies
  const stopDemo = useCallback(() => {
    demoTimeoutsRef.current.forEach((id) => clearTimeout(id));
    demoTimeoutsRef.current = [];
    setIsPlayingDemo(false);
    setDemoProgressText('');

    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    pianoContainerRef.current?.querySelectorAll('.key.active').forEach((el) => {
      el.classList.remove('active');
    });
    monstersRef.current.forEach((m) => {
      m.inUse = false;
      m.note = null;
      m.element.classList.remove('singing');
    });
  }, []);

  // Play Selected Demo Melody
  const playDemo = async () => {
    await startAudio();
    if (isPlayingDemo) {
      stopDemo();
      return;
    }

    stopDemo();
    const demo: DemoMelody | undefined = DEMO_MELODIES.find((d) => d.id === selectedDemoId);
    if (!demo || !synthRef.current) return;

    if (demo.recommendedPreset && selectedPresetId !== demo.recommendedPreset) {
      handlePresetSelect(demo.recommendedPreset);
    }

    setIsPlayingDemo(true);
    setDemoProgressText(`Playing: ${demo.name}`);

    demo.events.forEach((event, index) => {
      const tid = window.setTimeout(() => {
        if (!synthRef.current) return;

        // Transpose demo event notes by key shift if non-zero
        const playedNotes =
          keyShiftRef.current === 0
            ? event.notes
            : event.notes.map((n) => transposeNoteWithKey(n, 0, keyShiftRef.current));

        try {
          synthRef.current.triggerAttackRelease(
            playedNotes,
            event.duration,
            undefined,
            event.velocity || 0.85
          );
        } catch {
          // ignore
        }

        // Highlight all visual keys for played notes simultaneously
        playedNotes.forEach((notePitch) => {
          const matchingKeyEntry = Object.entries(BASE_KEY_NOTE_MAP).find(
            ([, baseNote]) => {
              const currentPitch = transposeNoteWithKey(
                baseNote,
                octaveShiftRef.current,
                keyShiftRef.current
              );
              return currentPitch === notePitch || baseNote === notePitch;
            }
          );

          if (matchingKeyEntry) {
            const keyCode = matchingKeyEntry[0];
            const visualKeyCode = KEY_ALIAS_MAP[keyCode] || keyCode;
            const keyElement = pianoContainerRef.current?.querySelector(
              `[data-key="${visualKeyCode}"]`
            );
            if (keyElement) {
              keyElement.classList.add('active');
              setTimeout(() => keyElement.classList.remove('active'), 280);
            }
          }

          // Trigger monster animation
          const availableMonster = monstersRef.current.find((m) => !m.inUse);
          if (availableMonster) {
            availableMonster.inUse = true;
            availableMonster.note = notePitch;
            availableMonster.element.style.left = `${Math.random() * 80 + 10}%`;
            availableMonster.element.style.bottom = `${Math.random() * 30 + 18}%`;
            availableMonster.element.classList.add('singing');

            setTimeout(() => {
              availableMonster.inUse = false;
              availableMonster.note = null;
              availableMonster.element.classList.remove('singing');
            }, 380);
          }
        });

        spawnParticles();

        if (index === demo.events.length - 1) {
          setTimeout(() => {
            setIsPlayingDemo(false);
            setDemoProgressText('');
          }, 1200);
        }
      }, event.time);

      demoTimeoutsRef.current.push(tid);
    });
  };

  // Main Effect: Audio Graph, Canvas, Monsters, MIDI, Keyboard Listeners
  useEffect(() => {
    const monsterStage = monsterStageRef.current;
    const pianoContainer = pianoContainerRef.current;
    const canvas = canvasRef.current;
    if (!monsterStage || !pianoContainer || !canvas) return;

    const ctx = canvas.getContext('2d');
    let midiAccess: WebMidi.MIDIAccess | null = null;
    // Audio Graph setup with master limiter & compressor for clean polyphony without clipping
    const limiter = new Tone.Limiter(-0.5).toDestination();
    const comp = new Tone.Compressor({
      threshold: -14,
      ratio: 3.5,
      attack: 0.003,
      release: 0.25,
    }).connect(limiter);

    const vol = new Tone.Volume(volume).connect(comp);
    const rev = new Tone.Reverb({ decay: 2.2, wet: currentPreset.defaultReverb });
    const vib = new Tone.Vibrato({ frequency: 5, depth: currentPreset.defaultVibrato });

    vib.connect(rev);
    rev.connect(vol);

    limiterRef.current = limiter;
    compressorRef.current = comp;
    volumeNodeRef.current = vol;
    reverbRef.current = rev;
    vibratoRef.current = vib;

    const initialSynth = currentPreset.createSynth();
    initialSynth.maxPolyphony = 24;
    initialSynth.volume.value = -8;
    const activeTuning =
      TUNING_PRESETS.find((t) => t.hz === tuningHz) || TUNING_PRESETS[0];
    try {
      initialSynth.set({ detune: activeTuning.cents });
    } catch {
      // ignore
    }
    initialSynth.connect(vib);
    synthRef.current = initialSynth;
    // Build Monster elements
    const monsterColors = [
      '#ff6b6b',
      '#48dbfb',
      '#1dd1a1',
      '#feca57',
      '#ff9f43',
      '#a29bfe',
      '#ff7979',
      '#badc58',
      '#fd79a8',
      '#00cec9',
      '#e17055',
      '#6c5ce7',
    ];
    const MAX_MONSTERS = 12;
    monstersRef.current = [];
    while (monsterStage.firstChild && monsterStage.firstChild !== canvas) {
      monsterStage.removeChild(monsterStage.firstChild);
    }

    for (let i = 0; i < MAX_MONSTERS; i++) {
      const monsterEl = document.createElement('div');
      monsterEl.className = 'monster';
      monsterEl.style.backgroundColor = monsterColors[i % monsterColors.length];
      monsterEl.innerHTML = `<div class="monster-eyes"><div class="eye"><div class="pupil"></div></div><div class="eye"><div class="pupil"></div></div></div><div class="mouth"></div>`;
      monsterStage.appendChild(monsterEl);
      monstersRef.current.push({ element: monsterEl, inUse: false, note: null });
    }

    // Kaleidoscope animation loop
    const animateKaleidoscope = () => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(20, 24, 33, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 1;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        p.radius += p.velocity;
        const opacity = p.life / p.maxLife;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${opacity * 0.85})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, 1)`;
        ctx.shadowBlur = 12;

        for (let j = 0; j < 8; j++) {
          const angle = (Math.PI / 4) * j;
          const rotatedX = p.x * Math.cos(angle) - p.y * Math.sin(angle);
          const rotatedY = p.x * Math.sin(angle) + p.y * Math.cos(angle);
          ctx.moveTo(centerX + rotatedX, centerY + rotatedY);
          ctx.arc(centerX + rotatedX, centerY + rotatedY, p.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      animationFrameIdRef.current = requestAnimationFrame(animateKaleidoscope);
    };

    const resizeCanvas = () => {
      if (canvas && monsterStage) {
        canvas.width = monsterStage.clientWidth;
        canvas.height = monsterStage.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animateKaleidoscope();

    // Keyboard handlers using refs for fresh state
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      startAudio();
      if (BASE_KEY_NOTE_MAP[event.code] && !event.repeat) {
        event.preventDefault();
        playNoteByCodeRef.current(event.code);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      if (BASE_KEY_NOTE_MAP[event.code]) {
        event.preventDefault();
        stopNoteByCodeRef.current(event.code);
      }
    };

    // Pointer (Mouse / Touch) handlers with glissando support
    let isPointerDown = false;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      const target = event.target as HTMLElement;
      const keyElement = target.closest('.key') as HTMLDivElement;
      if (keyElement) {
        event.preventDefault();
        startAudio();
        const keyCode = keyElement.dataset.key;
        if (keyCode) {
          playNoteByCodeRef.current(keyCode);
          keyElement.dataset.pressed = 'true';
        }
      }
    };

    const handlePointerOver = (event: MouseEvent) => {
      if (!isPointerDown) return;
      const target = event.target as HTMLElement;
      const keyElement = target.closest('.key') as HTMLDivElement;
      if (keyElement && keyElement.dataset.pressed !== 'true') {
        const keyCode = keyElement.dataset.key;
        if (keyCode) {
          playNoteByCodeRef.current(keyCode);
          keyElement.dataset.pressed = 'true';
        }
      }
    };

    const handlePointerOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const keyElement = target.closest('.key') as HTMLDivElement;
      if (keyElement && keyElement.dataset.pressed === 'true') {
        const keyCode = keyElement.dataset.key;
        if (keyCode) {
          stopNoteByCodeRef.current(keyCode);
          keyElement.dataset.pressed = 'false';
        }
      }
    };

    const handlePointerUp = () => {
      isPointerDown = false;
      document.querySelectorAll('.key[data-pressed="true"]').forEach((keyElement) => {
        const key = keyElement as HTMLDivElement;
        const keyCode = key.dataset.key;
        if (keyCode) {
          stopNoteByCodeRef.current(keyCode);
        }
        key.dataset.pressed = 'false';
      });
    };

    // Web MIDI setup
    const midiToKeyCodeMap: Record<number, string> = {};
    for (const [keyCode, noteName] of Object.entries(BASE_KEY_NOTE_MAP)) {
      const midiVal = Tone.Midi(noteName).toMidi();
      midiToKeyCodeMap[midiVal] = keyCode;
    }

    const onMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
      const [command, midiNote, velocity] = event.data;
      const keyCode = midiToKeyCodeMap[midiNote];
      if (!keyCode) return;

      if (command === 144 && velocity > 0) {
        startAudio();
        playNoteByCodeRef.current(keyCode, velocity / 127);
      } else if (command === 128 || (command === 144 && velocity === 0)) {
        stopNoteByCodeRef.current(keyCode);
      }
    };

    const setupMidi = async () => {
      if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
        try {
          midiAccess = await navigator.requestMIDIAccess();
          midiAccess.inputs.forEach((input: WebMidi.MIDIInput) => {
            input.onmidimessage = onMidiMessage;
          });
        } catch {
          // MIDI not available
        }
      }
    };

    setupMidi();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp, { passive: false });

    pianoContainer.addEventListener('mousedown', handlePointerDown);
    pianoContainer.addEventListener('mouseover', handlePointerOver);
    pianoContainer.addEventListener('mouseout', handlePointerOut);
    pianoContainer.addEventListener('touchstart', handlePointerDown, { passive: false });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);

      pianoContainer.removeEventListener('mousedown', handlePointerDown);
      pianoContainer.removeEventListener('mouseover', handlePointerOver);
      pianoContainer.removeEventListener('mouseout', handlePointerOut);
      pianoContainer.removeEventListener('touchstart', handlePointerDown);

      if (midiAccess) {
        midiAccess.inputs.forEach((input: WebMidi.MIDIInput) => {
          input.onmidimessage = null;
        });
      }

      if (synthRef.current) {
        synthRef.current.releaseAll();
        synthRef.current.dispose();
        synthRef.current = null;
      }
      if (reverbRef.current) {
        reverbRef.current.dispose();
        reverbRef.current = null;
      }
      if (vibratoRef.current) {
        vibratoRef.current.dispose();
        vibratoRef.current = null;
      }
      if (volumeNodeRef.current) {
        volumeNodeRef.current.dispose();
        volumeNodeRef.current = null;
      }
      if (compressorRef.current) {
        compressorRef.current.dispose();
        compressorRef.current = null;
      }
      if (limiterRef.current) {
        limiterRef.current.dispose();
        limiterRef.current = null;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-7xl text-center flex flex-col items-center select-none space-y-3">
      {/* Monster Stage & Kaleidoscope */}
      <div id="monster-stage" ref={monsterStageRef} className="monster-stage w-full">
        <canvas id="kaleidoscope-canvas" ref={canvasRef}></canvas>
      </div>

      {/* Category Filter Chips */}
      <div className="w-full flex items-center justify-center gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`preset-chip ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sound Preset Selector & Tuning / Key Bar */}
      <div className="w-full bg-[var(--bg-control)] border border-[var(--border-color)] rounded-xl p-3 shadow-md flex flex-col lg:flex-row items-center justify-between gap-3.5">
        {/* Preset Selector */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handlePrevPreset}
            className="p-2 rounded-lg bg-[var(--bg-ui)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-primary)] transition-colors"
            title="Previous Preset"
            aria-label="Previous Preset"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex flex-col text-left flex-grow lg:flex-grow-0">
            <label htmlFor="sound-selector" className="text-xs font-bold text-[var(--text-secondary)] mb-0.5">
              Instrument ({filteredPresets.length})
            </label>
            <select
              id="sound-selector"
              className="sound-select font-semibold"
              value={selectedPresetId}
              onChange={(e) => handlePresetSelect(e.target.value)}
            >
              {selectedCategory === 'All' ? (
                CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {SOUND_PRESETS.filter((p) => p.category === cat).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                filteredPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={handleNextPreset}
            className="p-2 rounded-lg bg-[var(--bg-ui)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-primary)] transition-colors"
            title="Next Preset"
            aria-label="Next Preset"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Current Preset Info Card */}
        <div className="text-left bg-[var(--bg-ui)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] flex-grow max-w-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{currentPreset.icon}</span>
            <span className="text-xs font-bold text-[var(--text-accent)]">{currentPreset.name}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-[var(--bg-control)] text-[var(--text-secondary)]">
              {currentPreset.category}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
            {currentPreset.description}
          </p>
        </div>

        {/* Octave Shift, Key Transposition & Micro-Tuning Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-center lg:justify-end">
          {/* Octave Controls */}
          <div className="flex items-center bg-[var(--bg-ui)] rounded-lg p-1 border border-[var(--border-color)]">
            <button
              onClick={() => changeOctave(-1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                octaveShift < 0 ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-[var(--bg-control)] text-[var(--text-secondary)]'
              }`}
              title="Shift Octave Down (-1)"
            >
              Oct -
            </button>
            <span className="px-2 text-xs font-mono font-bold text-[var(--text-primary)] min-w-[28px] text-center">
              {octaveShift === 0 ? '0' : octaveShift > 0 ? `+${octaveShift}` : `${octaveShift}`}
            </span>
            <button
              onClick={() => changeOctave(1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                octaveShift > 0 ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-[var(--bg-control)] text-[var(--text-secondary)]'
              }`}
              title="Shift Octave Up (+1)"
            >
              Oct +
            </button>
          </div>

          {/* Root Key / Semitone Transposition */}
          <div className="flex items-center gap-1 bg-[var(--bg-ui)] rounded-lg px-2 py-1 border border-[var(--border-color)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Key:</span>
            <select
              value={keyShift}
              onChange={(e) => handleKeyChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-[var(--text-accent)] cursor-pointer focus:outline-none"
              title="Transpose Root Key"
            >
              {ROOT_KEY_OPTIONS.map((k) => (
                <option key={k.semitones} value={k.semitones} className="bg-[var(--bg-control)] text-white">
                  {k.label} ({k.semitones >= 0 ? `+${k.semitones}` : k.semitones} st)
                </option>
              ))}
            </select>
          </div>

          {/* Master Tuning Reference Frequency (440Hz, 432Hz, 418Hz, etc.) */}
          <div className="flex items-center gap-1 bg-[var(--bg-ui)] rounded-lg px-2 py-1 border border-[var(--border-color)]">
            <Sliders size={12} className="text-[var(--text-accent)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">Pitch:</span>
            <select
              value={tuningHz}
              onChange={(e) => setTuningHz(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-[var(--text-accent)] cursor-pointer focus:outline-none font-mono"
              title={currentTuning.description}
            >
              {TUNING_PRESETS.map((t) => (
                <option key={t.hz} value={t.hz} className="bg-[var(--bg-control)] text-white">
                  {t.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Piano Keys */}
      <div id="piano" ref={pianoContainerRef} className="piano-container">
        {VISUAL_KEYS.map((keyCode) => {
          const baseNote = BASE_KEY_NOTE_MAP[keyCode];
          const displayedNote = transposeNoteWithKey(baseNote, octaveShift, keyShift);
          const label = getKeyLabel(keyCode);
          const isBlack = isBlackKey(baseNote);

          return (
            <div
              key={keyCode}
              data-key={keyCode}
              data-note={displayedNote}
              className={`key ${isBlack ? 'black' : 'white'}`}
            >
              <div className="key-label">{label}</div>
              <div className="key-note">{displayedNote}</div>
            </div>
          );
        })}
      </div>

      {/* Sound Effects & Demo Melody Bar */}
      <div className="w-full bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-xl p-3.5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Demo Melodies Player */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Music size={16} className="text-[var(--text-accent)]" />
            <select
              value={selectedDemoId}
              onChange={(e) => {
                setSelectedDemoId(e.target.value);
                if (isPlayingDemo) stopDemo();
              }}
              className="sound-select text-xs py-1.5 px-2.5 font-medium w-60 sm:w-72"
            >
              {DEMO_MELODIES.map((demo) => (
                <option key={demo.id} value={demo.id}>
                  {demo.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={isPlayingDemo ? stopDemo : playDemo}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isPlayingDemo
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
          >
            {isPlayingDemo ? <Square size={14} /> : <Play size={14} />}
            <span>{isPlayingDemo ? 'Stop' : 'Play Demo'}</span>
          </button>

          {demoProgressText && (
            <span className="text-xs font-semibold text-[var(--text-accent)] truncate max-w-[150px]">
              {demoProgressText}
            </span>
          )}
        </div>

        {/* Audio Knobs (Reverb, Vibrato, Volume) */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 flex-grow">
          {/* Reverb Slider */}
          <div className="flex flex-col gap-1 w-28 sm:w-32">
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
              <span>Reverb</span>
              <span className="font-mono text-[var(--text-accent)]">{Math.round(reverbAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverbAmount}
              onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            />
          </div>

          {/* Vibrato Slider */}
          <div className="flex flex-col gap-1 w-28 sm:w-32">
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
              <span>Vibrato</span>
              <span className="font-mono text-[var(--text-accent)]">{Math.round(vibratoAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={vibratoAmount}
              onChange={(e) => setVibratoAmount(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            />
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-1 w-28 sm:w-32">
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
              <span>Volume</span>
              <span className="font-mono text-[var(--text-accent)]">{isMuted ? 'Muted' : `${volume} dB`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min="-36"
                max="0"
                step="1"
                value={volume}
                disabled={isMuted}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              />
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Guide Trigger */}
        <button
          onClick={() => setShowKeyGuide(true)}
          className="p-2 rounded-lg bg-[var(--bg-control)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-secondary)] transition-colors"
          title="Keyboard shortcuts & info"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Initial Guidance Banner */}
      <div className="h-6 flex items-center justify-center">
        <p ref={initialMessageRef} className="text-xs text-green-400 font-semibold flex items-center gap-1.5 animate-pulse">
          <Sparkles size={14} />
          <span>
            {currentKey.name} • A4 = {currentTuning.hz} Hz ({currentTuning.description})
          </span>
        </p>
      </div>

      {/* Keyboard Guide Modal */}
      {showKeyGuide && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-ui)] border border-[var(--border-color)] rounded-2xl p-6 max-w-lg w-full shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--text-accent)] flex items-center gap-2">
                <Info size={20} />
                <span>Piano Controls & Tuning</span>
              </h3>
              <button
                onClick={() => setShowKeyGuide(false)}
                className="text-gray-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-[var(--text-primary)]">
              <div>
                <p className="font-bold text-[var(--text-accent)] mb-1">🎹 Playing Keys:</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-[var(--text-secondary)]">
                  <li><strong className="text-[var(--text-primary)]">Lower Octave:</strong> <code className="bg-[var(--bg-control)] px-1.5 py-0.5 rounded font-mono">Z</code> through <code className="bg-[var(--bg-control)] px-1.5 py-0.5 rounded font-mono">M</code> (C3 to B3, sharps on S, D, G, H, J)</li>
                  <li><strong className="text-[var(--text-primary)]">Middle & Upper:</strong> <code className="bg-[var(--bg-control)] px-1.5 py-0.5 rounded font-mono">Q</code> through <code className="bg-[var(--bg-control)] px-1.5 py-0.5 rounded font-mono">\</code> (C4 to A5, [ and ] play F5 and G5)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-[var(--text-accent)] mb-1">🎛️ Key & Tuning Controls:</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-[var(--text-secondary)]">
                  <li><strong className="text-[var(--text-primary)]">Oct - / Oct +:</strong> Transpose keyboard by whole octaves (-2 to +2)</li>
                  <li><strong className="text-[var(--text-primary)]">Key (Тональність):</strong> Shift root key across all 12 semitones (C, D, E, F, G, A, B...)</li>
                  <li><strong className="text-[var(--text-primary)]">Pitch (Стрій):</strong> Select reference frequency (440 Hz standard, 432 Hz Verdi, 418 Hz Earth harmonic, 415 Hz Baroque, 444 Hz Solfeggio)</li>
                  <li><strong className="text-[var(--text-primary)]">MIDI Keyboard:</strong> Connect any USB MIDI keyboard for velocity-sensitive play</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-[var(--text-accent)] mb-1">✨ 25 Presets & 16 Demo Songs:</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Play with Concert Grand Piano, Rhodes Mk I, 80s Synth Brass, Hammond B3, 8-Bit Chiptune, and experience classical, cinematic, and modern polyphonic demo songs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowKeyGuide(false)}
              className="mt-6 w-full py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Piano;
