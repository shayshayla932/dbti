import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type React from "react";
import { cn } from "@/lib/utils";
import type { T2 } from "./data";
import { useLang } from "./i18n";
import stPixel from "./stickers/pixel.webp";
import stClient from "./stickers/client.webp";
import stPixl from "./stickers/pixl.webp";
import stCopy from "./stickers/copy.webp";
import stGhst from "./stickers/ghst.webp";
import stShip from "./stickers/ship.webp";
import stLorm from "./stickers/lorm2.webp";
import stAuto from "./stickers/auto2.webp";
import stBlck from "./stickers/blck2.webp";
import stVibe from "./stickers/vibe2.webp";

/* ---------- data ---------- */

type Doodle = "arrow" | "sparkle" | "circle" | "squiggle" | "bang" | "spiral" | "heart" | "underline" | "star" | "zz";

interface StickerDef {
  id: string;
  src: string;
  ratio: number; // height / width
  name: T2;
  /** phone [x, y, w, rotate] in % of the pile, desktop in % of the cover */
  m: [number, number, number, number];
  d: [number, number, number, number];
  /** doodle near the sticker, x/y/size in % of the sticker box */
  doodle: { kind: Doodle; x: number; y: number; s: number; r?: number; tone?: "ink" | "red" | "blue" };
}

const STICKERS: StickerDef[] = [
  { id: "pixel", src: stPixel, ratio: 0.9422, name: { zh: "走查小组", en: "Design QA" },
    m: [-2, 0, 50, -5], d: [-1, 3, 19, -6], doodle: { kind: "circle", x: 22, y: 44, s: 49, tone: "red" } },
  { id: "client", src: stClient, ratio: 0.8234, name: { zh: "改稿现场", en: "Revision #12" },
    m: [50, 1.4, 50, 5], d: [79, 1, 22, 5], doodle: { kind: "spiral", x: 72, y: -10, s: 26 } },
  { id: "lorm", src: stLorm, ratio: 0.8719, name: { zh: "找灵感", en: "Moodboarding" },
    m: [0, 18, 44, 3], d: [3, 30, 16, 4], doodle: { kind: "sparkle", x: 86, y: 4, s: 26 } },
  { id: "auto", src: stAuto, ratio: 0.9641, name: { zh: "Auto Layout 打包", en: "Auto-layout packing" },
    m: [52, 17.6, 46, -4], d: [81, 29, 18, -4], doodle: { kind: "arrow", x: -26, y: 30, s: 44, r: 10, tone: "blue" } },
  { id: "ghst", src: stGhst, ratio: 0.9219, name: { zh: "已读不回", en: "Left on read" },
    m: [-2, 36, 46, 4], d: [1, 55, 17, 3], doodle: { kind: "zz", x: 70, y: -4, s: 32 } },
  { id: "blck", src: stBlck, ratio: 0.9953, name: { zh: "哪个黑", en: "Which black?" },
    m: [52, 35.1, 44, -3], d: [83, 54, 16, -3], doodle: { kind: "bang", x: -4, y: -6, s: 26, tone: "red" } },
  { id: "pixl", src: stPixl, ratio: 1.0579, name: { zh: "饼干对齐", en: "Cracker grid" },
    m: [4, 53.1, 40, -4], d: [19, 73, 12, -4], doodle: { kind: "underline", x: 18, y: 96, s: 87, tone: "red" } },
  { id: "vibe", src: stVibe, ratio: 1.608, name: { zh: "被 AI 吓醒", en: "Startled by AI" },
    m: [64, 51.3, 28, 6], d: [37, 72, 8.5, 5], doodle: { kind: "star", x: -34, y: 10, s: 44 } },
  { id: "copy", src: stCopy, ratio: 1.4128, name: { zh: "参考搬运", en: "Reference haul" },
    m: [10, 69.3, 28, 6], d: [55, 70, 9.5, 6], doodle: { kind: "heart", x: 78, y: -6, s: 38, tone: "red" } },
  { id: "ship", src: stShip, ratio: 1.0191, name: { zh: "先上线再说", en: "Shipping it" },
    m: [50, 70.2, 44, -6], d: [67, 74, 13, -5], doodle: { kind: "squiggle", x: -30, y: 70, s: 49 } },
];

