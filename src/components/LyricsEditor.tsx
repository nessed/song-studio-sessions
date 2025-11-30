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
    <textarea
      defaultValue={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Write your lyrics here...

Verse 1
...

Chorus
...

Verse 2
..."
      className="lyrics-editor"
    />
  );
}