import type { ReactNode } from "react";
import type { TypeCode } from "./data";
import { INK, Poly, tone, type Pt } from "./geom";

function Paper({ x, y, w, h, rot = 0, children }: { x: number; y: number; w: number; h: number; rot?: number; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Poly p={[[0, 0], [w, 0], [w, h], [0, h]]} fill="#FBFBFD" />
      <Poly p={[[w * 0.6, 0], [w, 0], [w, h], [w * 0.45, h]]} fill="#E9E8F0" />
      {children}
    </g>
  );
}

export function PropFront({ code, lang = "zh" }: { code: TypeCode; lang?: "zh" | "en" }) {
  switch (code) {
    case "PIXL":
      return (
        <g>
          {/* glasses */}
          <g fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="miter">
            <polygon points="81,53 95,52 95,63 82,64" />
            <polygon points="100,52 114,51 114,62 101,63" />
            <line x1={95} y1={56} x2={100} y2={56} />
          </g>
          {/* magnifier */}
          <Poly p={[[146, 66], [152, 62], [158, 50], [154, 48]]} fill="#3A3646" />
          <polygon points="160,22 171,26 176,37 172,48 161,52 150,48 146,37 150,26" fill="#DDF3FF" fillOpacity={0.7} stroke="#3A3646" strokeWidth={4} strokeLinejoin="round" />
          <Poly p={[[152, 30], [160, 26], [158, 32], [152, 36]]} fill="#fff" />
          {/* redline */}
          <g stroke="#F0398B" strokeWidth={1.4}>
            <line x1={34} y1={118} x2={34} y2={152} strokeDasharray="3 2" />
            <line x1={29} y1={118} x2={39} y2={118} /><line x1={29} y1={152} x2={39} y2={152} />
          </g>
          <rect x={18} y={129} width={32} height={13} rx={2} fill="#F0398B" />
          <text x={34} y={138.5} textAnchor="middle" fontSize={8} fontFamily="ui-monospace, Menlo, monospace" fill="#fff" fontWeight={600}>0.5px</text>
        </g>
      );
    case "AUTO":
      return (
        <g>
          <Poly p={[[72, 118], [132, 116], [134, 170], [74, 172]]} fill="#FFFFFF" />
          <Poly p={[[104, 117], [132, 116], [134, 170], [104, 171]]} fill="#EEF5FF" />
          <polygon points="72,118 132,116 134,170 74,172" fill="none" stroke="#0285F7" strokeWidth={2.4} />
          <Poly p={[[79, 124], [126, 123], [126, 132], [79, 133]]} fill="#0285F7" />
          <Poly p={[[79, 138], [126, 137], [126, 146], [79, 147]]} fill="#0285F7" opacity={0.6} />
          <Poly p={[[79, 152], [126, 151], [126, 160], [79, 161]]} fill="#0285F7" opacity={0.32} />
          <rect x={72} y={104} width={32} height={10} fill="#0285F7" />
          <text x={88} y={111.5} textAnchor="middle" fontSize={7} fontFamily="ui-monospace, Menlo, monospace" fill="#fff">Auto</text>
          {([[72, 118], [132, 116], [74, 172], [134, 170]] as Pt[]).map(([x, y]) => (
            <rect key={`${x}${y}`} x={x - 3} y={y - 3} width={6} height={6} fill="#fff" stroke="#0285F7" strokeWidth={1.4} />
          ))}
        </g>
      );
    case "BLCK":
      return (
        <g>
          <g transform="translate(150 60) rotate(-14)">
            <Poly p={[[-8, -22], [8, -24], [10, 14], [-6, 16]]} fill="#0B0E14" />
            <g transform="rotate(14)"><Poly p={[[-4, -26], [12, -28], [14, 10], [-2, 12]]} fill="#22183A" /></g>
            <g transform="rotate(28)"><Poly p={[[0, -30], [16, -32], [18, 6], [2, 8]]} fill="url(#iridescent)" /></g>
          </g>
          {/* beetle on the shoulder */}
          <g transform="translate(76 102) rotate(-20)">
            <Poly p={[[0, -12], [9, -6], [10, 8], [0, 14], [-10, 8], [-9, -6]]} fill="url(#beetle)" />
            <Poly p={[[0, -12], [9, -6], [10, 8], [0, 14]]} fill="#000" opacity={0.25} />
            <Poly p={[[-4, -17], [4, -17], [5, -11], [-5, -11]]} fill="#14121C" />
            <g stroke="#14121C" strokeWidth={1.4}><line x1={-9} y1={-2} x2={-15} y2={-6} /><line x1={9} y1={-2} x2={15} y2={-6} /><line x1={-9} y1={6} x2={-15} y2={10} /><line x1={9} y1={6} x2={15} y2={10} /></g>
          </g>
        </g>
      );
    case "LOGO":
      return (
        <g>
          <Poly p={[[48, -16], [156, -18], [158, 32], [50, 34]]} fill="#EF6A4C" />
          <Poly p={[[104, -17], [156, -18], [158, 32], [104, 33]]} fill="#D7553A" />
          <Poly p={[[48, -16], [82, -17], [60, 34], [50, 34]]} fill="#F7876D" />
          <text x={103} y={17} textAnchor="middle" fontSize={24} fontFamily="-apple-system, Inter, sans-serif" fontWeight={800} fill="#fff">LOGO</text>
          <g stroke="#EF6A4C" strokeWidth={2.5}>
            <line x1={38} y1={-12} x2={28} y2={-20} /><line x1={36} y1={8} x2={24} y2={8} /><line x1={168} y1={-12} x2={178} y2={-20} /><line x1={170} y1={8} x2={182} y2={8} />
          </g>
        </g>
      );
    case "UNDO":
      return (
        <g>
          {[3, 2, 1, 0].map((i) => <Paper key={i} x={72 + i * 3} y={124 + i * 4} w={52} h={32} />)}
          <text x={100} y={146} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, Menlo, monospace" fill="#EF6A4C" fontWeight={700}>v37</text>
          <polyline points="140,62 150,46 166,44 176,56 172,72 158,78" fill="none" stroke="#F08A3E" strokeWidth={4} strokeLinejoin="miter" />
          <Poly p={[[134, 56], [146, 68], [136, 72]]} fill="#F08A3E" />
          <text x={170} y={94} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, Menlo, monospace" fill={INK} opacity={0.7}>→ v1</text>
        </g>
      );
    case "MEGO":
      return (
        <g>
          <Poly p={[[78, 132], [124, 130], [126, 160], [80, 162]]} fill="#34313F" />
          <Poly p={[[104, 131], [124, 130], [126, 160], [104, 161]]} fill="#26232F" />
          <Poly p={[[84, 124], [98, 124], [100, 131], [82, 132]]} fill="#34313F" />
          <polygon points="102,136 110,139 113,147 110,155 102,158 94,155 91,147 94,139" fill="#5C5970" stroke="#A9A8C0" strokeWidth={2} />
          <Poly p={[[98, 141], [104, 140], [101, 145]]} fill="#fff" opacity={0.8} />
          <Poly p={[[114, 110], [132, 109], [132, 120], [114, 121]]} fill="#fff" />
          <text x={123} y={118} textAnchor="middle" fontSize={7} fill={INK} fontWeight={700}>{lang === "zh" ? "美工" : "PS"}</text>
        </g>
      );
    case "SHIP":
      return (
        <g>
          <g transform="translate(154 50) rotate(32)">
            <Poly p={[[0, -26], [9, -10], [9, 12], [-9, 12], [-9, -10]]} fill="#FBFBFD" />
            <Poly p={[[0, -26], [9, -10], [9, 12], [0, 12]]} fill="#E3E2EC" />
            <Poly p={[[-4, -4], [4, -4], [4, 4], [-4, 4]]} fill="#1FA37A" />
            <Poly p={[[-9, 2], [-16, 16], [-9, 12]]} fill="#1FA37A" />
            <Poly p={[[9, 2], [16, 16], [9, 12]]} fill="#167D5D" />
            <Poly p={[[-6, 13], [0, 30], [6, 13]]} fill="#F5A623" />
          </g>
          <Poly p={[[60, 250], [140, 248], [146, 254], [56, 256]]} fill="#1FA37A" />
          <Poly p={[[100, 249], [140, 248], [146, 254], [100, 255]]} fill="#167D5D" />
          <Poly p={[[70, 256], [78, 256], [78, 263], [70, 263]]} fill={INK} />
          <Poly p={[[126, 255], [134, 255], [134, 262], [126, 262]]} fill={INK} />
        </g>
      );
    case "LORM":
      return (
        <g>
          <Paper x={58} y={118} w={88} h={50}>
            <text x={42} y={17} textAnchor="middle" fontSize={11} fontFamily="-apple-system, Inter, sans-serif" fontWeight={700} fill={INK}>Lorem ipsum</text>
            <Poly p={[[10, 24], [76, 24], [76, 28], [10, 28]]} fill="#D9D6E3" />
            <Poly p={[[10, 32], [64, 32], [64, 36], [10, 36]]} fill="#D9D6E3" />
            <Poly p={[[10, 40], [50, 40], [50, 44], [10, 44]]} fill="#D9D6E3" />
          </Paper>
          <text x={146} y={50} fontSize={12} fontFamily="ui-monospace, Menlo, monospace" fill={INK} opacity={0.5}>z z</text>
        </g>
      );
    case "FNAL":
      return (
        <g>
          {["#E9AE1C", "#7E62E0", "#EF6A4C", "#1FA37A", "#2FB3A8", "#E9AE1C"].map((c, i) => (
            <g key={i} transform={`translate(${74 + (i % 2) * 5} ${156 - i * 10})`}>
              <Poly p={[[0, 0], [16, 0], [20, -4], [52, -4], [52, 11], [0, 11]]} fill={c} />
              <Poly p={[[30, -4], [52, -4], [52, 11], [26, 11]]} fill={tone(c, -0.18)} />
            </g>
          ))}
          <Paper x={138} y={32} w={42} h={26} rot={14}>
            <text x={20} y={16} textAnchor="middle" fontSize={7} fontFamily="ui-monospace, Menlo, monospace" fill={INK}>final_v3</text>
          </Paper>
          <Paper x={30} y={58} w={36} h={22} rot={-14}>
            <text x={17} y={14} textAnchor="middle" fontSize={6.5} fontFamily="ui-monospace, Menlo, monospace" fill={INK}>FINAL!!</text>
          </Paper>
        </g>
      );
    case "COPY":
      return (
        <g>
          <Poly p={[[80, 53], [96, 52], [95, 62], [82, 63]]} fill={INK} />
          <Poly p={[[100, 52], [116, 51], [115, 61], [101, 62]]} fill={INK} />
          <Poly p={[[95, 55], [100, 55], [100, 57], [95, 57]]} fill={INK} />
          <Poly p={[[84, 54], [90, 54], [85, 58]]} fill="#fff" opacity={0.35} />
          <g transform="translate(154 46) rotate(8)">
            <Poly p={[[-26, -28], [26, -28], [26, 26], [-26, 26]]} fill="#FBFBFD" />
            <Poly p={[[-22, -24], [-2, -24], [-2, -3], [-22, -3]]} fill="#F48FB1" />
            <Poly p={[[2, -24], [22, -24], [22, -3], [2, -3]]} fill="#7E62E0" />
            <Poly p={[[-22, 1], [-2, 1], [-2, 22], [-22, 22]]} fill="#E9AE1C" />
            <Poly p={[[2, 1], [22, 1], [22, 22], [2, 22]]} fill="#1FA37A" />
            <Poly p={[[-3, -33], [3, -33], [4, -27], [-4, -27]]} fill="#EF6A4C" />
          </g>
        </g>
      );
    case "VIBE":
      return (
        <g>
          <Poly p={[[64, 124], [136, 122], [130, 160], [70, 162]]} fill="#34313F" />
          <Poly p={[[100, 123], [136, 122], [130, 160], [100, 161]]} fill="#28252F" />
          <Poly p={[[66, 162], [134, 160], [138, 167], [62, 169]]} fill="#9C9AB2" />
          <text x={100} y={147} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, Menlo, monospace" fill="#5BE49B" fontWeight={700}>{"</>"}</text>
          <g transform="translate(150 118)">
            <Poly p={[[-9, 0], [9, 0], [8, 20], [-8, 20]]} fill="#FBFBFD" />
            <Poly p={[[2, 0], [9, 0], [8, 20], [2, 20]]} fill="#E3E2EC" />
            <polyline points="9,5 15,6 15,13 8,15" fill="none" stroke="#C9C7D6" strokeWidth={2.4} />
            <polyline points="-3,-4 0,-10 -3,-16" fill="none" stroke="#B9B6C8" strokeWidth={1.6} />
            <polyline points="3,-4 6,-10 3,-16" fill="none" stroke="#B9B6C8" strokeWidth={1.6} />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/* ---------- ghost ---------- */

export function Ghost({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <g>
      <Poly p={[[52, 248], [148, 245], [166, 256], [40, 260]]} fill="#000" opacity={0.08} />
      <Poly p={[[60, 244], [62, 96], [74, 46], [100, 26], [128, 44], [140, 94], [142, 244], [130, 234], [118, 246], [104, 234], [90, 246], [76, 234]]} fill="#F4F3F9" />
      <Poly p={[[100, 26], [128, 44], [140, 94], [142, 244], [130, 234], [118, 246], [108, 236], [112, 120]]} fill="#DCDAE8" />
      <Poly p={[[62, 96], [74, 46], [100, 26], [92, 70], [72, 140]]} fill="#FFFFFF" />
      <Poly p={[[82, 66], [92, 64], [94, 80], [84, 82]]} fill={INK} />
      <Poly p={[[104, 64], [114, 63], [115, 79], [105, 80]]} fill={INK} />
      <Poly p={[[90, 96], [106, 94], [104, 98], [92, 99]]} fill={INK} />
      <g transform="translate(138 126) rotate(-12)">
        <Poly p={[[0, 0], [20, 0], [20, 34], [0, 34]]} fill="#34313F" />
        <Poly p={[[3, 3], [17, 3], [17, 29], [3, 29]]} fill="#4E4B62" />
      </g>
      <g transform="translate(154 46)">
        <Poly p={[[-26, -14], [26, -14], [26, 12], [-6, 12], [-16, 20], [-12, 12], [-26, 12]]} fill="#fff" />
        <text x={0} y={3} textAnchor="middle" fontSize={10} fill={INK} opacity={0.7} fontWeight={600}>{lang === "zh" ? "已读" : "Read"}</text>
      </g>
      <text x={30} y={58} fontSize={10} fontFamily="ui-monospace, Menlo, monospace" fill={INK} opacity={0.45}>17:58</text>
    </g>
  );
}

