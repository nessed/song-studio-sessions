import AudioPlayerLib from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { UploadBar } from "./UploadBar";

interface AudioPlayerProps {
  url?: string;
  onTimeUpdate?: (time: number) => void;
}

export function AudioPlayer({ url, onTimeUpdate }: AudioPlayerProps) {
  if (!url) {
    return <UploadBar />;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[95%] max-w-xl -translate-x-1/2 transform overflow-hidden rounded-full border border-white/10 bg-[#09090b]/40 px-2 py-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
      <AudioPlayerLib
        src={url}
        autoPlay
        layout="horizontal-reverse"
        showJumpControls={false}
        showDownloadProgress={false}
        showFilledProgress
        customAdditionalControls={[]}
        customVolumeControls={[]}
        onListen={(e) => onTimeUpdate?.(e.target.currentTime)}
        listenInterval={400}
      />
    </div>
  );
}
