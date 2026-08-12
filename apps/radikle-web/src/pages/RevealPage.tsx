import { FixedCanvas } from '../components/FixedCanvas';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Asset } from '../components/Asset';
import { Reveal } from '../components/Reveal';
import { A } from '../lib/assets';

/**
 * Reveal ("Reveal" frame, node 288:2) — reproduced at the exact 1440x9162
 * Figma coordinates. Repetitive elements (the portfolio folder grid and the
 * capability pills) are data-driven for readability but positioned verbatim.
 */

type Rect = { l: string; t: string; w: string };
type Label = Rect & { text: string };
type Tile = Rect & { src: string; h: string };

// Portfolio folder grid (mist band).
const FOLDERS: Tile[] = [
  { src: A.folderA, l: 'left-[calc(58.33%_+_44px)]', t: 'top-[1139px]', w: 'w-[198px]', h: 'h-[155px]' },
  { src: A.folderA, l: 'left-[calc(8.33%_-_10px)]', t: 'top-[1609px]', w: 'w-[216px]', h: 'h-[169px]' },
  { src: A.folderB, l: 'left-[calc(8.33%_-_12px)]', t: 'top-[1132px]', w: 'w-[204px]', h: 'h-[161px]' },
  { src: A.folderB, l: 'left-[calc(41.67%_+_29px)]', t: 'top-[1616px]', w: 'w-[224px]', h: 'h-[177px]' },
  { src: A.folderC, l: 'left-[calc(25%_+_8px)]', t: 'top-[1132px]', w: 'w-[206px]', h: 'h-[161px]' },
  { src: A.folderC, l: 'left-[calc(75%_+_42px)]', t: 'top-[1375px]', w: 'w-[226px]', h: 'h-[176px]' },
  { src: A.folderD, l: 'left-[calc(41.67%_+_29px)]', t: 'top-[1138px]', w: 'w-[199px]', h: 'h-[156px]' },
  { src: A.folderD, l: 'left-[calc(75%_+_78px)]', t: 'top-[1631px]', w: 'w-[199px]', h: 'h-[156px]' },
  { src: A.folderE, l: 'left-[calc(75%_+_58px)]', t: 'top-[1139px]', w: 'w-[193px]', h: 'h-[155px]' },
  { src: A.folderE, l: 'left-[calc(25%_+_8px)]', t: 'top-[1616px]', w: 'w-[212px]', h: 'h-[171px]' },
  { src: A.folderF, l: 'left-[calc(8.33%_-_12px)]', t: 'top-[1356px]', w: 'w-[218px]', h: 'h-[171px]' },
  { src: A.folderF, l: 'left-[calc(58.33%_+_58px)]', t: 'top-[1616px]', w: 'w-[218px]', h: 'h-[171px]' },
];

