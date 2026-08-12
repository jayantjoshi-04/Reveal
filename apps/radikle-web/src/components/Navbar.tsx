import { Link, NavLink } from 'react-router-dom';

type NavItemProps = {
  to: string;
  label: string;
  /** Left position class copied from the Figma layout. */
  left: string;
};

function NavItem({ to, label, left }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group absolute top-[70px] ${left} whitespace-nowrap font-sans text-[16px] font-medium tracking-tight0 transition-colors duration-300 ${
          isActive ? 'text-teal' : 'text-ink hover:text-teal'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={`absolute -bottom-1 left-0 h-[1.5px] bg-teal transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

/**
 * Shared top navigation, positioned at the exact Figma coordinates inside the
 * 1440px canvas. Logo -> Home; the four links map to the site sections.
 */
export function Navbar() {
  return (
    <nav className="absolute left-0 top-0 z-40 h-[150px] w-[1440px]">
      <Link
        to="/"
        className="absolute top-[63px] left-[calc(8.33%_+_43.5px)] w-[87px] -translate-x-1/2 text-center font-display text-[24px] font-medium tracking-logo text-black transition-transform duration-300 hover:scale-[1.06] hover:text-teal"
      >
        radikle
      </Link>

      <NavItem to="/about" label="About" left="left-[calc(33.33%_+_7px)]" />
      <NavItem to="/reveal" label="Reveal" left="left-[calc(50%_+_10px)]" />
      <NavItem to="/disha" label="Disha" left="left-[calc(66.67%_+_13px)]" />
      <NavItem to="/discover" label="Discover" left="left-[calc(83.33%_+_17px)]" />
    </nav>
  );
}
