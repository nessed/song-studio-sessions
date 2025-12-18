import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        {/* Minimal Spinner */}
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    </div>
  );
}
