import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "auto";
}

interface OnboardingTourProps {
  steps: TourStep[];
  tourId?: string;
}

export function OnboardingTour({ steps, tourId = "main" }: OnboardingTourProps) {
  const { isActive, currentStep, nextStep, skipTour } = useOnboardingTour(tourId);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const updateTargetPosition = useCallback(() => {
    if (!isActive || !steps[currentStep]) return;

    const targetEl = document.querySelector(`[data-tour="${steps[currentStep].target}"]`);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener("scroll", updateTargetPosition, true);
    window.addEventListener("resize", updateTargetPosition);
    return () => {
      window.removeEventListener("scroll", updateTargetPosition, true);
      window.removeEventListener("resize", updateTargetPosition);
    };
  }, [updateTargetPosition]);

  useEffect(() => {
    if (!targetRect || !tooltipRef.current || isMobile) {
      setTooltipStyle({});
      return;
    }

    const tooltipWidth = 320;
    const tooltipHeight = tooltipRef.current.offsetHeight || 180;
    const padding = 16;
    const offset = 12;

    const step = steps[currentStep];
    let position = step.position || "auto";

    if (position === "auto") {
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;
      position = spaceBelow > tooltipHeight + padding ? "bottom" : 
                 spaceAbove > tooltipHeight + padding ? "top" : "bottom";
    }

    let style: React.CSSProperties = { position: "fixed" };

    if (position === "bottom") {
      style.top = targetRect.bottom + offset;
      style.left = Math.max(padding, Math.min(
        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - padding
      ));
    } else if (position === "top") {
      style.top = targetRect.top - tooltipHeight - offset;
      style.left = Math.max(padding, Math.min(
        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - padding
      ));
    } else if (position === "right") {
      style.top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      style.left = targetRect.right + offset;
    } else {
      style.top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      style.left = targetRect.left - tooltipWidth - offset;
    }

    setTooltipStyle(style);
  }, [targetRect, currentStep, steps, isMobile]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Simple dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60"
            onClick={skipTour}
          />
          
          {/* Spotlight ring around target - desktop only */}
          {targetRect && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed z-[9998] pointer-events-none rounded-xl border-2 border-white/20"
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
              }}
            />
          )}

          {/* Minimal glass tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: isMobile ? 20 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 20 : 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`z-[9999] ${
              isMobile ? "fixed bottom-0 left-0 right-0" : "w-80"
            }`}
            style={isMobile ? {} : tooltipStyle}
          >
            <div className={`glass-panel p-5 ${isMobile ? "rounded-t-2xl rounded-b-none" : ""}`}>
              {/* Close */}
              <button
                onClick={skipTour}
                className="absolute top-4 right-4 p-1 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Step counter */}
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-2">
                {currentStep + 1} / {steps.length}
              </p>

              {/* Content */}
              <h3 className="text-base font-semibold text-white mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  Skip
                </button>

                <button
                  onClick={() => nextStep(steps.length)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                >
                  {isLastStep ? "Done" : "Next"}
                  {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
