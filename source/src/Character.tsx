import type { TypeCode } from "./data";
import { TYPES } from "./data";
import { useLang } from "./i18n";
import PIXL from "./chars/PIXL.webp";
import AUTO from "./chars/AUTO.webp";
import BLCK from "./chars/BLCK.webp";
import LOGO from "./chars/LOGO.webp";
import UNDO from "./chars/UNDO.webp";
import MEGO from "./chars/MEGO.webp";
import SHIP from "./chars/SHIP.webp";
import GHST from "./chars/GHST.webp";
import LORM from "./chars/LORM.webp";
import FNAL from "./chars/FNAL.webp";
import COPY from "./chars/COPY.webp";
import VIBE from "./chars/VIBE.webp";

/* Faceted low-poly scenes from the DBTI character sheet, labels removed,
   backdrop kept. Every image is 1000×480. */
export const CHAR_SRC: Record<TypeCode, string> = { PIXL, AUTO, BLCK, LOGO, UNDO, MEGO, SHIP, GHST, LORM, FNAL, COPY, VIBE };

/** Face centre in % of the 570×480 canvas, for avatar crops. */
export const FACE: Record<TypeCode, [number, number]> = {
  PIXL: [50.4, 25.5], AUTO: [42.0, 20.1], BLCK: [37.7, 23.0], LOGO: [41.5, 23.2], UNDO: [42.1, 24.1], MEGO: [47.1, 22.4],
  SHIP: [49.5, 22.9], GHST: [43.6, 20.3], LORM: [38.8, 22.3], FNAL: [42.7, 16.5], COPY: [38.9, 16.4], VIBE: [44.7, 18.4],
};

export function Character({ code, className, title }: { code: TypeCode; className?: string; title?: string }) {
  const { t } = useLang();
  return (
    <img
      src={CHAR_SRC[code]}
      alt={title ?? `${code} · ${t(TYPES[code].name)}`}
      width={1000}
      height={480}
      draggable={false}
      className={className}
      style={{ aspectRatio: "1000 / 480" }}
    />
  );
}
