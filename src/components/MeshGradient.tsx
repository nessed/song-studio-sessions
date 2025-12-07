import { useEffect, useRef } from "react";
import { Gradient } from "whatamesh";

type MeshInstance = Gradient & {
  amp?: number;
  freqX?: number;
  freqY?: number;
  seed?: number;
  uniforms?: any;
  disconnect?: () => void;
};

export const MeshGradient = () => {
  const gradientRef = useRef<MeshInstance | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const gradient = new Gradient() as MeshInstance;
    gradient.amp = 180;
    gradient.freqX = 7e-5;
    gradient.freqY = 19e-5;
    gradientRef.current = gradient;
    gradient.initGradient("#gradient-canvas");

    const tuneMotion = () => {
      if (!gradient.uniforms?.u_global || !gradient.uniforms.u_vertDeform) {
        rafRef.current = requestAnimationFrame(tuneMotion);
        return;
      }

      gradient.uniforms.u_global.value.noiseSpeed.value = 2.5e-6;
      gradient.uniforms.u_vertDeform.value.noiseSpeed.value = 6;
      gradient.uniforms.u_vertDeform.value.noiseFlow.value = 1.75;
      gradient.uniforms.u_vertDeform.value.noiseAmp.value = 260;
    };

    tuneMotion();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gradient.pause?.();
      gradient.disconnect?.();
    };
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      data-transition-in
      className="fixed inset-0 w-screen h-screen opacity-60 -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
};
