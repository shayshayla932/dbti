import { useId } from "react";

/* Hand-drawn vector art used inside the question scenes. */

/** A "photo" of a jewel beetle on a leaf, top-down. */
export function BeetlePhoto({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const leg = (d: string, k: string) => (
    <g key={k}>
      <path d={d} fill="none" stroke="#14180F" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#3A4A2C" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </g>
  );
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="一只彩虹色的吉丁虫">
      <defs>
        <radialGradient id={`${id}bg`} cx="0.55" cy="0.45" r="0.85">
          <stop offset="0" stopColor="#5E8C3A" />
          <stop offset="0.55" stopColor="#2F5A22" />
          <stop offset="1" stopColor="#0F2611" />
        </radialGradient>
        <filter id={`${id}blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
        <linearGradient id={`${id}ely`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#19C98A" />
          <stop offset="0.28" stopColor="#0E9E7A" />
          <stop offset="0.48" stopColor="#E9C64B" />
          <stop offset="0.62" stopColor="#E0702F" />
          <stop offset="0.8" stopColor="#B9314A" />
          <stop offset="1" stopColor="#4A2C8F" />
        </linearGradient>
        <linearGradient id={`${id}elyShade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`${id}pro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2BE0B0" />
          <stop offset="0.5" stopColor="#1677C9" />
          <stop offset="1" stopColor="#6B2FA8" />
        </linearGradient>
      </defs>
      {/* leaf background with bokeh */}
      <rect width="320" height="240" fill={`url(#${id}bg)`} />
      <g filter={`url(#${id}blur)`} opacity={0.55}>
        <path d="M-20,190 C80,120 200,110 340,40" stroke="#A9D36E" strokeWidth={5} fill="none" />
        <path d="M60,150 C70,110 90,90 120,70 M150,128 C150,96 170,70 200,54 M230,96 C240,70 258,52 280,40" stroke="#8DBA55" strokeWidth={3} fill="none" />
        <circle cx={40} cy={40} r={22} fill="#D8F0A0" opacity={0.5} />
        <circle cx={286} cy={196} r={30} fill="#C7E58A" opacity={0.35} />
        <circle cx={262} cy={30} r={14} fill="#F5FFD6" opacity={0.5} />
      </g>
      {/* beetle, slightly rotated */}
      <g transform="translate(160 122) rotate(-18) translate(-100 -130)">
        <ellipse cx={104} cy={148} rx={44} ry={82} fill="#000" opacity={0.35} filter={`url(#${id}soft)`} />
        {/* legs */}
        {leg("M78,92 L56,80 L40,58", "l1")}
        {leg("M122,92 L144,80 L160,58", "r1")}
        {leg("M74,118 L48,122 L30,140", "l2")}
        {leg("M126,118 L152,122 L170,140", "r2")}
        {leg("M76,150 L54,170 L46,200", "l3")}
        {leg("M124,150 L146,170 L154,200", "r3")}
        {/* antennae */}
        <path d="M92,48 L80,30 L70,24 M108,48 L120,30 L130,24" fill="none" stroke="#14180F" strokeWidth={2} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={86 - i * 4} cy={38 - i * 4} r={1.6} fill="#14180F" />)}
        {/* head */}
        <path d="M86,52 Q100,38 114,52 L112,66 Q100,72 88,66 Z" fill="#0F6E5A" />
        <ellipse cx={89} cy={56} rx={4} ry={5} fill="#1A1A12" />
        <ellipse cx={111} cy={56} rx={4} ry={5} fill="#1A1A12" />
        {/* pronotum */}
        <path d="M76,72 Q100,60 124,72 L130,94 Q100,102 70,94 Z" fill={`url(#${id}pro)`} />
        <path d="M80,72 Q100,64 112,68 L104,84 Q90,84 78,90 Z" fill="#fff" opacity={0.22} />
        {/* elytra */}
        <path d="M70,96 Q100,90 130,96 L134,150 Q132,200 104,234 L100,236 L96,234 Q68,200 66,150 Z" fill={`url(#${id}ely)`} />
        <path d="M70,96 Q100,90 130,96 L134,150 Q132,200 104,234 L100,236 L96,234 Q68,200 66,150 Z" fill={`url(#${id}elyShade)`} />
        <path d="M100,96 L100,236" stroke="#120E1E" strokeWidth={1.6} opacity={0.65} />
        {[78, 86, 92, 108, 114, 122].map((x) => (
          <path key={x} d={`M${x},100 Q${x + (x < 100 ? -2 : 2)},160 ${x + (x < 100 ? 6 : -6)},220`} stroke="#000" strokeOpacity={0.18} strokeWidth={1} fill="none" />
        ))}
        {/* specular highlights */}
        <path d="M80,104 Q84,150 86,190" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" fill="none" filter={`url(#${id}soft)`} />
        <path d="M118,110 Q120,140 118,160" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" fill="none" filter={`url(#${id}soft)`} />
        <ellipse cx={90} cy={112} rx={5} ry={9} fill="#fff" opacity={0.6} />
      </g>
      {/* photo vignette */}
      <rect width="320" height="240" fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={24} />
    </svg>
  );
}

