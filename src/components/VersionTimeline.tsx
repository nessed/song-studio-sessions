import { useState } from "react";
import { GitBranch, Upload, Check, Clock, Loader2 } from "lucide-react";
import { SongVersion } from "@/hooks/useSongVersions";
import { formatDistanceToNow } from "date-fns";

interface VersionTimelineProps {
  versions: SongVersion[];
  currentVersion: SongVersion | null;
  onSelectVersion: (version: SongVersion) => void;
  onUploadVersion: (file: File, description: string) => Promise<void>;
  isUploading: boolean;
}

export function VersionTimeline({
  versions,
  currentVersion,
  onSelectVersion,
  onUploadVersion,
  isUploading,
}: VersionTimelineProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsScanning(true);
    
    // Simulate audio scanning animation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsScanning(false);

    const description = `Mix v${versions.length + 1}`;
    await onUploadVersion(file, description);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Mock diff data (would come from audio analysis in production)
  const getMockDiff = (version: SongVersion) => {
    const diffs = [
      "Vocals +2dB",
      "Bass EQ adjusted",
      "Added reverb",
      "Compressed drums",
      "Pan adjustments",
    ];
    return diffs[version.version_number % diffs.length];
  };
//cc tewq
  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-white/40" />
          <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">
            Version History
          </h3>
        </div>
        <span className="text-xs text-white/30 font-mono">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Upload Zone */}
      <label
        className={`block mb-4 cursor-pointer transition-all duration-300 ${
          dragOver ? "scale-[1.02]" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading || isScanning}
        />
        <div
          className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
            dragOver
              ? "border-indigo-400 bg-indigo-400/10"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
          <div className="absolute inset-0 border border-dashed border-white/10 rounded-xl" />
          
          <div className="relative px-4 py-6 flex flex-col items-center gap-2">
            {isScanning ? (
              <>
                <div className="relative">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <div className="absolute inset-0 blur-md bg-indigo-400/30 animate-pulse" />
                </div>
                <span className="text-sm text-indigo-400 font-medium">
                  Scanning audio...
                </span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <span className="text-sm text-white/40">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-white/30" />
                <span className="text-sm text-white/40">
                  Drop new mix or click to upload
                </span>
              </>
            )}
          </div>
        </div>
      </label>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {/* Versions */}
        <div className="space-y-3">
          {versions.map((version, index) => {
            const isCurrent = currentVersion?.id === version.id;
            
            return (
              <button
                key={version.id}
                onClick={() => onSelectVersion(version)}
                className={`relative w-full text-left pl-8 pr-4 py-3 rounded-xl transition-all duration-200 group ${
                  isCurrent
                    ? "bg-white/[0.08] border border-white/10"
                    : "hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                {/* Timeline node */}
                <div
                  className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all ${
                    isCurrent
                      ? "bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      : "bg-white/20 group-hover:bg-white/40"
                  }`}
                >
                  {isCurrent && (
                    <Check className="w-2 h-2 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isCurrent ? "text-white" : "text-white/70"}`}>
                        {version.description || `Mix v${version.version_number}`}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-400 font-bold tracking-wide">
                          CURRENT
                        </span>
                      )}
                    </div>
                    
                    {/* Mock diff badge */}
                    {index > 0 && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400/80 font-mono">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        {getMockDiff(version)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-white/30">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  </div>
                </div>
              </button>
            );
          })}

          {versions.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              No versions yet. Upload your first mix above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
