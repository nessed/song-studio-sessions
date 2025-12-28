import { useState, useEffect, useCallback } from "react";

const getStorageKey = (tourId: string) => `onboarding_${tourId}_completed`;

export function useOnboardingTour(tourId: string = "main") {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const storageKey = getStorageKey(tourId);

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === "true";
    setHasCompletedOnboarding(completed);
    
    // Auto-start tour if not completed
    if (!completed) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsActive(true), 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback((totalSteps: number) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete tour
      localStorage.setItem(storageKey, "true");
      setHasCompletedOnboarding(true);
      setIsActive(false);
    }
  }, [currentStep, storageKey]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setHasCompletedOnboarding(true);
    setIsActive(false);
  }, [storageKey]);

  const completeTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setHasCompletedOnboarding(true);
    setIsActive(false);
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasCompletedOnboarding(false);
    setCurrentStep(0);
  }, [storageKey]);

  return {
    hasCompletedOnboarding,
    currentStep,
    isActive,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
  };
}
