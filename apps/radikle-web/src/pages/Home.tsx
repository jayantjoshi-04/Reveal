import { FixedCanvas } from '../components/FixedCanvas';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Asset } from '../components/Asset';
import { Reveal } from '../components/Reveal';
import { HeroSeed } from '../components/HeroSeed';
import { A } from '../lib/assets';

/**
 * Home ("Website process" frame, node 1:2) — reproduced at the exact 1440x12090
 * Figma coordinates. Colours, type and positions are lifted verbatim from the
 * design; hand-drawn illustrations render from /public/assets (placeholders
 * until the exported files are added). Shared Navbar/Footer replace the
 * design's inline nav + footer layers.
 */
export default function Home() {
  return (
    <FixedCanvas height={12090}>
      {/* ── colour bands (drawn first, behind everything) ───────────────── */}
      <div className="absolute left-[-34px] top-[4943px] h-[7147px] w-[1500px] bg-cream" />
      <div className="absolute left-0 top-[9509px] h-[1049px] w-[1440px] bg-olive" />
      <div className="absolute left-[-27px] top-[-69px] h-[1253px] w-[1500px] bg-sky/60" />
      <div className="absolute left-[-24px] top-[1976px] h-[2967px] w-[1500px] bg-olive" />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      {/* small sprout strokes near the logo */}
      <div className="absolute left-[calc(41.67%_+_22px)] top-[294px] h-[164px] w-[40px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset
            src={A.layer14}
            alt=""
            placeholder="blank"
            imgClassName="absolute h-[100.01%] left-[-32.95%] top-[-0.01%] w-[495.18%] max-w-none"
          />
        </div>
      </div>
      <div className="absolute left-[calc(50%_+_57px)] top-[327px] flex h-[98px] w-[24px] items-center justify-center">
        <div className="flex-none -scale-y-100 rotate-180">
          <div className="relative h-[98px] w-[24px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Asset
                src={A.layer14}
                alt=""
                placeholder="blank"
                imgClassName="absolute h-[100.01%] left-[-32.95%] top-[-0.01%] w-[495.18%] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* hero soil line */}
      <div className="absolute left-0 top-[651px] h-[84px] w-[1440px]">
        <Asset src={A.lines} alt="lines" placeholder="line" />
      </div>

      {/* animated hero seed */}
      <HeroSeed />

      <Reveal className="absolute left-[calc(33.33%_+_242px)] top-[866px] h-[66px] w-[388px] -translate-x-1/2 whitespace-nowrap text-center font-display text-[40px] font-semibold leading-[1.5] tracking-tighter text-teal">
        Every child is a seed.
      </Reveal>
      <Reveal
        delay={0.1}
        className="absolute left-[calc(33.33%_+_240px)] top-[933px] h-[42px] w-[392px] -translate-x-1/2 text-center font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-ink"
      >
        Every child carries something. We just can&rsquo;t see it.
      </Reveal>

      {/* ── SECTION: seeds are not the same (cream) ─────────────────────── */}
      <div className="absolute left-[-8px] top-[1114px] h-[862px] w-[1456px] bg-cream" />

      {/* seed illustrations */}
      <div className="absolute left-[calc(8.33%_+_69px)] top-[1353.54px] flex h-[298.491px] w-[256.835px] items-center justify-center">
        <div className="flex-none rotate-[-22.51deg]">
          <div className="relative h-[251px] w-[174px]">
            <Asset src={A.seedCluster} alt="seed" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(25%_+_15.9px)] top-[1276px] flex h-[396.947px] w-[286.272px] items-center justify-center">
        <div className="flex-none rotate-[-15.02deg]">
          <div className="relative h-[357.172px] w-[200.541px]">
            <Asset src={A.seed2} alt="seed" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(16.67%_+_31px)] top-[1607.54px] flex h-[215.416px] w-[158.483px] items-center justify-center">
        <div className="flex-none rotate-[107.83deg]">
          <div className="relative h-[104.499px] w-[192.671px]">
            <Asset src={A.seed4} alt="seed" />
          </div>
        </div>
      </div>

      <Reveal className="absolute left-[58.33%] top-[1417px] w-[332px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        Like children, not all seeds are same. each a result of different DNA and Genes.
      </Reveal>
      <div className="absolute left-[58.33%] top-[1632px] w-[545px] font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">
          You can&rsquo;t tell a &ldquo;strong&rdquo; seed from a &ldquo;weak&rdquo; one just by looking.
        </p>
        <p className="leading-[1.5]">And each seed requires a different garden to thrive.</p>
      </div>

      {/* ── SECTION: same garden (olive) ────────────────────────────────── */}
      <div className="absolute left-[calc(8.33%_+_57px)] top-[2021px] h-[426px] w-[485px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset
            src={A.sun}
            alt="sun"
            imgClassName="absolute h-full left-[-0.05%] top-0 w-[170.18%] max-w-none animate-[sway_9s_ease-in-out_infinite]"
          />
        </div>
      </div>

      {/* water can */}
      <div className="absolute left-[calc(33.33%_+_35px)] top-[2240px] flex h-[684.779px] w-[876.656px] items-center justify-center">
        <div className="flex-none rotate-[-13deg]">
          <div className="relative h-[523px] w-[779px] animate-sway">
            <Asset src={A.waterCan} alt="water can" />
          </div>
        </div>
      </div>

      <Reveal className="absolute left-[calc(8.33%_+_2px)] top-[2582px] h-[115px] w-[474px] font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-teal">
        <p className="mb-0 leading-[1.5]">School (and often Parents) give all seeds the same garden.</p>
      </Reveal>
      <p className="absolute left-[calc(8.33%_+_2px)] top-[2697px] w-[378px] font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-ink">
        It gives them the same nutrients - soil, water, light, fertilizers, etc. and expects every seed to thrive.
      </p>

      <Reveal className="absolute left-[calc(58.33%_+_12px)] top-[2984px] w-[441px] font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-teal">
        <p className="mb-0 leading-[1.5]">The few seeds that happen to suit that one garden flourish.</p>
      </Reveal>

      {/* ground + nursery plant + sprout */}
      <div className="absolute left-[-24px] top-[3208px] h-[691px] w-[1464px]">
        <Asset src={A.ground} alt="ground" />
      </div>
      <div className="absolute left-[calc(41.67%_+_20px)] top-[2797px] h-[567px] w-[227px]">
        <Asset src={A.plant01} alt="plant" />
      </div>
      <div className="absolute left-[calc(16.67%_-_17px)] top-[3650px] flex h-[89.553px] w-[76.902px] items-center justify-center">
        <div className="flex-none rotate-[-29.74deg]">
          <div className="relative h-[78px] w-[44px]">
            <Asset src={A.seed2} alt="seed" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(66.67%_+_73px)] top-[3517px] h-[356px] w-[340px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset
            src={A.sprout}
            alt="sprout"
            imgClassName="absolute h-full left-0 top-0 w-[359.36%] max-w-none"
          />
        </div>
      </div>

      <Reveal className="absolute left-[calc(8.33%_+_2px)] top-[3264px] w-[327px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        The rest wither;
      </Reveal>
      <div className="absolute left-[calc(8.33%_+_8px)] top-[3312px] w-[321px] whitespace-pre-wrap font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">
          not because they&rsquo;re weak, but because it&rsquo;s the wrong garden for them.
        </p>
      </div>

      {/* ── SECTION: we judge children ──────────────────────────────────── */}
      <div className="absolute left-[51px] top-[4138px] h-[717px] w-[1362px]">
        <Asset src={A.withered} alt="withered plants" />
      </div>
      <Reveal className="absolute left-[calc(41.67%_+_103px)] top-[4007px] w-[499px] whitespace-pre-wrap font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        We judge children by how they did in that one garden and call the witherers &ldquo;less able.&rdquo;
      </Reveal>
      <div className="absolute left-[calc(50%_+_109px)] top-[4206px] w-[455px] whitespace-pre-wrap font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">
          We also pressurize children to &rsquo;thrive&rsquo; in that one garden, not knowing that each seed requires
          different nutrients to thrive.
        </p>
      </div>

      {/* ── SECTION: before any plant becomes visible (cream) ───────────── */}
      {/* olive highlight bands behind the statement lines */}
      <div className="absolute left-[calc(16.67%_+_3px)] top-[4943px] h-[158px] w-[954px] bg-olive" />
      <div className="absolute left-[calc(25%_+_1px)] top-[5101px] h-[158px] w-[710px] bg-olive" />
      <div className="absolute left-[calc(25%_+_106px)] top-[5254px] h-[158px] w-[506px] bg-olive" />

      <Reveal className="absolute left-[calc(25%_+_355.5px)] top-[4981px] w-[641px] -translate-x-1/2 text-center font-display text-[24px] font-semibold leading-[0] tracking-tight1 text-teal">
        <p className="mb-0">
          <span className="leading-[1.5]">What we forget is that before any plant becomes visible above the soil,</span>
          <span className="italic leading-[1.5]"> something important</span>
          <span className="leading-[1.5]"> happens beneath it.</span>
        </p>
      </Reveal>
      <Reveal className="absolute left-[calc(25%_+_335.5px)] top-[5170px] w-[641px] -translate-x-1/2 text-center font-display text-[24px] font-semibold leading-[0] tracking-tight1 text-deep">
        <p className="mb-0">
          <span className="leading-[1.5]">The first sign of life is </span>
          <span className="italic leading-[1.5]">not</span>
          <span className="leading-[1.5]"> a leaf.</span>
        </p>
      </Reveal>
      <Reveal className="absolute left-[calc(25%_+_355.5px)] top-[5297px] w-[641px] -translate-x-1/2 text-center font-display text-[24px] font-semibold leading-[0] tracking-tight1 text-deep">
        <p className="mb-0">
          <span className="leading-[1.5]">It is </span>
          <span className="italic leading-[1.5]">not</span>
          <span className="leading-[1.5]"> a flower.</span>
        </p>
        <p>
          <span className="leading-[1.5]">It is </span>
          <span className="italic leading-[1.5]">not</span>
          <span className="leading-[1.5]"> even a shoot.</span>
        </p>
      </Reveal>

      {/* the radicle illustration */}
      <div className="absolute left-[calc(16.67%_+_49px)] top-[5478px] flex h-[885.536px] w-[453.864px] items-center justify-center">
        <div className="flex-none rotate-[0.81deg]">
          <div className="relative h-[879.409px] w-[441.531px]">
            <Asset src={A.radikle} alt="radicle" />
          </div>
        </div>
      </div>

      <Reveal className="absolute left-[calc(58.33%_-_8px)] top-[5787px] w-[320px] font-display text-[48px] font-semibold leading-[0] tracking-tightest text-teal">
        <span className="leading-[1.5]">It is a radicle.</span>
      </Reveal>

      <p className="absolute left-[calc(58.33%_-_8px)] top-[5887px] h-[42px] w-[385px] font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-ink">
        A radicle appears only when the conditions are right.
      </p>
      <div className="absolute left-[calc(58.33%_-_8px)] top-[5931px] h-[113px] w-[385px] font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">Not because someone demanded it.</p>
        <p className="mb-0 leading-[1.5]">Not because someone compared it to other seeds.</p>
        <p className="leading-[1.5]">Not because the seed was labelled gifted.</p>
      </div>
      <p className="absolute left-[calc(58.33%_-_8px)] top-[6026px] h-[113px] w-[385px] font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-ink">
        A radicle emerges when the seed finally encounters the environment it needs to begin growing.
      </p>

      {/* ── SECTION: What we do? ────────────────────────────────────────── */}
      <Reveal className="absolute left-[calc(33.33%_+_223px)] top-[6465px] h-[66px] w-[388px] -translate-x-1/2 text-center font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        What we do?
      </Reveal>
      <p className="absolute left-[calc(33.33%_+_239.5px)] top-[6571px] h-[98px] w-[485px] -translate-x-1/2 text-center font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-[#1e1e1e]">
        At Radikle, our goal is not to decide what a child should become, but to create the conditions in which a
        radicle can emerge.
      </p>

      {/* pale ellipse backdrop (recreated from the SVG as CSS) */}
      <div className="absolute left-[-76px] top-[6669px] h-[1461px] w-[1591px] rounded-[50%] bg-sky/40" />

      <div className="absolute left-[calc(16.67%_-_7px)] top-[6822px] h-[930px] w-[887px]">
        <Asset src={A.plant} alt="nursery plant" />
      </div>
      <Reveal className="absolute left-[calc(16.67%_-_7px)] top-[7040px] w-[342px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        First, we expose each seed to different gardens in our nursery to understand:
      </Reveal>
      <div className="absolute left-[calc(58.33%_+_89px)] top-[7232px] w-[672px] whitespace-pre-wrap font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-black">
        <p className="mb-0 leading-[1.5]">· Where does the seed show signs of life?</p>
        <p className="mb-0 leading-[1.5]">· Which gardens seem most suitable for it?</p>
        <p className="mb-0 leading-[1.5]">· Which experiences does it return to?</p>
        <p className="leading-[1.5]">· Where does it begin to take root?</p>
      </div>
      <Reveal className="absolute left-[calc(25%_+_360px)] top-[7821px] w-[664px] -translate-x-1/2 text-center font-display text-[32px] font-medium leading-[0] tracking-tight2 text-teal">
        <p className="mb-0 leading-[1.5]">We are not looking for achievement.</p>
      </Reveal>
      <p className="absolute left-[calc(33.33%_+_239.5px)] top-[7917px] w-[485px] -translate-x-1/2 text-center font-sans text-[16px] font-medium leading-[1.5] tracking-tight0 text-ink">
        We are looking for the first emergence of the radicle — the moment a child begins to connect, engage, and grow.
      </p>

      {/* ── SECTION: enrich the nursery (roots) ─────────────────────────── */}
      <div className="absolute left-[-222px] top-[8466px] h-[847px] w-[1708px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset
            src={A.roots}
            alt="roots"
            imgClassName="absolute h-[123.85%] left-[-0.01%] top-[-23.85%] w-[113.15%] max-w-none"
          />
        </div>
      </div>
      <Reveal className="absolute left-[calc(50%_-_10px)] top-[8236px] w-[769px] whitespace-pre-wrap font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-teal">
        Second, once the radicle begins to emerge, we enrich the nursery environment with the right nutrients soil,
        water, light, challenge, support, mentorship, and opportunity to understand:
      </Reveal>
      <div className="absolute left-[calc(58.33%_-_6px)] top-[8660px] h-[187px] w-[558px] whitespace-pre-wrap font-sans text-[16px] font-medium leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">· Where does the seed pick things up quickly when given a chance?</p>
        <p className="mb-0 leading-[1.5]">· What does it return to again and again?</p>
        <p className="mb-0 leading-[1.5]">· What obstacles does it persist through?</p>
        <p className="leading-[1.5]">· What conditions help it grow stronger?</p>
      </div>
      <p className="absolute left-[calc(33.33%_+_239px)] top-[9366px] h-[89px] w-[464px] -translate-x-1/2 text-center font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-ink">
        We make sure that by the time it leaves the nursery, it has not only taken root, but has grown into a healthy
        sapling.
      </p>

      {/* ── SECTION: transfer to its own garden (olive) ─────────────────── */}
      <div className="absolute left-[calc(66.67%_+_91px)] top-[9477px] h-[1016px] w-[407px]">
        <Asset src={A.plant01} alt="plant" />
      </div>
      <div className="absolute left-[62px] top-[9754px] h-[711px] w-[377px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset
            src={A.sprout}
            alt="sprout"
            imgClassName="absolute h-full left-[-85.65%] top-0 w-[647.42%] max-w-none"
          />
        </div>
      </div>
      <div className="absolute left-[calc(25%_+_15px)] top-[10151px] h-[67px] w-[1160px]">
        <Asset src={A.lines} alt="lines" placeholder="line" />
      </div>

      <Reveal className="absolute left-[calc(33.33%_+_216px)] top-[9699px] w-[444px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-teal">
        <p className="mb-0 leading-[1.5]">
          Third, once it has become a sapling, we transfer it from the nursery to its own garden.
        </p>
        <p className="mb-0 leading-[1.5]">The conditions outside the nursery are different.</p>
        <p className="leading-[1.5]">The sapling must continue growing there too.</p>
      </Reveal>
      <div className="absolute left-[calc(8.33%_+_17px)] top-[10306px] h-[187px] w-[558px] whitespace-pre-wrap font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">So we:</p>
        <p className="mb-0 leading-[1.5]">· Ensure the sapling receives the right nutrients in its own garden.</p>
        <p className="mb-0 leading-[1.5]">· Transfer what we have learned about how it grows best to its gardener.</p>
        <p className="leading-[1.5]">· Support the gardener in maintaining those conditions.</p>
      </div>

      {/* ── SECTION: closing (cream) ────────────────────────────────────── */}
      <div className="absolute left-[calc(41.67%_+_45px)] top-[11109px] h-[203px] w-[161px]">
        <Asset src={A.lasst} alt="seed" />
      </div>
      <Reveal className="absolute left-[calc(33.33%_+_231px)] top-[10713px] w-[348px] -translate-x-1/2 text-center font-display text-[24px] font-semibold leading-[0] tracking-tight1 text-teal">
        <p className="mb-0 leading-[1.5]">Because our goal is not simply to help a child take root.</p>
      </Reveal>
      <Reveal className="absolute left-[calc(25%_+_350.5px)] top-[10869px] w-[495px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-teal">
        <p className="mb-0 leading-[1.5]">
          Our goal is to help every child continue growing long after they leave the nursery.
        </p>
      </Reveal>
      <div className="absolute left-[calc(33.33%_+_240px)] top-[11434px] w-[444px] -translate-x-1/2 text-center font-sans text-[16px] font-normal leading-[0] tracking-tight0 text-ink">
        <p className="mb-0 leading-[1.5]">Every thriving tree was once a seed.</p>
        <p className="leading-[1.5]">And every seed began with a radicle.</p>
      </div>

      {/* ── shared chrome ───────────────────────────────────────────────── */}
      <Navbar />
      <Footer />
    </FixedCanvas>
  );
}
