import { Syne } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
});

export const metadata = {
  title: 'FredoFlow — Auth',
};

export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          width: '42%',
          minHeight: '100vh',
          background: '#0f0f14',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.13)',
            filter: 'blur(65px)',
            top: '38%',
            left: '8%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Second orb — emerald top-left */}
        <div
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(52,211,153,0.07)',
            filter: 'blur(55px)',
            top: '-40px',
            left: '-40px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ── LOGO ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#6366f1',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 4L4 8l8 4 8-4-8-4z" />
                <path d="M4 12l8 4 8-4" />
                <path d="M4 16l8 4 8-4" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '20px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.3px',
              }}
            >
              FredoFlow
            </span>
          </div>
        </div>

        {/* ── HERO TEXT ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              margin: '0 0 14px',
              letterSpacing: '-0.5px',
            }}
          >
            Where teams
            <br />
            <span style={{ color: '#818cf8' }}>flow together</span>
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.48)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            The premium hub for teams to align, track, and succeed in real time.
          </p>
        </div>

        {/* ── FEATURE PILLS ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
          }}
        >
          {[
            { dot: '#818cf8', text: 'Real-time workspace collaboration' },
            { dot: '#34d399', text: 'Kanban boards & goal tracking' },
            { dot: '#fbbf24', text: 'Live announcements & @mentions' },
          ].map(({ dot, text }) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.22)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: dot,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          flex: 1,
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '56px 52px',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}