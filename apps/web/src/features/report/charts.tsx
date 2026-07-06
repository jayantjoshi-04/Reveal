/** Inline-SVG chart primitives for the Design Signature (no chart library). */

const CAP_COLOR: Record<string, string> = {
  empathy: '#EC6540',
  analytical: '#193E90',
  narrative: '#D6418F',
  conviction: '#E8A838',
  systems_sensing: '#46C2D6',
  aesthetic: '#8a96aa',
};

export function capColor(name: string): string {
  return CAP_COLOR[name] ?? '#EC6540';
}

/** A capacity ring gauge (value 0–100). */
export function Gauge({ value, label, sub, color }: { value: number; label: string; sub?: string; color: string }): JSX.Element {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex-1 text-center" style={{ minWidth: 74 }}>
      <svg viewBox="0 0 90 90" className="mx-auto h-[84px] w-[84px]">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#eee" strokeWidth="9" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="51" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="17" fontWeight="500" fill="#1A1A18">
          {Math.round(value)}
        </text>
      </svg>
      <div className="mt-0.5 font-mono text-[9px] uppercase leading-tight text-mid">
        <b className="block text-[9.5px] text-ink">{label}</b>
        {sub}
      </div>
    </div>
  );
}

/** A horizontal bar (0–1). */
export function Bar({ label, value, color = '#EC6540', note }: { label: string; value: number; color?: string; note?: string }): JSX.Element {
  return (
    <div className="grid grid-cols-[96px_1fr_36px] items-center gap-2.5 text-xs">
      <span className="text-[#3a3a34]">{label}</span>
      <span className="h-[9px] overflow-hidden rounded-full bg-rule">
        <span className="block h-full rounded-full" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
      </span>
      <span className="text-right font-mono text-[10px] text-mid">{note ?? value.toFixed(2)}</span>
    </div>
  );
}

/** Reach + gap bullet: now (bar) → target (marker). */
export function Bullet({ label, now, target }: { label: string; now: number; target: number }): JSX.Element {
  return (
    <div className="mb-3 grid grid-cols-[104px_1fr_46px] items-center gap-3">
      <span className="text-xs text-[#d4dcf0]">{label}</span>
      <span className="relative h-[11px] rounded-full" style={{ background: 'rgba(255,255,255,.12)' }}>
        <span className="absolute left-0 top-0 h-full rounded-full bg-steel" style={{ width: `${now * 100}%` }} />
        <span className="absolute top-[-3px] h-[17px] w-[3px] rounded bg-cyan" style={{ left: `${target * 100}%` }} />
      </span>
      <span className="text-right font-mono text-[9.5px] text-[#9fb0d8]">
        {Math.round(now * 100)}→{Math.round(target * 100)}
      </span>
    </div>
  );
}

const DIR_X: Record<string, number> = { impact: 0.84, commercial: 0.18, mixed: 0.5 };

/** The direction-vs-market axis: pays · wish · now on one line. */
export function MarketAxis({ wish, actual, pays }: { wish: string; actual: string; pays: string }): JSX.Element {
  const wx = DIR_X[wish] ?? 0.5;
  const ax = DIR_X[actual] ?? 0.5;
  const px = DIR_X[pays] ?? 0.5;
  const X = (t: number): number => 90 + t * 550;
  return (
    <svg viewBox="0 0 720 150" className="w-full">
      <line x1="90" y1="80" x2="640" y2="80" stroke="#3a5391" strokeWidth="1.5" />
      <text x="90" y="55" fill="#9fb0d8" fontFamily="DM Mono, monospace" fontSize="10">← WHAT YOU THINK PAYS</text>
      <text x="640" y="55" fill="#9fb0d8" fontFamily="DM Mono, monospace" fontSize="10" textAnchor="end">THE WORK YOU LOVE →</text>
      <circle cx={X(px)} cy="80" r="8" fill="#8a96aa" />
      <text x={X(px)} y="105" fill="#8a96aa" fontFamily="DM Mono, monospace" fontSize="9" textAnchor="middle">pays</text>
      <circle cx={X(wx)} cy="80" r="11" fill="none" stroke="#46C2D6" strokeWidth="2.5" />
      <text x={X(wx)} y="105" fill="#46C2D6" fontFamily="DM Mono, monospace" fontSize="9" textAnchor="middle">wish</text>
      <circle cx={X(ax)} cy="80" r="13" fill="#E8A838" />
      <text x={X(ax)} y="34" fill="#E8A838" fontFamily="DM Sans" fontSize="13" fontWeight="700" textAnchor="middle">NOW</text>
    </svg>
  );
}

/** Project pattern scatter (commercial↔impact × supporting↔lead). */
export function ProjectScatter({ leadImpact, outlier }: { leadImpact: string[]; outlier: string | null }): JSX.Element {
  return (
    <svg viewBox="0 0 720 240" className="w-full">
      <line x1="60" y1="125" x2="680" y2="125" stroke="#E4E0D8" strokeWidth="1.5" />
      <line x1="370" y1="26" x2="370" y2="214" stroke="#E4E0D8" strokeWidth="1.5" />
      <text x="64" y="228" fill="#a7a79e" fontFamily="DM Mono, monospace" fontSize="10">← COMMERCIAL</text>
      <text x="676" y="228" fill="#a7a79e" fontFamily="DM Mono, monospace" fontSize="10" textAnchor="end">IMPACT →</text>
      <text x="378" y="36" fill="#a7a79e" fontFamily="DM Mono, monospace" fontSize="10">↑ YOU LEAD</text>
      {leadImpact.slice(0, 5).map((t, i) => (
        <g key={t}>
          <circle cx={520 + i * 28} cy={70 + i * 14} r={i === 0 ? 13 : 9} fill={i === 0 ? '#EC6540' : '#193E90'} />
          <text x={520 + i * 28} y={54 + i * 14} fill="#1A1A18" fontFamily="DM Sans" fontSize="10" textAnchor="middle">{t}</text>
        </g>
      ))}
      {outlier ? (
        <g>
          <circle cx="250" cy="120" r="8" fill="#8a96aa" />
          <text x="250" y="106" fill="#3a3a34" fontFamily="DM Sans" fontSize="10" textAnchor="middle">{outlier}</text>
        </g>
      ) : null}
    </svg>
  );
}
