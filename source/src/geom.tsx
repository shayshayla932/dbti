export type Pt = [number, number];

export const INK = "#1F1E26";

function toRgb(h: string): [number, number, number] {
  if (h.startsWith("rgb")) {
    const [r, g, b] = h.replace(/[^\d.\s]/g, " ").trim().split(/\s+/).map(Number);
    return [r, g, b];
  }
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** amt > 0 mixes toward white, amt < 0 toward black (−1…1). */
export function tone(hex: string, amt: number) {
  const [r, g, b] = toRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  const m = (c: number) => Math.round(c + (t - c) * k);
  return `rgb(${m(r)} ${m(g)} ${m(b)})`;
}

const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export function Poly({ p, fill, opacity }: { p: Pt[]; fill: string; opacity?: number }) {
  return <polygon points={pts(p)} fill={fill} opacity={opacity} />;
}

export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const norm = (a: Pt): Pt => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
export const perp = (a: Pt): Pt => [-a[1], a[0]];
