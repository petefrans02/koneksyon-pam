export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <span className="text-lg">✝</span>
          </div>
        </div>
        <p className="text-white/40 text-sm animate-pulse">Chargement…</p>
      </div>
    </div>
  );
}