// Capability / disposition pills (olive rounded rects).
const PILLS: Rect[] = [
  { l: 'left-[calc(16.67%_-_14px)]', t: 'top-[4189px]', w: 'w-[128px]' },
  { l: 'left-[calc(16.67%_-_17px)]', t: 'top-[4503px]', w: 'w-[151px]' },
  { l: 'left-[calc(58.33%_-_8px)]', t: 'top-[4498px]', w: 'w-[137px]' },
  { l: 'left-[calc(66.67%_+_31px)]', t: 'top-[4499px]', w: 'w-[137px]' },
  { l: 'left-[calc(75%_+_58px)]', t: 'top-[4498px]', w: 'w-[137px]' },
  { l: 'left-[calc(16.67%_-_17px)]', t: 'top-[4557px]', w: 'w-[151px]' },
  { l: 'left-[calc(33.33%_+_92px)]', t: 'top-[4503px]', w: 'w-[151px]' },
  { l: 'left-[calc(50%_+_110px)]', t: 'top-[4499px]', w: 'w-[151px]' },
  { l: 'left-[calc(33.33%_+_92px)]', t: 'top-[4557px]', w: 'w-[151px]' },
  { l: 'left-[calc(50%_+_110px)]', t: 'top-[4553px]', w: 'w-[151px]' },
  { l: 'left-[calc(66.67%_+_28px)]', t: 'top-[4553px]', w: 'w-[151px]' },
  { l: 'left-[calc(75%_+_69px)]', t: 'top-[4553px]', w: 'w-[151px]' },
  { l: 'left-[calc(25%_+_24px)]', t: 'top-[4503px]', w: 'w-[178px]' },
  { l: 'left-[calc(25%_+_24px)]', t: 'top-[4557px]', w: 'w-[178px]' },
  { l: 'left-[calc(58.33%_-_4px)]', t: 'top-[4064px]', w: 'w-[153px]' },
  { l: 'left-[calc(16.67%_-_14px)]', t: 'top-[4243px]', w: 'w-[195px]' },
  { l: 'left-[calc(58.33%_-_1px)]', t: 'top-[4171px]', w: 'w-[195px]' },
  { l: 'left-[calc(66.67%_+_80px)]', t: 'top-[4171px]', w: 'w-[195px]' },
  { l: 'left-[calc(25%_+_4px)]', t: 'top-[4189px]', w: 'w-[128px]' },
  { l: 'left-[calc(58.33%_+_4px)]', t: 'top-[4226px]', w: 'w-[128px]' },
  { l: 'left-[calc(66.67%_+_21px)]', t: 'top-[4226px]', w: 'w-[128px]' },
  { l: 'left-[calc(75%_+_38px)]', t: 'top-[4224px]', w: 'w-[128px]' },
  { l: 'left-[calc(75%_+_72px)]', t: 'top-[4063px]', w: 'w-[128px]' },
  { l: 'left-[calc(66.67%_+_39px)]', t: 'top-[4063px]', w: 'w-[143px]' },
  { l: 'left-[calc(25%_+_71px)]', t: 'top-[4242px]', w: 'w-[128px]' },
  { l: 'left-[calc(58.33%_+_1px)]', t: 'top-[4116px]', w: 'w-[128px]' },
  { l: 'left-[calc(33.33%_+_89px)]', t: 'top-[4242px]', w: 'w-[128px]' },
  { l: 'left-[calc(66.67%_+_19px)]', t: 'top-[4116px]', w: 'w-[128px]' },
  { l: 'left-[calc(75%_+_37px)]', t: 'top-[4115px]', w: 'w-[78px]' },
  { l: 'left-[calc(83.33%_+_5px)]', t: 'top-[4116px]', w: 'w-[78px]' },
  { l: 'left-[calc(33.33%_+_22px)]', t: 'top-[4189px]', w: 'w-[212px]' },
];

