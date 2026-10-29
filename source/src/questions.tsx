import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type React from "react";
import { Button } from "@/components/motion/button/base";
import { RangeSlider } from "@/components/motion/range-slider";
import { Switch } from "@/components/motion/switch";
import { ColorSelector, ColorSelectorItem, ColorSelectorList } from "@/components/motion/color-selector";
import { Input } from "@/components/motion/input";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { FileTree, FileTreeFile, FileTreeFolder } from "@/components/motion/file-tree";
import { Dock, DockItem } from "@/components/motion/dock";
import { SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { classifyFilename, type Effect, type T2, type TypeCode } from "./data";
import { useLang } from "./i18n";
import { AIArt, BeetlePhoto, LowPolyWallpaper } from "./art";
import productImg from "./product.webp";

export type Done = (e: Effect) => void;
const T = (zh: string, en: string): T2 => ({ zh, en });

/* ---------- shared iOS bits ---------- */

/** An incoming iMessage-style bubble. */
export function Incoming({ who, children }: { who: string; children: ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#A5A9B4] to-[#858892] text-[11px] font-semibold text-white" aria-hidden="true">
        {who.slice(0, 1)}
      </span>
      <div className="min-w-0">
        <div className="mb-0.5 pl-3 text-[11px] text-muted-foreground">{who}</div>
        <div className="relative w-fit rounded-[18px] bg-[#E9E9EB] px-3.5 py-2 text-[16px] leading-[1.3] text-black dark:bg-[#262628] dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Full-width iOS primary button pinned at the end of a question. */
export function PrimaryButton({ children, disabled, onClick, type = "button" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <Button type={type} disabled={disabled} onClick={onClick} pressScale={0.97} className="h-[50px] w-full rounded-[14px] text-[17px] font-semibold tracking-[-0.01em]">
      {children}
    </Button>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col gap-2">{children}</div>;
}

function TextAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-11 w-full rounded-[14px] text-[17px] text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:opacity-60">
      {children}
    </button>
  );
}

/** Grouped settings list, like iOS Settings. */
function Group({ header, footer, children, className }: { header?: string; footer?: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {header && <div className="section-header">{header}</div>}
      <div className="cell overflow-hidden">{children}</div>
      {footer && <div className="section-footer">{footer}</div>}
    </section>
  );
}

function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("row-inset flex min-h-11 items-center gap-3 px-4 py-2.5", className)}>{children}</div>;
}

/** Figma's grey canvas behind a frame. */
function CanvasScene({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("dot-canvas relative overflow-hidden rounded-xl px-3 pb-5 pt-3 sm:px-6", className)}>
      {label && <div className="mb-1.5 text-[11px] text-black/45 dark:text-white/45">{label}</div>}
      {children}
    </div>
  );
}

function AcmeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="12,2 22,20 2,20" fill="currentColor" />
      <polygon points="12,2 22,20 12,14" fill="#000" opacity={0.18} />
      <polygon points="12,14 22,20 2,20" fill="#fff" opacity={0.25} />
    </svg>
  );
}

/* ---------- Q1 logo ---------- */

