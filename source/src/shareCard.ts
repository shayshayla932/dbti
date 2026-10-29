import qrcode from "qrcode-generator";
import { CHAR_SRC } from "./Character";
import { FAMILIES, TYPES, WHY, type Family, type Lang, type TypeCode } from "./data";

export const ARTIFACT_URL = "https://claude.ai/artifact/DDbZurGbGkSPfwDtYj1sPN";
export const SITE_URL = "https://shayshayla932.github.io/dbti/";
/** Inside claude.ai the page runs in a sandboxed frame, so link to the artifact; anywhere else, link to the public site. */
export const inClaude = () => typeof window !== "undefined" && !!(window as unknown as { claude?: unknown }).claude;
export const baseUrl = () => (inClaude() ? ARTIFACT_URL : SITE_URL);
export const shareUrl = (code: TypeCode) => `${baseUrl()}#t-${code.toLowerCase()}`;

export const FAM_HEX: Record<Family, string> = { pixel: "#4C6E9E", client: "#C0533A", ship: "#B0466C", chaos: "#8A6648" };

function mix(hex: string, white: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * white));
  return `rgb(${c.join(",")})`;
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Wrap text into lines that fit maxW. CJK breaks anywhere, Latin on spaces. */
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const tokens = /[　-鿿]/.test(text) ? Array.from(text) : text.split(/(?<=\s)/);
  const lines: string[] = [];
  let cur = "";
  for (const t of tokens) {
    if (g.measureText(cur + t).width > maxW && cur) { lines.push(cur.trimEnd()); cur = t.trimStart(); }
    else cur += t;
  }
  if (cur) lines.push(cur.trimEnd());
  return lines;
}

const SANS = `-apple-system, "SF Pro Display", Inter, "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif`;
const DISPLAY = `Unbounded, Inter, -apple-system, sans-serif`;

/** A 1080×1350 result card (4:5, fits most feeds). */
export async function renderCard(code: TypeCode, lang: Lang, share?: { pct: number | null }): Promise<Blob> {
  const W = 1080, H = 1350;
  const t = TYPES[code];
  const col = FAM_HEX[t.family];
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  try { await Promise.race([Promise.all([document.fonts.load(`800 120px Unbounded`), document.fonts.load(`700 60px Inter`)]), new Promise((r) => setTimeout(r, 1500))]); } catch { /* fallbacks are fine */ }

  // ground
  g.fillStyle = "#F4F3F7";
  g.fillRect(0, 0, W, H);
  // dotted canvas
  g.fillStyle = "rgba(20,20,30,0.08)";
  for (let y = 24; y < H; y += 32) for (let x = 24; x < W; x += 32) { g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill(); }

  // card
  const P = 56, cx = P, cy = 120, cw = W - P * 2, ch = 1000;
  g.save();
  g.shadowColor = "rgba(20,20,40,0.16)"; g.shadowBlur = 50; g.shadowOffsetY = 18;
  roundRect(g, cx, cy, cw, ch, 44); g.fillStyle = "#FFFFFF"; g.fill();
  g.restore();
  g.save();
  roundRect(g, cx, cy, cw, ch, 44); g.clip();
  g.fillStyle = mix(col, 0.82);
  g.fillRect(cx, cy, cw, 470);
  const img = await loadImg(CHAR_SRC[code]);
  const iw = cw - 20, ih = (iw * img.height) / img.width;
  g.drawImage(img, cx + 10, cy + 470 - ih, iw, ih);
  g.restore();

  // header above the card
  g.fillStyle = "#1C1C1E";
  g.font = `800 44px ${DISPLAY}`;
  g.textBaseline = "alphabetic";
  g.fillText("DBTI", P + 6, 84);
  g.font = `500 26px ${SANS}`;
  g.fillStyle = "rgba(60,60,67,0.6)";
  g.textAlign = "right";
  g.fillText(lang === "zh" ? "设计民工也有自己的 BTI" : "Designers get a BTI too", W - P - 6, 82);
  g.textAlign = "left";

  // chips
  let x = cx + 48;
  const chip = (label: string, bg: string, fg: string) => {
    g.font = `600 26px ${SANS}`;
    const w = g.measureText(label).width + 36;
    roundRect(g, x, cy + 505, w, 46, 23); g.fillStyle = bg; g.fill();
    g.fillStyle = fg; g.fillText(label, x + 18, cy + 537);
    x += w + 12;
  };
  chip(FAMILIES[t.family].name[lang], col, "#FFFFFF");
  chip(t.rarity, "#F0F0F3", "rgba(60,60,67,0.75)");
  if (share?.pct != null) chip(lang === "zh" ? `${share.pct}% 的人是这型` : `${share.pct}% got this`, "#F0F0F3", "rgba(60,60,67,0.75)");

  // code + name + line
  g.fillStyle = col;
  g.font = `800 150px ${DISPLAY}`;
  g.fillText(code, cx + 44, cy + 690);
  g.fillStyle = "#1C1C1E";
  g.font = `700 58px ${SANS}`;
  g.fillText(t.name[lang], cx + 48, cy + 772);
  g.fillStyle = "rgba(60,60,67,0.62)";
  g.font = `400 32px ${SANS}`;
  wrap(g, t.line[lang], cw - 96).slice(0, 2).forEach((l, i) => g.fillText(l, cx + 48, cy + 826 + i * 44));

  // relationships
  const ry = cy + 880;
  g.strokeStyle = "rgba(60,60,67,0.14)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(cx + 48, ry - 6); g.lineTo(cx + cw - 48, ry - 6); g.stroke();
  const rel = (dx: number, dot: string, label: string, other: TypeCode) => {
    g.fillStyle = dot; g.beginPath(); g.arc(cx + dx + 8, ry + 34, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(60,60,67,0.6)"; g.font = `500 24px ${SANS}`; g.fillText(label, cx + dx + 24, ry + 42);
    g.fillStyle = FAM_HEX[TYPES[other].family]; g.font = `800 30px ${DISPLAY}`; g.fillText(other, cx + dx, ry + 86);
    const w = g.measureText(other).width;
    g.fillStyle = "#1C1C1E"; g.font = `600 28px ${SANS}`; g.fillText(TYPES[other].name[lang], cx + dx + w + 12, ry + 86);
  };
  rel(48, "#34C759", lang === "zh" ? "最配搭子" : "Best match", t.bestie);
  rel(cw / 2 + 10, "#FF2D55", lang === "zh" ? "天生相克" : "Nemesis", t.enemy);
  void WHY;

  // footer with QR
  const qr = qrcode(0, "M");
  qr.addData(shareUrl(code));
  qr.make();
  const n = qr.getModuleCount();
  const qs = 150, q0x = W - P - qs, q0y = H - 40 - qs;
  roundRect(g, q0x - 12, q0y - 12, qs + 24, qs + 24, 16); g.fillStyle = "#FFFFFF"; g.fill();
  const cell = qs / n;
  g.fillStyle = "#1C1C1E";
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) g.fillRect(q0x + k * cell, q0y + r * cell, cell + 0.4, cell + 0.4);
  g.fillStyle = "#1C1C1E";
  g.font = `700 40px ${SANS}`;
  g.fillText(lang === "zh" ? "你是哪种设计师？" : "What kind of designer are you?", P + 6, H - 108);
  g.fillStyle = "rgba(60,60,67,0.62)";
  g.font = `400 26px ${SANS}`;
  g.fillText(lang === "zh" ? "扫码测一测 · 10 道题，全是上班日常" : "Scan to take it · 10 questions from your workday", P + 6, H - 62);

  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