const PILL_LABELS: Label[] = [
  { l: 'left-[calc(16.67%_+_49.5px)]', t: 'top-[4197px]', w: 'w-[75px]', text: 'empathy' },
  { l: 'left-[calc(16.67%_+_58.5px)]', t: 'top-[4512px]', w: 'w-[145px]', text: 'act ↔ reflect' },
  { l: 'left-[calc(50%_+_181.5px)]', t: 'top-[4507px]', w: 'w-[145px]', text: 'structure' },
  { l: 'left-[calc(66.67%_+_100.5px)]', t: 'top-[4508px]', w: 'w-[145px]', text: 'feedback' },
  { l: 'left-[calc(75%_+_127.5px)]', t: 'top-[4507px]', w: 'w-[145px]', text: 'challenge' },
  { l: 'left-[calc(16.67%_+_58.5px)]', t: 'top-[4566px]', w: 'w-[145px]', text: 'reinvent ↔ perfect' },
  { l: 'left-[calc(33.33%_+_167.5px)]', t: 'top-[4512px]', w: 'w-[145px]', text: 'persist ↔ adapt' },
  { l: 'left-[calc(33.33%_+_167.5px)]', t: 'top-[4566px]', w: 'w-[145px]', text: 'deep ↔ wide' },
  { l: 'left-[calc(58.33%_+_65.5px)]', t: 'top-[4562px]', w: 'w-[145px]', text: 'novelty' },
  { l: 'left-[calc(66.67%_+_103.5px)]', t: 'top-[4562px]', w: 'w-[145px]', text: 'resources' },
  { l: 'left-[calc(75%_+_144.5px)]', t: 'top-[4562px]', w: 'w-[145px]', text: 'resources' },
  { l: 'left-[calc(25%_+_112.5px)]', t: 'top-[4512px]', w: 'w-[145px]', text: 'experiment ↔ study' },
  { l: 'left-[calc(25%_+_112.5px)]', t: 'top-[4566px]', w: 'w-[145px]', text: 'solo ↔ bring-in' },
  { l: 'left-[calc(58.33%_+_72.5px)]', t: 'top-[4074px]', w: 'w-[153px]', text: 'design research' },
  { l: 'left-[calc(25%_+_67.5px)]', t: 'top-[4198px]', w: 'w-[75px]', text: 'analytical' },
  { l: 'left-[calc(58.33%_+_67.5px)]', t: 'top-[4235px]', w: 'w-[75px]', text: 'facilitation' },
  { l: 'left-[calc(66.67%_+_84.5px)]', t: 'top-[4235px]', w: 'w-[75px]', text: 'venture' },
  { l: 'left-[calc(75%_+_101.5px)]', t: 'top-[4233px]', w: 'w-[75px]', text: 'usability' },
  { l: 'left-[calc(75%_+_135.5px)]', t: 'top-[4072px]', w: 'w-[75px]', text: 'framing' },
  { l: 'left-[calc(66.67%_+_111px)]', t: 'top-[4073px]', w: 'w-[128px]', text: 'field research' },
  { l: 'left-[calc(25%_+_134.5px)]', t: 'top-[4251px]', w: 'w-[75px]', text: 'narrative' },
  { l: 'left-[calc(58.33%_+_64.5px)]', t: 'top-[4125px]', w: 'w-[75px]', text: 'ideation' },
  { l: 'left-[calc(41.67%_+_32.5px)]', t: 'top-[4251px]', w: 'w-[75px]', text: 'conviction' },
  { l: 'left-[calc(66.67%_+_85px)]', t: 'top-[4126px]', w: 'w-[88px]', text: 'prototyping' },
  { l: 'left-[calc(75%_+_75.5px)]', t: 'top-[4125px]', w: 'w-[39px]', text: 'craft' },
  { l: 'left-[calc(83.33%_+_43.5px)]', t: 'top-[4126px]', w: 'w-[57px]', text: 'visual' },
  { l: 'left-[calc(33.33%_+_133.5px)]', t: 'top-[4198px]', w: 'w-[201px]', text: 'aesthetic sensibility' },
  { l: 'left-[calc(16.67%_+_83.5px)]', t: 'top-[4254px]', w: 'w-[201px]', text: 'systems - sensing' },
  { l: 'left-[calc(58.33%_+_96.5px)]', t: 'top-[4182px]', w: 'w-[201px]', text: 'material and media' },
  { l: 'left-[calc(66.67%_+_177.5px)]', t: 'top-[4182px]', w: 'w-[201px]', text: 'systems and service' },
];

const H1 =
  'font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal';
const BODY = 'font-sans text-[16px] font-normal tracking-tight0 text-ink';

