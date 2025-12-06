import { useEffect, useState } from "react";
import { Link2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReferencePillProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReferencePill({ value, onChange }: ReferencePillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    onChange(draft);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`relative h-10 w-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center transition-all hover:border-white/30 ${value ? "text-white/80" : "text-white/40"}`}
        title={value ? "Reference link" : "Add reference link"}
      >
        <Link2 className="w-4 h-4" />
        {value && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute left-1/2 top-11 -translate-x-1/2 z-30 w-64"
          >
            <div className="relative rounded-xl border border-white/10 bg-[#0b0b0f]/95 backdrop-blur-2xl shadow-2xl p-3">
              <input
                type="url"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="https://reference.link"
                autoFocus
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setDraft(value);
                    setIsOpen(false);
                  }}
                  className="text-[11px] text-white/40 hover:text-white transition-colors px-2 py-1"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 rounded-lg bg-white text-black px-2.5 py-1.5 text-[11px] font-semibold hover:bg-white/90 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