const tonesVar: Record<NonNullable<StickerDef["doodle"]["tone"]>, string> = {
  ink: "var(--scribble-ink)",
  red: "var(--redline)",
  blue: "var(--primary)",
};

/* ---------- hand-drawn doodles ---------- */

function DoodleSvg({ kind, color }: { kind: Doodle; color: string }) {
  const p = { fill: "none", stroke: color, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, vectorEffect: "non-scaling-stroke" as const };
  switch (kind) {
    case "arrow":
      return <svg viewBox="0 0 100 60" className="block h-auto w-full overflow-visible"><path {...p} d="M4 48 C 26 10, 60 6, 90 26" /><path {...p} d="M76 12 L91 26 L72 33" /></svg>;
    case "sparkle":
      return <svg viewBox="0 0 60 60" className="block h-auto w-full overflow-visible"><path {...p} d="M30 4 L33 26 L56 30 L33 34 L30 56 L27 34 L4 30 L27 26 Z" /><path {...p} d="M52 6 l0 8 M48 10 l8 0" /></svg>;
    case "circle":
      return <svg viewBox="0 0 100 80" className="block h-auto w-full overflow-visible"><path {...p} d="M70 8 C 30 0, 2 22, 8 46 C 14 72, 70 78, 90 52 C 104 32, 84 8, 52 10" /></svg>;
    case "squiggle":
      return <svg viewBox="0 0 120 30" className="block h-auto w-full overflow-visible"><path {...p} d="M4 18 C 14 2, 22 30, 34 14 S 54 2, 64 16 S 84 30, 94 12 S 112 6, 116 16" /></svg>;
    case "bang":
      return <svg viewBox="0 0 50 60" className="block h-auto w-full overflow-visible"><path {...p} d="M14 6 L18 36 M14 48 l0.5 0.5" strokeWidth={3.4} /><path {...p} d="M34 4 L36 34 M35 46 l0.5 0.5" strokeWidth={3.4} /></svg>;
    case "spiral":
      return <svg viewBox="0 0 60 60" className="block h-auto w-full overflow-visible"><path {...p} d="M32 30 C 32 26, 26 26, 26 31 C 26 38, 38 38, 39 30 C 40 20, 22 18, 20 31 C 18 44, 44 48, 48 30 C 52 12, 18 6, 10 26" /></svg>;
    case "heart":
      return <svg viewBox="0 0 60 56" className="block h-auto w-full overflow-visible"><path {...p} d="M30 50 C 8 34, 2 20, 10 10 C 18 2, 28 8, 30 16 C 32 8, 44 0, 52 10 C 60 22, 50 36, 30 50 Z" /></svg>;
    case "underline":
      return <svg viewBox="0 0 160 24" className="block h-auto w-full overflow-visible"><path {...p} d="M4 14 C 50 6, 100 6, 156 12" /><path {...p} d="M18 20 C 60 14, 110 14, 140 18" /></svg>;
    case "star":
      return <svg viewBox="0 0 70 70" className="block h-auto w-full overflow-visible"><path {...p} d="M35 6 L43 26 L64 28 L48 42 L53 63 L35 52 L17 63 L22 42 L6 28 L27 26 Z" /></svg>;
    case "zz":
      return (
        <svg viewBox="0 0 70 60" className="block h-auto w-full overflow-visible">
          <path {...p} d="M8 30 L26 30 L8 50 L28 50" /><path {...p} d="M38 8 L54 8 L38 26 L56 26" strokeWidth={2.6} />
        </svg>
      );
  }
}

/* ---------- geometry ---------- */

type Pos = { x: number; y: number; w: number; r: number };
type Guide = { axis: "x" | "y"; at: number };

