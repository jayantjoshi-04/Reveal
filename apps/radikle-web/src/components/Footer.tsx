import type { ReactNode } from 'react';
import { Asset } from './Asset';
import { A } from '../lib/assets';

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group relative inline-block w-fit text-ink transition-colors duration-300 hover:text-teal"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-teal transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

/**
 * Shared "reach us!" footer band, anchored to the bottom of the page canvas.
 * Reused across every page, so pages of different heights all get the same
 * footer without re-declaring coordinates. `variant` picks the band colour —
 * sky-blue (most pages) or purple (Reveal), matching the Figma.
 */
export function Footer({ variant = 'sky' }: { variant?: 'sky' | 'violet' }) {
  const band = variant === 'violet' ? 'bg-violet/60' : 'bg-sky/60';
  return (
    <footer className="absolute bottom-0 left-0 h-[484px] w-[1440px] font-sans text-[16px] tracking-tight0">
      {/* colour band (bleeds past the canvas edges, clipped by the frame) */}
      <div className={`absolute left-[-76px] top-0 h-[484px] w-[1522px] ${band}`} />

      {/* hand-drawn divider line (real asset drops in here) */}
      <div className="absolute left-[-34px] top-[360px] h-[17px] w-[1554px]">
        <Asset src={A.lines} alt="lines" placeholder="line" />
      </div>

      {/* heading */}
      <h2 className="absolute left-[calc(16.67%_-_17px)] top-[78px] font-display text-[48px] font-semibold tracking-tightest text-teal">
        reach us!
      </h2>

      {/* contact column */}
      <address className="absolute left-[calc(16.67%_-_15px)] top-[173px] not-italic leading-[1.5] text-ink">
        B-88 Kamal Pushpa CHS, KC Marg
        <br />
        Bandra Reclamation, Bandra West
        <br />
        Mumbai 400050
      </address>
      <p className="absolute left-[calc(16.67%_-_13px)] top-[263px] leading-[1.5] text-ink">9820527840</p>
      <p className="absolute left-[calc(16.67%_-_13px)] top-[301px] leading-[1.5]">
        <FooterLink href="mailto:prasad@radikle.org">prasad@radikle.org</FooterLink>
      </p>

      {/* social column */}
      <p className="absolute left-[calc(66.67%_-_7px)] top-[103px] font-display text-[32px] font-semibold tracking-tight2 text-deep">
        Also <span className="italic">look</span> at
      </p>
      <p className="absolute left-[calc(66.67%_-_7px)] top-[166px] leading-[1.5] text-ink">
        <FooterLink href="https://instagram.com">Instagram</FooterLink>
      </p>
      <p className="absolute left-[calc(66.67%_-_7px)] top-[207px] leading-[1.5] text-ink">
        <FooterLink href="https://linkedin.com">LinkedIn</FooterLink>
      </p>
      <p className="absolute left-[calc(66.67%_-_7px)] top-[246px] leading-[1.5] text-ink">
        <FooterLink href="https://x.com">X (Twitter)</FooterLink>
      </p>

      {/* bottom bar */}
      <p className="absolute left-[calc(16.67%_-_17px)] top-[413px] whitespace-nowrap leading-[1.5] text-black">
        © 2026 RADIKLE · All rights reserved.
      </p>
      <p className="absolute left-[calc(58.33%_-_7px)] top-[407px] whitespace-nowrap leading-[1.5] text-black">
        <FooterLink href="#terms">Terms and Conditions</FooterLink>
      </p>
      <p className="absolute left-[calc(75%_-_4px)] top-[407px] whitespace-nowrap leading-[1.5] text-black">
        <FooterLink href="#privacy">Privacy</FooterLink>
      </p>
      <p className="absolute left-[calc(83.33%_-_2px)] top-[407px] whitespace-nowrap leading-[1.5] text-black">
        <FooterLink href="#signin">Sign in</FooterLink>
      </p>
    </footer>
  );
}
