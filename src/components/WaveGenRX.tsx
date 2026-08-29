import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

interface WaveGenRXProps {
  theme: 'light' | 'dark' | 'branded';
}

const WaveGenRX: React.FC<WaveGenRXProps> = ({ theme }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveType, setWaveType] = useState<"sine" | "square" | "sawtooth" | "triangle">('sine');
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(-5);

  const oscRef = useRef<Tone.Oscillator | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef(0);
  useEffect(() => {
    const vol = new Tone.Volume(volume).toDestination();
    const osc = new Tone.Oscillator({
      type: waveType,
      frequency: frequency,
    }).connect(vol);

    volumeRef.current = vol;
    oscRef.current = osc;

    return () => {
      osc.dispose();
      vol.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = waveType;
    }
  }, [waveType]);

  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.rampTo(frequency, 0.05);
    }
  }, [frequency]);

  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.volume.rampTo(volume, 0.05);
    }
  }, [volume]);

  const handlePlayPause = async () => {
    await Tone.start();
    if (isPlaying) {
      oscRef.current?.stop();
    } else {
      oscRef.current?.start();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      const width = canvas.width;
      const height = canvas.height;
      const halfHeight = height / 2;

      const bgColor = theme === 'light' ? '#F3F4F6' : '#111827';
      const strokeColor = theme === 'branded' ? '#F59E0B' : '#818CF8';

      canvasCtx.fillStyle = bgColor;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = strokeColor;

      if (!isPlaying) {
        phaseRef.current = 0;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, halfHeight);
        canvasCtx.lineTo(width, halfHeight);
        canvasCtx.stroke();
        return;
      }

      const oscVal = oscRef.current?.frequency.value;
      const numFreq = typeof oscVal === 'number' ? oscVal : (typeof oscVal === 'string' ? parseFloat(oscVal) || frequency : frequency);
      const currentWaveType = oscRef.current?.type || waveType;
      
      const visualFrequency = numFreq + 0.1;
      const scrollSpeed = (visualFrequency * 2 * Math.PI) / 60.0;
      phaseRef.current = (phaseRef.current + scrollSpeed) % (2 * Math.PI);

      let cyclesToShow = 0.5 + Math.log10(Math.max(1, visualFrequency)) * 1.8;
      cyclesToShow = Math.max(0.5, Math.min(15, cyclesToShow));

      canvasCtx.beginPath();
      for (let x = 0; x < width; x++) {
        const angle = ((x / width) * cyclesToShow * 2 * Math.PI) + phaseRef.current;
        let amplitude = 0;

        switch (currentWaveType) {
          case 'sine':
            amplitude = Math.sin(angle);
            break;
          case 'square':
            amplitude = Math.sign(Math.sin(angle));
            break;
          case 'triangle':
            amplitude = (Math.asin(Math.sin(angle)) * (2 / Math.PI));
            break;
          case 'sawtooth':
            amplitude = 1 - 2 * ((angle / (2 * Math.PI)) % 1);
            break;
        }

        const y = halfHeight + amplitude * (halfHeight - 5);
        if (x === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
      }
      canvasCtx.stroke();
    };

    animationFrameId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [theme, isPlaying, waveType, frequency]);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(parseFloat(e.target.value));
  };
  
  const adjustFrequency = (amount: number) => {
    setFrequency(prev => Math.max(1, Math.min(16000, prev + amount)));
  };

  return (
    <div className="w-full max-w-md bg-[var(--bg-ui)] rounded-2xl shadow-lg p-5 space-y-4 border border-[var(--border-color)] text-[var(--text-primary)]">
      <div className="bg-[var(--bg-waveform)] rounded-lg h-32">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>

      <div className="space-y-4 bg-[var(--bg-control)] p-4 rounded-lg">
        <button onClick={handlePlayPause} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-md flex items-center justify-center space-x-2">
          <span>{isPlaying ? 'Stop' : 'Play'}</span>
        </button>

        <div>
          <label htmlFor="wave-type" className="block mb-1 text-xs font-medium">Waveform</label>
          <select id="wave-type" value={waveType} onChange={(e) => setWaveType(e.target.value as "sine" | "square" | "sawtooth" | "triangle")} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2">
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="frequency" className="text-xs font-medium">Frequency</label>
            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">{Math.round(frequency)} Hz</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => adjustFrequency(-10)} className="bg-indigo-500 hover:bg-indigo-600 rounded-md p-1 w-8 h-8 flex items-center justify-center font-bold text-lg transition-colors">-</button>
            <input id="frequency" type="range" min="20" max="2000" value={frequency} onChange={handleFrequencyChange} className="w-full accent-indigo-500" />
            <button onClick={() => adjustFrequency(10)} className="bg-indigo-500 hover:bg-indigo-600 rounded-md p-1 w-8 h-8 flex items-center justify-center font-bold text-lg transition-colors">+</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="volume" className="text-xs font-medium">Volume</label>
            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">{volume} dB</span>
          </div>
          <input id="volume" type="range" min="-40" max="0" value={volume} step="1" onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
        </div>
      </div>
    </div>
  );
};

export default WaveGenRX;
