import { FixedCanvas } from './FixedCanvas';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ButtonLink } from './Button';
import { Asset } from './Asset';
import { A } from '../lib/assets';

type PlaceholderProps = {
  eyebrow?: string;
  title: string;
  blurb: string;
  /** Canvas height; defaults to the small coming-soon frame height. */
  height?: number;
};

/**
 * Branded interim page used for sections whose full Figma build is still to
 * come, and for the two "coming soon" frames (Disha / Discover). Uses the same
 * chrome (Navbar/Footer), palette and type as the rest of the site.
 */
export function Placeholder({ eyebrow, title, blurb, height = 1391 }: PlaceholderProps) {
  return (
    <FixedCanvas height={height}>
      <div className="absolute left-[-27px] top-[-69px] h-[1253px] w-[1500px] bg-sky/60" />

      <Navbar />

      {/* floating seed mark (appears once the asset is added) */}
      <div className="absolute left-1/2 top-[300px] h-[120px] w-[84px] -translate-x-1/2">
        <div className="h-full w-full animate-float">
          <Asset src={A.seedCluster} alt="" placeholder="blank" />
        </div>
      </div>

      <div className="absolute left-1/2 top-[470px] w-[760px] -translate-x-1/2 text-center">
        {eyebrow && (
          <p className="mb-4 font-sans text-[13px] font-medium uppercase tracking-[3px] text-azure">{eyebrow}</p>
        )}
        <h1 className="font-display text-[56px] font-semibold leading-[1.12] tracking-tighter text-teal">{title}</h1>
        <p className="mx-auto mt-6 max-w-[540px] font-sans text-[18px] font-normal leading-[1.6] tracking-tight0 text-ink">
          {blurb}
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink to="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>

      <Footer />
    </FixedCanvas>
  );
}
