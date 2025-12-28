import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface JogWheelProps {
  onScroll: (delta: number) => void;
  onSnapToActive: () => void;
}

export function JogWheel({ onScroll, onSnapToActive }: JogWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - lastY.current;
    lastY.current = e.clientY;
    
    // Calculate rotation based on drag distance
    const rotationDelta = deltaY * 2; // 2 degrees per pixel
    setRotation(prev => prev + rotationDelta);
    
    // Calculate scroll velocity - faster drag = more scroll
    const velocity = Math.abs(deltaY) > 5 ? deltaY * 3 : deltaY;
    onScroll(velocity);
  }, [isDragging, onScroll]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return (
    <motion.div
      ref={wheelRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-8 right-8 z-50 select-none touch-none"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Outer glow / shadow */}
      <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl scale-150 opacity-50" />
      
      {/* Main wheel body */}
      <div
        className="relative w-24 h-24 rounded-full shadow-2xl shadow-black/70"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={onSnapToActive}
        style={{
          background: `
            radial-gradient(circle at 30% 30%, #3a3a3a 0%, #252525 40%, #1a1a1a 100%)
          `,
        }}
      >
        {/* Rim light (top-left highlight) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)`,
          }}
        />
        
        {/* Brushed aluminum texture rings */}
        <div 
          className="absolute inset-2 rounded-full border border-white/[0.08]"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.3) 100%)
            `,
          }}
        />
        <div className="absolute inset-4 rounded-full border border-white/[0.05]" />
        <div className="absolute inset-6 rounded-full border border-white/[0.03]" />
        
        {/* Center hub */}
        <div 
          className="absolute inset-[28%] rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, #2a2a2a, #151515)`,
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.05)`,
          }}
        />
        
        {/* Crimson indicator dot */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg"
          style={{
            top: "8px",
            left: "50%",
            marginLeft: "-5px",
            boxShadow: `0 0 10px rgba(244, 63, 94, 0.8), 0 0 20px rgba(244, 63, 94, 0.4)`,
            transformOrigin: "center 40px", // Distance to center
          }}
          animate={{
            rotate: rotation,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* Inner shadow for depth */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 0 4px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.02)`,
          }}
        />
      </div>

      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30">
          Jog • Scroll
        </span>
      </div>
    </motion.div>
  );
}
