import { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MoodTagsInputProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

// Uniform neutral tag style
const tagStyle = "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90";

export function MoodTagsInput({ tags, onUpdate }: MoodTagsInputProps) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdate([...tags, newTag.trim()]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const handleRemove = (tag: string) => {
    onUpdate(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTag("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence mode="popLayout">
        {tags.map((tag, index) => {
          return (
            <motion.span 
              key={tag} 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border backdrop-blur-sm group transition-all cursor-default ${tagStyle}`}
            >
              <span className="mr-1.5">{tag}</span>
              <button
                onClick={() => handleRemove(tag)}
                className="opacity-50 hover:opacity-100 transition-opacity p-0.5 -mr-1 rounded-full hover:bg-white/10"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
          >
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTag.trim()) setIsAdding(false);
              }}
              placeholder="Tag name..."
              autoFocus
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all w-28"
            />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdding(true)}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/40 rounded-full border border-dashed border-white/10 hover:border-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all group overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/5 blur-sm" />
            <Plus className="relative w-3 h-3 group-hover:rotate-90 transition-transform" />
            <span className="relative">Add vibe</span>
            <Sparkles className="relative w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity text-white/50" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
