import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Common = {
  children: ReactNode;
  variant?: 'solid' | 'outline';
  className?: string;
};

const base =
  'group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-[15px] font-medium tracking-tight0 ' +
  'transition-all duration-300 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40';

const variants = {
  solid:
    'bg-teal text-cream shadow-sm hover:-translate-y-0.5 hover:bg-[#0a3f40] hover:shadow-lg active:translate-y-0',
  outline:
    'border border-teal/40 text-teal hover:-translate-y-0.5 hover:border-teal hover:bg-teal hover:text-cream active:translate-y-0',
};

const arrow = (
  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
);

/** Internal-route button. */
export function ButtonLink({
  to,
  children,
  variant = 'solid',
  className = '',
  withArrow = true,
}: Common & { to: string; withArrow?: boolean }) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {withArrow && arrow}
    </Link>
  );
}

/** External / anchor button. */
export function ButtonAnchor({
  href,
  children,
  variant = 'solid',
  className = '',
  withArrow = true,
}: Common & { href: string; withArrow?: boolean }) {
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {withArrow && arrow}
    </a>
  );
}