function useWide() {
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

function initial(wide: boolean): Record<string, Pos> {
  return Object.fromEntries(STICKERS.map((s) => {
    const [x, y, w, r] = wide ? s.d : s.m;
    return [s.id, { x, y, w, r }];
  }));
}

/* ---------- board ---------- */

export function StickerBoard({ className, children }: { className?: string; children?: ReactNode }) {
  const { tx, t } = useLang();
  const reduce = useReducedMotion();
  const wide = useWide();
  const board = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [pos, setPos] = useState<Record<string, Pos>>(() => initial(wide));
  const [order, setOrder] = useState<string[]>(STICKERS.map((s) => s.id));
  const [sel, setSel] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  type Frame = { ids: string[]; x: number; y: number; w: number; h: number; dir: "row" | "col" };
  const [frames, setFrames] = useState<Frame[]>([]);
  const drag = useRef<{ id: string; px: number; py: number; ox: number; oy: number; moved: boolean; additive: boolean; touch: boolean } | null>(null);

  useEffect(() => { setPos(initial(wide)); setFrames([]); setSel([]); }, [wide]);

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hPct = useCallback((id: string, p: Pos) => {
    const s = STICKERS.find((x) => x.id === id)!;
    return (p.w * size.w * s.ratio) / size.h;
  }, [size]);

  const bring = (id: string) => setOrder((o) => [...o.filter((x) => x !== id), id]);

  const onDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id, px: e.clientX, py: e.clientY, ox: pos[id].x, oy: pos[id].y, moved: false, additive: e.shiftKey || e.metaKey || e.ctrlKey, touch: e.pointerType === "touch" };
    bring(id);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = ((e.clientX - d.px) / size.w) * 100;
    const dy = ((e.clientY - d.py) / size.h) * 100;
    if (!d.moved && Math.hypot(e.clientX - d.px, e.clientY - d.py) < 4) return;
    if (!d.moved) {
      d.moved = true;
      setDragId(d.id);
      setFrames((fs) => fs.filter((f) => !f.ids.includes(d.id)));
      if (!sel.includes(d.id)) setSel([d.id]);
    }
    const me = pos[d.id];
    let x = d.ox + dx;
    let y = d.oy + dy;
    const h = hPct(d.id, me);
    // smart guides: board centre + other stickers' centres and edges
    const snap = 0.9;
    const g: Guide[] = [];
    const cxs = [50, ...STICKERS.filter((s) => s.id !== d.id).flatMap((s) => [pos[s.id].x, pos[s.id].x + pos[s.id].w / 2, pos[s.id].x + pos[s.id].w])];
    const cys = [50, ...STICKERS.filter((s) => s.id !== d.id).flatMap((s) => { const hh = hPct(s.id, pos[s.id]); return [pos[s.id].y, pos[s.id].y + hh / 2, pos[s.id].y + hh]; })];
    for (const [k, off] of [["l", 0], ["c", me.w / 2], ["r", me.w]] as const) {
      const v = x + off;
      const hit = cxs.find((c) => Math.abs(c - v) < snap);
      if (hit !== undefined && !g.some((q) => q.axis === "x")) { x = hit - off; g.push({ axis: "x", at: hit }); void k; }
    }
    for (const off of [0, h / 2, h]) {
      const v = y + off;
      const hit = cys.find((c) => Math.abs(c - v) < snap);
      if (hit !== undefined && !g.some((q) => q.axis === "y")) { y = hit - off; g.push({ axis: "y", at: hit }); }
    }
    setGuides(g);
    setPos((p) => ({ ...p, [d.id]: { ...p[d.id], x, y } }));
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragId(null);
    setGuides([]);
    if (d && !d.moved) {
      if (d.additive || d.touch) setSel((s) => (s.includes(d.id) ? s.filter((x) => x !== d.id) : [...s, d.id]));
      else setSel((s) => (s.length === 1 && s[0] === d.id ? s : [d.id]));
    }
  };

  /** Lay ids out as one auto-layout frame. dir: row (wraps) or col (stacks). anchor in % of the board. */
  const layoutGroup = useCallback((ids: string[], dir: "row" | "col", anchor: { x: number; y: number; align: "start" | "center" | "end" }) => {
    const G = 16, P = 16;
    const next: Record<string, Pos> = {};
    let fw = 0, fh = 0;
    if (dir === "col") {
      const colW = wide ? Math.min(150, size.w * 0.15) : size.w * 0.4;
      let k = 1;
      const widthOf = (id: string) => Math.min(colW, (colW * 0.95) / STICKERS.find((x) => x.id === id)!.ratio) * k;
      const total = () => ids.reduce((a, id) => a + widthOf(id) * STICKERS.find((x) => x.id === id)!.ratio, 0) + G * (ids.length - 1) + P * 2;
      const top = wide ? 44 : 24;
      const maxH = size.h - top - 64;
      if (total() > maxH) k = (maxH - G * (ids.length - 1) - P * 2) / (total() - G * (ids.length - 1) - P * 2);
      fw = colW * k + P * 2;
      fh = total();
      let x0 = (anchor.x / 100) * size.w;
      if (anchor.align === "end") x0 -= fw; else if (anchor.align === "center") x0 -= fw / 2;
      let y0 = (anchor.y / 100) * size.h - fh / 2;
      y0 = Math.min(Math.max(y0, top), size.h - fh - 64);
      x0 = Math.min(Math.max(x0, wide ? 24 : 4), size.w - fw - 4);
      let y = y0 + P;
      for (const id of ids) {
        const r = STICKERS.find((x) => x.id === id)!.ratio;
        const w = widthOf(id);
        next[id] = { x: ((x0 + P + (colW * k - w) / 2) / size.w) * 100, y: (y / size.h) * 100, w: (w / size.w) * 100, r: 0 };
        y += w * r + G;
      }
      setPos((p) => ({ ...p, ...next }));
      return { ids, x: (x0 / size.w) * 100, y: (y0 / size.h) * 100, w: (fw / size.w) * 100, h: (fh / size.h) * 100, dir } as Frame;
    }
    const rowH = wide ? Math.min(140, size.h * 0.19) : Math.min(116, size.w * 0.3);
    const maxRow = (wide ? 0.9 : 0.96) * size.w - P * 2;
    const rows: { id: string; w: number }[][] = [[]];
    let cur = 0;
    for (const id of ids) {
      const w = rowH / STICKERS.find((x) => x.id === id)!.ratio;
      if (cur > 0 && cur + G + w > maxRow) { rows.push([]); cur = 0; }
      rows[rows.length - 1].push({ id, w });
      cur += (cur > 0 ? G : 0) + w;
    }
    const widest = Math.max(...rows.map((r) => r.reduce((a, b) => a + b.w, 0) + G * (r.length - 1)));
    fw = widest + P * 2;
    fh = rows.length * rowH + (rows.length - 1) * G + P * 2;
    let x0 = (anchor.x / 100) * size.w - fw / 2;
    let y0 = (anchor.y / 100) * size.h - fh / 2;
    x0 = Math.min(Math.max(x0, 4), size.w - fw - 4);
    y0 = Math.min(Math.max(y0, wide ? 44 : 24), size.h - fh - 64);
    let y = y0 + P;
    for (const r of rows) {
      const rw = r.reduce((a, b) => a + b.w, 0) + G * (r.length - 1);
      let x = x0 + P + (widest - rw) / 2;
      for (const it of r) {
        next[it.id] = { x: (x / size.w) * 100, y: (y / size.h) * 100, w: (it.w / size.w) * 100, r: 0 };
        x += it.w + G;
      }
      y += rowH + G;
    }
    setPos((p) => ({ ...p, ...next }));
    return { ids, x: (x0 / size.w) * 100, y: (y0 / size.h) * 100, w: (fw / size.w) * 100, h: (fh / size.h) * 100, dir } as Frame;
  }, [size, wide]);

  const autoLayout = useCallback(() => {
    const all = STICKERS.map((s) => s.id);
    if (sel.length >= 2) {
      const cx = sel.reduce((a, id) => a + pos[id].x + pos[id].w / 2, 0) / sel.length;
      const cy = sel.reduce((a, id) => a + pos[id].y + hPct(id, pos[id]) / 2, 0) / sel.length;
      const ordered = [...sel].sort((a, b) => (pos[a].y - pos[b].y) || (pos[a].x - pos[b].x));
      let f: Frame;
      if (wide && cx < 32) f = layoutGroup(ordered, "col", { x: 1.5, y: cy, align: "start" });
      else if (wide && cx > 68) f = layoutGroup(ordered, "col", { x: 98.5, y: cy, align: "end" });
      else if (wide) f = layoutGroup([...sel].sort((a, b) => pos[a].x - pos[b].x), "row", { x: 50, y: 86, align: "center" });
      else f = layoutGroup(ordered, "row", { x: 50, y: cy, align: "center" });
      setFrames((fs) => [...fs.filter((x) => !x.ids.some((id) => sel.includes(id))), f]);
      return;
    }
    // nothing (or one) selected: tidy everything
    if (wide) {
      const byX = [...all].sort((a, b) => (pos[a].x + pos[a].w / 2) - (pos[b].x + pos[b].w / 2));
      const left = byX.slice(0, 5).sort((a, b) => pos[a].y - pos[b].y);
      const right = byX.slice(5).sort((a, b) => pos[a].y - pos[b].y);
      const fL = layoutGroup(left, "col", { x: 1.5, y: 50, align: "start" });
      const fR = layoutGroup(right, "col", { x: 98.5, y: 50, align: "end" });
      setFrames([fL, fR]);
    } else {
      setFrames([layoutGroup(all, "row", { x: 50, y: 50, align: "center" })]);
    }
    setSel([]);
  }, [sel, pos, hPct, wide, layoutGroup]);

  const reset = () => { setPos(initial(wide)); setFrames([]); setSel([]); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Escape") setSel([]);
      if (e.shiftKey && (e.key === "A" || e.key === "a") && sel.length > 0) { e.preventDefault(); autoLayout(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoLayout, sel.length]);

  const selBox = useMemo(() => {
    if (sel.length === 0) return null;
    const xs = sel.map((id) => pos[id]);
    const x = Math.min(...xs.map((p) => p.x));
    const y = Math.min(...sel.map((id) => pos[id].y));
    const r = Math.max(...xs.map((p) => p.x + p.w));
    const b = Math.max(...sel.map((id) => pos[id].y + hPct(id, pos[id])));
    return { x, y, w: r - x, h: b - y };
  }, [sel, pos, hPct]);

  const px = (pct: number, axis: "w" | "h") => Math.round((pct / 100) * (axis === "w" ? size.w : size.h));

  return (
    <div
      ref={board}
      className={cn("sticker-board relative select-none", className)}
      onPointerDown={() => { if (!drag.current) setSel([]); }}
    >
      {children}

      {/* rulers (desktop) */}
      {wide && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[18px] border-b border-border bg-canvas/85 backdrop-blur-sm">
            {Array.from({ length: Math.ceil(size.w / 50) + 1 }).map((_, i) => (
              <span key={i} className="absolute bottom-0 border-l border-border-strong" style={{ left: i * 50, height: i % 2 === 0 ? 8 : 4 }}>
                {i % 2 === 0 && <span className="absolute -top-[1px] left-[3px] font-mono text-[8.5px] text-muted-foreground">{i * 50}</span>}
              </span>
            ))}
            {selBox && <span className="absolute inset-y-0 bg-primary/15" style={{ left: `${selBox.x}%`, width: `${selBox.w}%` }} />}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[18px] border-r border-border bg-canvas/85 backdrop-blur-sm">
            {Array.from({ length: Math.ceil(size.h / 50) + 1 }).map((_, i) => (
              <span key={i} className="absolute right-0 border-t border-border-strong" style={{ top: i * 50, width: i % 2 === 0 ? 8 : 4 }} />
            ))}
            {selBox && <span className="absolute inset-x-0 bg-primary/15" style={{ top: `${selBox.y}%`, height: `${selBox.h}%` }} />}
          </div>
        </>
      )}

      {/* auto layout frames */}
      <AnimatePresence>
        {frames.map((frame) => (
          <motion.div
            key={frame.ids.join("-")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute z-[3] rounded-[6px] border-[1.5px] border-primary bg-primary/[0.04]"
            style={{ left: `${frame.x}%`, top: `${frame.y}%`, width: `${frame.w}%`, height: `${frame.h}%` }}
          >
            <span className="absolute -top-[22px] left-[-1.5px] flex items-center gap-1 whitespace-nowrap rounded-[4px] bg-primary px-1.5 py-[2px] text-[10.5px] font-medium text-primary-foreground">
              <svg viewBox="0 0 12 12" className={cn("size-2.5", frame.dir === "row" && "rotate-90")} aria-hidden="true"><path d="M1 3h10M1 6h10M1 9h10" stroke="currentColor" strokeWidth="1.4" /></svg>
              Auto layout
            </span>
            <span className="absolute -bottom-[22px] right-[-1.5px] whitespace-nowrap rounded-[4px] bg-primary px-1.5 py-[2px] font-mono text-[10px] text-primary-foreground">
              {frame.dir === "col" ? "↓" : "→"} gap 16 · pad 16
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* stickers */}
      {order.map((id) => {
        const s = STICKERS.find((x) => x.id === id)!;
        const p = pos[id];
        const z = 4 + order.indexOf(id);
        const isSel = sel.includes(id);
        const inFrame = frames.some((f) => f.ids.includes(id));
        const doodleColor = tonesVar[s.doodle.tone ?? "ink"];
        const i = STICKERS.findIndex((x) => x.id === id);
        return (
          <motion.div
            key={id}
            onPointerDown={(e) => onDown(e, id)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: dragId === id ? 1.06 : 1, left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, rotate: p.r }}
            transition={
              dragId === id
                ? { left: { duration: 0 }, top: { duration: 0 }, scale: { type: "spring", stiffness: 400, damping: 22 } }
                : { type: "spring", stiffness: 260, damping: 24, opacity: { duration: 0.3, delay: reduce ? 0 : 0.1 + i * 0.05 }, scale: { type: "spring", stiffness: 260, damping: 18, delay: reduce ? 0 : 0.1 + i * 0.05 } }
            }
            className={cn("absolute touch-none", dragId === id ? "cursor-grabbing" : "cursor-grab")}
            style={{ zIndex: z }}
          >
            <img src={s.src} alt={t(s.name)} draggable={false} className="sticker-img pointer-events-none block h-auto w-full" />
            <AnimatePresence>
              {!inFrame && (
                <motion.span
                  key="doodle"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.25, delay: reduce ? 0 : 0.5 + i * 0.05 }}
                  className="pointer-events-none absolute"
                  style={{ left: `${s.doodle.x}%`, top: `${s.doodle.y}%`, width: `${s.doodle.s}%`, rotate: `${s.doodle.r ?? 0}deg` }}
                  aria-hidden="true"
                >
                  <DoodleSvg kind={s.doodle.kind} color={doodleColor} />
                </motion.span>
              )}
            </AnimatePresence>
            {isSel && (
              <span className="pointer-events-none absolute -inset-[3px] border-[1.5px] border-primary" style={{ rotate: `${-0}deg` }}>
                {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((c) => (
                  <span key={c} className={cn("absolute size-[7px] border-[1.5px] border-primary bg-white", c)} />
                ))}
                {sel.length === 1 && (
                  <>
                    <span className="absolute -top-[21px] left-[-1.5px] whitespace-nowrap rounded-[3px] bg-primary px-1 py-[1px] text-[10px] font-medium text-primary-foreground">{t(s.name)}</span>
                    <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-primary px-1 py-[1px] font-mono text-[10px] text-primary-foreground">
                      {px(p.w, "w")} × {Math.round(px(p.w, "w") * s.ratio)}
                    </span>
                  </>
                )}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* smart guides + live position */}
      {guides.map((g, i) => (
        <span
          key={i}
          className={cn("pointer-events-none absolute z-[90] bg-redline", g.axis === "x" ? "inset-y-0 w-px" : "inset-x-0 h-px")}
          style={g.axis === "x" ? { left: `${g.at}%` } : { top: `${g.at}%` }}
        />
      ))}
      {dragId && (
        <span
          className="pointer-events-none absolute z-[91] whitespace-nowrap rounded-[4px] bg-redline px-1.5 py-[2px] font-mono text-[10px] text-white"
          style={{ left: `${pos[dragId].x + pos[dragId].w + 1}%`, top: `${pos[dragId].y}%` }}
        >
          X {px(pos[dragId].x, "w")}　Y {px(pos[dragId].y, "h")}
        </span>
      )}

      {/* Figma-style toolbar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[95] flex justify-center lg:bottom-5">
        <div
          className="pointer-events-auto flex items-center gap-1 rounded-[12px] bg-[#2C2C2C] p-1 text-[12px] text-white shadow-[0_8px_24px_-8px_rgb(0_0_0/0.45)]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="px-2 tabular-nums text-white/60">
            {sel.length > 0 ? tx(`已选 ${sel.length}`, `${sel.length} selected`) : tx("点贴纸选中，可多选", wide ? "Click to select · ⇧ for more" : "Tap stickers to select")}
          </span>
          <button
            type="button"
            onClick={autoLayout}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#0D99FF] px-2.5 py-1.5 font-medium outline-none hover:bg-[#2AA5FF] focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97]"
          >
            <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true"><rect x="1.5" y="2" width="4" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="8.5" y="2" width="4" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
            Auto layout
            {wide && <span className="text-white/60">⇧A</span>}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={tx("复原", "Reset")}
            className="grid size-[30px] place-items-center rounded-[8px] text-white/80 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true"><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3M3.5 2.5v2.6h2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
