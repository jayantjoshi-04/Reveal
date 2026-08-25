import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth.js';
import { LogoLink } from '../../components/Logo.js';

const NAV = [
  { to: '/admin', label: 'Overview', icon: '▦', end: true },
  { to: '/admin/reports', label: 'Reports', icon: '▤' },
  { to: '/admin/students', label: 'Students', icon: '☺' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export function AdminLayout(): JSX.Element {
  const { name, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-white/5">
      <div className="mx-auto flex max-w-7xl">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card px-4 py-6 md:flex">
          <div className="px-1">
            <LogoLink markClass="h-6 w-6" wordClass="text-[17px]" />
            <div className="mt-1 pl-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">Admin console</div>
          </div>
          <nav className="mt-8 flex-1 space-y-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-accent-soft text-accent-dark' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`
                }
              >
                <span className="w-4 text-center opacity-70">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-100 dark:border-white/10 pt-4">
            <div className="px-3 text-[13px] font-medium text-slate-700 dark:text-slate-200">{name}</div>
            <button className="mt-2 px-3 text-[13px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => { signOut(); nav('/'); }}>Sign out</button>
          </div>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }): JSX.Element {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">{title}</h1>
        {sub ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}
