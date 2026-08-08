/** A small V1 / V2 switch. V2 routes to the deterministic-engine experience. */
import { useNavigate } from 'react-router-dom';
import { useVersion } from '../store/version.js';

export function VersionToggle({ className = '' }: { className?: string }): JSX.Element {
  const version = useVersion((s) => s.version);
  const set = useVersion((s) => s.set);
  const nav = useNavigate();

  const choose = (v: 'v1' | 'v2'): void => {
    set(v);
    nav(v === 'v2' ? '/v2' : '/');
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white/70 p-0.5 text-[12px] font-medium shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 ${className}`}
      role="tablist"
      aria-label="Product version"
    >
      {(['v1', 'v2'] as const).map((v) => {
        const on = version === v;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => choose(v)}
            className={`rounded-full px-3 py-1 transition-colors ${
              on
                ? 'bg-accent text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {v === 'v1' ? 'V1' : 'V2 · 2.0'}
          </button>
        );
      })}
    </div>
  );
}

/** Fixed, always-available floating toggle for pages without their own nav. */
export function FloatingVersionToggle(): JSX.Element {
  return <VersionToggle className="fixed bottom-5 right-5 z-50" />;
}
