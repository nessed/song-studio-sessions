export function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08080a]">
      <div
        className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse"
        style={{ boxShadow: "0 0 18px 2px rgba(255,255,255,0.18)" }}
      />
    </div>
  );
}
