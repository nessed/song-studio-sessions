import { useState, useEffect, useRef } from "react";

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
    const key = url.split("?")[0].slice(-50);
    cache[key] = peaks;
    
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

// Create worker lazily
let workerInstance: Worker | null = null;
function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  
  if (!workerInstance) {
    try {
      // Create inline worker to avoid bundler issues
      const workerCode = `
        self.onmessage = function(event) {
          const { audioData } = event.data;
          try {
            const channelData = new Float32Array(audioData);
            const step = Math.ceil(channelData.length / 100);
            const peaks = [];
            
            for (let i = 0; i < 100; i++) {
              let max = 0;
              const start = i * step;
              const end = Math.min(start + step, channelData.length);
              
              for (let j = start; j < end; j++) {
                const datum = channelData[j];
                const abs = datum < 0 ? -datum : datum;
                if (abs > max) max = abs;
              }
              peaks.push(max);
            }
            
            const maxPeak = Math.max.apply(null, peaks) || 1;
            const normalizedPeaks = peaks.map(function(p) { return p / maxPeak; });
            
            self.postMessage({ type: 'result', peaks: normalizedPeaks });
          } catch (err) {
            self.postMessage({ type: 'error', message: String(err) });
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerInstance = new Worker(URL.createObjectURL(blob));
    } catch {
      return null;
    }
  }
  return workerInstance;
}

export function useAudioAnalyzer(audioUrl: string) {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    
    if (!audioUrl) return;
    
    // Check cache first
    const cachedPeaks = getCachedPeaks(audioUrl);
    if (cachedPeaks) {
      setPeaks(cachedPeaks);
      setIsAnalyzed(true);
      return;
    }
    
    // Reset state
    setPeaks([]);
    setIsAnalyzed(false);

    // Defer to not block render
    const timeoutId = setTimeout(async () => {
      if (!activeRef.current) return;
      
      try {
        const response = await fetch(audioUrl);
        if (!activeRef.current) return;
        
        const arrayBuffer = await response.arrayBuffer();
        if (!activeRef.current) return;
        
        // Decode audio (must be on main thread due to AudioContext)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close();
        
        if (!activeRef.current) return;

        const channelData = audioBuffer.getChannelData(0);
        
        // Try to use Web Worker for peak extraction
        const worker = getWorker();
        
        if (worker) {
          // Transfer to worker
          const dataToSend = new Float32Array(channelData);
          
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'result' && activeRef.current) {
              setPeaks(event.data.peaks);
              setIsAnalyzed(true);
              setPeaksCache(audioUrl, event.data.peaks);
            }
            worker.removeEventListener('message', handleMessage);
          };
          
          worker.addEventListener('message', handleMessage);
          worker.postMessage({ audioData: dataToSend.buffer }, [dataToSend.buffer]);
        } else {
          // Fallback: do it on main thread with chunking
          const step = Math.ceil(channelData.length / 100);
          const newPeaks: number[] = [];

          for (let i = 0; i < 100; i++) {
            let max = 0;
            for (let j = 0; j < step; j++) {
              const datum = channelData[i * step + j];
              if (datum > max) max = datum;
              if (-datum > max) max = -datum;
            }
            newPeaks.push(max);
          }

          const maxPeak = Math.max(...newPeaks) || 1;
          const normalizedPeaks = newPeaks.map(p => p / maxPeak);
          
          if (activeRef.current) {
            setPeaks(normalizedPeaks);
            setIsAnalyzed(true);
            setPeaksCache(audioUrl, normalizedPeaks);
          }
        }
      } catch (err) {
        console.error("Error analyzing audio:", err);
      }
    }, 50);

    return () => { 
      activeRef.current = false; 
      clearTimeout(timeoutId);
    };
  }, [audioUrl]);

  return { peaks, isAnalyzed };
}


