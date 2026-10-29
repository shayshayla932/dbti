import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type React from "react";
import { TextScramble } from "@/components/motion/text-scramble";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Button } from "@/components/motion/button/base";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { Character, FACE } from "./Character";
import { AXES, FAMILIES, TYPES, TYPE_ORDER, WHY, computeResult, type Effect, type Family, type Lang, type Result, type T2, type TypeCode } from "./data";
import { useLang } from "./i18n";
import { PrimaryButton, QUESTIONS } from "./questions";
import { StickerBoard } from "./Cover";
import { useStats, type Totals } from "./stats";
import { inClaude, renderCard, shareUrl } from "./shareCard";

const FAM_TEXT: Record<Family, string> = { pixel: "text-fam-pixel", client: "text-fam-client", ship: "text-fam-ship", chaos: "text-fam-chaos" };
const FAM_BG: Record<Family, string> = { pixel: "bg-fam-pixel", client: "bg-fam-client", ship: "bg-fam-ship", chaos: "bg-fam-chaos" };
const famTint = (f: Family, pct = 16) => `color-mix(in srgb, var(--fam-${f}) ${pct}%, var(--background))`;

type Screen = "intro" | "quiz" | "result" | "shared";

function codeFromHash(): TypeCode | null {
  try {
    const m = /^#t-([a-z]{4})$/i.exec(window.location.hash);
    if (!m) return null;
    const c = m[1].toUpperCase() as TypeCode;
    return TYPE_ORDER.includes(c) ? c : null;
  } catch { return null; }
}
function setHash(code: TypeCode | null) {
  try {
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", code ? `${base}#t-${code.toLowerCase()}` : base);
  } catch { /* the frame may not allow it; sharing still works through the copied link */ }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function useDownloads() {
  const [dl, setDl] = useState<any>(null);
  useEffect(() => {
    const c = (window as any).claude;
    if (!c?.use) return;
    c.use("downloads").then((d: any) => setDl(d)).catch(() => setDl(null));
  }, []);
  return dl;
}

export default function App() {
  const { tx } = useLang();
  const [screen, setScreen] = useState<Screen>("intro");
  const [step, setStep] = useState(0);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [fixedAt, setFixedAt] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [gallery, setGallery] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [sharedCode, setSharedCode] = useState<TypeCode | null>(null);
  const reduce = useReducedMotion();
  const stats = useStats();

  useEffect(() => {
    const read = () => {
      const c = codeFromHash();
      if (c) { setSharedCode(c); setScreen("shared"); }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const openedTracked = useRef(false);
  useEffect(() => {
    if (screen === "shared" && !openedTracked.current) { openedTracked.current = true; stats.track("open"); }
  }, [screen, stats]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [screen, step, reduce]);

  const start = () => {
    stats.track("start");
    setHash(null);
    setEffects([]);
    setFixedAt(null);
    setStep(0);
    setResult(null);
    setScreen("quiz");
  };

  const answer = (e: Effect) => {
    const next = [...effects, e];
    setEffects(next);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else {
      const res = computeResult(next, fixedAt);
      setResult(res);
      setScreen("result");
      stats.track("finish", res.type.code);
      setHash(res.type.code);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar
        screen={screen}
        step={step}
        fixed={fixedAt !== null}
        onFix={() => { if (fixedAt === null) setFixedAt(step + 1); }}
        onHome={() => { setHash(null); setScreen("intro"); }}
        isOwner={stats.isOwner}
        onData={() => setDataOpen(true)}
      />
      <main className="gutter mx-auto w-full max-w-[1040px] pb-20">
        <AnimatePresence mode="wait">
          {screen === "intro" && (
            <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <Intro onStart={start} onGallery={() => setGallery(true)} people={stats.totals?.people ?? 0} />
            </motion.div>
          )}
          {screen === "quiz" && (
            <motion.div key={`q${step}`} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
              <QuestionScreen step={step} onDone={answer} />
            </motion.div>
          )}
          {screen === "shared" && sharedCode && (
            <motion.div key="shared" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SharedView code={sharedCode} onStart={start} onGallery={() => setGallery(true)} totals={stats.totals} />
            </motion.div>
          )}
          {screen === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ResultView result={result} fixedAt={fixedAt} onRestart={start} onGallery={() => setGallery(true)} totals={stats.totals} onShared={(k) => stats.track(k)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomSheet open={gallery} onOpenChange={setGallery} title={tx("12 种设计师人格", "All 12 designer types")} snapPoints={[0.88]}>
        <Gallery highlight={result?.type.code ?? sharedCode ?? undefined} />
      </BottomSheet>
      {stats.isOwner && (
        <BottomSheet open={dataOpen} onOpenChange={setDataOpen} title={tx("测试数据", "Test data")} snapPoints={[0.88]}>
          <DataPanel totals={stats.totals} />
        </BottomSheet>
      )}
    </div>
  );
}

/* ---------- navigation bar ---------- */

function Segmented() {
  const { lang, setLang } = useLang();
  const opts: { v: Lang; label: string }[] = [{ v: "zh", label: "中文" }, { v: "en", label: "EN" }];
  return (
    <div role="radiogroup" aria-label="Language" className="relative flex h-8 rounded-[9px] bg-[rgb(118_118_128/0.12)] p-[2px] dark:bg-[rgb(118_118_128/0.24)]">
      {opts.map((o) => {
        const on = lang === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setLang(o.v)}
            className="relative z-10 min-w-[50px] rounded-[7px] px-2.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {on && (
              <motion.span layoutId="seg-thumb" transition={SPRING_LAYOUT} className="absolute inset-0 -z-10 rounded-[7px] bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] dark:bg-[#636366]" />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function NavBar({ screen, step, fixed, onFix, onHome, isOwner, onData }: { screen: Screen; step: number; fixed: boolean; onFix: () => void; onHome: () => void; isOwner: boolean; onData: () => void }) {
  const { tx } = useLang();
  const total = QUESTIONS.length;
  const progress = screen === "quiz" ? (step + 1) / total : screen === "result" ? 1 : 0;
  return (
    <header className="sticky z-30 border-b-[0.5px] border-border bg-canvas/80 backdrop-blur-xl backdrop-saturate-150" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="gutter mx-auto flex h-[52px] w-full max-w-[1040px] items-center justify-between gap-3">
        {screen === "intro" ? (
          <span className="text-[17px] font-semibold tracking-[-0.02em]">DBTI</span>
        ) : (
          <button type="button" onClick={onHome} className="-ml-1.5 flex items-center gap-0.5 rounded-md px-1 text-[17px] text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:opacity-50">
            <svg viewBox="0 0 12 20" className="h-[17px] w-[10px]" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {tx("首页", "Home")}
          </button>
        )}
        <div className="flex items-center gap-2.5">
          {isOwner && (
            <button type="button" onClick={onData} aria-label={tx("测试数据", "Test data")} className="grid size-8 place-items-center rounded-full text-primary outline-none hover:bg-[rgb(118_118_128/0.12)] focus-visible:ring-2 focus-visible:ring-primary/40 active:opacity-60">
              <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true"><path d="M3 17V9M8 17V4M13 17v-6M18 17V7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
          )}
          {screen !== "intro" && screen !== "shared" && (
            <motion.button
              type="button"
              onClick={onFix}
              aria-label="v1.0"
              initial={false}
              animate={fixed ? { rotate: 0, y: 0 } : { rotate: 2.4, y: 1.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              className="rounded-[6px] bg-[rgb(118_118_128/0.12)] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground dark:bg-[rgb(118_118_128/0.24)]"
            >
              v1.0
            </motion.button>
          )}
          <Segmented />
        </div>
      </div>
      {screen === "quiz" && (
        <div className="h-[2.5px] w-full bg-transparent">
          <motion.div className="h-full rounded-r-full bg-primary" initial={false} animate={{ width: `${progress * 100}%` }} transition={SPRING_LAYOUT} />
        </div>
      )}
    </header>
  );
}

/* ---------- shared list pieces ---------- */

function Group({ header, footer, children, className }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {header && <div className="section-header">{header}</div>}
      <div className="cell overflow-hidden">{children}</div>
      {footer && <div className="section-footer">{footer}</div>}
    </section>
  );
}

function IconTile({ color, children }: { color: string; children: ReactNode }) {
  return <span className="grid size-[29px] shrink-0 place-items-center rounded-[7px] text-white" style={{ background: color }}>{children}</span>;
}

function Chevron() {
  return <svg viewBox="0 0 8 14" className="h-[13px] w-[7px] shrink-0 text-muted-foreground/70" aria-hidden="true"><path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Avatar({ code, size = 44 }: { code: TypeCode; size?: number }) {
  const f = TYPES[code].family;
  const h = size * 4;
  const w = (h * 1000) / 480;
  const [fx, fy] = FACE[code];
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, background: famTint(f, 28) }}>
      <span
        aria-hidden="true"
        className="absolute"
        style={{ width: w, height: h, left: size / 2 - (fx / 100) * w, top: size / 2 - (fy / 100) * h + size * 0.08 }}
      >
        <Character code={code} className="block h-full w-full" title="" />
      </span>
    </span>
  );
}

function CastName({ code }: { code: TypeCode }) {
  const { t } = useLang();
  return <span className="text-[12px] text-muted-foreground">{t(TYPES[code].name)}</span>;
}

/* ---------- intro ---------- */

function CoverText({ onStart, onGallery, people = 0 }: { onStart: () => void; onGallery: () => void; people?: number }) {
  const { tx } = useLang();
  return (
    <div className="relative z-[1] mx-auto max-w-[520px] text-center">
      <div className="frame-label mb-3">Designer Behavior Type Indicator</div>
      <div className="relative mx-auto inline-block px-3 py-1">
        <h1 className="font-cover text-[64px] font-extrabold leading-none tracking-tight sm:text-[104px]">DBTI</h1>
        <span className="pointer-events-none absolute inset-0 border-[1.5px] border-primary" aria-hidden="true" />
        {["-left-1 -top-1", "-right-1 -top-1", "-left-1 -bottom-1", "-right-1 -bottom-1"].map((p) => (
          <span key={p} className={cn("handle", p)} aria-hidden="true" />
        ))}
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground" aria-hidden="true">
          Hug × Hug
        </span>
      </div>
      <h2 className="mt-12 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{tx("设计民工也有自己的 BTI", "Designers get a BTI too")}</h2>
      <p className="mx-auto mt-3 max-w-[26rem] text-[15px] leading-7 text-muted-foreground">
        {tx(
          "MBTI 测的是你是谁，DBTI 测的是你改到第几版会崩。10 道题，全是上班日常。",
          "MBTI tells you who you are. DBTI tells you which revision breaks you. Ten questions, all from your workday.",
        )}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button size="lg" onClick={onStart}>{tx("开始测试", "Start the test")}</Button>
        <Button size="lg" variant="ghost" onClick={onGallery}>{tx("先看 12 种人格", "See all 12 types")}</Button>
      </div>
      {people > 0 && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-ios-green/60" /><span className="relative size-2 rounded-full bg-ios-green" /></span>
          {tx(`已有 ${people} 位设计民工测过`, `${people} designer${people === 1 ? "" : "s"} have taken it`)}
        </div>
      )}
    </div>
  );
}

function useWideCover() {
  const q = "(min-width: 1024px)";
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

function Intro({ onStart, onGallery, people }: { onStart: () => void; onGallery: () => void; people: number }) {
  const wide = useWideCover();
  if (wide) {
    return (
      <StickerBoard className="cover-canvas mt-6 h-[760px] overflow-hidden rounded-[28px] px-6 pt-28">
        <CoverText onStart={onStart} onGallery={onGallery} people={people} />
      </StickerBoard>
    );
  }
  return (
    <section className="cover-canvas -mx-4 overflow-hidden px-4 pb-4 pt-10 sm:mx-0 sm:rounded-[28px] sm:px-6">
      <CoverText onStart={onStart} onGallery={onGallery} people={people} />
      <StickerBoard className="mx-auto mt-8 aspect-[1/2] w-full max-w-[520px]" />
    </section>
  );
}

/* ---------- question ---------- */

function QuestionScreen({ step, onDone }: { step: number; onDone: (e: Effect) => void }) {
  const { tx, t } = useLang();
  const q = QUESTIONS[step];
  const Q = q.C;
  return (
    <section className="mx-auto max-w-[560px] pt-5 sm:pt-8">
      <div className="text-[13px] font-medium text-muted-foreground">
        {tx(`第 ${step + 1} 题，共 ${QUESTIONS.length} 题`, `Question ${step + 1} of ${QUESTIONS.length}`)} · {t(q.tag)}
      </div>
      <h1 className="mb-5 mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.025em] sm:text-[34px]">{t(q.title)}</h1>
      <Q onDone={onDone} />
    </section>
  );
}

/* ---------- result ---------- */

function pctOf(totals: Totals | null, code: TypeCode) {
  if (!totals || totals.people < 5) return null;
  return Math.max(1, Math.round((100 * totals.byType[code]) / totals.people));
}

function ResultView({ result, fixedAt, onRestart, onGallery, totals, onShared }: { result: Result; fixedAt: number | null; onRestart: () => void; onGallery: () => void; totals: Totals | null; onShared: (k: "share" | "save") => void }) {
  const { tx, t, lang } = useLang();
  const r = result.type;
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const pct = pctOf(totals, r.code);
  const shareText = tx(
    `我的 DBTI 设计师人格是 ${r.code}「${r.name.zh}」：${r.line.zh}。你是哪种设计师？`,
    `My DBTI designer type is ${r.code}, “${r.name.en}”: ${r.line.en}. What kind of designer are you?`,
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.getElementById("share-text");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };
  const hiddenLine = fixedAt !== null
    ? tx(`你在第 ${fixedAt} 题时，把右上角歪了 2.4° 的版本标签扶正了。`, `On question ${fixedAt}, you straightened the version tag that was tilted 2.4°.`)
    : tx("右上角的版本标签全程歪了 2.4°，你一直没发现。没关系，用户也不会发现。", "The version tag up top was tilted 2.4° the whole time. You never noticed. Neither will users.");

  return (
    <section className="pt-5 sm:pt-8">
      <div className="text-[13px] font-medium text-muted-foreground">{tx("你的结果", "Your result")}</div>
      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
        {/* hero */}
        <div className="lg:sticky lg:top-20">
          <div className="cell overflow-hidden">
            <div className="relative">
              <motion.div initial={{ scale: 1.04, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
                <Character code={r.code} className="block h-auto w-full" />
              </motion.div>
              <div className="absolute right-[6%] top-[34%] flex flex-col items-end [--scribble-ink:#1C1C1E] [--scribble-mark:#E9FF4F]">
                <span className="scribble rotate-[-4deg] text-[26px] leading-none">{tx("就是你", "that's you")}</span>
                <svg viewBox="0 0 50 40" className="mr-6 h-8 w-10 text-[var(--scribble-ink)]" aria-hidden="true"><path d="M44 4 C 40 20, 28 30, 8 34 M8 34 L16 27 M8 34 L17 38" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
              </div>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <span className={cn("rounded-full px-2 py-0.5 text-white", FAM_BG[r.family])}>{t(FAMILIES[r.family].name)}</span>
                <span className="rounded-full bg-card px-2 py-0.5 text-muted-foreground">{r.rarity}</span>
              </div>
              <TextScramble key={r.code} text={r.code} duration={900} className={cn("mt-3 text-[52px] font-black leading-none tracking-[-0.04em]", FAM_TEXT[r.family])} />
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">{t(r.name)}</h1>
              <p className="mt-1 text-[17px] text-muted-foreground">{t(r.line)}</p>
              {pct !== null && totals && (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {tx(`测过的 ${totals.people} 人里，${pct}% 和你一样`, `${pct}% of ${totals.people} people got the same`)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* details */}
        <div className="min-w-0 space-y-7">
          <Group header={tx("人格维度", "Dimensions")}>
            {AXES.map((ax, i) => {
              const left = result.axes[i];
              const leftWins = left >= 50;
              const val = leftWins ? left : 100 - left;
              return (
                <div key={ax.left.en} className="row-inset px-4 py-3">
                  <div className="mb-2 flex items-baseline justify-between text-[15px]">
                    <span className={leftWins ? "font-semibold" : "text-muted-foreground"}>{t(ax.left)}</span>
                    <span className={cn("tabular-nums text-[13px] font-semibold", FAM_TEXT[r.family])}>
                      <AnimatedNumber value={val} format={(n) => `${Math.round(n)}% ${leftWins ? t(ax.left) : t(ax.right)}`} />
                    </span>
                    <span className={!leftWins ? "font-semibold" : "text-muted-foreground"}>{t(ax.right)}</span>
                  </div>
                  <div className="relative h-[6px] rounded-full bg-card">
                    <motion.div
                      className={cn("absolute top-0 h-full rounded-full", FAM_BG[r.family])}
                      style={leftWins ? { left: 0 } : { right: 0 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + i * 0.08 }}
                    />
                  </div>
                </div>
              );
            })}
          </Group>

          <Group header={tx("你做了什么", "What you did")}>
            {result.log.map((l, i) => (
              <div key={i} className="row-inset flex gap-3 px-4 py-2.5 [--sep-inset:52px]">
                <span className="w-6 shrink-0 pt-[2px] text-[13px] font-medium tabular-nums text-muted-foreground">Q{i + 1}</span>
                <span className="min-w-0 text-[15px] leading-[1.4]">{l[lang]}</span>
              </div>
            ))}
          </Group>

          <Group header={tx("隐藏题", "Hidden question")}>
            <div className="flex gap-3 px-4 py-3">
              <span className="w-[3px] shrink-0 rounded-full bg-redline" />
              <span className="text-[15px] leading-[1.45]">{hiddenLine}</span>
            </div>
          </Group>

          <Group header={tx("你的日常", "Sounds like you")}>
            {r.traits[lang].map((tr) => (
              <div key={tr} className="row-inset flex items-start gap-3 px-4 py-2.5 [--sep-inset:32px]">
                <span className={cn("mt-[9px] size-1.5 shrink-0 rounded-full", FAM_BG[r.family])} />
                <span className="text-[15px] leading-[1.45]">{tr}</span>
              </div>
            ))}
          </Group>

          <Group header={tx("关系", "Relationships")}>
            {([[tx("最配搭子", "Best match"), r.bestie, WHY[r.code].bestie, "bestie"], [tx("天生相克", "Nemesis"), r.enemy, WHY[r.code].enemy, "enemy"]] as [string, TypeCode, T2, string][]).map(([label, code, why, kind]) => (
              <button key={label} type="button" onClick={onGallery} className="row-inset flex w-full items-start gap-3 px-4 py-3 text-left active:bg-card [--sep-inset:72px]">
                <Avatar code={code} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <span className={cn("size-1.5 rounded-full", kind === "bestie" ? "bg-ios-green" : "bg-redline")} />
                    {label}
                  </span>
                  <span className="block truncate text-[17px]"><span className={cn("font-bold", FAM_TEXT[TYPES[code].family])}>{code}</span> {t(TYPES[code].name)}</span>
                  <span className="mt-1 block text-[14px] leading-[1.45] text-muted-foreground">{t(why)}</span>
                </span>
                <Chevron />
              </button>
            ))}
          </Group>

          <div>
            <p id="share-text" className="sr-only">{shareText}</p>
            <PrimaryButton onClick={() => setShareOpen(true)}>{tx("分享结果", "Share result")}</PrimaryButton>
            <button type="button" onClick={onRestart} className="mt-2 h-11 w-full rounded-[14px] text-[17px] text-primary active:opacity-60">{tx("再测一次", "Retake")}</button>
          </div>
        </div>
      </div>
      <BottomSheet open={shareOpen} onOpenChange={setShareOpen} title={tx("分享你的结果", "Share your result")} snapPoints={[0.92]}>
        <ShareSheet code={r.code} pct={pct} open={shareOpen} shareText={shareText} copied={copied} onCopyText={copy} onShared={onShared} />
      </BottomSheet>
    </section>
  );
}

/* ---------- share ---------- */

function ShareSheet({ code, pct, open, shareText, onShared }: { code: TypeCode; pct: number | null; open: boolean; shareText: string; copied: boolean; onCopyText: () => void; onShared: (k: "share" | "save") => void }) {
  const { tx, lang } = useLang();
  const dl = useDownloads();
  const [url, setUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const link = shareUrl(code);
  const linkText = `${shareText}\n${link}`;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    let made: string | null = null;
    renderCard(code, lang, { pct }).then((b) => {
      if (!alive) return;
      blobRef.current = b;
      made = URL.createObjectURL(b);
      setUrl(made);
    }).catch(() => setStatus(lang === "zh" ? "卡片生成失败，可以先复制链接分享。" : "Couldn't make the card. You can still copy the link."));
    return () => { alive = false; if (made) URL.revokeObjectURL(made); setUrl(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, code, lang, pct]);

  const nativeShare = async () => {
    const b = blobRef.current;
    if (!b) return;
    const file = new File([b], `DBTI-${code}.png`, { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "DBTI", text: linkText });
      onShared("share");
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") setStatus(tx("系统分享没打开，可以长按上面的图片保存。", "Couldn't open sharing. Long-press the image to save it."));
    }
  };
  const canNativeShare = (() => {
    try {
      return !inClaude() && typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [new File([new Blob(["x"])], "x.png", { type: "image/png" })] });
    } catch { return false; }
  })();
  const anchorSave = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `DBTI-${code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onShared("save");
    setStatus(tx("卡片已保存", "Card saved"));
  };
  const save = async () => {
    if (!dl) { anchorSave(); return; }
    if (!blobRef.current) return;
    setStatus(null);
    try {
      await dl.save({ filename: `DBTI-${code}.png`, data: blobRef.current });
      onShared("save");
      setStatus(tx("卡片已保存", "Card saved"));
    } catch (e: unknown) {
      const c = (e as { code?: string })?.code;
      if (c === "declined") return;
      setStatus(c === "rate_limited" ? tx("稍等一下再试", "Wait a moment and try again") : tx("这里没法直接保存，长按或右键上面的图片保存。", "Saving isn't available here. Long-press or right-click the image to save it."));
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkText);
      setLinkCopied(true);
      onShared("share");
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      const el = document.getElementById("share-link-text");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        onShared("share");
        setStatus(tx("已选中链接，按 ⌘C / 长按复制", "Link selected. Press ⌘C or long-press to copy."));
      }
    }
  };

  return (
    <div className="pb-8">
      <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[18px] bg-card shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)]">
        {url ? (
          <img src={url} alt={tx(`DBTI 结果卡片：${code}`, `DBTI result card: ${code}`)} className="block h-auto w-full" />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center text-[13px] text-muted-foreground">
            <motion.span className="block size-5 rounded-full border-2 border-border-strong border-t-primary" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[12px] text-muted-foreground">{tx("卡片上有二维码，扫码就能测。也可以长按图片保存。", "The card has a QR code that opens the test. You can also long-press to save it.")}</p>

      <div className="mt-5 space-y-2">
        {canNativeShare && <PrimaryButton disabled={!url} onClick={nativeShare}>{tx("分享图片和链接", "Share image and link")}</PrimaryButton>}
        {(dl || !inClaude()) && !canNativeShare && <PrimaryButton disabled={!url} onClick={save}>{tx("保存卡片图片", "Save card image")}</PrimaryButton>}
        <button type="button" onClick={copyLink} className={cn("h-[50px] w-full rounded-[14px] text-[17px] font-semibold active:scale-[0.98]", dl || !inClaude() ? "bg-card text-primary" : "bg-primary text-primary-foreground")}>
          {linkCopied ? tx("已复制链接", "Link copied") : tx("复制链接", "Copy link")}
        </button>
      </div>
      <p id="share-link-text" className="mt-3 select-all break-all rounded-[10px] bg-card px-3 py-2 text-[12px] leading-[1.5] text-muted-foreground">{linkText}</p>
      {status && <p className="mt-2 text-center text-[13px] text-muted-foreground" role="status">{status}</p>}
    </div>
  );
}

function SharedView({ code, onStart, onGallery, totals }: { code: TypeCode; onStart: () => void; onGallery: () => void; totals: Totals | null }) {
  const { tx, t } = useLang();
  const r = TYPES[code];
  const pct = pctOf(totals, code);
  return (
    <section className="mx-auto max-w-[480px] pt-6 sm:pt-10">
      <div className="text-[13px] font-medium text-muted-foreground">{tx("有人分享了 Ta 的结果", "Someone shared their result")}</div>
      <div className="cell mt-2 overflow-hidden">
        <Character code={code} className="block h-auto w-full" />
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className={cn("rounded-full px-2 py-0.5 text-white", FAM_BG[r.family])}>{t(FAMILIES[r.family].name)}</span>
            <span className="rounded-full bg-card px-2 py-0.5 text-muted-foreground">{r.rarity}</span>
          </div>
          <div className={cn("mt-3 text-[52px] font-black leading-none tracking-[-0.04em]", FAM_TEXT[r.family])}>{code}</div>
          <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">{t(r.name)}</h1>
          <p className="mt-1 text-[17px] text-muted-foreground">{t(r.line)}</p>
          {pct !== null && totals && <p className="mt-3 text-[13px] text-muted-foreground">{tx(`测过的 ${totals.people} 人里，${pct}% 是这个类型`, `${pct}% of ${totals.people} people got this type`)}</p>}
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={onStart}>{tx("我也测一下", "Take the test")}</PrimaryButton>
        <button type="button" onClick={onGallery} className="mt-2 h-11 w-full rounded-[14px] text-[17px] text-primary active:opacity-60">{tx("看看 12 种人格", "See all 12 types")}</button>
      </div>
    </section>
  );
}

/* ---------- owner data ---------- */

function DataPanel({ totals }: { totals: Totals | null }) {
  const { tx, t } = useLang();
  if (!totals) {
    return <p className="py-10 text-center text-[15px] text-muted-foreground">{tx("还没有数据。有人完成测试后，这里会显示。", "No data yet. It appears once someone finishes the test.")}</p>;
  }
  const done = totals.starts > 0 ? Math.round((100 * totals.plays) / totals.starts) : 0;
  const max = Math.max(1, ...TYPE_ORDER.map((c) => totals.byType[c]));
  const tiles: [string, number | string, string?][] = [
    [tx("测过的人", "People"), totals.people, tx(`共来访 ${totals.visitors} 人`, `${totals.visitors} visitors`)],
    [tx("完成次数", "Finished"), totals.plays, tx(`完成率 ${done}%`, `${done}% completion`)],
    [tx("分享次数", "Shares"), totals.shares + totals.saves, tx(`复制链接 ${totals.shares} · 存图 ${totals.saves}`, `${totals.shares} links · ${totals.saves} cards`)],
    [tx("从分享打开", "Opened from shares"), totals.opens],
  ];
  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-2 gap-2">
        {tiles.map(([label, v, sub]) => (
          <div key={label} className="rounded-[12px] bg-card px-3.5 py-3">
            <div className="text-[13px] text-muted-foreground">{label}</div>
            <div className="mt-0.5 text-[28px] font-bold tabular-nums tracking-[-0.02em]">{v}</div>
            {sub && <div className="text-[12px] text-muted-foreground">{sub}</div>}
          </div>
        ))}
      </div>
      <div>
        <div className="section-header !px-1">{tx("结果分布（按每人最近一次）", "Results (each person's latest)")}</div>
        <div className="space-y-2 rounded-[12px] bg-card p-3.5">
          {TYPE_ORDER.map((c) => {
            const n = totals.byType[c];
            return (
              <div key={c} className="flex items-center gap-2.5">
                <span className={cn("w-12 shrink-0 text-[13px] font-bold", FAM_TEXT[TYPES[c].family])}>{c}</span>
                <span className="w-[5.5rem] shrink-0 truncate text-[12px] text-muted-foreground">{t(TYPES[c].name)}</span>
                <span className="relative h-2 min-w-0 flex-1 rounded-full bg-background">
                  <span className={cn("absolute inset-y-0 left-0 rounded-full", FAM_BG[TYPES[c].family])} style={{ width: `${(100 * n) / max}%` }} />
                </span>
                <span className="w-7 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="px-1 text-[12px] leading-[1.5] text-muted-foreground">
        {tx(
          "只统计登录 claude.ai、并且有这个页面参与权限（协作者及以上）的人。未登录或只有查看权限的访客能玩、能分享，但不会被记进来。这个面板只有你能看到。",
          "Counts only people signed in to claude.ai with Contributor access or above. Signed-out or view-only visitors can play and share but aren't recorded. Only you see this panel.",
        )}
      </p>
    </div>
  );
}

function Gallery({ highlight }: { highlight?: TypeCode }) {
  const { t } = useLang();
  return (
    <div className="space-y-6 pb-8">
      {(Object.keys(FAMILIES) as Family[]).map((f) => (
        <div key={f}>
          <div className="section-header !px-1">{t(FAMILIES[f].name)} · {t(FAMILIES[f].desc)}</div>
          <div className="overflow-hidden rounded-[12px] bg-card">
            {TYPE_ORDER.filter((c) => TYPES[c].family === f).map((c) => (
              <div key={c} className={cn("row-inset flex items-center gap-3 px-3 py-2 [--sep-inset:68px]", highlight === c && "bg-primary/10")}>
                <Avatar code={c} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px]"><span className={cn("font-bold", FAM_TEXT[f])}>{c}</span> {t(TYPES[c].name)}</div>
                  <div className="truncate text-[13px] text-muted-foreground">{t(TYPES[c].line)}</div>
                </div>
                {highlight === c && <span className="text-[13px] font-medium text-primary">{t({ zh: "你", en: "You" })}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
