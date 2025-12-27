import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";

interface StudioFaderProps {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollProgress: number; // 0-1
  onSeek: (progress: number) => void;
}

export function StudioFader({ containerRef, scrollProgress, onSeek }: StudioFaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(scrollProgress);
  
  // Animation frame ref for LERP
  const animationRef = useRef<number>();
  const targetProgressRef = useRef(scrollProgress);

  // LERP animation loop
  useEffect(() => {
    const animate = () => {
      setDisplayProgress(prev => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        
        // Boundary braking: increase friction in last 15%
        const frictionMultiplier = target > 0.85 ? 0.5 : 1;
        const lerpFactor = 0.15 * frictionMultiplier;
        
        // If close enough, snap to target
        if (Math.abs(diff) < 0.001) return target;
        
        return prev + diff * lerpFactor;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Update target when external scroll changes
  useEffect(() => {
    if (!isDragging) {
      targetProgressRef.current = scrollProgress;
    }
  }, [scrollProgress, isDragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    // Calculate initial position
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const progress = Math.max(0, Math.min(1, y / rect.height));
      targetProgressRef.current = progress;
      onSeek(progress);
    }
  }, [onSeek]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate raw progress
    let progress = y / rect.height;
    
    // Velocity clamping: limit how fast progress can change
    const maxDelta = 0.05; // Max 5% per frame
    const currentProgress = targetProgressRef.current;
    const delta = Math.max(-maxDelta, Math.min(maxDelta, progress - currentProgress));
    progress = Math.max(0, Math.min(1, currentProgress + delta));
    
    targetProgressRef.current = progress;
    onSeek(progress);
  }, [isDragging, onSeek]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Track height calculation
  const trackHeight = 300; // Fixed height, or could be dynamic
  const handleHeight = 48;
  const handleTop = displayProgress * (trackHeight - handleHeight);

  return (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2"
      style={{ height: trackHeight + 40 }}
    >
      {/* Progress Label */}
      <div className="text-[10px] font-mono text-rose-400/60 mb-2">
        {Math.round(displayProgress * 100)}%
      </div>
      
      {/* Fader Track */}
      <div
        ref={trackRef}
        className="relative cursor-pointer touch-none"
        style={{ 
          width: 24, 
          height: trackHeight,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Track Line */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 2,
            height: '100%',
            background: 'rgba(244, 63, 94, 0.3)',
            boxShadow: '0 0 8px rgba(244, 63, 94, 0.2)',
          }}
        />
        
        {/* Track Markers */}
        {[0, 0.25, 0.5, 0.75, 1].map((mark) => (
          <div 
            key={mark}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-white/10"
            style={{ top: `${mark * 100}%` }}
          />
        ))}
        
        {/* Soft Landing Zone Indicator (last 15%) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-b-full"
          style={{
            width: 6,
            height: '15%',
            bottom: 0,
            background: 'linear-gradient(to bottom, transparent, rgba(244, 63, 94, 0.15))',
          }}
        />
        
        {/* Handle - Glassmorphic Pill */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 touch-none select-none"
          style={{
            width: 12,
            height: handleHeight,
            top: handleTop,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          animate={{
            scale: isDragging ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Handle Glass Body */}
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.15),
                inset 0 -1px 1px rgba(0,0,0,0.2),
                0 4px 12px rgba(0,0,0,0.4)
              `,
            }}
          />
          
          {/* Handle Center Indicator */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-3 rounded-full"
            style={{
              background: isDragging 
                ? 'rgba(244, 63, 94, 0.9)' 
                : 'rgba(244, 63, 94, 0.5)',
              boxShadow: isDragging 
                ? '0 0 8px rgba(244, 63, 94, 0.8)' 
                : 'none',
              transition: 'all 0.2s',
            }}
          />
        </motion.div>
      </div>
      
      {/* Bottom Label */}
      <div className="text-[9px] font-mono text-white/30 mt-2 uppercase tracking-widest">
        Fader
      </div>
    </div>
  );
}
