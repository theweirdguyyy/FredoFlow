export const metadata = { title: 'FredoFlow — Auth' };

export default function AuthLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
    }}>
      {/* ── LEFT PANEL (hidden on mobile, shown md+) ── */}
      <div className="auth-left-panel" style={{
        width: '42%',
        minHeight: '100vh',
        background: '#0f0f14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Glow orb 1 */}
        <div style={{
          position: 'absolute', width: '280px', height: '280px',
          borderRadius: '50%', background: 'rgba(99,102,241,0.13)',
          filter: 'blur(70px)', top: '35%', left: '5%',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Glow orb 2 */}
        <div style={{
          position: 'absolute', width: '180px', height: '180px',
          borderRadius: '50%', background: 'rgba(52,211,153,0.07)',
          filter: 'blur(55px)', top: '-50px', left: '-40px',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', background: '#6366f1',
              borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M12 4L4 8l8 4 8-4-8-4z" />
                <path d="M4 12l8 4 8-4" />
                <path d="M4 16l8 4 8-4" />
              </svg>
            </div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: '20px',
              fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px',
            }}>FredoFlow</span>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 3vw, 36px)',
            fontWeight: 800, lineHeight: 1.15, color: '#fff',
            margin: '0 0 14px', letterSpacing: '-0.5px',
          }}>
            Where teams<br />
            <span style={{ color: '#818cf8' }}>flow together</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, margin: 0 }}>
            The premium hub for teams to align, track, and succeed in real time.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {[
            { dot: '#818cf8', text: 'Real-time workspace collaboration' },
            { dot: '#34d399', text: 'Kanban boards & goal tracking' },
            { dot: '#fbbf24', text: 'Live announcements & @mentions' },
          ].map(({ dot, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.22)',
              borderRadius: '8px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 52px)',
      }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

