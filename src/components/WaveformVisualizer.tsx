import { useEffect, useRef, memo } from "react";

interface WaveformVisualizerProps {
  peaks: number[];
  color?: string;
  height?: number;
}

// Static loading bars - computed once
const LOADING_BARS = Array.from({ length: 20 }, (_, i) => ({
  height: 10 + (Math.sin(i * 0.5) * 30 + 30), // Smooth wave pattern, not random
}));

function WaveformVisualizerInner({ peaks, color = "rgba(255, 255, 255, 0.25)", height = 56 }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight || height;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, canvasHeight);
    
    const barWidth = width / peaks.length;
    const gap = 2;
    const effectiveBarWidth = Math.max(2, barWidth - gap);

    ctx.fillStyle = color;

    peaks.forEach((peak, i) => {
      const x = i * barWidth;
      const barHeight = Math.max(4, peak * (canvasHeight * 0.8)); 
      const yCenter = (canvasHeight - barHeight) / 2; 

      ctx.beginPath();
      if (ctx.roundRect) {
         ctx.roundRect(x, yCenter, effectiveBarWidth, barHeight, 2);
      } else {
         ctx.rect(x, yCenter, effectiveBarWidth, barHeight);
      }
      ctx.fill();
    });

  }, [peaks, color, height]);

  if (!peaks.length) {
    // Simple static loading state - no animations
    return (
       <div className="w-full h-full flex items-center justify-center gap-1 opacity-30 px-1">
          {LOADING_BARS.map((bar, i) => (
             <div 
               key={i} 
               className="flex-1 bg-white/40 rounded-full" 
               style={{ height: `${bar.height}%` }} 
             />
          ))}
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

// Memoize to prevent re-renders when parent updates
export const WaveformVisualizer = memo(WaveformVisualizerInner);

