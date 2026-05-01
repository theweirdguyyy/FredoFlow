export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 p-4 sm:p-12 font-['DM_Sans']">
      {/* Main Container Card: Fixed 620px Height on Desktop */}
      <div className="min-h-[620px] md:h-[620px] max-w-[980px] w-full bg-white rounded-[2rem] overflow-hidden border border-zinc-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] flex flex-col md:flex-row">
        
        {/* Left Section: Dark Immersive Panel (44% width) */}
        <div className="hidden md:flex md:w-[44%] bg-[#0f0f14] p-12 text-white flex-col justify-between relative overflow-hidden shrink-0">
          {/* Subtle Geometric Grid Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]" 
            style={{ 
              backgroundImage: `
                linear-gradient(to right, rgba(99,102,241,0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99,102,241,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px'
            }} 
          />
          
          {/* Blurred Accent Glow Orb */}
          <div className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-[100px] z-0 pointer-events-none" />
          
          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex flex-col gap-3">
              <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight font-['Syne']">FredoFlow</h1>
            </div>
          </div>

          {/* Hero Text */}
          <div className="relative z-10">
            <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight font-['Syne']">
              Where teams <br />
              <span className="text-indigo-400">flow together</span>
            </h2>
            <p className="mt-4 text-xs text-zinc-500 font-semibold leading-relaxed max-w-[200px] uppercase tracking-wider opacity-80">
              Goals, announcements, and action items — all in real time.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="relative z-10 space-y-2.5">
            {[
              { text: 'Real-time workspace collaboration', dot: 'bg-indigo-500' },
              { text: 'Kanban boards & goal tracking', dot: 'bg-emerald-400' },
              { text: 'Live announcements & @mentions', dot: 'bg-amber-500' },
            ].map((feature, i) => (
              <div key={feature.text} className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md w-fit transition-all hover:bg-indigo-500/10">
                <div className={`w-1.5 h-1.5 rounded-full ${feature.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                <span className="text-[10px] font-bold text-zinc-300 tracking-wider uppercase">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Light Workspace (Flex-grow) */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 overflow-y-auto bg-white">
          <div className="w-full max-w-[340px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}