/** A dreamy "AI generated" illustration: a whale drifting over a dusk city. */
export function AIArt({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const stars = Array.from({ length: 34 }, (_, i) => {
    const x = (i * 97) % 320;
    const y = (i * 53) % 110;
    return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.3 : 0.7} fill="#fff" opacity={0.35 + ((i * 7) % 5) / 10} />;
  });
  return (
    <svg viewBox="0 0 320 220" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="鲸鱼漂浮在黄昏城市上空的插画">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2453" />
          <stop offset="0.45" stopColor="#6D4C93" />
          <stop offset="0.75" stopColor="#E98AA0" />
          <stop offset="1" stopColor="#FFC98B" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF4D6" />
          <stop offset="0.4" stopColor="#FFD08A" />
          <stop offset="1" stopColor="#FF9F7A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}whale`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FA8E8" />
          <stop offset="1" stopColor="#3B4E9E" />
        </linearGradient>
        <linearGradient id={`${id}m1`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B06C9E" /><stop offset="1" stopColor="#6B3F7A" /></linearGradient>
        <linearGradient id={`${id}m2`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A3A78" /><stop offset="1" stopColor="#2A2350" /></linearGradient>
        <filter id={`${id}glow`}><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="320" height="220" fill={`url(#${id}sky)`} />
      {stars}
      <circle cx={232} cy={128} r={70} fill={`url(#${id}sun)`} />
      <circle cx={232} cy={128} r={26} fill="#FFF1D0" />
      {/* clouds */}
      <g fill="#FFD9E4" opacity={0.55}>
        <ellipse cx={70} cy={118} rx={46} ry={8} />
        <ellipse cx={250} cy={92} rx={38} ry={6} />
        <ellipse cx={150} cy={140} rx={60} ry={7} opacity={0.6} />
      </g>
      {/* whale */}
      <g transform="translate(66 34)">
        <path d="M0,40 C10,8 70,-6 120,14 C140,22 152,30 160,24 L176,10 L172,34 L186,44 L164,46 C150,58 110,74 60,70 C24,66 -4,58 0,40 Z" fill={`url(#${id}whale)`} />
        <path d="M6,48 C30,62 90,66 140,48 C120,64 80,72 46,68 C24,64 10,58 6,48 Z" fill="#E4EEFF" opacity={0.85} />
        {[24, 36, 48, 60, 72, 84].map((x) => <path key={x} d={`M${x},${56 + (x % 3)} L${x + 8},${60}`} stroke="#9FB4E0" strokeWidth={1.2} />)}
        <circle cx={28} cy={36} r={2.6} fill="#1E2453" />
        <path d="M62,58 C70,74 82,84 96,86 C84,74 78,66 76,60 Z" fill="#4E66B8" />
        <path d="M40,14 C44,4 50,-2 56,-6 M48,14 C54,6 60,4 66,2" stroke="#BFD6FF" strokeWidth={1.6} fill="none" opacity={0.8} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-10 - i * 9} cy={52 + (i % 2) * 6} r={1.6 - i * 0.2} fill="#FFF4D6" opacity={0.8 - i * 0.12} />)}
      </g>
      {/* mountains */}
      <path d="M0,170 L40,140 L80,158 L130,124 L180,156 L230,132 L280,152 L320,138 L320,220 L0,220 Z" fill={`url(#${id}m1)`} />
      <path d="M0,186 L50,168 L100,182 L160,160 L210,184 L260,170 L320,186 L320,220 L0,220 Z" fill={`url(#${id}m2)`} />
      {/* city */}
      <g fill="#1B1838">
        {[[12, 22], [30, 34], [46, 18], [62, 44], [82, 28], [100, 38], [194, 30], [212, 48], [232, 24], [250, 40], [270, 30], [290, 52], [306, 26]].map(([x, h], i) => (
          <rect key={i} x={x} y={220 - h} width={14} height={h} />
        ))}
      </g>
      <g fill="#FFD27A" filter={`url(#${id}glow)`} opacity={0.9}>
        {[[16, 204], [34, 194], [66, 186], [86, 200], [104, 190], [198, 198], [216, 182], [236, 204], [254, 190], [274, 200], [294, 178]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={3} height={3} />
        ))}
      </g>
      <g fill="#FFE3A3">
        {[[16, 204], [34, 194], [66, 186], [86, 200], [104, 190], [198, 198], [216, 182], [236, 204], [254, 190], [274, 200], [294, 178], [38, 206], [216, 196]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={2.4} height={2.4} />
        ))}
      </g>
    </svg>
  );
}

