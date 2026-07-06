import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';

export function TopBar({ doc }: { doc?: string }): JSX.Element {
  const { name, role, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-6 py-3 md:px-9">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-white">
        <span className="text-orange">Reveal</span>
        {doc ? <span className="text-[#666]"> · {doc}</span> : null}
      </div>
      <div className="flex items-center gap-4">
        {name ? <span className="font-mono text-[10px] text-[#8a8a82]">{name} · {role}</span> : null}
        {role ? (
          <button
            className="font-mono text-[10px] uppercase tracking-wide text-[#8a8a82] hover:text-white"
            onClick={() => {
              signOut();
              nav('/');
            }}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </div>
  );
}
