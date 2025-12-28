// Audio analyzer worker - runs on background thread
// This worker receives audio ArrayBuffer and returns peaks

self.onmessage = async (event: MessageEvent) => {
  const { audioData, type } = event.data;
  
  if (type === 'analyze') {
    try {
      // We can't use AudioContext in a worker, so we'll do raw PCM analysis
      // For MP3/audio files, we need to decode first - but workers don't have AudioContext
      // So we'll receive already-decoded PCM data from the main thread
      
      // If we receive raw audio data (PCM Float32Array)
      if (audioData instanceof Float32Array) {
        const channelData = audioData;
        const step = Math.ceil(channelData.length / 100); // 100 bars
        const peaks: number[] = [];

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

        // Normalize
        const maxPeak = Math.max(...peaks) || 1;
        const normalizedPeaks = peaks.map(p => p / maxPeak);
        
        self.postMessage({ type: 'result', peaks: normalizedPeaks });
      } else {
        self.postMessage({ type: 'error', message: 'Invalid audio data format' });
      }
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) });
    }
  }
};

export {};
