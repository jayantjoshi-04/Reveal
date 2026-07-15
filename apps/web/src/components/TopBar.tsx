import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';

export function TopBar({ doc }: { doc?: string }): JSX.Element {
  const { name, role, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <span className="text-[13px] font-bold uppercase tracking-[0.28em] text-slate-900">
          Re<span className="text-accent">veal</span>
          {doc ? <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">· {doc}</span> : null}
        </span>
        <div className="flex items-center gap-4">
          {name ? <span className="text-[13px] text-slate-500">{name}</span> : null}
          {role ? (
            <button
              className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700"
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
    </header>
  );
}
