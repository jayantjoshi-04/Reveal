import { FixedCanvas } from '../components/FixedCanvas';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Asset } from '../components/Asset';
import { Reveal } from '../components/Reveal';
import { A } from '../lib/assets';

/**
 * Our Stories ("Our Stories" frame, node 194:4) — the founding narrative, at
 * the exact 1440x6798 Figma coordinates. Same story beats as About but on
 * olive bands, with the built-in olive footer.
 */
const BODY = 'font-sans text-[16px] font-normal tracking-tight0 text-ink';

export default function Stories() {
  return (
    <FixedCanvas height={6798}>
      {/* base layers */}
      <div className="absolute left-0 top-[-9px] h-[6323px] w-[1456px] bg-cream" />
      <div className="absolute left-0 top-0 h-[6314px] w-[1440px] bg-ivory" />
      <div className="absolute left-[-135px] top-[1442px] h-[1378px] w-[1712px] bg-olive" />
      <div className="absolute left-[-64px] top-[4003px] h-[1012px] w-[1712px] bg-olive" />
      <div className="absolute left-[-119px] top-[6022px] h-[292px] w-[1712px] bg-peach" />

      {/* ── header ──────────────────────────────────────────────────────── */}
      <Reveal className="absolute left-[calc(50%_-_10px)] top-[259px] h-[66px] w-[388px] font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        Our Journey
      </Reveal>
      <p className={`absolute left-[calc(50%_-_10px)] top-[363px] h-[42px] w-[322px] leading-[1.5] ${BODY}`}>
        Every idea starts incomplete, three people, three separate realities, no connection yet.
      </p>

      {/* photo cells */}
      <div className="absolute left-[calc(8.33%_+_2px)] top-[292px] h-[344px] w-[251px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.cell1} alt="photo" imgClassName="absolute h-[162.09%] left-[-0.05%] top-0 w-[100.09%] max-w-none" />
        </div>
      </div>
      <div className="absolute left-[calc(58.33%_+_102px)] top-[568px] h-[205px] w-[285px]">
        <Asset src={A.cell2} alt="photo" />
      </div>
      <div className="absolute left-[calc(25%_+_61px)] top-[914px] h-[251px] w-[256px]">
        <Asset src={A.cell3} alt="photo" />
      </div>

      {/* three founders */}
      <Reveal className="absolute left-[calc(25%_+_5px)] top-[603px] w-[332px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        Prasad
      </Reveal>
      <p className={`absolute left-[calc(8.33%_+_2px)] top-[676px] h-[139px] w-[481px] leading-[1.5] ${BODY}`}>
        Prasad spent thirty years in the design industry wondering why capable people stop being imaginative. Creativity
        was truly something we are born with and beyond art and aesthetics. His own son&rsquo;s flourishing curiosity
        showed and made him believe; we are never short of intelligence but always short of environments.
      </p>
      <Reveal className="absolute left-[calc(58.33%_-_8px)] top-[780px] w-[332px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        Jaanhvi
      </Reveal>
      <p className={`absolute left-[calc(58.33%_-_8px)] top-[853px] h-[139px] w-[486px] whitespace-pre-wrap leading-[1.5] ${BODY}`}>
        Jaanhvi grew up beside a domestic worker&rsquo;s children, just as bright, curious and capable as her but the
        only difference was, she grew up around people who simply assumed she would do well; they had neither of that.
        The gap was never in the children, it in their homes, halls and their lives.
      </p>
      <Reveal className="absolute left-[calc(25%_-_15px)] top-[1164px] w-[332px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        Reva
      </Reveal>
      <p className={`absolute left-[calc(25%_-_13px)] top-[1242px] h-[139px] w-[501px] leading-[1.5] ${BODY}`}>
        A design project that began in a Belgian prison showed her that character rarely decides which side of a wall
        someone ends up on. Given the right soil, many could have grown into something extraordinary. But for too many,
        the environment fails first and the cost is their freedom.
      </p>

      {/* ── three different roads (drift) ───────────────────────────────── */}
      <div className="absolute left-[-95px] top-[1546px] flex h-[1386.111px] w-[1491.941px] items-center justify-center">
        <div className="flex-none rotate-[32.83deg]">
          <div className="relative h-[863.39px] w-[1218.461px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Asset src={A.driftCloser} alt="illustration" imgClassName="absolute h-[93.34%] left-0 top-0 w-full max-w-none" />
            </div>
          </div>
        </div>
      </div>
      <Reveal className="absolute left-[calc(25%_+_381.5px)] top-[1511px] w-[641px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <p className="mb-0">
          <span className="leading-[1.5]">Three </span>
          <span className="italic leading-[1.5]">different</span>
          <span className="leading-[1.5]"> roads</span>
        </p>
      </Reveal>
      <p className={`absolute left-[calc(33.33%_+_274.5px)] top-[1585px] h-[139px] w-[481px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Each moved alone at first: an industry question, a childhood observation, a prison reckoning.
      </p>
      <Reveal className="absolute left-[calc(58.33%_-_5px)] top-[1750px] h-[180px] w-[382px] font-display text-[40px] font-bold leading-[1.5] tracking-tighter text-teal">
        One shared, unspoken question:
      </Reveal>
      <Reveal className="absolute left-[calc(25%_+_360.5px)] top-[2682px] h-[42px] w-[641px] -translate-x-1/2 text-center font-display text-[24px] font-semibold leading-[0] tracking-tight1 text-deep">
        <p className="mb-0">
          <span className="leading-[1.5]">Is it capacity that&rsquo;s missing or the </span>
          <span className="italic leading-[1.5]">ground to grow</span>
          <span className="leading-[1.5]"> in?</span>
        </p>
      </Reveal>

      {/* ── fusion ──────────────────────────────────────────────────────── */}
      <div className="absolute left-[calc(16.67%_+_42px)] top-[2968px] flex h-[848.442px] w-[876.085px] items-center justify-center">
        <div className="flex-none rotate-[-30.84deg]">
          <div className="relative h-[588.867px] w-[668.77px]">
            <Asset src={A.fusionnn} alt="illustration" />
          </div>
        </div>
      </div>
      <p className="absolute left-[calc(16.67%_-_17px)] top-[3037px] h-[42px] w-[641px] font-display text-[24px] font-medium leading-[1.5] tracking-tight1 text-black">
        Nothing here was acquired.
      </p>
      <Reveal className="absolute left-[calc(16.67%_-_17px)] top-[2968px] h-[180px] w-[438px] font-display text-[40px] font-bold leading-[1.5] tracking-tighter text-teal">
        Fusion isn&rsquo;t a merger
      </Reveal>
      <div className={`absolute left-[calc(41.67%_-_12px)] top-[3800px] w-[507px] whitespace-pre-wrap leading-[0] ${BODY}`}>
        <p className="mb-0 leading-[1.5]">
          Like three unfinished sentences turning out, on a second read, to be one. The boundaries dissolve first. Then
          the centers merge.
        </p>
        <p className="leading-[1.5]">Three becomes one but one that remembers being three.</p>
      </div>

      {/* ── potential / seed ────────────────────────────────────────────── */}
      <div className="absolute left-[calc(25%_+_3px)] top-[4105px] flex h-[710.337px] w-[645.565px] items-center justify-center">
        <div className="flex-none rotate-[16.75deg]">
          <div className="relative h-[592.578px] w-[495.805px]">
            <Asset src={A.mainSeed} alt="seed" />
          </div>
        </div>
      </div>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[4134px] w-[405px] leading-[1.5] ${BODY}`}>
        A seed shows nothing on the outside. Inside it: three lives, compressed into a single conviction.
      </p>
      <Reveal className="absolute left-[calc(33.33%_+_106px)] top-[4781px] h-[180px] w-[599px] font-display text-[40px] font-bold leading-[1.5] tracking-tighter text-teal">
        Potential isn&rsquo;t the rare thing. The right environment for it is.
      </Reveal>

      {/* ── root ────────────────────────────────────────────────────────── */}
      <div className="absolute left-[calc(33.33%_-_13px)] top-[5315px] h-[552px] w-[478px]">
        <Asset src={A.seedRadikle} alt="radicle" />
      </div>
      <Reveal className="absolute left-[calc(8.33%_+_100px)] top-[5145px] h-[180px] w-[487px] font-display text-[40px] font-bold leading-[1.5] tracking-tighter text-teal">
        The root goes down before anything goes up.
      </Reveal>
      <p className={`absolute left-[calc(66.67%_-_7px)] top-[5632px] h-[113px] w-[354px] leading-[1.5] ${BODY}`}>
        Before a stem, before a leaf a seed sends down a root first. The radicle reaches for ground before it reaches
        for light. Unglamorous, but decisive, it decides whether anything else survives.
      </p>

      {/* ── closing ─────────────────────────────────────────────────────── */}
      <Reveal className="absolute left-[calc(16.67%_-_17px)] top-[6148px] h-[92px] w-[487px] font-display text-[40px] font-bold leading-[1.5] tracking-tighter text-teal">
        Want to know more?
      </Reveal>
      <a
        href="#manifesto"
        className={`group absolute left-[calc(66.67%_+_13px)] top-[6168px] h-[113px] w-[354px] leading-[1.5] ${BODY}`}
      >
        <span className="relative inline-block transition-colors duration-300 group-hover:text-teal">
          Read our manifesto!
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-teal transition-all duration-300 group-hover:w-full" />
        </span>
      </a>

      {/* ── shared chrome ───────────────────────────────────────────────── */}
      <Navbar />
      <Footer variant="olive" />
    </FixedCanvas>
  );
}
