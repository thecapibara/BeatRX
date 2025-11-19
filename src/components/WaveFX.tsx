import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play as LucidePlay, Pause as LucidePause, Volume2 as LucideVolume2, VolumeX as LucideVolumeX, Activity as LucideActivity, Minus as LucideMinus, Plus as LucidePlus } from 'lucide-react';

interface WaveFXProps {
  theme?: string;
}

const WaveFX: React.FC<WaveFXProps> = ({ theme }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformType, setWaveformType] = useState<Tone.ToneOscillatorType>('sine');
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(-10);
  const [isMuted, setIsMuted] = useState(false);

  const oscillatorRef = useRef<Tone.Oscillator | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Tone.js components
    const analyser = new Tone.Analyser('waveform', 2048);
    analyserRef.current = analyser;

    const oscillator = new Tone.Oscillator({
      type: waveformType,
      frequency: frequency,
      volume: volume,
    } as any).connect(analyser).toDestination();

    oscillatorRef.current = oscillator;

    return () => {
      oscillator.dispose();
      analyser.dispose();
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = waveformType;
    }
  }, [waveformType]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  useEffect(() => {
    if (oscillatorRef.current) {
      if (isMuted) {
        oscillatorRef.current.volume.value = -Infinity;
      } else {
        oscillatorRef.current.volume.value = volume;
      }
    }
  }, [volume, isMuted]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
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
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#6366f1';
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

  useEffect(() => {
    const canvas = canvasRef.current;
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
  }, [isPlaying, drawWaveform]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start();
      oscillatorRef.current?.start();
      setIsPlaying(true);
    } else {
      oscillatorRef.current?.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-accent)] flex items-center justify-center gap-2">
          <LucideActivity className="w-8 h-8" />
          WaveFX Generator
        </h2>
        <p className="text-[var(--text-secondary)]">Generate and visualize pure waveforms</p>
      </div>

      <div className="w-full bg-[var(--bg-control)] rounded-xl p-4 shadow-inner border border-[var(--border-color)]">
        <canvas
          ref={canvasRef}
          className="w-full h-64 bg-[var(--bg-waveform)] rounded-lg"
        ></canvas>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[var(--bg-control)] p-6 rounded-xl border border-[var(--border-color)]">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Waveform Type</label>
            <div className="flex gap-2">
              {(['sine', 'square', 'sawtooth', 'triangle'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setWaveformType(type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${waveformType === type
                    ? 'bg-[var(--accent-color)] text-white shadow-md transform scale-105'
                    : 'bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-opacity-80'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePlayPause}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${isPlaying
                ? (theme === 'branded' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600')
                : (theme === 'branded' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-green-500 hover:bg-green-600')
                }`}
            >
              {isPlaying ? <><LucidePause size={20} /> Stop</> : <><LucidePlay size={20} /> Start</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="frequency-slider" className="text-sm font-medium text-[var(--text-secondary)]">Frequency</label>
              <span className="text-sm font-mono text-[var(--text-primary)]">{frequency} Hz</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFrequency(Math.max(1, frequency - 1))}
                className={`p-2 rounded-full transition-colors duration-200 ${theme === 'branded'
                  ? 'bg-pink-600 hover:bg-pink-700 text-white'
                  : 'bg-[var(--bg-main)] hover:bg-[var(--bg-ui)] text-[var(--text-primary)] border border-[var(--border-color)]'}`}
                aria-label="Decrease Frequency"
              >
                <LucideMinus size={16} />
              </button>
              <input
                id="frequency-slider"
                type="range"
                min="1"
                max="15000"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              />
              <button
                onClick={() => setFrequency(Math.min(15000, frequency + 1))}
                className={`p-2 rounded-full transition-colors duration-200 ${theme === 'branded'
                  ? 'bg-pink-600 hover:bg-pink-700 text-white'
                  : 'bg-[var(--bg-main)] hover:bg-[var(--bg-ui)] text-[var(--text-primary)] border border-[var(--border-color)]'}`}
                aria-label="Increase Frequency"
              >
                <LucidePlus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="volume-slider" className="text-sm font-medium text-[var(--text-secondary)]">Volume</label>
              <span className="text-sm font-mono text-[var(--text-primary)]">{isMuted ? 'Muted' : `${volume} dB`}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-opacity-80 transition-colors"
              >
                {isMuted ? <LucideVolumeX size={20} /> : <LucideVolume2 size={20} />}
              </button>
              <input
                id="volume-slider"
                type="range"
                min="-60"
                max="0"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                disabled={isMuted}
                className="flex-grow h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveFX;
