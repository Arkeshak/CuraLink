// UrgencyBadge — four-tier clinical triage badge
// Always pairs icon + text label for accessibility
// Emergency badge pulses; respects prefers-reduced-motion

export type UrgencyLevel = 'Low' | 'Monitor' | 'See Doctor Soon' | 'Emergency';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  score?: number;
}

const CONFIG: Record<UrgencyLevel, {
  className: string;
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Low: {
    className: 'badge-low',
    icon: '✓',
    label: 'Low urgency',
    color: '#2F9E44',
    bgColor: '#EBFBEE',
    borderColor: '#8CE99A',
  },
  Monitor: {
    className: 'badge-monitor',
    icon: '◉',
    label: 'Monitor',
    color: '#E8A317',
    bgColor: '#FFF9DB',
    borderColor: '#FFD43B',
  },
  'See Doctor Soon': {
    className: 'badge-soon',
    icon: '!',
    label: 'See a doctor soon',
    color: '#D9722C',
    bgColor: '#FFF3ED',
    borderColor: '#FFC59E',
  },
  Emergency: {
    className: 'badge-emergency badge-emergency-pulse',
    icon: '!!',
    label: 'Emergency',
    color: '#D64545',
    bgColor: '#FFF5F5',
    borderColor: '#F5A6A6',
  },
};

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: '0.7rem', padding: '0.15rem 0.5rem' },
  md: { fontSize: '0.75rem', padding: '0.2rem 0.65rem' },
  lg: { fontSize: '0.875rem', padding: '0.35rem 0.875rem', fontWeight: 700 },
};

export default function UrgencyBadge({ level, size = 'md', showScore, score }: UrgencyBadgeProps) {
  const cfg = CONFIG[level];

  return (
    <span
      className={`badge ${cfg.className}`}
      style={SIZE_STYLES[size]}
      role="status"
      aria-label={cfg.label}
    >
      <span aria-hidden="true" style={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.05em' }}>
        {cfg.icon}
      </span>
      {level}
      {showScore && score !== undefined && (
        <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 2 }}>
          {' '}({Math.round(score * 100)}%)
        </span>
      )}
    </span>
  );
}

// Larger display version with radial gauge for triage screen
export function UrgencyGauge({ level, score }: { level: UrgencyLevel; score: number }) {
  const cfg = CONFIG[level];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * score;
  const gap = circumference - filled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <svg width={140} height={140} viewBox="0 0 140 140" aria-hidden="true">
        {/* Track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="var(--cl-border)"
          strokeWidth="10"
        />
        {/* Filled arc */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          transform="rotate(-90 70 70)"
          style={{
            transition: 'stroke-dasharray 0.8s ease',
            ...(level === 'Emergency' ? { filter: 'drop-shadow(0 0 4px rgba(214,69,69,0.5))' } : {}),
          }}
        />
        {/* Score text */}
        <text x="70" y="64" textAnchor="middle" fontSize="18" fontWeight="700" fill={cfg.color} fontFamily="'IBM Plex Sans', sans-serif">
          {Math.round(score * 100)}
        </text>
        <text x="70" y="80" textAnchor="middle" fontSize="10" fill="var(--cl-muted)" fontFamily="'Inter', sans-serif">
          / 100
        </text>
      </svg>
      <UrgencyBadge level={level} size="lg" />
    </div>
  );
}
