import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../auth/AuthShell.js';
import { Card } from '../../components/ui.js';

export function Welcome(): JSX.Element {
  const nav = useNavigate();
  const paths = [
    { to: '/signin', title: 'Sign In', sub: 'Continue your Design Signature', icon: '↩', primary: false },
    { to: '/signup', title: 'Sign Up', sub: 'Create your account and begin', icon: '✦', primary: true },
    { to: '/admin/signin', title: 'Admin Sign In', sub: 'Manage the instrument & reviews', icon: '⚙', primary: false },
  ];
  return (
    <AuthShell wide>
      <div className="mb-10 text-center">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Reveal · Design Diagnostic</div>
        <h1 className="font-serif text-4xl leading-tight text-slate-900 md:text-5xl">
          See the designer your <span className="italic text-accent">work already shows.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-500">
          A hybrid assessment that reads how you design — from what you do, not just what you say — and returns a
          high-fidelity Design Signature.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {paths.map((p) => (
          <button
            key={p.to}
            onClick={() => nav(p.to)}
            className="press group text-left focus:outline-none"
          >
            <Card className={`h-full p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift ${p.primary ? 'ring-2 ring-accent/20' : ''}`}>
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg ${p.primary ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500'}`}>
                {p.icon}
              </div>
              <div className="text-[15px] font-semibold text-slate-900">{p.title}</div>
              <div className="mt-1 text-[13px] leading-snug text-slate-500">{p.sub}</div>
              <div className={`mt-4 text-sm font-medium ${p.primary ? 'text-accent' : 'text-slate-400'} transition-transform group-hover:translate-x-0.5`}>
                Continue →
              </div>
            </Card>
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
