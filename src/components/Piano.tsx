import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import './Piano.css';

const Piano: React.FC = () => {
    const monsterStageRef = useRef<HTMLDivElement>(null);
    const pianoContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initialMessageRef = useRef<HTMLDivElement>(null);

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const vibratoRef = useRef<Tone.Vibrato | null>(null);
    
    const audioStartedRef = useRef(false);
    const monstersRef = useRef<{ element: HTMLDivElement; inUse: boolean; note: string | null; }[]>([]);
    const pressedKeysRef = useRef(new Set<string>());
    const animationFrameIdRef = useRef<number | null>(null);
    const notePositionsRef = useRef<Record<string, { left: string; bottom: string }>>({});
    const lastNotePlayedRef = useRef<string | null>(null);
    const particlesRef = useRef<any[]>([]);

    const [selectedSound, setSelectedSound] = useState('default');
    const [reverbAmount, setReverbAmount] = useState(0);
    const [vibratoAmount, setVibratoAmount] = useState(0);

    const keyNoteMap: Record<string, string> = {
        'KeyZ': 'C3', 'KeyS': 'C#3', 'KeyX': 'D3', 'KeyD': 'D#3', 'KeyC': 'E3', 'KeyV': 'F3', 'KeyG': 'F#3', 'KeyB': 'G3', 'KeyH': 'G#3', 'KeyN': 'A3', 'KeyJ': 'A#3', 'KeyM': 'B3', 'Comma': 'C4', 'Period': 'D4', 'Slash': 'E4', 'KeyL': 'C#4', 'Semicolon': 'D#4', 'KeyQ': 'C4', 'Digit2': 'C#4', 'KeyW': 'D4', 'Digit3': 'D#4', 'KeyE': 'E4', 'KeyR': 'F4', 'Digit5': 'F#4', 'KeyT': 'G4', 'Digit6': 'G#4', 'KeyY': 'A4', 'Digit7': 'A#4', 'KeyU': 'B4', 'KeyI': 'C5', 'Digit9': 'C#5', 'KeyO': 'D5', 'Digit0': 'D#5', 'KeyP': 'E5', 'BracketLeft': 'F5', 'Equal': 'F#5', 'BracketRight': 'G5', 'Backspace': 'G#5', 'Backslash': 'A5'
    };
    const visualKeys = [ 'KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight', 'Backspace', 'Backslash' ];
    const keyAliasMap: Record<string, string> = { 'Comma': 'KeyQ', 'Period': 'KeyW', 'Slash': 'KeyE', 'KeyL': 'Digit2', 'Semicolon': 'Digit3' };
    const isBlackKey = (note: string) => note.includes('#');

    const getKeyLabel = (keyCode: string) => {
        if (keyCode.startsWith('Key')) return keyCode.substring(3);
        if (keyCode.startsWith('Digit')) return keyCode.substring(5);
        if (keyCode === 'BracketLeft') return '[';
        if (keyCode === 'BracketRight') return ']';
        if (keyCode === 'Equal') return '=';
        if (keyCode === 'Backslash') return '\\';
        if (keyCode === 'Backspace') return '⌫';
        return '';
    };

    const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSound(event.target.value);
        setReverbAmount(0);
        setVibratoAmount(0);
    };

    useEffect(() => {
        if (reverbRef.current) {
            reverbRef.current.wet.value = reverbAmount;
        }
    }, [reverbAmount]);

    useEffect(() => {
        if (vibratoRef.current) {
            vibratoRef.current.depth.value = vibratoAmount;
        }
    }, [vibratoAmount]);

    useEffect(() => {
        const monsterStage = monsterStageRef.current;
        const pianoContainer = pianoContainerRef.current;
        const canvas = canvasRef.current;
        if (!monsterStage || !pianoContainer || !canvas) return;

        const ctx = canvas.getContext('2d');
        let midiAccess: WebMidi.MIDIAccess | null = null;

        if (!reverbRef.current) {
            reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0 }).toDestination();
        }
        if (!vibratoRef.current) {
            vibratoRef.current = new Tone.Vibrato({ frequency: 5, depth: 0 });
        }
        
        const synthOptions = {
            default: { synth: Tone.Synth, options: { oscillator: { type: 'fatsawtooth' as const }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.8 } } },
            amSynth: { synth: Tone.AMSynth, options: { harmonicity: 2, detune: 0, oscillator: { type: "sawtooth" as const }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.9 }, modulation: { type: "square" as const }, modulationEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.5 } } },
            fmSynth: { synth: Tone.FMSynth, options: { harmonicity: 3, modulationIndex: 10, detune: 0, oscillator: { type: "sine" as const }, envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 }, modulation: { type: "square" as const }, modulationEnvelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 } } },
            keygenNostalgia: { synth: Tone.Synth, options: { volume: -3, oscillator: { type: 'square' as const }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 } } },
            sawtooth: { synth: Tone.Synth, options: { oscillator: { type: 'sawtooth' as const }}},
            square: { synth: Tone.Synth, options: { oscillator: { type: 'square' as const }}},
            sine: { synth: Tone.Synth, options: { oscillator: { type: 'sine' as const }}},
            triangle: { synth: Tone.Synth, options: { oscillator: { type: 'triangle' as const }}},
            chiptune: { synth: Tone.Synth, options: { volume: -8, oscillator: { type: 'square' as const }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.2 } } },
        };

        const createSynth = (type: string) => {
            if (synthRef.current) synthRef.current.dispose();
            const config = synthOptions[type as keyof typeof synthOptions];
            synthRef.current = new Tone.PolySynth(config.synth as any, config.options);
            
            if (vibratoRef.current && reverbRef.current) {
                synthRef.current.connect(vibratoRef.current);
                vibratoRef.current.connect(Tone.Destination);
                synthRef.current.connect(reverbRef.current);
            }
            if(synthRef.current) {
                synthRef.current.maxPolyphony = 12;
            }
        };

        createSynth(selectedSound);

        const monsterColors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9f43', '#a29bfe', '#ff7979', '#badc58'];
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
        
        const localAnimateKaleidoscope = () => {
             if (!ctx || !canvas) return;
             ctx.fillStyle = 'rgba(30, 33, 36, 0.4)';
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
                 ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${opacity * 0.8})`;
                 ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 1)`;
                 ctx.shadowBlur = 15;
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
             animationFrameIdRef.current = requestAnimationFrame(localAnimateKaleidoscope);
        };

        const startAudio = async () => {
            if (!audioStartedRef.current) {
                await Tone.start();
                audioStartedRef.current = true;
                if(initialMessageRef.current) initialMessageRef.current.classList.add('fade-out');
            }
        };

        const playNote = (keyCode: string) => {
            if (!synthRef.current) return;
            const note = keyNoteMap[keyCode];
            if (note && !pressedKeysRef.current.has(keyCode)) {
                pressedKeysRef.current.add(keyCode);
                synthRef.current.triggerAttack(note, Tone.now());
                const visualKeyCode = keyAliasMap[keyCode] || keyCode;
                const keyElement = pianoContainer.querySelector(`[data-key="${visualKeyCode}"]`);
                if (keyElement) keyElement.classList.add('active');
                const availableMonster = monstersRef.current.find(m => !m.inUse);
                if (availableMonster) {
                    availableMonster.inUse = true;
                    availableMonster.note = note;
                    let position = notePositionsRef.current[note];
                    if (note !== lastNotePlayedRef.current || !position) {
                        position = {
                            left: `${Math.random() * (100 - 15) + 5}%`,
                            bottom: `${Math.random() * 40 + 20}%`
                        };
                        notePositionsRef.current[note] = position;
                    }
                    lastNotePlayedRef.current = note;
                    availableMonster.element.style.left = position.left;
                    availableMonster.element.style.bottom = position.bottom;
                    availableMonster.element.classList.add('singing');
                }
                if(canvas){
                    particlesRef.current.push({
                        x: (Math.random() - 0.5) * (canvas.width * 0.4),
                        y: (Math.random() - 0.5) * (canvas.height * 0.4),
                        radius: 1, velocity: 0.5 + Math.random() * 0.5,
                        hue: Math.random() * 360, life: 60, maxLife: 60
                    });
                }
            }
        };

        const stopNote = (keyCode: string) => {
            const note = keyNoteMap[keyCode];
            if (note && synthRef.current) {
                pressedKeysRef.current.delete(keyCode);
                synthRef.current.triggerRelease(note, Tone.now());
                const visualKeyCode = keyAliasMap[keyCode] || keyCode;
                const keyElement = pianoContainer.querySelector(`[data-key="${visualKeyCode}"]`);
                if (keyElement) keyElement.classList.remove('active');
                const monsterToStop = monstersRef.current.find(m => m.inUse && m.note === note);
                if (monsterToStop) {
                    monsterToStop.inUse = false;
                    monsterToStop.note = null;
                    monsterToStop.element.classList.remove('singing');
                }
            }
        };
        
        const handleKeyDown = (event: KeyboardEvent) => {
            startAudio();
            if (keyNoteMap[event.code] && !event.repeat) {
                 event.preventDefault();
                 playNote(event.code);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
             if (keyNoteMap[event.code]) {
                event.preventDefault();
                stopNote(event.code);
            }
        };

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as HTMLElement;
            const keyElement = target.closest('.key') as HTMLDivElement;
            if (keyElement) {
                event.preventDefault();
                startAudio();
                playNote(keyElement.dataset.key!);
                keyElement.dataset.pressed = 'true';
            }
        };

        const handlePointerUp = () => {
            document.querySelectorAll('.key[data-pressed="true"]').forEach(keyElement => {
                const key = keyElement as HTMLDivElement;
                stopNote(key.dataset.key!);
                key.dataset.pressed = 'false';
            });
        };

        const resizeCanvas = () => {
            if (canvas && monsterStage) {
                canvas.width = monsterStage.clientWidth;
                canvas.height = monsterStage.clientHeight;
            }
        };

        const midiToKeyCodeMap: { [key: number]: string } = {};
        for (const [keyCode, noteName] of Object.entries(keyNoteMap)) {
            const midiValue = Tone.Midi(noteName).toMidi();
            midiToKeyCodeMap[midiValue] = keyCode;
        }
    
        const onMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const [command, note, velocity] = event.data;
            const keyCode = midiToKeyCodeMap[note];
    
            if (!keyCode) return;
    
            if (command === 144 && velocity > 0) {
                startAudio();
                playNote(keyCode);
            } else if (command === 128 || (command === 144 && velocity === 0)) {
                stopNote(keyCode);
            }
        };
    
        const setupMidi = async () => {
            if (navigator.requestMIDIAccess) {
                try {
                    midiAccess = await navigator.requestMIDIAccess();
                    midiAccess.inputs.forEach((input: WebMidi.MIDIInput) => {
                        input.onmidimessage = onMidiMessage;
                    });
                } catch (error) {
                    console.error("MIDI access denied or not available.", error);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', resizeCanvas);
        pianoContainer.addEventListener('mousedown', handlePointerDown);
        pianoContainer.addEventListener('touchstart', handlePointerDown, { passive: false });
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchend', handlePointerUp, { passive: false });
        
        resizeCanvas();
        localAnimateKaleidoscope();
        setupMidi();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchend', handlePointerUp);
            
            if (midiAccess) {
                midiAccess.inputs.forEach((input: WebMidi.MIDIInput) => {
                    input.onmidimessage = null;
                });
            }

            if (synthRef.current) {
                synthRef.current.releaseAll();
                synthRef.current.dispose();
            }
            if(reverbRef.current) {
                reverbRef.current.dispose();
                reverbRef.current = null;
            }
            if(vibratoRef.current) {
                vibratoRef.current.dispose();
                vibratoRef.current = null;
            }
            if(animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [selectedSound]);

    return (
        <div className="w-full max-w-7xl text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl mb-2 title-font">BeatRX Piano</h1>
            <p className="mb-6 text-[var(--text-secondary)]">Play on the keyboard, choose sounds, and create music!</p>

            <div id="monster-stage" ref={monsterStageRef} className="monster-stage w-full">
                <canvas id="kaleidoscope-canvas" ref={canvasRef}></canvas>
            </div>

            <div id="piano" ref={pianoContainerRef} className="piano-container">
                {visualKeys.map(keyCode => {
                    const note = keyNoteMap[keyCode];
                    const label = getKeyLabel(keyCode);
                    return (
                        <div key={keyCode} data-key={keyCode} data-note={note} className={`key ${isBlackKey(note) ? 'black' : 'white'}`}>
                            <div className="key-label">{label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center">
                <div className="flex items-center gap-2">
                    <label htmlFor="sound-selector" className="font-bold text-[var(--text-secondary)]">Presets:</label>
                    <select
                        id="sound-selector"
                        className="sound-select"
                        value={selectedSound}
                        onChange={handlePresetChange}
                    >
                        <option value="default">Classic Synth</option>
                        <option value="amSynth">Cosmic Bell</option>
                        <option value="fmSynth">Warm Organ</option>
                        <option value="keygenNostalgia">Nostalgia</option>
                        <option value="chiptune">Chiptune</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="square">Square</option>
                        <option value="sine">Sine</option>
                        <option value="triangle">Triangle</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 w-48">
                    <label className="text-sm font-bold text-[var(--text-secondary)]">Reverb: {Math.round(reverbAmount * 100)}%</label>
                    <input type="range" min="0" max="1" step="0.01" value={reverbAmount} onChange={(e) => setReverbAmount(parseFloat(e.target.value))} className="w-full h-2 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer range-sm accent-[var(--accent-color)]" />
                </div>
                
                <div className="flex flex-col gap-2 w-48">
                    <label className="text-sm font-bold text-[var(--text-secondary)]">Vibrato: {Math.round(vibratoAmount * 100)}%</label>
                    <input type="range" min="0" max="0.5" step="0.01" value={vibratoAmount} onChange={(e) => setVibratoAmount(parseFloat(e.target.value))} className="w-full h-2 bg-[var(--bg-control)] rounded-lg appearance-none cursor-pointer range-sm accent-[var(--accent-color)]" />
                </div>
            </div>

        </div>
    );
};

export default Piano;
