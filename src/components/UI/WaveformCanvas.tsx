import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  className?: string;
  intensity?: 'subtle' | 'vibrant';
  interactive?: boolean;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  className = '',
  intensity = 'subtle',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Audio spectrum & sine wave particles
    const lines = [
      { frequency: 0.008, speed: 0.015, amplitude: height * 0.18, phase: 0, color: 'rgba(199, 243, 107, 0.25)' },
      { frequency: 0.012, speed: 0.012, amplitude: height * 0.12, phase: 1.5, color: 'rgba(255, 255, 255, 0.12)' },
      { frequency: 0.005, speed: 0.008, amplitude: height * 0.24, phase: 3.0, color: 'rgba(199, 243, 107, 0.12)' },
      { frequency: 0.018, speed: 0.02, amplitude: height * 0.08, phase: 4.5, color: 'rgba(255, 255, 255, 0.06)' },
    ];

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle horizon ambient glow
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.6
      );
      gradient.addColorStop(0, intensity === 'vibrant' ? 'rgba(199, 243, 107, 0.08)' : 'rgba(199, 243, 107, 0.03)');
      gradient.addColorStop(1, 'rgba(8, 9, 11, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw smooth flowing audio waveform curves
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = line.color;

        const centerY = height * 0.5;

        for (let x = 0; x < width; x += 3) {
          // Envelope function: smooth fade at left and right edges
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * line.frequency + t * line.speed + line.phase) * line.amplitude * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw periodic audio spectrum vertical bars along center
      const barCount = 48;
      const barSpacing = width / barCount;
      const barWidth = 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * barSpacing + barSpacing / 2;
        const envelope = Math.sin((i / barCount) * Math.PI);
        const noise = Math.sin(i * 0.5 + t * 0.04) * Math.cos(i * 0.3 - t * 0.03);
        const barHeight = Math.max(4, Math.abs(noise) * (height * 0.16) * envelope);

        ctx.fillStyle = i % 4 === 0 ? 'rgba(199, 243, 107, 0.3)' : 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x - barWidth / 2, height / 2 - barHeight / 2, barWidth, barHeight);
      }

      t += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
    />
  );
};
