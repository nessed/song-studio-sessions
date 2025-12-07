import React, { useEffect, useRef } from "react";
import { Gradient } from "whatamesh";

type MeshInstance = Gradient & {
  amp?: number;
  freqX?: number;
  freqY?: number;
  seed?: number;
  uniforms?: any;
  disconnect?: () => void;
};

type MeshGradientProps = {
  colorSignature?: string;
  overlayOpacity?: number;
  canvasOpacity?: number;
};

export function MeshGradient({
  colorSignature,
  overlayOpacity = 0.2,
  canvasOpacity = 0.6,
}: MeshGradientProps) {
  const gradientRef = useRef<MeshInstance | null>(null);
  const rafRef = useRef<number>();
  const canvasId = useRef(`gradient-canvas-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const canvasElement = document.getElementById(canvasId);
      if (!canvasElement) return;

      const gradient = new Gradient() as MeshInstance;
      gradient.amp = 220;
      gradient.freqX = 5e-5;
      gradient.freqY = 15e-5;
      gradientRef.current = gradient;
      gradient.initGradient(`#${canvasId}`);

      const tuneMotion = () => {
        if (!gradient.uniforms?.u_global || !gradient.uniforms.u_vertDeform) {
          rafRef.current = requestAnimationFrame(tuneMotion);
          return;
        }

        gradient.uniforms.u_global.value.noiseSpeed.value = 2e-6;
        gradient.uniforms.u_vertDeform.value.noiseSpeed.value = 5.5;
        gradient.uniforms.u_vertDeform.value.noiseFlow.value = 1.5;
        gradient.uniforms.u_vertDeform.value.noiseAmp.value = 320;
      };

      tuneMotion();
    }, 50);

    return () => {
      window.clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gradientRef.current?.pause?.();
      gradientRef.current?.disconnect?.();
    };
  }, [colorSignature, canvasId]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: `rgba(9, 9, 11, ${overlayOpacity})` }}
      />
      <canvas
        key={colorSignature}
        id={canvasId}
        data-transition-in
        className="w-full h-full"
        style={{ opacity: canvasOpacity } as React.CSSProperties}
      />
    </div>
  );
}
