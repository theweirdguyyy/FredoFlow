export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-indigo-600">FF</span>
            </div>
            <span>FredoFlow</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            The future of team <br />
            <span className="text-indigo-200">collaboration</span> is here.
          </h1>
          <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
            FredoFlow helps high-performance teams align on goals, track milestones, 
            and celebrate success in a single, premium hub.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-indigo-200">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span>Trusted by 5,000+ teams worldwide</span>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