export default function RevealPage() {
  return (
    <FixedCanvas height={9162}>
      {/* peach base */}
      <div className="absolute left-0 top-0 h-[9162px] w-[1440px] bg-peach" />

      {/* rounded colour bands */}
      <div className="absolute left-0 top-0 h-[778px] w-[1440px] rounded-bl-[200px] rounded-br-[200px] bg-olive" />
      <div className="absolute left-0 top-[778px] h-[237px] w-[1440px] bg-peach" />
      <div className="absolute left-0 top-[987px] h-[1071px] w-[1440px] rounded-[200px] bg-mist" />
      <div className="absolute left-0 top-[2979px] h-[762px] w-[1440px] rounded-[200px] bg-olive" />
      <div className="absolute left-[-42px] top-[4731px] h-[541px] w-[1570px] bg-sky/60" />
      <div className="absolute left-[-9px] top-[6169px] h-[731px] w-[1570px] bg-olive" />
      <div className="absolute left-[-18px] top-[8137px] h-[541px] w-[1570px] bg-sky/60" />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <Reveal className={`absolute left-[calc(16.67%_-_17px)] top-[297px] h-[255px] w-[607px] ${H1}`}>
        You spent four years learning to be a designer.
      </Reveal>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[465px] h-[139px] w-[486px] leading-[1.5] ${BODY}`}>
        Nobody asked what kind.
      </p>
      <div className="absolute left-[calc(66.67%_+_3px)] top-[267px] h-[310px] w-[247px]">
        <div className="h-full w-full animate-float">
          <Asset src={A.revealHero} alt="reveal" />
        </div>
      </div>
      <Reveal className="absolute left-[calc(25%_+_359.5px)] top-[873px] w-[641px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <p className="mb-0">
          <span className="leading-[1.5]">Did you ever</span>
          <span className="italic leading-[1.5]"> notice?</span>
        </p>
      </Reveal>

      {/* ── PORTFOLIO GRID ──────────────────────────────────────────────── */}
      {FOLDERS.map((f, i) => (
        <div key={`folder-${i}`} className={`absolute ${f.l} ${f.t} ${f.w} ${f.h}`}>
          <Asset src={f.src} alt="portfolio" />
        </div>
      ))}
      <Reveal className={`absolute left-[calc(25%_+_359.5px)] top-[1393px] h-[255px] w-[607px] -translate-x-1/2 text-center ${H1}`}>
        Your portfolio looks like
        <br />
        their portfolio.
      </Reveal>
      <div className={`absolute left-[calc(33.33%_+_240px)] top-[1869px] h-[139px] w-[486px] -translate-x-1/2 text-center leading-[0] ${BODY}`}>
        <p className="mb-0 leading-[1.5]">
          Your batch has the same tools, the same references, the same case-study format, the same certifications.
          You&rsquo;ve all been graded on the same output by the same critique culture.
        </p>
        <p className="leading-[1.5]">And then you&rsquo;re asked to compete on being different.</p>
      </div>

      {/* ── THREE INSTRUMENTS ───────────────────────────────────────────── */}
      <div className="absolute left-[calc(8.33%_+_85px)] top-[2214px] h-[133px] w-[170px]">
        <Asset src={A.folderF} alt="portfolio" />
      </div>
      <div className="absolute left-[calc(41.67%_+_48px)] top-[2173px] h-[185px] w-[153px]">
        <Asset src={A.resume} alt="resume" />
      </div>
      <div className="absolute left-[calc(75%_+_3px)] top-[2181px] h-[169px] w-[134px]">
        <Asset src={A.revealHero} alt="interview" />
      </div>
      <p className="absolute left-[calc(8.33%_+_179.5px)] top-[2380px] w-[355px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        The portfolio
      </p>
      <p className="absolute left-[calc(33.33%_+_244.5px)] top-[2380px] w-[355px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        The resume
      </p>
      <p className="absolute left-[calc(66.67%_+_190.5px)] top-[2380px] w-[355px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        The interview
      </p>
      <p className={`absolute left-[calc(8.33%_+_169.5px)] top-[2441px] h-[139px] w-[263px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Shows what was made. Not who made it, or whether the making was genuinely theirs.
      </p>
      <p className={`absolute left-[calc(41.67%_+_129.5px)] top-[2441px] h-[139px] w-[263px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Lists skills. Not the conditions under which those skills switch on.
      </p>
      <p className={`absolute left-[calc(66.67%_+_190.5px)] top-[2437px] h-[139px] w-[263px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Assesses presentation. And designers are trained to present.
      </p>
      <Reveal className={`absolute left-[calc(25%_+_359.5px)] top-[2618px] h-[255px] w-[607px] -translate-x-1/2 text-center ${H1}`}>
        Three instruments.
        <br />
        All incomplete.
      </Reveal>

      {/* ── SAME BRIEF ──────────────────────────────────────────────────── */}
      <p className="absolute left-[calc(25%_+_82px)] top-[3083px] w-[641px] font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <span className="leading-[1.5]">Why does this </span>
        <span className="italic leading-[1.5]">matter</span>
        <span className="leading-[1.5]"> more in </span>
        <span className="italic leading-[1.5]">design?</span>
      </p>
      <div className="absolute left-[calc(66.67%_+_89px)] top-[3272px] h-[124px] w-[327px]">
        <Asset src={A.bridge3} alt="bridge" />
      </div>
      <div className="absolute left-[70px] top-[3301px] h-[112px] w-[344px]">
        <Asset src={A.bridge2} alt="bridge" />
      </div>
      <Reveal className="absolute left-[calc(25%_+_359.5px)] top-[3199px] h-[255px] w-[607px] -translate-x-1/2 whitespace-pre-wrap text-center font-display text-[48px] font-semibold leading-[0] tracking-tightest text-teal">
        <p className="mb-0 leading-[1.5]">Same brief. </p>
        <p className="leading-[1.5]">
          Two designers.
          <br />
          Two different answers.
        </p>
      </Reveal>
      <div className={`absolute left-[calc(25%_+_359.5px)] top-[3473px] h-[139px] w-[535px] -translate-x-1/2 text-center leading-[0] ${BODY}`}>
        <p className="mb-0 leading-[1.5]">
          Give two engineers a bridge and the answers converge. Give two designers the same brief and you get two
          different answers — because what you bring is your values, your beliefs, what you&rsquo;ve lived.
        </p>
        <p className="leading-[1.5]">
          That difference is the entire product. And it&rsquo;s exactly what four years of studio culture sands off.
        </p>
      </div>

      {/* ── WHAT DOES REVEAL READ? ──────────────────────────────────────── */}
      <Reveal className="absolute left-[calc(16.67%_-_3px)] top-[3882px] h-[181px] w-[607px] font-display text-[48px] font-semibold leading-[0] tracking-tightest text-teal">
        <p className="mb-0 leading-[1.5]">What does</p>
        <p className="leading-[1.5]">Reveal read?</p>
      </Reveal>
      <p className="absolute left-[calc(58.33%_+_4px)] top-[3973px] w-[641px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Capabilities
      </p>
      <p className="absolute left-[calc(16.67%_-_8px)] top-[4098px] w-[641px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Capacities
      </p>
      <p className="absolute left-[calc(16.67%_-_8px)] top-[4412px] w-[641px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Dispositions
      </p>
      <p className="absolute left-[calc(58.33%_-_4px)] top-[4412px] w-[641px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Conditions
      </p>
      <p className={`absolute left-[calc(58.33%_+_4px)] top-[4022px] w-[263px] leading-[1.5] ${BODY}`}>
        what you can do · trainable in weeks
      </p>
      <p className={`absolute left-[calc(16.67%_-_8px)] top-[4146px] h-[38px] w-[263px] leading-[1.5] ${BODY}`}>
        how you think · slow to build
      </p>
      <p className="absolute left-[calc(16.67%_-_8px)] top-[4460px] whitespace-nowrap font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-black">
        how you prefer to work · no better end
      </p>
      <p className="absolute left-[58.33%] top-[4460px] whitespace-nowrap font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-black">
        where you thrive, stretch, or wither
      </p>
      {/* pills */}
      {PILLS.map((p, i) => (
        <div key={`pill-${i}`} className={`absolute h-[46px] rounded-[70px] bg-olive ${p.l} ${p.t} ${p.w}`} />
      ))}
      {PILL_LABELS.map((x, i) => (
        <p
          key={`pilllbl-${i}`}
          className={`absolute h-[38px] -translate-x-1/2 whitespace-nowrap text-center font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-teal ${x.l} ${x.t} ${x.w}`}
        >
          {x.text}
        </p>
      ))}

      {/* ── IT ISN'T SCARCITY ───────────────────────────────────────────── */}
      <div className="absolute left-[calc(58.33%_+_76px)] top-[4838px] h-[330px] w-[328px]">
        <Asset src={A.conform} alt="conformity" />
      </div>
      <Reveal className="absolute left-[calc(16.67%_-_14px)] top-[4833px] h-[255px] w-[607px] whitespace-pre-wrap font-display text-[48px] font-semibold leading-[0] tracking-tightest text-teal">
        <p className="mb-0 leading-[1.5]">
          It isn&rsquo;t scarcity.
          <br />
          It isn&rsquo;t abundance.{' '}
        </p>
        <p className="leading-[1.5]">It&rsquo;s conformity.</p>
      </Reveal>
      <div className={`absolute left-[calc(16.67%_-_14px)] top-[5070px] h-[139px] w-[535px] leading-[0] ${BODY}`}>
        <p className="mb-0 leading-[1.5]">
          A house style, a group project, a rubric, and a market telling you what to become. Everything distinct about
          you got filtered out on the way through.
        </p>
        <p className="leading-[1.5]">That&rsquo;s not your fault. And it isn&rsquo;t permanent.</p>
      </div>

      {/* ── WHAT YOU SAY / WHAT YOU DO ──────────────────────────────────── */}
      <p className="absolute left-[calc(8.33%_+_102px)] top-[5443px] h-[71px] w-[607px] font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        What you say.
      </p>
      <p className="absolute left-[calc(58.33%_+_81px)] top-[5443px] h-[71px] w-[607px] font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        What you do.
      </p>
      <p className="absolute left-[calc(50%_-_10px)] top-[5461px] w-[641px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        &amp;
      </p>
      <p className={`absolute left-[calc(25%_+_359.5px)] top-[5558px] h-[139px] w-[535px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        We don&rsquo;t ask you who you are — you&rsquo;d tell us what you&rsquo;ve been trained to say. We watch what you
        actually choose. Where those two disagree is the most interesting thing in your report.
      </p>
      <div className="absolute left-[calc(16.67%_+_13px)] top-[5699px] h-[119px] w-[141px]">
        <Asset src={A.confirmed} alt="confirmed" />
      </div>
      <div className="absolute left-[calc(41.67%_+_60px)] top-[5697px] h-[221px] w-[132px]">
        <Asset src={A.aspirational} alt="aspirational" />
      </div>
      <div className="absolute left-[calc(66.67%_+_96px)] top-[5690px] h-[141px] w-[133px]">
        <Asset src={A.surprise} alt="surprise" />
      </div>
      <p className="absolute left-[311.5px] top-[5837px] w-[641px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Confirmed
      </p>
      <p className="absolute left-[calc(50%_+_418.5px)] top-[5848px] w-[641px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Surprise
      </p>
      <p className="absolute left-[calc(25%_+_365.5px)] top-[5933px] w-[641px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep">
        Aspirational
      </p>
      <p className={`absolute left-[calc(8.33%_+_196px)] top-[5891px] h-[139px] w-[244px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        What you said, and what you do, agree. This is solid ground — and now you can evidence it.
      </p>
      <p className={`absolute left-[calc(66.67%_+_182px)] top-[5896px] h-[139px] w-[224px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        You reach for it, but never claimed it. A door someone opened for you that nobody ever named.
      </p>
      <p className={`absolute left-[calc(41.67%_+_120px)] top-[5981px] h-[139px] w-[244px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        You say it, but you don&rsquo;t reach for it. A door you haven&rsquo;t opened yet — not a lie.
      </p>

      {/* ── FOUR SESSIONS ───────────────────────────────────────────────── */}
      <div className="absolute left-[calc(66.67%_+_49px)] top-[6204px] h-[567px] w-[227px]">
        <Asset src={A.plant01} alt="plant" />
      </div>
      <Reveal className="absolute left-[calc(8.33%_+_102px)] top-[6291px] h-[255px] w-[694px] font-display text-[48px] font-semibold leading-[0] tracking-tightest text-teal">
        <p className="mb-0 leading-[1.5]">Four sessions.</p>
        <p className="leading-[1.5]">
          Two channels.
          <br />
          One Design Signature.
        </p>
      </Reveal>
      <p className="absolute left-[calc(8.33%_+_102px)] top-[6664px] w-[641px] font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <span className="leading-[1.5]">A mirror of how you </span>
        <span className="italic leading-[1.5]">work today</span>
        <span className="leading-[1.5]">. Not a verdict on </span>
        <span className="italic leading-[1.5]">who you are.</span>
      </p>
      <p className={`absolute left-[calc(16.67%_-_14px)] top-[6544px] h-[139px] w-[535px] leading-[1.5] ${BODY}`}>
        Eight tasks designed so you can&rsquo;t perform your way through them. Out comes a graphical report that you — and
        the studios you want to work with — can both actually use.
      </p>

      {/* ── CASE STUDY ──────────────────────────────────────────────────── */}
      <div className="absolute left-[calc(58.33%_+_76px)] top-[7196px] h-[238px] w-[281px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.sun} alt="sun" imgClassName="absolute h-full left-0 top-0 w-[164.23%] max-w-none" />
        </div>
      </div>
      <div className="absolute left-[calc(58.33%_+_61px)] top-[7405px] h-[567px] w-[437px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.plant3} alt="plant" imgClassName="absolute h-[80.88%] left-[-0.01%] top-[19.12%] w-[100.02%] max-w-none" />
        </div>
      </div>
      <Reveal className="absolute left-[calc(8.33%_+_102px)] top-[7033px] h-[255px] w-[506px] whitespace-pre-wrap font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        A design student who had every door open and couldn&rsquo;t walk through any of them.
      </Reveal>
      <p className={`absolute left-[calc(8.33%_+_102px)] top-[7346px] h-[139px] w-[535px] leading-[1.5] ${BODY}`}>
        A case study
      </p>
      <div className={`absolute left-[calc(8.33%_+_98px)] top-[7405px] h-[544px] w-[610px] whitespace-pre-wrap leading-[0] ${BODY}`}>
        <p className="mb-0 leading-[1.5]">
          She was the one her college was sure about. Competitions won, college represented, an excellent portfolio, an
          impeccable resume. Everyone assumed she&rsquo;d place first and place highest.
        </p>
        <p className="mb-0 leading-[1.5]">&nbsp;</p>
        <p className="mb-0 leading-[1.5]">
          She had no idea what she wanted. Her friends were certain — a Masters, healthcare, lighting, UI/UX — and
          certain about her too: you&rsquo;ll walk into any of them. None of it moved her. She began to think something
          was wrong with her, and that she should just do what everyone was telling her to do.
        </p>
        <p className="mb-0 leading-[1.5]">&nbsp;</p>
        <p className="mb-0 leading-[1.5]">
          She came to us asking for help getting a job at a social enterprise. That was the only word she had for the
          pull she felt. Her backup was a Masters in design for social good.
        </p>
        <p className="mb-0 leading-[1.5]">&nbsp;</p>
        <p className="mb-0 leading-[1.5]">
          The options weren&rsquo;t wrong. The question was. Every one of them — including both of her own — was a seat
          in a building someone else had already built. In four years of design education, nobody had put the fourth
          option on the table: that she could build it. She wasn&rsquo;t confused. She was being asked the wrong
          question, by everyone who loved her, and by herself.
        </p>
        <p className="mb-0 leading-[1.5]">&nbsp;</p>
        <p className="leading-[1.5]">
          She now runs a social enterprise helping children in low-income communities find what they&rsquo;re uniquely
          good at. She later ran the Reveal instrument on herself. It came back conviction and venture — the two things
          she had already bet her life on.
        </p>
      </div>
      <p className="absolute left-[calc(16.67%_-_17px)] top-[7982px] h-[122px] w-[678px] font-sans text-[14px] font-light italic leading-[1.5] tracking-[-0.154px] text-ink">
        Disclosure: she is now a co-founder of Radikle. Her confusion is a large part of why Reveal exists — much of the
        instrument was built out of those conversations, and she was the first person we ever ran it on.
      </p>

      {/* ── FOR STUDIOS AND EMPLOYERS ───────────────────────────────────── */}
      <div className="absolute left-[calc(58.33%_+_72px)] top-[8220px] h-[186px] w-[395px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.layer14} alt="" placeholder="blank" imgClassName="absolute h-[146.77%] left-[-0.01%] top-[-46.77%] w-[83.56%] max-w-none" />
        </div>
      </div>
      <div className="absolute left-[calc(66.67%_+_15px)] top-[8349px] h-[185px] w-[237px]">
        <Asset src={A.folderF} alt="portfolio" />
      </div>
      <Reveal className="absolute left-[calc(16.67%_-_17px)] top-[8219px] h-[255px] w-[506px] font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal">
        For studios and employers.
      </Reveal>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[8390px] h-[134px] w-[507px] leading-[1.5] ${BODY}`}>
        The portfolio looked right. The skills were there. The hire was still wrong. Reveal gives you what the portfolio
        and the interview structurally cannot: who the designer actually is, and whether that is who your studio
        genuinely needs.
      </p>
      {/* CTA button */}
      <a
        href="#activate"
        className="group absolute left-[calc(8.33%_+_95px)] top-[8513px] flex h-[46px] w-[209px] items-center justify-center rounded-[70px] bg-teal font-sans text-[16px] tracking-tight0 text-peach transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0a3f40] hover:shadow-lg"
      >
        Activate for my studio
      </a>

      {/* ── shared chrome ───────────────────────────────────────────────── */}
      <Navbar />
      <Footer variant="violet" />
    </FixedCanvas>
  );
}