/** Deterministic low-poly wallpaper. */
export function LowPolyWallpaper({ className, from = [94, 80, 230], to = [255, 120, 140] }: { className?: string; from?: number[]; to?: number[] }) {
  const cols = 6, rows = 11, W = 300, H = 640;
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const pts: [number, number][][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: [number, number][] = [];
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols, edgeY = r === 0 || r === rows;
      row.push([
        (c / cols) * W + (edgeX ? 0 : (rnd() - 0.5) * 34),
        (r / rows) * H + (edgeY ? 0 : (rnd() - 0.5) * 40),
      ]);
    }
    pts.push(row);
  }
  const tris: { p: string; f: string }[] = [];
  const color = (y: number, x: number) => {
    const t = Math.min(1, Math.max(0, y / H * 0.85 + x / W * 0.25));
    const l = (rnd() - 0.5) * 22;
    const c = from.map((v, i) => Math.round(v + (to[i] - v) * t + l));
    return `rgb(${c.join(" ")})`;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c], e = pts[r + 1][c + 1];
      const cy = (a[1] + e[1]) / 2, cx = (a[0] + e[0]) / 2;
      tris.push({ p: `${a} ${b} ${e}`, f: color(cy - 8, cx + 6) });
      tris.push({ p: `${a} ${e} ${d}`, f: color(cy + 8, cx - 6) });
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {tris.map((t, i) => <polygon key={i} points={t.p} fill={t.f} stroke={t.f} strokeWidth={0.6} />)}
    </svg>
  );
}

/** Faceted sneaker for the sale poster. */
export function Sneaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 110" className={className} aria-hidden="true">
      <polygon points="8,92 192,92 186,104 14,104" fill="#2A2733" />
      <polygon points="10,82 188,80 192,92 8,92" fill="#F4F3F8" />
      <polygon points="100,81 188,80 192,92 100,92" fill="#D9D7E3" />
      <polygon points="14,82 30,48 70,40 96,52 130,58 170,60 186,72 188,80" fill="#FF6B4A" />
      <polygon points="96,52 130,58 170,60 186,72 188,80 120,80" fill="#E2502F" />
      <polygon points="30,48 70,40 64,26 44,22 34,30" fill="#FF8A6E" />
      <polygon points="44,22 64,26 70,40 52,44" fill="#E2502F" />
      <polygon points="70,40 96,52 76,62 54,56" fill="#FFFFFF" />
      <polygon points="96,52 120,58 110,70 84,64" fill="#1F1E26" />
      <polygon points="14,82 40,74 60,80" fill="#FFB49F" />
      {[0, 1, 2, 3].map((i) => <polygon key={i} points={`${66 + i * 9},${44 + i * 4} ${72 + i * 9},${46 + i * 4} ${68 + i * 9},${50 + i * 4}`} fill="#fff" />)}
    </svg>
  );
}
