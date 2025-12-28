import { useState, useEffect } from "react";

// Cache peaks in localStorage to avoid re-analyzing the same audio
const PEAKS_CACHE_KEY = "audio-peaks-cache";
const MAX_CACHE_ENTRIES = 50;

function getPeaksCache(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem(PEAKS_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setPeaksCache(url: string, peaks: number[]) {
  try {
    const cache = getPeaksCache();
    // Use URL hash as key to keep it shorter
    const key = url.split("?")[0].slice(-50); // Last 50 chars of base URL
    cache[key] = peaks;
    
    // Limit cache size
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_ENTRIES) {
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
      toRemove.forEach(([k]) => delete cache[k]);
    }
    
    localStorage.setItem(PEAKS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

function getCachedPeaks(url: string): number[] | null {
  try {
    const cache = getPeaksCache();
    const key = url.split("?")[0].slice(-50);
    return cache[key] || null;
  } catch {
    return null;
  }
}

export function useAudioAnalyzer(audioUrl: string) {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;
    
    // Check cache first
    const cachedPeaks = getCachedPeaks(audioUrl);
    if (cachedPeaks) {
      setPeaks(cachedPeaks);
      setIsAnalyzed(true);
      return;
    }
    
    // Reset state when url changes
    setPeaks([]);
    setIsAnalyzed(false);

    let active = true;
    
    // Use setTimeout to defer analysis and not block initial render
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // We need a new AudioContext for decoding
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close(); // Important: Close context to free resources
        
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
          // Cache the result
          setPeaksCache(audioUrl, normalizedPeaks);
        }
      } catch (err) {
        console.error("Error analyzing audio:", err);
      }
    }, 100); // Small delay to let UI render first

    return () => { 
      active = false; 
      clearTimeout(timeoutId);
    };
  }, [audioUrl]);

  return { peaks, isAnalyzed };
}

