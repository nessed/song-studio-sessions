import { useRef } from "react";

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LyricsEditor({ value, onChange }: LyricsEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleChange = (newValue: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  return (
    <div className="w-full min-h-[500px] bg-[#0a0a0c]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-6 block">
        LYRICS // FREEFORM
      </span>
      <textarea
        defaultValue={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start writing..."
        className="w-full h-full min-h-[400px] bg-transparent border-none resize-none focus:outline-none text-lg text-white/80 leading-relaxed font-sans tracking-wide placeholder:text-white/20"
      />
    </div>
  );
}
