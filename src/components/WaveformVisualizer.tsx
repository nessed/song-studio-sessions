import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  peaks: number[];
  color?: string;
  height?: number;
}

export function WaveformVisualizer({ peaks, color = "rgba(255, 255, 255, 0.25)", height = 56 }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // We rely on parent to set width via CSS (w-full), but we need to read it.
    // However, if we are in a hidden 'overflow' container, offsetWidth might be tricky if not careful.
    // Assuming this component is always rendered full width of its container.
    const width = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight || height;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, canvasHeight);
    
    // Config
    const barWidth = width / peaks.length;
    const gap = 2;
    const effectiveBarWidth = Math.max(2, barWidth - gap); // Maintain minimum visibility

    ctx.fillStyle = color;

    peaks.forEach((peak, i) => {
      const x = i * barWidth;
      // Scale height relative to canvas, ensure min height of 4px
      const barHeight = Math.max(4, peak * (canvasHeight * 0.8)); 
      const yCenter = (canvasHeight - barHeight) / 2; 

      // Draw rounded rect
      ctx.beginPath();
      // ctx.roundRect is not available in all TS envs yet, use simple rect or polyfill
      if (ctx.roundRect) {
         ctx.roundRect(x, yCenter, effectiveBarWidth, barHeight, 2);
      } else {
         ctx.rect(x, yCenter, effectiveBarWidth, barHeight);
      }
      ctx.fill();
    });

  }, [peaks, color, height]);

  if (!peaks.length) {
    return (
       <div className="w-full h-full flex items-center justify-center gap-1 opacity-50 relative">
          <div className="flex gap-1 items-end h-1/2">
             {[...Array(10)].map((_, i) => (
                 <div key={i} className="w-1 bg-white/20 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
             ))}
          </div>
       </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
}
