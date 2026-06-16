// Inline SVG illustrations — no external dependencies needed

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl -z-10" />

      {/* Main card */}
      <div className="relative bg-white rounded-3xl shadow-card-hover border border-indigo-50 p-6 space-y-5 animate-float">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">Mira</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Chat bubble */}
        <div className="bg-indigo-50 rounded-2xl rounded-tl-sm p-4">
          <p className="text-sm text-indigo-900 leading-relaxed">
            Hi there 💙 I'm here to listen. How are you feeling today?
          </p>
        </div>

        {/* Mood bar */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Today's mood</p>
          <div className="flex gap-2">
            {["😢", "😔", "😐", "🙂", "😄"].map((emoji, i) => (
              <div
                key={emoji}
                className={`flex-1 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${i === 3 ? "bg-indigo-100 ring-2 ring-indigo-400 scale-105" : "bg-gray-50"}`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-semibold text-orange-700">7-day streak!</span>
          </div>
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Keep going</span>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card border border-purple-100 px-3 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "0.5s" }}>
        <span className="text-lg">✨</span>
        <span className="text-xs font-medium text-purple-700">AI Insights</span>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card border border-indigo-100 px-3 py-2 flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
        <span className="text-lg">📊</span>
        <span className="text-xs font-medium text-indigo-700">Mood trends</span>
      </div>
    </div>
  );
}

export function MindfulnessIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
      <circle cx="100" cy="100" r="80" fill="#eef2ff" />
      <circle cx="100" cy="100" r="60" fill="#e0e7ff" />
      <circle cx="100" cy="100" r="40" fill="#c7d2fe" />
      <circle cx="100" cy="100" r="20" fill="#818cf8" />
      <path d="M100 60 C100 60, 120 80, 120 100 C120 120, 100 140, 100 140 C100 140, 80 120, 80 100 C80 80, 100 60, 100 60Z" fill="#6366f1" opacity="0.6" />
    </svg>
  );
}
