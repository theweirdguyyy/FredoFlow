export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#222222] selection:bg-accent/30">
      {/* Left Panel: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0a0a0c] p-16 text-white flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `radial-gradient(#6366f1 0.5px, transparent 0.5px)`, 
            backgroundSize: '24px 24px' 
          }} 
        />
        
        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">FredoFlow</h1>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="relative z-10 max-w-sm">
          <h2 className="text-5xl font-black leading-[1.1] mb-6">
            Where teams <br />
            <span className="text-indigo-400">flow together</span>
          </h2>
          <p className="text-lg text-zinc-500 font-medium leading-relaxed">
            Goals, announcements, and action items — all in real time.
          </p>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-3">
          {[
            { text: 'Real-time workspace collaboration', dot: 'bg-indigo-500' },
            { text: 'Kanban boards & goal tracking', dot: 'bg-emerald-400' },
            { text: 'Live announcements & @mentions', dot: 'bg-orange-400' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${feature.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
              <span className="text-sm font-semibold text-zinc-300">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#1c1c1c] dark:bg-[#1c1c1c] transition-colors duration-300">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}

