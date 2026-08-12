import { FixedCanvas } from '../components/FixedCanvas';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Asset } from '../components/Asset';
import { Reveal } from '../components/Reveal';
import { A } from '../lib/assets';

/**
 * What we do ("What we do" frame, node 214:52) — reproduced at the exact
 * 1440x9489 Figma coordinates: the three-signal model, the gate diagram, the
 * neuroscience section and the three product doors. Olive footer band.
 */

const H1 = 'font-display text-[48px] font-semibold leading-[1.5] tracking-tightest text-teal';
const H2 = 'font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep';
const BODY = 'font-sans text-[16px] font-normal tracking-tight0 text-ink';

// The three product doors.
const DOORS = [
  {
    card: 'left-[calc(8.33%_+_89px)]',
    title: 'left-[calc(16.67%_+_3px)]',
    name: 'Reveal',
    body: 'left-[calc(16.67%_+_3px)]',
    text: 'Four years of group projects, a house style, and a portfolio built to please. Every portfolio in the batch looks the same — and the one thing that makes you different is the thing you’ve been editing out. Reveal reads who you actually are as a designer.',
    btn: 'left-[calc(16.67%_+_6px)]',
    btnTop: 'top-[8857px]',
    label: 'left-[calc(16.67%_+_78px)]',
    labelTop: 'top-[8879px]',
    cta: 'Learn more',
    to: '/reveal',
  },
  {
    card: 'left-[calc(33.33%_+_81px)]',
    title: 'left-[calc(41.67%_-_1px)]',
    name: 'Disha',
    body: 'left-[calc(41.67%_+_3px)]',
    text: 'For children whose gate is jammed shut by scarcity — no exposure, no materials, no permission, too much stress. Their capacities aren’t absent. They’re dormant.',
    btn: 'left-[calc(41.67%_+_3px)]',
    btnTop: 'top-[8854px]',
    label: 'left-[calc(41.67%_+_75px)]',
    labelTop: 'top-[8876px]',
    cta: 'Coming soon!',
    to: '/disha',
  },
  {
    card: 'left-[calc(58.33%_+_73px)]',
    title: 'left-[calc(66.67%_-_5px)]',
    name: 'Discover',
    body: 'left-[calc(66.67%_-_5px)]',
    text: 'For children with everything except room. Too many options, constant comparison, and every choice already made for them — often, lovingly, by us.',
    btn: 'left-[calc(66.67%_-_5px)]',
    btnTop: 'top-[8854px]',
    label: 'left-[calc(66.67%_+_67px)]',
    labelTop: 'top-[8876px]',
    cta: 'Coming soon!',
    to: '/discover',
  },
];

// The four "flow" pills.
const FLOW = [
  { card: 'left-[calc(8.33%_+_19px)]', w: 'w-[277px]', label: 'left-[311.5px]', text: 'Interest pull' },
  { card: 'left-[calc(25%_+_67px)]', w: 'w-[347px]', label: 'left-[calc(25%_+_240.5px)]', text: 'Deep practice' },
  { card: 'left-[calc(50%_+_66px)]', w: 'w-[284px]', label: 'left-[calc(41.67%_+_323.5px)]', text: 'Competence' },
  { card: 'left-[calc(75%_+_5px)]', w: 'w-[208px]', label: 'left-[calc(66.67%_+_228.5px)]', text: 'Passion' },
];