export function LogoQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const [size, setSize] = useState(100);
  const [trim, setTrim] = useState(false);
  const pad = trim ? 7 : 12;
  const submit = () => {
    const t: Partial<Record<TypeCode, number>> = {};
    const a: [number, number, number, number] = [0, 0, 0, 0];
    if (size >= 240) { t.LOGO = 4; t.MEGO = 1; a[1] += 2; }
    else if (size >= 150) { t.LOGO = 2; t.UNDO = 1; a[1] += 1; }
    else if (size > 100) { t.PIXL = 1; a[0] += 1; }
    else { t.SHIP = 1; t.GHST = 1; a[1] -= 2; }
    if (trim) { t.BLCK = (t.BLCK ?? 0) + 3; a[0] += 1; a[2] += 1; }
    const log = size === 100
      ? T(`logo 一点没动${trim ? "，但偷偷缩了留白" : "，原样发回去"}`, `Left the logo alone${trim ? ", but quietly trimmed the margins" : " and sent it back"}`)
      : T(`把 logo 放大到 ${size}%${trim ? "，还偷偷缩了留白让它显得更大" : ""}`, `Scaled the logo to ${size}%${trim ? ", and trimmed the margins so it looks bigger" : ""}`);
    onDone({ t, a, log });
  };
  return (
    <div>
      <Incoming who={tx("王总 · ACME 品牌部", "Mark · ACME Brand")}>{tx("logo 再大一点，我们老板说看不清。", "Can you make the logo bigger? My boss can't see it.")}</Incoming>
      <CanvasScene label={tx("双11 海报 — 1080 × 1440", "Black Friday poster — 1080 × 1440")} className="mt-5">
        <div className="relative mx-auto w-full max-w-[320px]">
          <motion.div
            layout
            className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] text-[#3A0F12] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] [container-type:inline-size]"
            style={{ background: "radial-gradient(120% 70% at 50% 62%, #FFE9DC 0%, #FFC7B0 38%, #F2573F 78%, #D8302A 100%)" }}
          >
            {/* light rays + confetti */}
            <div className="absolute inset-0 opacity-50" style={{ background: "repeating-conic-gradient(from 0deg at 50% 64%, rgb(255 255 255 / 0.28) 0deg 6deg, transparent 6deg 18deg)", maskImage: "radial-gradient(70% 60% at 50% 64%, #000 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 64%, #000 30%, transparent 75%)" }} />
            {[[12, 30, "#FFD25A", 18], [84, 24, "#FFFFFF", -24], [8, 58, "#FFFFFF", 40], [90, 52, "#FFD25A", 12], [20, 46, "#FF8FA3", -30], [78, 40, "#FF8FA3", 22]].map(([x, y, c, r], i) => (
              <span key={i} className="absolute h-[1.6cqw] w-[4cqw] rounded-[0.4cqw]" style={{ left: `${x}%`, top: `${y}%`, background: c as string, rotate: `${r}deg` }} />
            ))}
            <motion.div layout className="absolute inset-0 flex flex-col" style={{ padding: `${pad}cqw` }}>
              <div className="flex items-start justify-between">
                <motion.div
                  animate={{ scale: size / 100 }}
                  transition={SPRING_LAYOUT}
                  style={{ transformOrigin: "top left" }}
                  className="flex items-center gap-[1.4cqw] rounded-[1.6cqw] bg-white px-[2.4cqw] py-[1.4cqw] text-[#D8302A] shadow-[0_1cqw_2cqw_rgb(150_20_20/0.18)]"
                >
                  <AcmeMark className="size-[4.6cqw]" />
                  <span className="text-[4.2cqw] font-black tracking-tight text-[#1F1E26]">ACME</span>
                </motion.div>
                <div className="rounded-[1.4cqw] bg-[#1F1E26] px-[2cqw] py-[1.2cqw] text-right leading-none text-white">
                  <div className="text-[2.4cqw] opacity-70">{tx("天猫官方旗舰店", "Official store")}</div>
                  <div className="mt-[0.6cqw] text-[3.4cqw] font-black">{tx("双11 狂欢节", "BLACK FRIDAY")}</div>
                </div>
              </div>
              <div className="mt-[4cqw] text-center">
                <div className="text-[3.4cqw] font-bold tracking-[0.3em] text-white [text-shadow:0_0.3cqw_0.8cqw_rgb(150_20_20/0.4)]">{tx("修护明星三件套", "THE REPAIR TRIO")}</div>
                <div className="mt-[0.4cqw] text-[12.5cqw] font-black leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_0.6cqw_0_#B0201B,0_1.4cqw_2cqw_rgb(120_10_10/0.35)]">{tx("全场 5 折", "50% OFF")}</div>
              </div>
              {/* product on podium */}
              <div className="relative mx-auto mt-auto w-[78%] min-h-0 shrink">
                <div className="absolute bottom-[3%] left-1/2 h-[18%] w-[96%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#FFF5EE] to-[#F3C9B6] shadow-[0_1.2cqw_2cqw_rgb(160_40_30/0.35)]" />
                <div className="absolute bottom-[10%] left-1/2 h-[10%] w-[80%] -translate-x-1/2 rounded-[50%] bg-[#7A2A1F]/30 blur-[1.4cqw]" />
                <img src={productImg} alt={tx("ACME 修护三件套产品图", "ACME skincare set")} className="relative block w-full" draggable={false} />
                <div className="absolute -right-[4%] top-[6%] grid size-[17cqw] rotate-[10deg] place-items-center rounded-full bg-[#FFD25A] text-center leading-[1.05] text-[#B0201B] shadow-[0_1cqw_2cqw_rgb(150_40_0/0.3)]">
                  <span><span className="block text-[2.6cqw] font-bold">{tx("立省", "SAVE")}</span><span className="block text-[5cqw] font-black">{tx("¥300", "$60")}</span></span>
                </div>
              </div>
              {/* price bar */}
              <div className="-mx-[1cqw] mt-[1cqw] flex shrink-0 items-stretch overflow-hidden rounded-[2cqw] bg-white shadow-[0_1cqw_2.5cqw_rgb(150_20_20/0.25)]">
                <div className="flex-1 px-[2.6cqw] py-[1.8cqw]">
                  <div className="text-[2.4cqw] font-semibold text-[#D8302A]">{tx("到手价", "Final price")}</div>
                  <div className="whitespace-nowrap leading-[1.05] text-[#D8302A]">
                    <span className="text-[3.8cqw] font-bold">{tx("¥", "$")}</span><span className="text-[9cqw] font-black tracking-tight">{tx("299", "59")}</span>
                    <span className="ml-[1.4cqw] text-[3cqw] text-[#9A8A86] line-through">{tx("¥599", "$119")}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center border-l border-dashed border-[#F2B8A8] px-[2.4cqw] text-center text-[#D8302A]">
                  <span className="text-[2.4cqw]">{tx("跨店满减", "Coupon")}</span>
                  <span className="text-[3.4cqw] font-black">{tx("300-50", "-$10")}</span>
                </div>
                <div className="grid place-items-center bg-gradient-to-b from-[#FF4D3A] to-[#D8302A] px-[3cqw] text-[3.6cqw] font-black text-white">{tx("抢", "BUY")}</div>
              </div>
              <div className="mt-[2cqw] flex shrink-0 items-center justify-between text-[2.4cqw] text-white/85">
                <span>{tx("11.11 00:00 开抢 · 前 1 小时加赠小样", "Starts Nov 28, 00:00 · free minis first hour")}</span>
                <span>{tx("*以页面为准", "*T&Cs apply")}</span>
              </div>
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {trim && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-0 aspect-[3/4] [container-type:inline-size]">
                <div className="absolute left-0" style={{ top: `${pad + 3}cqw`, width: `${pad}cqw` }}>
                  <span className="block h-[1.5px] w-full bg-redline" />
                </div>
                <span className="absolute rounded-[3px] bg-redline px-1 text-[10px] font-medium leading-4 text-white" style={{ top: `${pad + 5}cqw`, left: "1cqw" }}>{Math.round(pad * 10.8)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CanvasScene>
      <Group className="mt-6" footer={tx("缩小留白不会改 logo 本身，只是让它显得更大。", "Trimming margins leaves the logo alone. It just looks bigger.")}>
        <Row className="flex-col items-stretch gap-2 py-3">
          <div className="flex items-center justify-between text-[17px]">
            <span>{tx("Logo 尺寸", "Logo size")}</span>
            <span className="tabular-nums text-muted-foreground">{size}%</span>
          </div>
          <RangeSlider value={size} onValueChange={setSize} min={100} max={300} step={10} showTicks={false} aria-label={tx("Logo 尺寸", "Logo size")} />
        </Row>
        <Row className="justify-between">
          <span className="text-[17px]">{tx("偷偷缩小留白", "Quietly trim margins")}</span>
          <span style={{ ["--primary" as string]: "var(--green)" }}>
            <Switch checked={trim} onCheckedChange={setTrim} ariaLabel={tx("偷偷缩小留白", "Quietly trim margins")} />
          </span>
        </Row>
      </Group>
      <Actions>
        <PrimaryButton onClick={submit}>{tx("发给甲方", "Send to client")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- Q2 black ---------- */

const BLACKS = [
  { value: "pure", label: T("纯黑", "Pure black"), hex: "#000000", color: "#000000", sub: T("就是黑，没有五彩斑斓", "Just black. No colors involved.") },
  { value: "blue", label: T("带一点蓝的黑", "Black with a hint of blue"), hex: "#0B0F1A", color: "#0B0F1A", sub: T("看起来更贵", "Looks more expensive") },
  { value: "rainbow", label: T("五彩斑斓的黑", "Colorful black"), hex: "Iridescent", color: "#2A1B3D", sub: T("黑底上浮着一层油膜光，真的调出来了", "An oil-slick sheen on black. You actually did it.") },
  { value: "beetle", label: T("发一张甲虫照片", "Send a beetle photo"), hex: "IMG_0427.JPG", color: "#0E9E7A", sub: T("大自然已经做好了", "Nature already shipped it") },
] as const;

function OilSlick() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07060B]">
      <motion.div
        className="absolute -inset-1/2 mix-blend-screen"
        style={{ background: "conic-gradient(from 0deg, #5B1688, #0E5C8C, #11805A, #8A6A0E, #8C1848, #5B1688)", filter: "blur(30px)", opacity: 0.9 }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      />
      <div className="absolute inset-0 mix-blend-screen" style={{ background: "radial-gradient(60% 50% at 25% 30%, rgb(0 255 200 / 0.45), transparent 70%), radial-gradient(50% 45% at 75% 65%, rgb(255 60 180 / 0.45), transparent 70%), radial-gradient(40% 40% at 60% 20%, rgb(255 210 80 / 0.32), transparent 70%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 40%, rgb(0 0 0 / 0.55) 100%)" }} />
      <motion.div
        className="absolute inset-y-0 w-1/3 mix-blend-screen"
        style={{ background: "linear-gradient(100deg, transparent, rgb(255 255 255 / 0.12), transparent)" }}
        animate={reduce ? undefined : { x: ["-120%", "320%"] }}
        transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
      />
    </div>
  );
}

export function BlackQuestion({ onDone }: { onDone: Done }) {
  const { tx, t: tr } = useLang();
  const [v, setV] = useState<string>("");
  const pick = BLACKS.find((b) => b.value === v);
  const submit = () => {
    const map: Record<string, Effect> = {
      pure: { t: { AUTO: 1, SHIP: 2 }, a: [-1, -1, 1, 0], log: T("给了甲方一个纯黑 #000000", "Gave the client pure #000000") },
      blue: { t: { PIXL: 2, BLCK: 1 }, a: [2, 0, 1, 0], log: T("交了一个带一点蓝的黑 #0B0F1A", "Delivered a blue-ish black, #0B0F1A") },
      rainbow: { t: { BLCK: 4, MEGO: 2 }, a: [1, 2, 0, 1], log: T("真的调出了五彩斑斓的黑", "Actually made a colorful black") },
      beetle: { t: { COPY: 3, VIBE: 1 }, a: [-1, -1, -1, 0], log: T("给甲方发了一张甲虫照片", "Sent the client a photo of a beetle") },
    };
    onDone(map[v]);
  };
  return (
    <div>
      <Incoming who={tx("王总 · ACME 品牌部", "Mark · ACME Brand")}>{tx("主视觉的底色，我要一个五彩斑斓的黑。", "For the background, I want a black that's… colorful.")}</Incoming>
      <div className="cell mt-5 overflow-hidden">
        <div className="relative aspect-[16/10] w-full">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={v || "none"} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              {!v && <div className="grid h-full place-items-center bg-card text-[15px] text-muted-foreground">{tx("从下面挑一个黑", "Pick a black below")}</div>}
              {v === "pure" && (
                <div className="grid h-full place-items-center bg-black"><span className="font-mono text-xs text-white/40">#000000 · R0 G0 B0</span></div>
              )}
              {v === "blue" && (
                <div className="grid h-full place-items-center" style={{ background: "radial-gradient(90% 80% at 30% 20%, #1A2744, #0B0F1A 60%)" }}>
                  <span className="font-mono text-xs text-white/40">#0B0F1A · R11 G15 B26</span>
                </div>
              )}
              {v === "rainbow" && <div className="relative h-full"><OilSlick /></div>}
              {v === "beetle" && (
                <div className="flex h-full items-center justify-end bg-white px-3 dark:bg-black">
                  <div className="flex max-w-[78%] flex-col items-end gap-1">
                    <motion.div initial={{ scale: 0.9, y: 8 }} animate={{ scale: 1, y: 0 }} transition={SPRING_SWAP} className="overflow-hidden rounded-[18px]">
                      <BeetlePhoto className="block w-full" />
                    </motion.div>
                    <span className="pr-1 text-[11px] text-muted-foreground">{tx("已送达", "Delivered")}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <Row className="justify-between border-t-[0.5px] border-border">
          <span className="truncate text-[17px]">{pick ? tr(pick.label) : tx("未选择", "None selected")}</span>
          <span className="shrink-0 font-mono text-[13px] text-muted-foreground">{pick?.hex ?? "—"}</span>
        </Row>
      </div>
      <ColorSelector value={v} onValueChange={setV} className="mt-5" aria-label={tx("选择黑色", "Choose a black")}>
        <ColorSelectorList className="justify-center gap-4">
          {BLACKS.map((b) => (
            <ColorSelectorItem
              key={b.value}
              value={b.value}
              color={b.color}
              label={tr(b.label)}
              className={cn(
                "size-14 bg-background [&>span:last-child]:size-9",
                b.value === "rainbow" && "[&>span:last-child]:[background:radial-gradient(circle_at_30%_30%,rgb(0_255_200/0.55),transparent_45%),radial-gradient(circle_at_70%_70%,rgb(255_60_180/0.55),transparent_50%),conic-gradient(from_200deg,#120A1E,#3B0A57,#0B3D5C,#0F5A3E,#5C4A0A,#120A1E)]",
                b.value === "beetle" && "[&>span:last-child]:[background:linear-gradient(170deg,#19C98A,#E9C64B_45%,#E0702F_65%,#4A2C8F)]",
              )}
            />
          ))}
        </ColorSelectorList>
      </ColorSelector>
      <p className="mt-3 min-h-5 text-center text-[13px] text-muted-foreground">{pick ? tr(pick.sub) : tx("四个都算交差", "All four count as delivering")}</p>
      <Actions>
        <PrimaryButton onClick={submit} disabled={!v}>{tx("交稿", "Deliver")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- Q3 filename ---------- */

function desktopFiles(zh: boolean) {
  return zh
    ? [
      { name: "海报.fig", date: "10月28日 14:02", size: "18.2 MB" },
      { name: "海报_改.fig", date: "10月29日 10:47", size: "18.6 MB" },
      { name: "海报_最终版.fig", date: "10月29日 19:31", size: "19.1 MB" },
      { name: "海报_最终版2.fig", date: "昨天 23:58", size: "19.4 MB" },
      { name: "海报_最终版2_不改了.fig", date: "今天 11:20", size: "19.4 MB" },
      { name: "截屏2026-10-30 下午3.12.04.png", date: "今天 15:12", size: "2.1 MB" },
    ]
    : [
      { name: "poster.fig", date: "Oct 28, 2:02 PM", size: "18.2 MB" },
      { name: "poster_edit.fig", date: "Oct 29, 10:47 AM", size: "18.6 MB" },
      { name: "poster_FINAL.fig", date: "Oct 29, 7:31 PM", size: "19.1 MB" },
      { name: "poster_FINAL2.fig", date: "Yesterday, 11:58 PM", size: "19.4 MB" },
      { name: "poster_FINAL2_dont_touch.fig", date: "Today, 11:20 AM", size: "19.4 MB" },
      { name: "Screenshot 2026-10-30 at 3.12.04 PM.png", date: "Today, 3:12 PM", size: "2.1 MB" },
    ];
}

function FileIcon({ png }: { png?: boolean }) {
  return png ? (
    <span className="relative inline-block h-4 w-3.5 shrink-0 rounded-[2px] bg-gradient-to-br from-sky-300 to-indigo-400" />
  ) : (
    <span className="relative grid h-4 w-3.5 shrink-0 place-items-center rounded-[2px] bg-[#1F1E26]">
      <span className="size-1.5 rounded-full bg-[#A259FF]" />
    </span>
  );
}

export function FilenameQuestion({ onDone }: { onDone: Done }) {
  const { tx, t: tr, lang } = useLang();
  const [name, setName] = useState("");
  const verdict = useMemo(() => classifyFilename(name), [name]);
  const submit = () => {
    const shown = name.trim() || "Untitled";
    onDone({ ...verdict.effect, log: T(`把文件存成「${shown}.fig」（${verdict.label.zh}）`, `Saved it as “${shown}.fig” (${verdict.label.en})`) });
  };
  const files = desktopFiles(lang === "zh");
  return (
    <div>
      <p className="text-[17px] text-muted-foreground">{tx("周五 18:30，海报终于过了。按下 ⌘S。", "Friday, 6:30 PM. The poster is finally approved. ⌘S.")}</p>
      <div className="relative mt-4 overflow-hidden rounded-xl p-3 sm:p-6">
        <LowPolyWallpaper className="absolute inset-0 h-full w-full" from={[40, 110, 200]} to={[120, 210, 200]} />
        <form
          className="relative overflow-hidden rounded-xl border border-black/10 bg-[#F6F6F7] text-[#1D1D1F] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] [--background:#FFFFFF] [--foreground:#1D1D1F] [--muted-foreground:#86868B] [--border:rgb(0_0_0/0.12)] dark:border-white/10 dark:bg-[#2A2A2D] dark:text-[#F2F2F3] dark:[--background:#1E1E20] dark:[--foreground:#F2F2F3] dark:[--muted-foreground:#98989D] dark:[--border:rgb(255_255_255/0.12)]"
          onSubmit={(e) => { e.preventDefault(); submit(); }}
        >
          <div className="flex items-center gap-1.5 px-3 py-2.5">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="space-y-2.5 px-4 pb-3 text-[13px]">
            <Input
              id="filename"
              label={tx("存储为", "Save As")}
              value={name}
              onChange={setName}
              placeholder={tx("给文件起个名", "Name this file")}
              autoComplete="off"
              rightIcon={<span className="font-mono text-xs text-muted-foreground">.fig</span>}
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="w-12 shrink-0 text-right text-[#86868B]">{tx("标签", "Tags")}</span>
              <div className="flex gap-1.5">
                {["#FF5F57", "#FEBC2E", "#28C840", "#0A84FF", "#BF5AF2"].map((c) => <span key={c} className="size-3 rounded-full" style={{ background: c }} />)}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-12 shrink-0 text-right text-[#86868B]">{tx("位置", "Where")}</span>
                <span className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#3A3A3D]">
                  <span className="h-2.5 w-3.5 rounded-[2px] bg-[#5AC8FA]" /> {tx("桌面", "Desktop")} <span className="text-[#86868B]">⌄</span>
                </span>
              </div>
              <AnimatedBadge status={name ? "info" : "neutral"} size="sm" contentKey={verdict.label.en} showIcon={false}>
                {name ? tr(verdict.label) : tx("等你起名", "Waiting for a name")}
              </AnimatedBadge>
            </div>
          </div>
          <div className="flex border-y border-black/10 dark:border-white/10">
            <aside className="hidden w-32 shrink-0 space-y-0.5 border-r border-black/10 bg-black/[0.03] p-2 text-[11px] sm:block dark:border-white/10 dark:bg-white/[0.03]">
              <div className="px-1.5 pb-1 text-[10px] font-semibold text-[#86868B]">{tx("个人收藏", "Favorites")}</div>
              {(lang === "zh" ? ["隔空投送", "最近使用", "桌面", "下载", "文稿"] : ["AirDrop", "Recents", "Desktop", "Downloads", "Documents"]).map((f, i) => (
                <div key={f} className={cn("rounded px-1.5 py-1", i === 2 && "bg-black/[0.07] font-medium dark:bg-white/10")}>{f}</div>
              ))}
              <div className="px-1.5 pb-1 pt-2 text-[10px] font-semibold text-[#86868B]">iCloud</div>
              <div className="rounded px-1.5 py-1">{tx("iCloud 云盘", "iCloud Drive")}</div>
            </aside>
            <div className="min-w-0 flex-1 bg-white text-[11.5px] dark:bg-[#232326]">
              <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-black/5 px-3 py-1.5 text-[10px] text-[#86868B] sm:grid-cols-[1fr_auto_auto] dark:border-white/5">
                <span>{tx("名称", "Name")}</span><span className="hidden sm:block">{tx("修改日期", "Date Modified")}</span><span>{tx("大小", "Size")}</span>
              </div>
              {files.map((f, i) => (
                <div key={f.name} className={cn("grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-1.5 sm:grid-cols-[1fr_auto_auto]", i % 2 === 1 && "bg-black/[0.025] dark:bg-white/[0.03]")}>
                  <span className="flex min-w-0 items-center gap-2"><FileIcon png={f.name.endsWith("png")} /><span className="truncate">{f.name}</span></span>
                  <span className="hidden text-[#86868B] sm:block">{f.date}</span>
                  <span className="text-right tabular-nums text-[#86868B]">{f.size}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs">
            <span className="flex items-center gap-2"><span className="text-[#86868B]">{tx("格式", "Format")}</span><span className="rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#3A3A3D]">{tx("Figma 文件", "Figma File")} ⌄</span></span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" className="rounded-md bg-white dark:bg-[#3A3A3D]" onClick={() => setName("")}>{tx("取消", "Cancel")}</Button>
              <Button type="submit" size="sm" className="rounded-md">{tx("存储", "Save")}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Q4 Friday 17:58 ---------- */

type Note = { id: string; app: "wechat" | "feishu" | "calendar" | "messages" | "chat"; title: string; body: string; time: string };

function notes(zh: boolean): Note[] {
  return zh
    ? [
      { id: "n5", app: "wechat", title: "王总（ACME 品牌部）", body: "今晚能出吗？明早 9 点过会要用🙏", time: "现在" },
      { id: "n4", app: "wechat", title: "王总（ACME 品牌部）", body: "logo 再大一点，我们老板说看不清", time: "2分钟前" },
      { id: "n6", app: "feishu", title: "双11主视觉 项目群", body: "李经理：@你 甲方又加了 3 条意见，文档已更新，辛苦今晚看一下", time: "1分钟前" },
      { id: "n3", app: "wechat", title: "王总（ACME 品牌部）", body: "海报简单改一下哈，很快的", time: "3分钟前" },
      { id: "n2", app: "wechat", title: "王总（ACME 品牌部）", body: "[语音] 47″", time: "5分钟前" },
      { id: "n1", app: "wechat", title: "王总（ACME 品牌部）", body: "在吗", time: "6分钟前" },
      { id: "n0", app: "calendar", title: "日历", body: "18:00 下班", time: "18:00" },
    ]
    : [
      { id: "n5", app: "messages", title: "Mark (ACME)", body: "can we get it tonight? need it for the 9am review 🙏", time: "now" },
      { id: "n4", app: "messages", title: "Mark (ACME)", body: "also the logo needs to be bigger, my boss can't see it", time: "2m ago" },
      { id: "n6", app: "chat", title: "#bf-campaign", body: "Lisa: @you client added 3 more comments, doc's updated. mind taking a look tonight?", time: "1m ago" },
      { id: "n3", app: "messages", title: "Mark (ACME)", body: "just a quick tweak on the poster, won't take long", time: "3m ago" },
      { id: "n2", app: "messages", title: "Mark (ACME)", body: "Audio Message · 0:47", time: "5m ago" },
      { id: "n1", app: "messages", title: "Mark (ACME)", body: "hey, you there?", time: "6m ago" },
      { id: "n0", app: "calendar", title: "Calendar", body: "6:00 PM · Leave work", time: "6:00 PM" },
    ];
}

function AppIcon({ app, zh }: { app: Note["app"]; zh: boolean }) {
  if (app === "wechat")
    return (
      <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-[#07C160]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <ellipse cx="9.5" cy="10" rx="7" ry="5.6" fill="#fff" />
          <polygon points="5,14 4.5,17.5 8,15" fill="#fff" />
          <ellipse cx="16" cy="14.5" rx="5.6" ry="4.6" fill="#fff" stroke="#07C160" strokeWidth="1" />
          <circle cx="7" cy="9" r="0.9" fill="#07C160" /><circle cx="12" cy="9" r="0.9" fill="#07C160" />
        </svg>
      </span>
    );
  if (app === "messages")
    return (
      <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-gradient-to-b from-[#5BF675] to-[#0CBD2A]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <ellipse cx="12" cy="11" rx="8.5" ry="7" fill="#fff" />
          <path d="M6 16 L4.5 20 L9.5 17.5 Z" fill="#fff" />
        </svg>
      </span>
    );
  if (app === "feishu")
    return (
      <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-white">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <polygon points="3,6 13,13 9,19" fill="#00D6B9" />
          <polygon points="6,3 18,3 13,13" fill="#3370FF" />
          <polygon points="13,13 22,9 18,19 9,19" fill="#133C9A" />
        </svg>
      </span>
    );
  if (app === "chat")
    return (
      <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-[#4A154B] text-[17px] font-bold text-white">#</span>
    );
  return (
    <span className="flex size-[30px] shrink-0 flex-col items-center overflow-hidden rounded-[8px] bg-white leading-none">
      <span className="mt-[3px] text-[6px] font-semibold text-[#FF3B30]">{zh ? "周五" : "FRI"}</span>
      <span className="text-[15px] font-light text-black">30</span>
    </span>
  );
}

function NoteCard({ n, zh }: { n: Note; zh: boolean }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[18px] bg-white/72 p-2.5 text-[#111] shadow-[0_6px_18px_-10px_rgb(0_0_0/0.5)] backdrop-blur-xl">
      <AppIcon app={n.app} zh={zh} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[12px] font-semibold">{n.title}</span>
          <span className="shrink-0 text-[10.5px] text-black/45">{n.time}</span>
        </div>
        <div className="text-[12px] leading-[1.3] text-black/85">{n.body}</div>
      </div>
    </div>
  );
}

function Waveform({ dark }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-[2px]">
      {[6, 10, 14, 8, 12, 16, 9, 13, 7, 11, 15, 8].map((h, i) => (
        <span key={i} className={cn("w-[2px] rounded-full", dark ? "bg-black/70" : "bg-white/90")} style={{ height: h }} />
      ))}
    </span>
  );
}

/** The app a notification opens into. */
function ChatView({ app, zh, onBack }: { app: Note["app"]; zh: boolean; onBack: () => void }) {
  const back = (label: string, color: string) => (
    <button type="button" onClick={onBack} aria-label={zh ? "返回" : "Back"} className="flex items-center gap-0.5 text-[13px] active:opacity-50" style={{ color }}>
      <svg viewBox="0 0 12 20" className="h-[14px] w-[8px]" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {label}
    </button>
  );
  const status = (dark: boolean) => (
    <div className={cn("flex shrink-0 items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold", dark ? "text-black" : "text-white")}>
      <span>{zh ? "17:58" : "5:58"}</span>
      <span className="absolute left-1/2 top-2 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
      <span className="relative h-[10px] w-[20px] rounded-[3px] border border-current p-[1px] opacity-80"><span className="block h-full w-[23%] rounded-[1px] bg-[#FF9F0A]" /></span>
    </div>
  );
  const scroll = "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  if (app === "wechat") {
    const me = "王总（ACME 品牌部）";
    const msgs: ({ t: string } | { from: "them" | "me"; text?: string; voice?: string })[] = [
      { t: "17:52" }, { from: "them", text: "在吗" }, { from: "them", voice: "47″" },
      { t: "17:55" }, { from: "them", text: "海报简单改一下哈，很快的" }, { from: "them", text: "logo 再大一点，我们老板说看不清" },
      { t: "17:58" }, { from: "them", text: "今晚能出吗？明早 9 点过会要用🙏" },
    ];
    return (
      <div className="absolute inset-0 flex flex-col bg-[#EDEDED] text-black">
        {status(true)}
        <div className="relative flex shrink-0 items-center justify-between px-3 pb-2 pt-1">
          {back("", "#000")}
          <div className="absolute left-1/2 -translate-x-1/2 text-center leading-tight">
            <div className="text-[13px] font-semibold">{me}</div>
            <div className="text-[9.5px] text-black/45">对方正在输入…</div>
          </div>
          <span className="text-[16px] leading-none">⋯</span>
        </div>
        <div className={cn(scroll, "space-y-2 px-2.5 pb-2 pt-1")}>
          {msgs.map((m, i) =>
            "t" in m ? (
              <div key={i} className="py-1 text-center text-[9.5px] text-black/40">{m.t}</div>
            ) : (
              <div key={i} className="flex items-start gap-1.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-[5px] bg-[#C0533A] text-[11px] font-semibold text-white">王</span>
                <div className="relative max-w-[78%] rounded-[5px] bg-white px-2.5 py-1.5 text-[12px] leading-[1.35]">
                  <span className="absolute -left-[4px] top-[9px] size-2 rotate-45 bg-white" />
                  {m.voice ? <span className="relative flex items-center gap-2"><Waveform dark /><span className="text-black/60">{m.voice}</span><span className="size-1.5 rounded-full bg-[#FA5151]" /></span> : <span className="relative">{m.text}</span>}
                </div>
              </div>
            ),
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 border-t border-black/5 bg-[#F7F7F7] px-2 pb-5 pt-1.5">
          <span className="grid size-6 place-items-center rounded-full border border-black/70 text-[10px]">🔈</span>
          <span className="h-7 flex-1 rounded-[5px] bg-white" />
          <span className="text-[16px]">☺︎</span>
          <span className="grid size-6 place-items-center rounded-full border border-black/70 text-[14px] leading-none">+</span>
        </div>
      </div>
    );
  }

  if (app === "messages") {
    const msgs: ({ t: string } | { text?: string; voice?: string })[] = [
      { t: "Today 5:52 PM" }, { text: "hey, you there?" }, { voice: "0:47" },
      { t: "5:55 PM" }, { text: "just a quick tweak on the poster, won't take long" }, { text: "also the logo needs to be bigger, my boss can't see it" },
      { t: "5:58 PM" }, { text: "can we get it tonight? need it for the 9am review 🙏" },
    ];
    return (
      <div className="absolute inset-0 flex flex-col bg-white text-black">
        {status(true)}
        <div className="relative flex shrink-0 flex-col items-center border-b border-black/5 bg-[#F6F6F6]/90 px-3 pb-1.5 pt-0.5 backdrop-blur">
          <div className="absolute left-2 top-2">{back("", "#007AFF")}</div>
          <span className="grid size-8 place-items-center rounded-full bg-gradient-to-b from-[#A5A9B4] to-[#858892] text-[12px] font-semibold text-white">M</span>
          <span className="mt-0.5 text-[10px]">Mark (ACME) ›</span>
        </div>
        <div className={cn(scroll, "space-y-1 px-2.5 py-2")}>
          {msgs.map((m, i) =>
            "t" in m ? (
              <div key={i} className="py-1 text-center text-[9.5px] text-black/40">{m.t}</div>
            ) : (
              <div key={i} className="flex">
                <div className="max-w-[80%] rounded-[16px] bg-[#E9E9EB] px-2.5 py-1.5 text-[12px] leading-[1.3]">
                  {m.voice ? <span className="flex items-center gap-2"><span className="text-[#007AFF]">▶</span><Waveform dark /><span className="text-black/50">{m.voice}</span></span> : m.text}
                </div>
              </div>
            ),
          )}
          <div className="flex pt-1">
            <div className="flex gap-1 rounded-[16px] bg-[#E9E9EB] px-3 py-2.5">
              {[0, 1, 2].map((k) => <motion.span key={k} className="size-1.5 rounded-full bg-black/35" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: k * 0.18 }} />)}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 px-2 pb-5 pt-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-[#E9E9EB] text-[14px] leading-none text-black/60">+</span>
          <span className="flex h-7 flex-1 items-center rounded-full border border-black/15 px-2.5 text-[11px] text-black/30">iMessage</span>
        </div>
      </div>
    );
  }

  if (app === "feishu" || app === "chat") {
    const isZh = app === "feishu";
    const rows = isZh
      ? [
        { who: "李经理", c: "#3370FF", text: "@你 甲方又加了 3 条意见，文档已更新，辛苦今晚看一下" },
        { who: "小陈", c: "#7E62E0", text: "收到，开发这边明天上午等切图" },
        { who: "王总", c: "#C0533A", text: "辛苦辛苦，明早过会就靠大家了 💪" },
      ]
      : [
        { who: "Lisa", c: "#2EB67D", text: "@you client added 3 more comments, doc's updated. mind taking a look tonight?" },
        { who: "Alex", c: "#7E62E0", text: "dev needs assets by tomorrow AM 🙏" },
        { who: "Mark", c: "#C0533A", text: "thanks all, big review at 9!" },
      ];
    return (
      <div className={cn("absolute inset-0 flex flex-col text-black", isZh ? "bg-[#F5F6F7]" : "bg-white")}>
        {status(true)}
        <div className="relative flex shrink-0 items-center gap-2 border-b border-black/5 bg-white px-3 pb-2 pt-1">
          {back("", isZh ? "#1F2329" : "#1D1C1D")}
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12.5px] font-semibold">{isZh ? "双11主视觉 项目群" : "# bf-campaign"}</div>
            <div className="text-[9.5px] text-black/45">{isZh ? "12 位成员" : "12 members"}</div>
          </div>
        </div>
        <div className={cn(scroll, "space-y-3 px-3 py-3")}>
          {rows.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-[7px] text-[11px] font-semibold text-white" style={{ background: r.c }}>{r.who.slice(0, 1)}</span>
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold">{r.who} <span className="font-normal text-black/40">{isZh ? "17:5" + (7 + (i % 2)) : "5:5" + (7 + (i % 2)) + " PM"}</span></div>
                <div className={cn("mt-0.5 text-[12px] leading-[1.35]", isZh && "w-fit rounded-[8px] bg-white px-2.5 py-1.5")}>{r.text}</div>
                {i === 0 && (
                  <div className="mt-1.5 flex w-[190px] items-center gap-2 rounded-[8px] border border-black/10 bg-white p-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-[5px] bg-[#3370FF] text-[10px] font-bold text-white">{isZh ? "文" : "Doc"}</span>
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-[11px] font-medium">{isZh ? "双11主视觉修改意见 v3" : "BF key visual feedback v3"}</div>
                      <div className="text-[9.5px] text-black/45">{isZh ? "3 条新评论" : "3 new comments"}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 px-2.5 pb-5 pt-1.5">
          <div className="flex h-8 items-center rounded-[8px] border border-black/10 bg-white px-2.5 text-[11px] text-black/30">{isZh ? "发送给 双11主视觉 项目群" : "Message #bf-campaign"}</div>
        </div>
      </div>
    );
  }

  // calendar
  return (
    <div className="absolute inset-0 flex flex-col bg-white text-black">
      {status(true)}
      <div className="flex shrink-0 items-center justify-between px-3 pb-2 pt-1">{back(zh ? "10月" : "October", "#FF3B30")}<span className="text-[13px] text-[#FF3B30]">{zh ? "编辑" : "Edit"}</span></div>
      <div className="px-4">
        <div className="text-[20px] font-bold">{zh ? "下班" : "Leave work"}</div>
        <div className="mt-1 text-[12px] text-black/60">{zh ? "10月30日 星期五" : "Friday, Oct 30"}</div>
        <div className="text-[12px] text-black/60">{zh ? "18:00 至 23:59" : "6:00 PM to 11:59 PM"}</div>
        <div className="mt-3 rounded-[10px] bg-[#F2F2F7] p-2.5 text-[11.5px] text-black/70">{zh ? "重复：每个工作日\n提醒：提前 2 分钟" : "Repeat: every weekday · Alert: 2 min before"}</div>
        <div className="mt-3 text-center text-[11px] text-black/35">{zh ? "这个日程你已经错过 214 次" : "You've missed this event 214 times"}</div>
      </div>
    </div>
  );
}

function LockScreen() {
  const { tx, lang } = useLang();
  const zh = lang === "zh";
  const list = notes(zh);
  const [open, setOpen] = useState(false);
  const [app, setApp] = useState<Note["app"] | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const reduce = useReducedMotion();
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -24 || info.velocity.y < -300) setOpen(true);
  };
  const openNote = (n: Note) => {
    setApp(n.app);
    setRead((r) => [...new Set([...r, ...list.filter((x) => x.app === n.app).map((x) => x.id)])]);
  };
  const unread = list.filter((n) => !read.includes(n.id));
  return (
    <div className="mx-auto w-[min(100%,292px)]">
      <div className="relative aspect-[9/19.2] w-full rounded-[46px] bg-[#111] p-[9px] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.6),inset_0_0_0_2px_#2A2A2E]">
        <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-black text-white">
          <LowPolyWallpaper className="absolute inset-0 h-full w-full" from={[70, 50, 170]} to={[255, 120, 120]} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
          <div className="relative flex items-center justify-between px-6 pt-3 text-[11px] font-semibold">
            <span>{zh ? "中国移动" : "Verizon"}</span>
            <span className="absolute left-1/2 top-2 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[1.5px]">{[4, 6, 8, 10].map((h, i) => <span key={h} className={cn("w-[2.5px] rounded-[1px]", i < 3 ? "bg-white" : "bg-white/40")} style={{ height: h }} />)}</span>
              5G
              <span className="relative ml-0.5 h-[10px] w-[20px] rounded-[3px] border border-white/60 p-[1px]"><span className="block h-full w-[23%] rounded-[1px] bg-[#FFD60A]" /></span>
            </span>
          </div>
          <motion.div className="relative mt-3 text-center" animate={{ opacity: open ? 0.35 : 1, scale: open ? 0.86 : 1, y: open ? -10 : 0 }} transition={SPRING_LAYOUT}>
            <svg viewBox="0 0 24 24" className="mx-auto mb-0.5 size-3.5" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.5" fill="#fff" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="#fff" strokeWidth="2.2" /></svg>
            <div className="text-[13px] font-semibold text-white/90">{tx("10月30日 星期五", "Friday, October 30")}</div>
            <div className="text-[64px] font-semibold leading-[1] tracking-[-0.03em] tabular-nums">{tx("17:58", "5:58")}</div>
          </motion.div>

          {open ? (
            <div className="absolute inset-x-2.5 bottom-[66px] top-[42%] flex flex-col">
              <div className="flex shrink-0 items-center justify-between px-1 pb-1.5 text-[13px] font-semibold">
                <span>{tx("通知中心", "Notification Center")}</span>
                <button type="button" className="rounded-full bg-white/25 px-2 py-0.5 text-[11px] backdrop-blur" onClick={() => setOpen(false)}>{tx("收起", "Show less")}</button>
              </div>
              <div className="min-h-0 flex-1 touch-pan-y space-y-1.5 overflow-y-auto overscroll-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {list.map((n, i) => (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => openNote(n)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: read.includes(n.id) ? 0.55 : 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ ...SPRING_LAYOUT, delay: reduce ? 0 : i * 0.03 }}
                    className="block w-full text-left"
                  >
                    <NoteCard n={n} zh={zh} />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              className="absolute inset-x-2.5 bottom-[88px] touch-none select-none"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragEnd={onDragEnd}
            >
              <button type="button" onClick={() => setOpen(true)} className="relative block w-full pb-3 text-left" aria-label={tx("展开全部通知", "Show all notifications")}>
                <NoteCard n={unread[0] ?? list[0]} zh={zh} />
                <div className="absolute inset-x-3 bottom-1.5 h-3 rounded-b-[16px] bg-white/45 backdrop-blur" />
                <div className="absolute inset-x-6 bottom-0 h-3 rounded-b-[14px] bg-white/30 backdrop-blur" />
              </button>
            </motion.div>
          )}
          {!open && (
            <motion.div className="pointer-events-none absolute inset-x-0 bottom-[62px] text-center text-[11px] font-medium text-white/85" animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              {unread.length > 1 ? tx(`⌃ 上划查看 ${unread.length - 1} 条未读`, `⌃ Swipe up for ${unread.length - 1} more`) : tx("⌃ 上划查看通知", "⌃ Swipe up for notifications")}
            </motion.div>
          )}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-8">
            {["flash", "cam"].map((k) => (
              <span key={k} className="grid size-10 place-items-center rounded-full bg-black/35 backdrop-blur">
                {k === "flash" ? (
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path d="M8 3h8l-1 5H9z M9 9h6v12H9z" fill="#fff" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="12" cy="13" r="3.4" fill="none" stroke="#fff" strokeWidth="1.8" /></svg>
                )}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {app && (
              <motion.div
                key="app"
                className="absolute inset-0 z-20 overflow-hidden rounded-[38px]"
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 24 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                <ChatView app={app} zh={zh} onBack={() => setApp(null)} />
              </motion.div>
            )}
          </AnimatePresence>
          <div className={cn("pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-[4px] w-[96px] -translate-x-1/2 rounded-full", app ? "bg-black/80" : "bg-white/90")} />
        </div>
      </div>
    </div>
  );
}

export function FridayQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const zone = useRef<HTMLDivElement>(null);
  const tired = dodges >= 3;

  const dodge = () => {
    if (tired) return;
    const el = zone.current;
    const w = el ? el.clientWidth / 2 - 60 : 80;
    const nx = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * Math.max(20, w));
    const ny = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 22);
    setPos({ x: nx, y: ny });
    setDodges((d) => d + 1);
  };

  const choose = (k: "ok" | "read" | "off" | "no") => {
    const map: Record<string, Effect> = {
      ok: { t: { MEGO: 4, UNDO: 1 }, a: [0, 2, 0, 3], log: T("周五 17:58 秒回王总「收到！马上改」", "Friday 5:58 PM: replied “On it!” within seconds") },
      read: { t: { GHST: 5 }, a: [0, -1, 0, -3], log: T("周五 17:58 已读不回", "Friday 5:58 PM: left it on read") },
      off: { t: { GHST: 1, LORM: 2, SHIP: 1 }, a: [-1, 0, -1, -3], log: T("周五 17:58 直接关机下班", "Friday 5:58 PM: turned the phone off and left") },
      no: { t: { SHIP: 2, PIXL: 1, VIBE: 1 }, a: [0, -3, 0, -1], log: T(`追着「拒绝」按钮跑了 ${dodges} 次才按到`, `Chased the “Decline” button ${dodges} times before catching it`) },
    };
    onDone(map[k]);
  };

  const choice = "h-[50px] rounded-[14px] bg-background text-[16px] font-medium text-foreground hover:bg-background";

  return (
    <div>
      <div className="rounded-2xl px-2 pb-1 pt-2">
        <LockScreen />
      </div>
      <p className="mt-4 text-[15px] text-muted-foreground">{tx("在手机上上划看通知，点一条能进到对话里。你会怎么回？", "Swipe up for notifications, tap one to open the chat. What do you do?")}</p>
      <div ref={zone} className="relative mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" className={choice} pressScale={0.97} onClick={() => choose("ok")}>{tx("收到！马上改", "On it!")}</Button>
        <Button variant="secondary" className={choice} pressScale={0.97} onClick={() => choose("read")}>{tx("已读不回", "Leave on read")}</Button>
        <Button variant="secondary" className={choice} pressScale={0.97} onClick={() => choose("off")}>{tx("关机下班", "Turn phone off")}</Button>
        <motion.div animate={{ x: pos.x, y: pos.y }} transition={{ type: "spring", stiffness: 380, damping: 18 }} className="relative z-10">
          <Button
            variant="secondary"
            pressScale={0.97}
            className={cn(choice, "w-full text-destructive", tired && "text-redline")}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") dodge(); }}
            onPointerDown={(e) => { if (!tired) { e.preventDefault(); dodge(); } }}
            onClick={() => { if (tired) choose("no"); }}
          >
            {tired ? tx("拒绝（被你追到了）", "Decline (caught it)") : tx("拒绝", "Decline")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Q5 layers ---------- */

const LAYERS = [
  { id: "l1", raw: "Rectangle 87", fixed: "Card / Background" },
  { id: "l4", raw: "image 14", fixed: "Cover image" },
  { id: "l2", raw: "Group 12 copy", fixed: "Avatar" },
  { id: "l3", raw: "Ellipse 3", fixed: "Badge / Dot" },
  { id: "l5", raw: "Frame 2847 copy 2", fixed: "Card / Footer" },
  { id: "l6", raw: "Vector", fixed: "Icon / Arrow" },
];

function Sel({ on, name, children, className }: { on: boolean; name: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence>
        {on && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute -inset-[3px] z-10 border-[1.5px] border-[#0D99FF]">
            <span className="absolute left-0 top-0 whitespace-nowrap rounded-br-[2px] bg-[#0D99FF] px-1 text-[9px] leading-[14px] text-white">{name}</span>
            {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((p) => (
              <span key={p} className={cn("absolute size-[7px] border border-[#0D99FF] bg-white", p)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LayersQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const [fixed, setFixed] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<string | null>(null);
  const n = Object.values(fixed).filter(Boolean).length;
  const nameOf = (id: string) => {
    const l = LAYERS.find((x) => x.id === id)!;
    return fixed[id] ? l.fixed : l.raw;
  };
  const submit = (count: number) => {
    let e: Effect;
    if (count === 0) e = { t: { SHIP: 3, GHST: 1, LORM: 1 }, a: [-2, 0, -2, 0], log: T("同事的图层一个没改，直接交给开发", "Handed the file to dev without renaming a single layer") };
    else if (count <= 3) e = { t: { PIXL: 1, UNDO: 1 }, a: [0, 0, 1, 0], log: T(`顺手改了 ${count} 个图层名`, `Renamed ${count} layers on the way`) };
    else if (count < 6) e = { t: { AUTO: 3, PIXL: 1 }, a: [1, 0, 2, 0], log: T(`改了 ${count} / 6 个图层名`, `Renamed ${count} of 6 layers`) };
    else e = { t: { AUTO: 5, PIXL: 1 }, a: [2, 0, 3, 0], log: T("把 6 个图层全部重新命名", "Renamed all 6 layers") };
    onDone(e);
  };
  return (
    <div>
      <p className="text-[17px] text-muted-foreground">{tx("你接手了同事的文件，开发等着切图。", "You inherited a colleague's file. Dev is waiting for assets.")}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white text-[#1E1E1E] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.5)]">
        <div className="flex items-center justify-between gap-2 bg-[#2C2C2C] px-2.5 py-2 text-white">
          <div className="flex items-center gap-1">
            {["M5 3l14 9-6 1-3 6z", "M4 4h16v16H4z", "M12 4l8 16H4z", "M5 19L19 5", "M6 5h12M12 5v14"].map((d, i) => (
              <span key={i} className={cn("grid size-7 place-items-center rounded", i === 0 && "bg-[#0D99FF]")}>
                <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true"><path d={d} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
              </span>
            ))}
          </div>
          <span className="truncate text-[11px] text-white/80">{tx("交接_首页卡片_v2", "handoff_home_card_v2")}</span>
          <span className="flex items-center gap-1.5">
            <span className="grid size-6 place-items-center rounded-full bg-[#F24E1E] text-[10px] font-semibold">{tx("陈", "A")}</span>
            <span className="hidden rounded bg-[#0D99FF] px-2 py-1 text-[11px] font-medium sm:inline">Share</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="order-2 border-t border-black/10 sm:order-1 sm:w-[46%] sm:border-r sm:border-t-0">
            <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 text-[11px]">
              <span className="font-semibold">Layers</span>
              <span className="tabular-nums text-black/50">{tx(`已整理 ${n} / 6`, `${n} / 6 renamed`)}</span>
            </div>
            <div className="p-1.5 text-[#1E1E1E] [--foreground:#1E1E1E] [--muted-foreground:#6B6B73] [--card:#F2F2F2] [--border:rgb(0_0_0/0.08)] [--background:#FFFFFF]">
              <FileTree
                ariaLabel="Layers"
                defaultExpandedIds={["frame"]}
                onValueChange={(v) => {
                  if (v === "frame") return;
                  setSel(v);
                  setFixed((f) => ({ ...f, [v]: true }));
                }}
              >
                <FileTreeFolder value="frame" name="Frame 2847">
                  {LAYERS.map((l) => (
                    <FileTreeFile key={l.id} value={l.id} name={fixed[l.id] ? `✓ ${l.fixed}` : l.raw} />
                  ))}
                </FileTreeFolder>
              </FileTree>
            </div>
          </div>
          <div className="order-1 grid place-items-center bg-[#E5E5E5] px-4 pb-6 pt-8 sm:order-2 sm:flex-1">
            <div className="w-full max-w-[220px]">
              <div className="mb-1 text-[9px] text-black/45">Frame 2847</div>
              <Sel on={sel === "l1"} name={nameOf("l1")}>
                <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]">
                  <Sel on={sel === "l4"} name={nameOf("l4")}>
                    <AIArt className="block aspect-[16/10] w-full" />
                  </Sel>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center gap-2">
                      <Sel on={sel === "l2"} name={nameOf("l2")}>
                        <span className="relative grid size-7 place-items-center rounded-full bg-[#7E62E0] text-[10px] font-semibold text-white">
                          {tx("林", "J")}
                          <Sel on={sel === "l3"} name={nameOf("l3")} className="absolute -right-0.5 -top-0.5">
                            <span className="block size-2.5 rounded-full border-2 border-white bg-[#F24E1E]" />
                          </Sel>
                        </span>
                      </Sel>
                      <div className="min-w-0 leading-tight">
                        <div className="text-[11px] font-semibold">{tx("鲸落黄昏", "Whale at Dusk")}</div>
                        <div className="text-[9.5px] text-black/50">{tx("林一 · 2 小时前", "Jun Lin · 2h ago")}</div>
                      </div>
                    </div>
                    <Sel on={sel === "l5"} name={nameOf("l5")}>
                      <div className="flex items-center justify-between rounded-lg bg-[#F4F4F6] px-2.5 py-1.5 text-[10px]">
                        <span className="text-black/60">{tx("♥ 2.4k · 收藏 318", "♥ 2.4k · 318 saves")}</span>
                        <Sel on={sel === "l6"} name={nameOf("l6")}>
                          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </Sel>
                      </div>
                    </Sel>
                  </div>
                </div>
              </Sel>
            </div>
          </div>
        </div>
      </div>
      <p className="section-footer px-1">{tx("点图层能选中它，并顺手改成正经名字。改不改，随你。", "Tap a layer to select it and give it a proper name. Or don't.")}</p>
      <Actions>
        <PrimaryButton onClick={() => submit(n)}>{tx("交给开发", "Hand off to dev")}</PrimaryButton>
        <TextAction onClick={() => submit(0)}>{tx("关掉面板，眼不见为净", "Close the panel and pretend you didn't see")}</TextAction>
      </Actions>
    </div>
  );
}

/* ---------- Q6 dev ---------- */

const STICKERS = [
  { id: "where", emoji: "🧐", text: T("哪一行实现不了？", "Which line can't be built?"), e: { t: { PIXL: 3 }, a: [2, -1, 1, 0] } },
  { id: "ship", emoji: "🫠", text: T("那就先上线吧", "Fine, just ship it"), e: { t: { SHIP: 4 }, a: [-3, 0, -1, 0] } },
  { id: "ai", emoji: "🤖", text: T("我让 AI 写个 demo 给你", "I'll get AI to build you a demo"), e: { t: { VIBE: 4 }, a: [0, -1, -1, 1] } },
  { id: "ok", emoji: "🙏", text: T("好的，我改设计", "OK, I'll change the design"), e: { t: { UNDO: 2, MEGO: 1, FNAL: 1 }, a: [0, 2, 0, 0] } },
  { id: "apple", emoji: "📎", text: T("苹果都能做", "Apple does it"), e: { t: { COPY: 4 }, a: [0, -2, -1, 0] } },
] as const;

function DesignThumb() {
  const { tx } = useLang();
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: "linear-gradient(135deg,#1E2453,#6D4C93 55%,#E98AA0)" }}>
      <span className="absolute left-[12%] top-[20%] size-[34%] rounded-full bg-[#5DE0C0] opacity-70 blur-[2px]" />
      <span className="absolute right-[10%] top-[38%] size-[30%] rounded-full bg-[#FF6B9A] opacity-70 blur-[2px]" />
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="absolute size-[3px] rounded-full bg-white/80" style={{ left: `${(i * 37) % 95}%`, top: `${(i * 53) % 90}%` }} />
      ))}
      <div className="absolute inset-x-[16%] top-[30%] rounded-[10px] border border-white/40 bg-white/20 p-2 text-white backdrop-blur-sm">
        <div className="text-[8px] opacity-80">{tx("本月余额", "Balance")}</div>
        <div className="text-[13px] font-black">{tx("¥ 12,480", "$12,480")}</div>
      </div>
    </div>
  );
}

export function DevQuestion({ onDone }: { onDone: Done }) {
  const { tx, t: tr } = useLang();
  const [sel, setSel] = useState<string | null>(null);
  const pick = STICKERS.find((s) => s.id === sel);
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-black/10 bg-[#F5F6F7] text-[#1F2329] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]">
        <div className="flex items-center gap-2.5 border-b border-black/5 bg-white px-3.5 py-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-[#7E62E0] text-[12px] font-semibold text-white">{tx("陈", "A")}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13px] font-semibold">{tx("小陈", "Alex")} <span className="ml-1 rounded bg-[#E1EAFF] px-1 text-[10px] font-normal text-[#245BDB]">{tx("前端开发", "Frontend")}</span></div>
            <div className="flex items-center gap-1 text-[11px] text-[#8F959E]"><span className="size-1.5 rounded-full bg-[#34C724]" />{tx("在线 · 正在忙版本封板", "Online · in release freeze")}</div>
          </div>
          <span className="text-[#8F959E]">⋯</span>
        </div>
        <div className="space-y-3 px-3.5 py-3">
          <div className="text-center text-[10.5px] text-[#8F959E]">{tx("今天 16:18", "Today 4:18 PM")}</div>
          <div className="flex justify-end">
            <div className="w-[62%] max-w-[220px] overflow-hidden rounded-xl border border-black/5 bg-white">
              <DesignThumb />
              <div className="px-2.5 py-1.5 text-[11px] text-[#646A73]">{tx("首页_v7.png · 毛玻璃卡片 + 视差 + 粒子", "home_v7.png · glass card + parallax + particles")}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#7E62E0] text-[11px] font-semibold text-white">{tx("陈", "A")}</span>
            <div className="space-y-1.5">
              <div className="w-fit rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[13.5px]">{tx("这个效果实现不了。", "This can't be built.")}</div>
              <div className="w-fit rounded-xl bg-white px-3 py-2 text-[13.5px] leading-snug">{tx("毛玻璃 + 视差 + 粒子，还要 60 帧，低端安卓直接卡死", "Glass + parallax + particles at 60fps? Budget Androids will melt.")}</div>
            </div>
          </div>
          <div className="flex min-h-[86px] justify-end">
            <AnimatePresence mode="popLayout">
              {pick && (
                <motion.div key={pick.id} initial={{ opacity: 0, y: 14, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={SPRING_SWAP} className="flex flex-col items-end gap-1">
                  <div className="grid size-[64px] place-items-center rounded-2xl bg-white text-[40px] leading-none shadow-[0_4px_12px_-6px_rgb(0_0_0/0.3)]" aria-hidden="true">{pick.emoji}</div>
                  <div className="rounded-xl rounded-tr-sm bg-[#CCE0FF] px-3 py-1.5 text-[13px]">{tr(pick.text)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="border-t border-black/5 bg-white px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#8F959E]">
            <span>{tx("表情包 · 常用", "Stickers · Frequently used")}</span>
            <span>{pick ? tx("已选择", "Selected") : tx("选一个回他", "Pick one")}</span>
          </div>
          <div className="flex justify-center [--card:#F5F6F7] [--border:rgb(0_0_0/0.06)]">
            <Dock size={48}>
              {STICKERS.map((s) => (
                <DockItem key={s.id} active={sel === s.id} onClick={() => setSel(s.id)} aria-label={tr(s.text)}>
                  <span className="text-[26px] leading-none">{s.emoji}</span>
                </DockItem>
              ))}
            </Dock>
          </div>
        </div>
      </div>
      <Actions>
        <PrimaryButton disabled={!pick} onClick={() => pick && onDone({ t: { ...pick.e.t }, a: [...pick.e.a], log: T(`回复开发：「${pick.text.zh}」`, `Replied to dev: “${pick.text.en}”`) })}>{tx("发送", "Send")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- Q7 free canvas ---------- */

type PieceId = "ai" | "dribbble" | "lorem" | "logo" | "glass" | "grid";

const PIECES: { id: PieceId; label: T2; t: Partial<Record<TypeCode, number>>; x: number; y: number; w: number; size: string }[] = [
  { id: "ai", label: T("AI 生成插画", "AI illustration"), t: { VIBE: 2 }, x: 5, y: 7, w: 44, size: "634×432" },
  { id: "dribbble", label: T("Dribbble 截图", "Dribbble shot"), t: { COPY: 2 }, x: 55, y: 8, w: 40, size: "576×432" },
  { id: "lorem", label: T("Lorem ipsum", "Lorem ipsum"), t: { LORM: 3 }, x: 6, y: 60, w: 46, size: "662×248" },
  { id: "logo", label: T("超大 logo", "Huge logo"), t: { LOGO: 3 }, x: 56, y: 66, w: 38, size: "548×160" },
  { id: "glass", label: T("毛玻璃卡片", "Glass card"), t: { BLCK: 1, COPY: 1 }, x: 30, y: 30, w: 40, size: "576×362" },
  { id: "grid", label: T("8pt 网格", "8pt grid"), t: { AUTO: 2, PIXL: 1 }, x: 0, y: 0, w: 100, size: "12 col" },
];

function PieceArt({ id }: { id: PieceId }) {
  const { tx } = useLang();
  switch (id) {
    case "ai":
      return (
        <div className="relative overflow-hidden rounded-[1.6cqw] shadow-[0_1cqw_3cqw_-1cqw_rgb(0_0_0/0.35)]">
          <AIArt className="block aspect-[16/11] w-full" />
          <span className="absolute bottom-[2cqw] left-[2cqw] rounded-full bg-black/45 px-[1.6cqw] py-[0.6cqw] text-[2cqw] font-medium text-white backdrop-blur">{tx("✦ AI 生成", "✦ AI generated")}</span>
        </div>
      );
    case "dribbble":
      return (
        <div className="overflow-hidden rounded-[1.4cqw] bg-white shadow-[0_1cqw_3cqw_-1cqw_rgb(0_0_0/0.35)]">
          <div className="aspect-[4/3] bg-[#F6E9FF] p-[2.2cqw]">
            <div className="h-full rounded-[1.2cqw] bg-[#14121C] p-[2cqw] text-white">
              <div className="text-[1.6cqw] text-white/50">Total balance</div>
              <div className="text-[3.6cqw] font-black">$48,210</div>
              <svg viewBox="0 0 100 30" className="mt-[1cqw] w-full" aria-hidden="true"><path d="M0,24 L14,20 L28,22 L42,12 L56,15 L70,6 L84,9 L100,2" fill="none" stroke="#C3F53C" strokeWidth="2.4" /><path d="M0,24 L14,20 L28,22 L42,12 L56,15 L70,6 L84,9 L100,2 L100,30 L0,30 Z" fill="#C3F53C" opacity="0.15" /></svg>
              <div className="mt-[1.2cqw] flex gap-[1cqw]">
                {["#FF8AB4", "#7E62E0", "#C3F53C"].map((c) => <span key={c} className="h-[3cqw] flex-1 rounded-[0.8cqw]" style={{ background: c }} />)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-[2cqw] py-[1.4cqw] text-[1.9cqw] text-[#0D0C22]">
            <span className="flex items-center gap-[1cqw]"><span className="size-[2.6cqw] rounded-full bg-[#EA4C89]" />Fintech Dashboard</span>
            <span className="text-[#6E6D7A]">♥ 2.4k</span>
          </div>
        </div>
      );
    case "lorem":
      return (
        <div className="text-[#1F1E26]">
          <div className="text-[1.8cqw] font-semibold tracking-[0.2em] text-[#7E62E0]">LOREM IPSUM</div>
          <div className="mt-[0.8cqw] text-[4.4cqw] font-bold leading-[1.1] tracking-tight">Dolor sit amet, consectetur.</div>
          <div className="mt-[1cqw] text-[2cqw] leading-[1.45] text-[#6B6B73]">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>
          <span className="mt-[1.6cqw] inline-block rounded-full bg-[#1F1E26] px-[2.4cqw] py-[1cqw] text-[1.9cqw] font-medium text-white">Adipiscing →</span>
        </div>
      );
    case "logo":
      return (
        <div className="flex items-center gap-[1.6cqw] text-[#FF3D6E]">
          <AcmeMark className="size-[9cqw]" />
          <span className="text-[8.4cqw] font-black leading-none tracking-tight text-[#1F1E26]">ACME</span>
        </div>
      );
    case "glass":
      return (
        <div className="relative">
          <span className="absolute -left-[4%] -top-[14%] size-[42%] rounded-full bg-[#FF6B9A]" />
          <span className="absolute -bottom-[16%] right-[-6%] size-[48%] rounded-full bg-[#5DE0C0]" />
          <span className="absolute left-[40%] top-[30%] size-[26%] rounded-full bg-[#FFD25A]" />
          <div className="relative aspect-[1.586] rounded-[2cqw] border border-white/60 bg-white/25 p-[2.6cqw] text-white shadow-[0_2cqw_5cqw_-2cqw_rgb(80_40_120/0.45)] backdrop-blur-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[2.6cqw] font-black">ACME</span>
              <span className="h-[3.4cqw] w-[5cqw] rounded-[0.7cqw] bg-gradient-to-br from-[#F7E3A1] to-[#C9A24B]" />
            </div>
            <div className="mt-[5cqw] font-mono text-[2.6cqw] tracking-[0.18em]">•••• •••• •••• 2026</div>
            <div className="mt-[1cqw] text-[1.7cqw] opacity-80">DESIGNER · 11/26</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function CanvasQuestion({ onDone }: { onDone: Done }) {
  const { tx, t: tr } = useLang();
  const [on, setOn] = useState<PieceId[]>([]);
  const [selected, setSelected] = useState<PieceId | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Record<PieceId, { x: number; y: number }>>(() =>
    Object.fromEntries(PIECES.map((p) => [p.id, { x: p.x, y: p.y }])) as Record<PieceId, { x: number; y: number }>,
  );
  const [dragging, setDragging] = useState<PieceId | null>(null);
  const drag = useRef<{ id: PieceId; sx: number; sy: number; ox: number; oy: number; w: number; h: number } | null>(null);
  const startDrag = (e: React.PointerEvent<HTMLDivElement>, id: PieceId) => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const el = e.currentTarget.getBoundingClientRect();
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox: pos[id].x, oy: pos[id].y, w: (el.width / rect.width) * 100, h: (el.height / rect.height) * 100 };
    setSelected(id);
    setDragging(id);
  };
  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const rect = board.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const x = Math.min(Math.max(d.ox + ((e.clientX - d.sx) / rect.width) * 100, -d.w * 0.25), 100 - d.w * 0.75);
    const y = Math.min(Math.max(d.oy + ((e.clientY - d.sy) / rect.height) * 100, -d.h * 0.25), 100 - d.h * 0.75);
    setPos((p) => ({ ...p, [d.id]: { x, y } }));
  };
  const endDrag = () => { drag.current = null; setDragging(null); };
  const toggle = (id: PieceId) => {
    setOn((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
    setSelected(id === "grid" ? null : id);
  };
  const submit = () => {
    const t: Partial<Record<TypeCode, number>> = {};
    const a: [number, number, number, number] = [0, 0, 0, 0];
    for (const id of on) {
      const p = PIECES.find((x) => x.id === id)!;
      for (const [k, v] of Object.entries(p.t)) t[k as TypeCode] = (t[k as TypeCode] ?? 0) + (v ?? 0);
    }
    if (on.length === 0) { t.GHST = 3; t.SHIP = 1; a[3] -= 1; }
    if (on.length >= 4) { t.FNAL = (t.FNAL ?? 0) + 2; a[2] -= 2; }
    if (on.includes("grid")) a[2] += 1;
    if (on.includes("logo")) a[1] += 1;
    const zh = on.map((id) => PIECES.find((p) => p.id === id)!.label.zh).join("、");
    const en = on.map((id) => PIECES.find((p) => p.id === id)!.label.en).join(", ");
    onDone({ t, a, log: on.length ? T(`“随便发挥”交了：${zh}`, `“Do whatever” delivered: ${en}`) : T("“随便发挥”交了一张空白画布", "“Do whatever” delivered a blank canvas") });
  };
  const order: PieceId[] = ["grid", "ai", "dribbble", "lorem", "logo", "glass"];
  return (
    <div>
      <Incoming who={tx("王总 · ACME 品牌部", "Mark · ACME Brand")}>{tx("随便发挥，你看着办。", "Just do whatever you think works.")}</Incoming>
      <CanvasScene label="Frame 1 — 1440 × 1080" className="mt-5">
        <div
          ref={board}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-[#FBFAFD] shadow-[0_10px_30px_-16px_rgb(0_0_0/0.4)] [container-type:inline-size]"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          {order.filter((id) => on.includes(id)).map((id) => {
            const p = PIECES.find((x) => x.id === id)!;
            if (id === "grid")
              return (
                <motion.div key={id} className="pointer-events-none absolute inset-0 grid grid-cols-12 gap-[1.6cqw] px-[3cqw]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {Array.from({ length: 12 }).map((_, i) => <span key={i} className="bg-[#FF5A7A]/12" />)}
                  <span className="absolute right-[1cqw] top-[1cqw] rounded bg-[#FF5A7A] px-[1cqw] text-[1.6cqw] text-white">12 col · 24 gutter</span>
                </motion.div>
              );
            const isSel = selected === id;
            const at = pos[id];
            return (
              <motion.div
                key={id}
                onPointerDown={(e) => startDrag(e, id)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: dragging === id ? 1.02 : 1 }}
                transition={SPRING_SWAP}
                className={cn("absolute touch-none select-none", dragging === id ? "cursor-grabbing" : "cursor-grab")}
                style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${p.w}%`, zIndex: isSel ? 20 : 10 }}
              >
                <PieceArt id={id} />
                {isSel && (
                  <div className="pointer-events-none absolute -inset-[0.8cqw] border-[1.5px] border-[#0D99FF]">
                    <span className="absolute -top-[3.2cqw] left-[-1.5px] whitespace-nowrap rounded-[2px] bg-[#0D99FF] px-[0.8cqw] text-[max(9px,1.7cqw)] leading-[1.6] text-white">{tr(p.label)}</span>
                    <span className="absolute -bottom-[3.4cqw] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-[#0D99FF] px-[0.8cqw] text-[max(9px,1.6cqw)] leading-[1.6] text-white">{p.size}</span>
                    {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((pp) => (
                      <span key={pp} className={cn("absolute size-[7px] border border-[#0D99FF] bg-white", pp)} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
          {on.length === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center text-[13px] text-[#9C9CA6]">
              {tx("空白画布", "Blank canvas")}<br /><span className="text-[12px]">{tx("从下面加元素，加进来的可以拖动", "Add pieces below, then drag them around")}</span>
            </div>
          )}
        </div>
      </CanvasScene>
      <Group className="mt-6" header={tx("素材", "Assets")}>
        {PIECES.map((p) => {
          const active = on.includes(p.id);
          return (
            <button key={p.id} type="button" aria-pressed={active} onClick={() => toggle(p.id)} className="row-inset flex min-h-11 w-full items-center justify-between px-4 py-2.5 text-left text-[17px] active:bg-card">
              <span>{tr(p.label)}</span>
              <span className={cn("grid size-[22px] place-items-center rounded-full border-[1.5px] transition-colors", active ? "border-primary bg-primary text-white" : "border-border-strong")}>
                {active && <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
            </button>
          );
        })}
      </Group>
      <Actions>
        <PrimaryButton onClick={submit}>{on.length ? tx("交稿", "Deliver") : tx("就交空白的", "Deliver it blank")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- shared: iOS choice list ---------- */

function ChoiceList<K extends string>({ options, value, onChange, header }: { options: { k: K; label: string; sub?: string }[]; value: K | null; onChange: (k: K) => void; header?: string }) {
  return (
    <Group header={header} className="mt-5">
      {options.map((o) => (
        <button
          key={o.k}
          type="button"
          role="radio"
          aria-checked={value === o.k}
          onClick={() => onChange(o.k)}
          className="row-inset flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left active:bg-card"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-snug">{o.label}</span>
            {o.sub && <span className="mt-0.5 block text-[13px] text-muted-foreground">{o.sub}</span>}
          </span>
          {value === o.k && (
            <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-primary" aria-hidden="true"><path d="M2.5 8.5 6.2 12 13.5 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </button>
      ))}
    </Group>
  );
}

/* ---------- Q7 AI ---------- */

const AI_FILTERS = ["none", "hue-rotate(40deg) saturate(1.2)", "hue-rotate(-50deg)", "hue-rotate(160deg) saturate(0.9)", "grayscale(0.4) contrast(1.15)", "hue-rotate(90deg) brightness(1.05)"];

export function AIQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const reduce = useReducedMotion();
  const [regen, setRegen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState<"use" | "redraw" | "more" | "save" | "hand" | null>(null);
  const generate = () => {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => { setRegen((r) => r + 1); setLoading(false); }, reduce ? 50 : 1100);
  };
  const submit = () => {
    if (!pick) return;
    const map: Record<string, Effect> = {
      use: { t: { VIBE: 3, SHIP: 2 }, a: [-2, 1, -1, 0], log: T("把老板的 AI 图换了个 logo 直接交了", "Swapped the logo on the boss's AI image and shipped it") },
      redraw: { t: { PIXL: 1, AUTO: 2 }, a: [2, -1, 2, 0], log: T("把 AI 图当草稿，自己从头重画", "Treated the AI image as a sketch and redrew it from scratch") },
      more: { t: { VIBE: 4, MEGO: 2 }, a: [0, 2, -1, 1], log: T("又让 AI 生成了 20 张给老板挑", "Generated 20 more with AI for the boss to choose from") },
      save: { t: { COPY: 4 }, a: [0, 0, -2, 0], log: T("把 AI 图存进了灵感库", "Saved the AI image to the inspiration folder") },
      hand: { t: { PIXL: 2, BLCK: 2 }, a: [2, -2, 1, 0], log: T("指出 AI 图里的人有 6 根手指", "Pointed out the person in the AI image has six fingers") },
    };
    const e = map[pick];
    if (regen >= 3) { e.t = { ...e.t, VIBE: (e.t?.VIBE ?? 0) + 2 }; e.log = T(`${e.log.zh}（之前还点了 ${regen} 次重新生成）`, `${e.log.en} (after regenerating ${regen} times)`); }
    onDone(e);
  };
  return (
    <div>
      <Incoming who={tx("老板", "Your boss")}>{tx("我用 AI 生成了一张，你照这个做就行，应该很快吧？", "I made this with AI. Just do it like this, should be quick, right?")}</Incoming>
      <div className="cell mt-5 overflow-hidden">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
          <motion.div key={regen} initial={{ opacity: 0, filter: "blur(16px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.6 }} className="absolute inset-0" style={{ filter: AI_FILTERS[regen % AI_FILTERS.length] }}>
            <AIArt className="absolute inset-0 h-full w-full" />
          </motion.div>
          {/* a small figure waving from the hill; count the fingers */}
          <svg viewBox="0 0 60 80" className="absolute bottom-[14%] left-[16%] w-[9%]" aria-hidden="true">
            <ellipse cx="30" cy="22" rx="9" ry="10" fill="#2A2350" />
            <path d="M18 78 L22 38 Q30 32 38 38 L42 78 Z" fill="#2A2350" />
            <path d="M37 42 L50 26" stroke="#2A2350" strokeWidth="6" strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M50 26 L${44 + k * 3} ${10 + Math.abs(2.5 - k) * 2}`} stroke="#F3C6A5" strokeWidth="2.2" strokeLinecap="round" />)}
            <circle cx="50" cy="26" r="4" fill="#F3C6A5" />
          </svg>
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[13px] text-white">
                  <motion.span className="block size-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  {tx("生成中…", "Generating…")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white backdrop-blur">✦ {tx(`第 ${regen + 1} 张`, `Image ${regen + 1}`)}</span>
        </div>
        <div className="flex items-center gap-2 border-t-[0.5px] border-border px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[14px] text-muted-foreground">{tx("高级感，科技感，要有温度，鲸鱼", "Premium, techy, but warm. Also a whale.")}</span>
          <Button size="sm" variant="secondary" onClick={generate} disabled={loading} className="shrink-0">{tx("重新生成", "Regenerate")}</Button>
        </div>
      </div>
      <ChoiceList
        header={tx("你会怎么做", "What do you do")}
        value={pick}
        onChange={setPick}
        options={[
          { k: "use", label: tx("换个 logo，直接交", "Swap in the logo and ship it") },
          { k: "more", label: tx("再生成 20 张给老板挑", "Generate 20 more for the boss to pick") },
          { k: "redraw", label: tx("当草稿，自己重画一遍", "Use it as a sketch, redraw it properly") },
          { k: "save", label: tx("先存进灵感库", "Save it to the inspiration folder") },
          { k: "hand", label: tx("告诉老板：这只手有 6 根手指", "Tell the boss: that hand has six fingers") },
        ]}
      />
      <Actions>
        <PrimaryButton disabled={!pick} onClick={submit}>{tx("就这么办", "Do it")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- Q8 version history ---------- */

function VersionThumb({ v }: { v: number }) {
  const t = (v - 1) / 36;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] [container-type:inline-size]" style={{ background: `linear-gradient(165deg, hsl(${14 + t * 330} 85% ${62 - t * 10}%), hsl(${350 - t * 80} 75% ${48 - t * 8}%))` }}>
      <div className="absolute left-[8%] top-[6%] flex items-center gap-[2cqw] rounded-[2cqw] bg-white px-[3cqw] py-[1.5cqw] text-[#D8302A]" style={{ transform: `scale(${1 + t * 1.6})`, transformOrigin: "top left" }}>
        <AcmeMark className="size-[6cqw]" /><span className="text-[5cqw] font-black text-[#1F1E26]">ACME</span>
      </div>
      <img src={productImg} alt="" className="absolute bottom-[18%] left-1/2 w-[78%] -translate-x-1/2" style={{ rotate: `${t * 8}deg` }} />
      <div className="absolute inset-x-[8%] bottom-[6%] rounded-[2cqw] bg-white py-[2cqw] text-center text-[7cqw] font-black text-[#D8302A]" style={{ fontSize: `${7 + t * 5}cqw` }}>{v < 12 ? "5 折" : v < 25 ? "5 折！！" : "全场 5 折！！！"}</div>
      {t > 0.5 && <span className="absolute right-[6%] top-[30%] rotate-12 rounded-full bg-[#FFE600] px-[3cqw] py-[1cqw] text-[5cqw] font-black text-[#D8302A]" style={{ opacity: t }}>爆！</span>}
    </div>
  );
}

export function VersionQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const [v, setV] = useState(37);
  const [pick, setPick] = useState<"restore" | "rename" | "argue" | "merge" | "later" | null>(null);
  const submit = () => {
    if (!pick) return;
    const map: Record<string, Effect> = {
      restore: { t: { UNDO: 4, MEGO: 1 }, a: [0, 3, 0, 1], log: T("二话不说恢复了第一版", "Restored v1 without a word") },
      rename: { t: { FNAL: 5, UNDO: 1 }, a: [-1, 1, -2, 0], log: T("把 v1 另存为 v38_final 发了过去", "Saved v1 as v38_final and sent it") },
      argue: { t: { BLCK: 3, PIXL: 1 }, a: [1, -3, 1, 0], log: T("写了一页说明，解释为什么 v37 更好", "Wrote a one-pager on why v37 is better") },
      merge: { t: { LOGO: 3, MEGO: 3 }, a: [0, 2, -1, 1], log: T("把 v1 和 v37 拼在了一起", "Merged v1 and v37 into one") },
      later: { t: { GHST: 4, LORM: 2 }, a: [-1, -1, 0, -3], log: T("回了个“好的”，明天再说", "Replied “ok”, decided to deal with it tomorrow") },
    };
    const e = map[pick];
    if (v <= 3) { e.t = { ...e.t, UNDO: (e.t?.UNDO ?? 0) + 1 }; }
    onDone({ ...e, log: T(`${e.log.zh}（翻到了 v${v}）`, `${e.log.en} (scrubbed back to v${v})`) });
  };
  return (
    <div>
      <Incoming who={tx("王总 · ACME 品牌部", "Mark · ACME Brand")}>{tx("我们开会讨论了一下，还是觉得第一版好。", "We discussed it in the meeting. We think v1 was better.")}</Incoming>
      <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white text-[#1E1E1E] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]">
        <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 text-[11px]">
          <span className="font-semibold">{tx("版本历史", "Version history")}</span>
          <span className="tabular-nums text-black/50">{tx(`共 37 个版本`, `37 versions`)}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.1fr] gap-3 p-3">
          <div className="grid place-items-center rounded-lg bg-[#E5E5E5] p-3">
            <div className="w-full max-w-[150px]"><VersionThumb v={v} /></div>
          </div>
          <div className="min-w-0">
            <div className="text-[18px] font-bold tabular-nums">v{v}{v === 37 && <span className="ml-1.5 align-middle text-[11px] font-medium text-[#0D99FF]">{tx("当前", "Current")}</span>}{v === 1 && <span className="ml-1.5 align-middle text-[11px] font-medium text-[#F24E1E]">{tx("第一版", "First")}</span>}</div>
            <div className="mt-0.5 text-[11px] text-black/50">{tx(`10月${Math.min(30, 2 + Math.floor((v - 1) * 0.8))}日 · 你`, `Oct ${Math.min(30, 2 + Math.floor((v - 1) * 0.8))} · You`)}</div>
            <ul className="mt-2 space-y-1 text-[11.5px] leading-snug text-black/70">
              {(v < 8 ? [tx("初版提案", "First proposal"), tx("留白充足", "Plenty of whitespace")] : v < 20 ? [tx("logo 放大", "Logo bigger"), tx("加了“！！”", "Added “!!”")] : v < 32 ? [tx("logo 再放大", "Logo even bigger"), tx("加了爆炸贴", "Added a starburst"), tx("产品歪了一点", "Product tilted a bit")] : [tx("logo 最大", "Logo at maximum"), tx("全场 5 折！！！", "50% OFF!!!"), tx("甲方说“差不多了”", "Client said “almost there”")]).map((x) => (
                <li key={x} className="flex gap-1.5"><span className="mt-[6px] size-1 shrink-0 rounded-full bg-black/40" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-black/10 px-3 pb-3 pt-2 [--foreground:#1E1E1E] [--muted:#F2F2F2] [--muted-foreground:#6B6B73]">
          <div className="mb-1.5 flex justify-between text-[10px] text-black/45"><span>v1</span><span>{tx("拖动查看历史版本", "Drag to scrub versions")}</span><span>v37</span></div>
          <RangeSlider value={v} onValueChange={setV} min={1} max={37} step={1} showTicks={false} aria-label={tx("版本", "Version")} />
        </div>
      </div>
      <ChoiceList
        header={tx("你会怎么做", "What do you do")}
        value={pick}
        onChange={setPick}
        options={[
          { k: "restore", label: tx("恢复第一版", "Restore v1") },
          { k: "rename", label: tx("把 v1 另存成 v38_final 发过去", "Save v1 as v38_final and send it") },
          { k: "merge", label: tx("把 v1 和 v37 拼在一起", "Combine v1 and v37") },
          { k: "argue", label: tx("写一页说明，坚持 v37", "Write a one-pager defending v37") },
          { k: "later", label: tx("回个“好的”，明天再说", "Reply “ok”, deal with it tomorrow") },
        ]}
      />
      <Actions>
        <PrimaryButton disabled={!pick} onClick={submit}>{tx("回复甲方", "Reply")}</PrimaryButton>
      </Actions>
    </div>
  );
}

/* ---------- Q9 pre-send checklist ---------- */

type CheckK = "align" | "copy" | "logo" | "black" | "export" | "refs" | "v1" | "none";

export function ChecklistQuestion({ onDone }: { onDone: Done }) {
  const { tx } = useLang();
  const [on, setOn] = useState<CheckK[]>([]);
  const [left, setLeft] = useState(299);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const toggle = (k: CheckK) => setOn((o) => (k === "none" ? (o.includes("none") ? [] : ["none"]) : o.includes(k) ? o.filter((x) => x !== k) : [...o.filter((x) => x !== "none"), k]));
  const items: { k: CheckK; label: string; t: Partial<Record<TypeCode, number>>; a: Axis4Partial }[] = [
    { k: "align", label: tx("检查所有对齐和间距", "Check every alignment and spacing"), t: { PIXL: 1, AUTO: 1 }, a: [1, 0, 1, 0] },
    { k: "copy", label: tx("把 Lorem ipsum 换成真文案", "Replace Lorem ipsum with real copy"), t: { AUTO: 1 }, a: [1, 0, 1, 0] },
    { k: "export", label: tx("导出 @1x @2x @3x，按规范命名", "Export @1x @2x @3x with proper names"), t: { AUTO: 2 }, a: [0, 0, 2, 0] },
    { k: "logo", label: tx("logo 再放大 10%，保险", "Logo 10% bigger, just in case"), t: { LOGO: 3 }, a: [0, 2, 0, 0] },
    { k: "black", label: tx("把黑色再调深一点", "Make the black a little deeper"), t: { BLCK: 3 }, a: [1, 0, 0, 0] },
    { k: "refs", label: tx("把参考图的出处删掉", "Remove the credits on the reference images"), t: { COPY: 3 }, a: [0, 0, -1, 0] },
    { k: "v1", label: tx("把第一版也附上，以防万一", "Attach v1 too, just in case"), t: { UNDO: 3 }, a: [0, 1, 0, 0] },
    { k: "none", label: tx("什么都不查，直接发", "Check nothing, just send"), t: { SHIP: 3, GHST: 1 }, a: [-3, 0, -1, -1] },
  ];
  const submit = () => {
    const t: Partial<Record<TypeCode, number>> = {};
    const a: [number, number, number, number] = [0, 0, 0, 0];
    for (const k of on) {
      const it = items.find((x) => x.k === k)!;
      for (const [c, n] of Object.entries(it.t)) t[c as TypeCode] = (t[c as TypeCode] ?? 0) + (n ?? 0);
      it.a.forEach((n, i) => { a[i] += n ?? 0; });
    }
    if (!on.includes("copy") && !on.includes("none")) t.LORM = (t.LORM ?? 0) + 2;
    if (on.length === 0) { t.GHST = 2; t.LORM = (t.LORM ?? 0) + 1; }
    if (on.length >= 5) { t.PIXL = (t.PIXL ?? 0) + 1; t.FNAL = (t.FNAL ?? 0) + 1; }
    const zh = on.map((k) => items.find((x) => x.k === k)!.label);
    onDone({ t, a, log: on.length ? T(`交稿前做了：${on.map((k) => labelZh[k]).join("、")}`, `Before sending: ${on.map((k) => labelEn[k]).join(", ")}`) : T("交稿前什么都没勾，也没点“直接发”", "Ticked nothing before sending") });
    void zh;
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div>
      <div className="cell flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-[13px] text-muted-foreground">{tx("离过会还有", "Until the review")}</div>
          <div className={cn("text-[34px] font-bold tabular-nums tracking-[-0.02em]", left < 240 && "text-destructive")}>{mm}:{ss}</div>
        </div>
        <div className="text-right text-[13px] text-muted-foreground">{tx("明早 9:00 · 会议室 B", "9:00 AM · Room B")}<br />{tx("海报_v38.fig", "poster_v38.fig")}</div>
      </div>
      <Group className="mt-5" header={tx("交稿前你会做哪些（可多选）", "Before sending, you… (pick any)")}>
        {items.map((it) => {
          const active = on.includes(it.k);
          return (
            <button key={it.k} type="button" role="checkbox" aria-checked={active} onClick={() => toggle(it.k)} className="row-inset flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left active:bg-card [--sep-inset:52px]">
              <span className={cn("grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors", active ? "border-primary bg-primary text-white" : "border-border-strong")}>
                {active && <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span className={cn("text-[16px] leading-snug", it.k === "none" && "text-destructive")}>{it.label}</span>
            </button>
          );
        })}
      </Group>
      <Actions>
        <PrimaryButton onClick={submit}>{tx("发送", "Send")}</PrimaryButton>
      </Actions>
    </div>
  );
}

type Axis4Partial = [number, number, number, number];
const labelZh: Record<CheckK, string> = { align: "查对齐", copy: "换真文案", export: "规范导出", logo: "logo 再放大 10%", black: "黑色调深", refs: "删参考出处", v1: "附上第一版", none: "直接发" };
const labelEn: Record<CheckK, string> = { align: "checked alignment", copy: "replaced Lorem ipsum", export: "exported properly", logo: "logo +10%", black: "deepened the black", refs: "removed reference credits", v1: "attached v1", none: "just sent it" };

export const QUESTIONS: { tag: T2; title: T2; C: (p: { onDone: Done }) => React.JSX.Element }[] = [
  { tag: T("甲方说", "The client"), title: T("logo 再大一点", "Make the logo bigger"), C: LogoQuestion },
  { tag: T("甲方又说", "The client, again"), title: T("五彩斑斓的黑", "A colorful black"), C: BlackQuestion },
  { tag: T("下班前", "Before you leave"), title: T("给这个文件起个名", "Name this file"), C: FilenameQuestion },
  { tag: T("周五 17:58", "Friday, 5:58 PM"), title: T("手机亮了", "Your phone lights up"), C: FridayQuestion },
  { tag: T("接手文件", "Handoff"), title: T("同事的图层", "Someone else's layers"), C: LayersQuestion },
  { tag: T("评审后", "After review"), title: T("开发说实现不了", "Dev says it can't be built"), C: DevQuestion },
  { tag: T("老板说", "Your boss"), title: T("我用 AI 出了张图", "I made one with AI"), C: AIQuestion },
  { tag: T("改到第 37 版", "Round 37"), title: T("还是第一版好", "Actually, v1 was better"), C: VersionQuestion },
  { tag: T("过会前 5 分钟", "5 minutes to review"), title: T("交稿前最后检查", "Final check before sending"), C: ChecklistQuestion },
  { tag: T("最后一题", "Last one"), title: T("随便发挥", "Do whatever you want"), C: CanvasQuestion },
];
