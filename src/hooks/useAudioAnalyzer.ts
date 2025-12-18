import { useState, useEffect } from "react";

export function useAudioAnalyzer(audioUrl: string) {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;
    
    // Reset state when url changes
    setPeaks([]);
    setIsAnalyzed(false);

    let active = true;
    const fetchAndAnalyze = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // We need a new AudioContext for decoding
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        if (!active) return;

        // Extract peaks
        const channelData = audioBuffer.getChannelData(0); // Left channel
        const step = Math.ceil(channelData.length / 100); // 100 bars
        const newPeaks = [];

        for (let i = 0; i < 100; i++) {
          let max = 0;
          for (let j = 0; j < step; j++) {
            const datum = channelData[i * step + j];
            if (datum > max) max = datum;
            if (-datum > max) max = -datum;
          }
          newPeaks.push(max);
        }

        // Normalize
        const maxPeak = Math.max(...newPeaks) || 1;
        const normalizedPeaks = newPeaks.map(p => p / maxPeak);
        
        if (active) {
          setPeaks(normalizedPeaks);
          setIsAnalyzed(true);
        }
      } catch (err) {
        console.error("Error analyzing audio:", err);
      }
    };

    fetchAndAnalyze();

    return () => { active = false; };
  }, [audioUrl]);

  return { peaks, isAnalyzed };
}
