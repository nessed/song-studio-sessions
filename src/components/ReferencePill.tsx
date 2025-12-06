import { useState } from "react";
import { ExternalLink, Link2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReferencePillProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReferencePill({ value, onChange }: ReferencePillProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onChange(inputValue);
    setIsEditing(false);
  };

  const handleClear = () => {
    onChange("");
    setInputValue("");
  };

  const truncateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace("www.", "");
    } catch {
      return url.substring(0, 20) + "...";
    }
  };

  // Empty state
  if (!value && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        <Link2 className="w-3.5 h-3.5" />
        <span>+ Add Reference</span>
      </button>
    );
  }

  // Editing state
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1 max-w-xs">
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="https://..."
            autoFocus
            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 font-mono"
          />
        </div>
        <button
          onClick={handleSave}
          className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setInputValue(value);
          }}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // Display state
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="inline-flex items-center gap-2"
      >
        <div className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10" />
          
          <Link2 className="relative w-3.5 h-3.5 text-white/50" />
          <span className="relative text-sm text-white/70 font-mono">
            {truncateUrl(value)}
          </span>
          
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-1 -m-1 text-white/40 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          onClick={() => {
            setInputValue(value);
            setIsEditing(true);
          }}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Edit
        </button>
        
        <button
          onClick={handleClear}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </motion.div>
    </AnimatePresence>
  );
}