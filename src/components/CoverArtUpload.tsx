import { useRef, useState } from "react";

interface CoverArtUploadProps {
  currentArt?: string;
  onUpload: (dataUrl: string) => void;
}

export function CoverArtUpload({ currentArt, onUpload }: CoverArtUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onUpload(dataUrl);
        setLoading(false);
      };
      reader.onerror = () => {
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        className="cover-art w-32 h-32 relative group cursor-pointer overflow-hidden"
        disabled={loading}
      >
        {currentArt ? (
          <img
            src={currentArt}
            alt="Cover art"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">No cover</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
          <span className="text-xs text-transparent group-hover:text-foreground transition-colors">
            {loading ? "Loading…" : "Upload"}
          </span>
        </div>
      </button>
    </div>
  );
}