export default function WhatWeDo() {
  return (
    <FixedCanvas height={9489}>
      {/* base + bands */}
      <div className="absolute left-0 top-0 h-[9489px] w-[1440px] bg-peach" />
      <div className="absolute left-[10px] top-0 h-[6314px] w-[1440px] bg-ivory" />
      <div className="absolute left-[-30px] top-[722px] h-[1512px] w-[1470px] bg-olive" />
      <div className="absolute left-[-11px] top-[5536px] h-[1242px] w-[1570px] bg-sky/60" />
      <div className="absolute left-[-55px] top-[8221px] h-[805px] w-[1570px] bg-haze" />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <Reveal className={`absolute left-[calc(8.33%_+_93px)] top-[293px] h-[255px] w-[507px] ${H1}`}>
        We don&rsquo;t predict who a child will become.
      </Reveal>
      <p className={`absolute left-[calc(8.33%_+_93px)] top-[469px] h-[139px] w-[486px] leading-[1.5] ${BODY}`}>
        We build the conditions in which they discover it — and we watch closely enough to recognise it when it shows.
      </p>
      <div className="absolute left-[calc(58.33%_+_85.36px)] top-[274.73px] flex h-[248.114px] w-[182.916px] items-center justify-center">
        <div className="flex-none rotate-[-5.22deg]">
          <div className="relative h-[234.331px] w-[162.284px]">
            <Asset src={A.seedCluster} alt="seed" />
          </div>
        </div>
      </div>

      {/* ── THREE SIGNALS (olive) ───────────────────────────────────────── */}
      <Reveal className={`absolute left-[calc(25%_+_359.5px)] top-[789px] h-[255px] w-[633px] -translate-x-1/2 text-center ${H1}`}>
        None of them is a job title.
      </Reveal>
      <div className="absolute left-[calc(16.67%_+_3px)] top-[987px] h-[401px] w-[477px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.roots} alt="roots" imgClassName="absolute h-[100.26%] left-[-15.76%] top-[-0.13%] w-[155.59%] max-w-none" />
        </div>
      </div>
      <div className="absolute left-[calc(50%_+_68px)] top-[995px] flex h-[311.493px] w-[428.6px] items-center justify-center">
        <div className="flex-none rotate-[-6.15deg]">
          <div className="relative h-[270px] w-[402px]">
            <Asset src={A.waterCan} alt="water can" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(41.67%_+_10px)] top-[1557px] flex h-[260.289px] w-[299.727px] -scale-y-100 items-center justify-center">
        <div className="flex-none rotate-[-56.99deg]">
          <div className="relative h-[269.513px] w-[135.316px]">
            <Asset src={A.radikle} alt="radicle" />
          </div>
        </div>
      </div>
      <p className={`absolute left-[calc(16.67%_+_3px)] top-[929px] w-[641px] leading-[1.5] ${H2}`}>What they&rsquo;re good at.</p>
      <p className={`absolute left-[calc(16.67%_+_3px)] top-[988px] h-[139px] w-[345px] leading-[1.5] ${BODY}`}>
        The things they take to naturally and can keep getting better at.
      </p>
      <p className={`absolute left-[calc(58.33%_-_8px)] top-[1319px] w-[641px] leading-[1.5] ${H2}`}>How they engage.</p>
      <p className={`absolute left-[calc(58.33%_-_8px)] top-[1378px] h-[139px] w-[345px] leading-[1.5] ${BODY}`}>
        Their way of working, which stays much the same whatever they&rsquo;re doing — and there is no better end of
        this.
      </p>
      <p className={`absolute left-[calc(25%_+_361.5px)] top-[1808px] w-[641px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        What pulls them.
      </p>
      <p className={`absolute left-[calc(33.33%_+_241.5px)] top-[1868px] h-[139px] w-[345px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        What they keep doing when nobody&rsquo;s watching and there&rsquo;s no reward for it.
      </p>

      {/* ── NONE OF IT SHOWS ────────────────────────────────────────────── */}
      <Reveal className={`absolute left-[calc(8.33%_+_99px)] top-[2359px] h-[255px] w-[633px] ${H1}`}>
        None of it shows unless
        <br />
        the conditions allow it.
      </Reveal>
      <p className={`absolute left-[calc(33.33%_+_250px)] top-[2025px] h-[139px] w-[486px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Of the three, the pull is the engine. Being good at something, and being suited to how it works, don&rsquo;t make
        anyone move. Wanting to does. Which is why drive can&rsquo;t be handed to a child from outside — only uncovered,
        and fed.
      </p>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[2528px] h-[139px] w-[486px] leading-[1.5] ${BODY}`}>
        The environment sits between the child and the world like a gate. Open, and a real signal walks through —
        interest, practice they return to even when it&rsquo;s hard, competence, and finally this is me.
      </p>

      {/* ── GATE DIAGRAM ────────────────────────────────────────────────── */}
      <p className="absolute left-[calc(8.33%_+_99px)] top-[2679px] w-[409px] font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <span className="leading-[1.5]">The child arrives with </span>
        <span className="italic leading-[1.5]">aptitude and prior schema </span>
      </p>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[2793px] h-[139px] w-[335px] leading-[1.5] ${BODY}`}>
        not a blank slate, and not a finished verdict. Just what they came with, plus everything experience has already
        built.
      </p>
      <p className="absolute left-[calc(25%_+_359.5px)] top-[3072px] h-[168px] w-[625px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <span className="leading-[1.5]">The gate decides </span>
        <span className="italic leading-[1.5]">what gets to show.</span>
      </p>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[3181px] w-[409px] leading-[1.5] ${H2}`}>Jammed</p>
      <p className={`absolute left-[calc(58.33%_+_89px)] top-[3182px] w-[409px] leading-[1.5] ${H2}`}>Jammed again</p>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[3239px] h-[139px] w-[335px] leading-[1.5] ${BODY}`}>
        For an affluent child it is jammed by excess — noise, comparison, FOMO, and permission held by someone else.
      </p>
      <p className={`absolute left-[calc(58.33%_+_89px)] top-[3240px] h-[139px] w-[310px] leading-[1.5] ${BODY}`}>
        For a low-resource child it is jammed by absence — scarcity, stress, no exposure, no permission.
      </p>
      <p className={`absolute left-[calc(33.33%_+_239.5px)] top-[3415px] h-[139px] w-[493px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Some children have too little — no exposure, no permission, too much stress. Others have too much — too many
        options, too much comparison, and every choice already made for them. Both bury the same signal. Both look like a
        child with nothing there.
      </p>
      <p className="absolute left-[calc(33.33%_+_243.5px)] top-[3656px] h-[168px] w-[465px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[0] tracking-tight2 text-deep">
        <span className="leading-[1.5]">Then, and only then, the </span>
        <span className="italic leading-[1.5]">signals become apparent</span>
      </p>
      <p className={`absolute left-[calc(33.33%_+_243.5px)] top-[3782px] h-[139px] w-[493px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        capacities, dispositions, what pulls them. This is the honest part: we don&rsquo;t measure what&rsquo;s in a
        child. We read what a properly opened environment lets become visible.
      </p>
      <p className={`absolute left-[calc(33.33%_+_239.5px)] top-[4247px] h-[74px] w-[465px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        Agency is the ignition.
      </p>
      <p className={`absolute left-[calc(33.33%_+_239.5px)] top-[4321px] h-[139px] w-[493px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        The pull becomes self-drive — recruited by real choice, genuine competence, and an adult who stays close without
        taking over. This is the one thing that cannot be installed from outside.
      </p>
      <p className={`absolute left-[calc(33.33%_+_225.5px)] top-[4628px] h-[74px] w-[465px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        Child flourishes
      </p>
      <p className={`absolute left-[calc(33.33%_+_240px)] top-[5302px] h-[74px] w-[486px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        The environment reads back out
      </p>
      <p className={`absolute left-[calc(33.33%_+_239.5px)] top-[5376px] h-[42px] w-[493px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        How a child works is a description of the conditions they need. So the same environment appears twice: a gate to
        open on the way in, and conditions to build on the way out.
      </p>
      {/* diagram illustration slots */}
      <div className="absolute left-[calc(41.67%_+_57px)] top-[2811px] h-[211px] w-[146px]">
        <Asset src={A.seedCluster} alt="seed" />
      </div>
      <div className="absolute left-[calc(41.67%_-_0.32px)] top-[2701.62px] flex h-[432.435px] w-[542.627px] items-center justify-center">
        <div className="flex-none rotate-[9.39deg]">
          <div className="relative h-[357.133px] w-[490.945px] rounded-[23px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[23px]">
              <Asset src={A.layer20} alt="illustration" imgClassName="absolute h-full left-[-5.91%] top-0 w-[105.92%] max-w-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(41.67%_+_34px)] top-[3902px] h-[295px] w-[171px]">
        <Asset src={A.layer23} alt="" placeholder="blank" />
      </div>
      <div className="absolute left-[calc(8.33%_+_50px)] top-[3292px] flex h-[395.038px] w-[387.504px] items-center justify-center">
        <div className="flex-none rotate-[46.85deg]">
          <div className="relative h-[194.18px] w-[359.448px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Asset src={A.layer22b} alt="" placeholder="blank" imgClassName="absolute h-[159.34%] left-[-4.16%] top-[-59.34%] w-[104.16%] max-w-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(58.33%_+_56px)] top-[3285px] flex h-[395.038px] w-[387.504px] -scale-y-100 items-center justify-center">
        <div className="flex-none rotate-[133.15deg]">
          <div className="relative h-[194.18px] w-[359.448px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Asset src={A.layer22b} alt="" placeholder="blank" imgClassName="absolute h-[159.34%] left-[-4.16%] top-[-59.34%] w-[104.16%] max-w-none" />
            </div>
          </div>
        </div>
      </div>

      {/* flow pills */}
      {FLOW.map((f, i) => (
        <div key={`flow-${i}`} className={`absolute h-[117px] rounded-[70px] bg-olive top-[4738px] ${f.card} ${f.w}`} />
      ))}
      {FLOW.map((f, i) => (
        <p
          key={`flowlbl-${i}`}
          className={`absolute h-[74px] w-[465px] -translate-x-1/2 text-center font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-deep top-[4772px] ${f.label}`}
        >
          {f.text}
        </p>
      ))}
      <div className="absolute left-[calc(41.67%_+_94px)] top-[4891px] h-[373px] w-[543px]">
        <Asset src={A.layer27} alt="illustration" />
      </div>
      <div className="absolute left-[calc(16.67%_+_78px)] top-[4892px] h-[149px] w-[843px]">
        <Asset src={A.layer28} alt="illustration" />
      </div>

      {/* ── WHERE ALL THREE OVERLAP (sky) ───────────────────────────────── */}
      <Reveal className={`absolute left-[calc(8.33%_+_99px)] top-[5633px] h-[255px] w-[507px] ${H1}`}>
        Where all three overlap and
        <br />
        hold steady
      </Reveal>
      <p className={`absolute left-[calc(8.33%_+_99px)] top-[5870px] h-[139px] w-[486px] leading-[1.5] ${BODY}`}>
        The environment sits between the child and the world like a gate. Open, and a real signal walks through —
        interest, practice they return to even when it&rsquo;s hard, competence, and finally this is me.
      </p>
      <Reveal className={`absolute left-[calc(50%_-_10px)] top-[6605px] h-[255px] w-[600px] ${H1}`}>
        that&rsquo;s their element
      </Reveal>

      {/* ── PORTRAIT / CONDITIONS / DIRECTIONS ──────────────────────────── */}
      <div className="absolute left-[calc(16.67%_+_9px)] top-[6045px] h-[192px] w-[217px]">
        <Asset src={A.portrait} alt="portrait" />
      </div>
      <div className="absolute left-[calc(41.67%_+_6px)] top-[6045px] h-[193px] w-[228px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.sun} alt="sun" imgClassName="absolute h-full left-0 top-0 w-[164.23%] max-w-none" />
        </div>
      </div>
      <div className="absolute left-[calc(58.33%_+_85px)] top-[6054px] h-[173px] w-[326px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.rectangle103} alt="photo" imgClassName="absolute h-full left-[-4.95%] top-0 w-[87.23%] max-w-none" />
        </div>
      </div>
      <p className={`absolute left-[calc(8.33%_+_241.5px)] top-[6277px] h-[47px] w-[339px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        A portrait
      </p>
      <p className={`absolute left-[calc(41.67%_+_116px)] top-[6305px] w-[244px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        The conditions they need
      </p>
      <p className={`absolute left-[calc(58.33%_+_193.5px)] top-[6253px] w-[207px] -translate-x-1/2 text-center leading-[1.5] ${H2}`}>
        Directions, not a verdict
      </p>
      <p className={`absolute left-[calc(16.67%_+_129px)] top-[6336px] h-[139px] w-[272px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        How this specific person meets the world — with the evidence behind it, not a label.
      </p>
      <p className={`absolute left-[calc(33.33%_+_236px)] top-[6414px] h-[115px] w-[272px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        Where they thrive, where they stretch, and where they quietly wither. Most people are never told the third one.
      </p>
      <p className={`absolute left-[calc(58.33%_+_191px)] top-[6362px] h-[115px] w-[212px] -translate-x-1/2 text-center leading-[1.5] ${BODY}`}>
        A handful of real options that fit — which widen and sharpen as they grow.
      </p>

      {/* ── NEUROSCIENCE ────────────────────────────────────────────────── */}
      <Reveal className={`absolute left-[calc(16.67%_-_17px)] top-[6882px] h-[255px] w-[771px] ${H1}`}>
        Neuroscience is the foundation.
        <br />
        It is not the measurement.
      </Reveal>
      <p className={`absolute left-[calc(8.33%_+_100px)] top-[7044px] h-[139px] w-[560px] leading-[1.5] ${BODY}`}>
        We read behaviour and infer developmental state. The science tells us why those behaviours mean what we say they
        mean. It does not let us read anyone&rsquo;s brain, and we don&rsquo;t claim it does.
      </p>
      <p className={`absolute left-[calc(16.67%_-_17px)] top-[7197px] w-[244px] leading-[1.5] ${H2}`}>Why the gate is multiplicative</p>
      <p className={`absolute left-[calc(16.67%_-_15px)] top-[7306px] h-[139px] w-[444px] leading-[1.5] ${BODY}`}>
        Development runs on experience-dependent plasticity. Enrichment and deprivation produce real structural
        differences, chronic stress measurably impairs the very systems that do the growing, and some windows close.
      </p>
      <p className={`absolute left-[calc(58.33%_-_8px)] top-[7457px] w-[244px] leading-[1.5] ${H2}`}>Why drive can&rsquo;t be forced</p>
      <p className={`absolute left-[calc(58.33%_-_6px)] top-[7566px] h-[139px] w-[333px] leading-[1.5] ${BODY}`}>
        What pulls a person runs on the brain&rsquo;s seeking circuitry — and controlling, reward-heavy environments
        measurably suppress the very motivation they&rsquo;re trying to produce.
      </p>
      <p className={`absolute left-[calc(16.67%_-_15px)] top-[7764px] w-[313px] leading-[1.5] ${H2}`}>Why more activities isn&rsquo;t richer</p>
      <p className={`absolute left-[calc(16.67%_-_13px)] top-[7873px] h-[139px] w-[333px] leading-[1.5] ${BODY}`}>
        Development comes from sustained, deepening engagement — not from the number of settings a child is exposed to.
        Eight activities isn&rsquo;t enrichment. It&rsquo;s noise.
      </p>
      <div className="absolute left-[calc(58.33%_+_4px)] top-[7276px] h-[148px] w-[314px]">
        <Asset src={A.ground} alt="ground" />
      </div>
      <div className="absolute left-[calc(25%_+_72px)] top-[7407px] flex h-[394.815px] w-[396.299px] items-center justify-center">
        <div className="flex-none rotate-[38.65deg]">
          <div className="relative h-[276.684px] w-[286.17px]">
            <Asset src={A.layer31} alt="illustration" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(41.67%_+_100px)] top-[7860px] h-[176px] w-[188px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Asset src={A.aspirational} alt="illustration" imgClassName="absolute h-[180.34%] left-0 top-[-80.01%] w-full max-w-none" />
        </div>
      </div>

      {/* ── ONE FRAMEWORK, THREE DOORS (haze) ───────────────────────────── */}
      <Reveal className={`absolute left-[calc(16.67%_+_479.5px)] top-[8279px] h-[255px] w-[771px] -translate-x-1/2 whitespace-pre-wrap text-center ${H1}`}>
        One framework.
        <br />
        Three doors.
      </Reveal>
      {DOORS.map((d) => (
        <div
          key={d.name}
          className={`group absolute top-[8473px] h-[415px] w-[317px] rounded-[70px] bg-teal transition-transform duration-300 hover:-translate-y-1 ${d.card}`}
        />
      ))}
      {DOORS.map((d) => (
        <p
          key={`${d.name}-title`}
          className={`absolute top-[8552px] w-[313px] font-display text-[32px] font-semibold leading-[1.5] tracking-tight2 text-peach ${d.title}`}
        >
          {d.name}
        </p>
      ))}
      {DOORS.map((d) => (
        <p
          key={`${d.name}-body`}
          className={`absolute top-[8615px] h-[227px] w-[224px] font-sans text-[16px] font-normal leading-[1.5] tracking-tight0 text-peach ${d.body}`}
        >
          {d.text}
        </p>
      ))}
      {DOORS.map((d) => (
        <a
          key={`${d.name}-btn`}
          href={d.to}
          className={`group absolute flex h-[67px] w-[244px] items-center justify-center rounded-[70px] bg-olive font-sans text-[16px] leading-[1.5] tracking-tight0 text-deep transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 ${d.btn} ${d.btnTop}`}
        >
          {d.cta}
        </a>
      ))}

      {/* ── shared chrome ───────────────────────────────────────────────── */}
      <Navbar />
      <Footer variant="olive" />
    </FixedCanvas>
  );
}
