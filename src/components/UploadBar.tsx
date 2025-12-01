interface UploadBarProps {
  onClick?: () => void;
}

export function UploadBar({ onClick }: UploadBarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 z-50 h-20 w-[90%] max-w-2xl -translate-x-1/2 transform">
      <div className="flex h-full items-center rounded-full border border-white/10 bg-[#09090b]/80 px-6 shadow-2xl backdrop-blur-2xl">
        <div
          onClick={onClick}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-dashed border-white/20 text-xs font-mono uppercase tracking-wide text-muted-foreground transition-colors hover:bg-white/5"
        >
          Upload Demo (MP3)
        </div>
      </div>
    </div>
  );
}
