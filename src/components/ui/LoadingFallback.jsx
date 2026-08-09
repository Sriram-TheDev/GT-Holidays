// src/components/ui/LoadingFallback.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Suspense boundary fallback shown while a lazy-loaded route chunk is fetching.
// Matches the app's dark background exactly so there's no flash of white.
// ─────────────────────────────────────────────────────────────────────────────

export default function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--color-base, #0B0C10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}
      role="status"
      aria-label="Loading page"
    >
      {/* Pulsing logo mark */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'rgba(0,255,163,0.08)',
          border: '1px solid rgba(0,255,163,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'vi-pulse 1.6s ease-in-out infinite',
        }}
      >
        {/* Simple compass SVG — no external dependency */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent-green, #00FFA3)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>

      {/* Shimmer bar */}
      <div
        style={{
          width: 120,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,163,0.4), transparent)',
            animation: 'vi-shimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes vi-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes vi-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
