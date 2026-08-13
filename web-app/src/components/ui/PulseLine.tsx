// PulseLine — heartbeat/ECG SVG animation used as AI loading indicator and divider
// Usage: <PulseLine /> for loading, <PulseLine divider /> for section break

interface PulseLineProps {
  divider?: boolean;
  label?: string;
  width?: number;
  color?: string;
}

export default function PulseLine({
  divider = false,
  label,
  width = 120,
  color = 'var(--cl-teal)',
}: PulseLineProps) {
  // ECG/heartbeat path
  const path = 'M0,20 L20,20 L28,4 L36,36 L44,20 L56,20 L64,8 L72,32 L80,20 L120,20';

  if (divider) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.25rem 0',
          color: 'var(--cl-subtle)',
        }}
        aria-hidden="true"
      >
        <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
        <svg
          width={60}
          height={24}
          viewBox="0 0 120 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={path}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </svg>
        {label && <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{label}</span>}
        <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
      </div>
    );
  }

  return (
    <div
      className="ai-loading"
      role="status"
      aria-label="Analysing, please wait"
    >
      <svg
        width={width}
        height={32}
        viewBox="0 0 120 40"
        fill="none"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <style>{`
            @keyframes ecgDraw {
              0%   { stroke-dashoffset: 300; opacity: 0.2; }
              30%  { opacity: 1; }
              100% { stroke-dashoffset: -300; opacity: 0.2; }
            }
            @media (prefers-reduced-motion: reduce) {
              .ecg-path { animation: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
            }
          `}</style>
        </defs>
        <path
          className="ecg-path"
          d={path}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset="300"
          style={{ animation: 'ecgDraw 1.4s ease-in-out infinite' }}
        />
      </svg>
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>
        Analysing…
      </span>
    </div>
  );
}
