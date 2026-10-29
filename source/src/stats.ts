import { useCallback, useEffect, useRef, useState } from "react";
import { TYPE_ORDER, type TypeCode } from "./data";

/*
 * Play / share stats, kept in the artifact's shared store.
 * Each viewer owns one document, plays/<their id>, and only ever writes that one
 * (no shared counters, so concurrent viewers never overwrite each other).
 * Everyone who can read the store sums the collection for the totals.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type ClaudeWin = { claude?: { use: (name: string) => Promise<any> } };

export type EventKind = "start" | "finish" | "share" | "save" | "open";

interface MyDoc {
  starts: number;
  plays: number;
  shares: number;
  saves: number;
  opens: number;
  types: Partial<Record<TypeCode, number>>;
  last: TypeCode | null;
  firstAt: number;
  updatedAt: number;
}

export interface Totals {
  people: number; // viewers who finished at least once
  visitors: number; // viewers who started or opened a shared link
  starts: number;
  plays: number;
  shares: number;
  saves: number;
  opens: number;
  byType: Record<TypeCode, number>; // people whose latest result is this type
}

const empty = (): MyDoc => ({ starts: 0, plays: 0, shares: 0, saves: 0, opens: 0, types: {}, last: null, firstAt: Date.now(), updatedAt: Date.now() });

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

export function useStats() {
  const [ready, setReady] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [totals, setTotals] = useState<Totals | null>(null);
  const dbRef = useRef<any>(null);
  const idRef = useRef<string | null>(null);
  const mine = useRef<MyDoc | null>(null);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef<{ kind: EventKind; code?: TypeCode }[]>([]);
  const writable = useRef(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let alive = true;
    (async () => {
      const c = (window as unknown as ClaudeWin).claude;
      if (!c?.use) return;
      const [db, user] = await Promise.all([c.use("db"), c.use("user")]);
      if (!alive || !db) return;
      dbRef.current = db;
      try { setIsOwner(!!user?.isOwner?.()); } catch { /* ignore */ }
      let id: string | null = null;
      try { id = (await user?.id?.()) ?? null; } catch { id = null; }
      idRef.current = id;
      let w: boolean | null = null;
      try { w = await user?.can?.("data.write"); } catch { w = null; }
      writable.current = w !== false && !!id;
      setCanWrite(writable.current);

      if (id && writable.current) {
        try {
          const snap = await db.doc(`plays/${id}`).get();
          const d = snap.exists ? (snap.data() as Partial<MyDoc>) : null;
          mine.current = d
            ? { ...empty(), ...d, types: { ...(d.types ?? {}) } } as MyDoc
            : empty();
        } catch {
          mine.current = empty();
        }
      }

      unsub = db.collection("plays").limit(1000).onSnapshot(
        (qs: any) => {
          const t: Totals = { people: 0, visitors: 0, starts: 0, plays: 0, shares: 0, saves: 0, opens: 0, byType: Object.fromEntries(TYPE_ORDER.map((c) => [c, 0])) as Record<TypeCode, number> };
          for (const doc of qs.docs) {
            const d = doc.data() ?? {};
            const plays = num(d.plays);
            t.starts += num(d.starts);
            t.plays += plays;
            t.shares += num(d.shares);
            t.saves += num(d.saves);
            t.opens += num(d.opens);
            if (plays > 0) t.people += 1;
            if (plays > 0 || num(d.starts) > 0 || num(d.opens) > 0) t.visitors += 1;
            if (typeof d.last === "string" && (TYPE_ORDER as string[]).includes(d.last)) t.byType[d.last as TypeCode] += 1;
          }
          setTotals(t);
        },
        () => { /* stats are optional; the quiz works without them */ },
      );
      setReady(true);
      // flush anything tracked before the store answered
      const queued = pending.current.splice(0);
      for (const q of queued) track(q.kind, q.code);
    })();
    return () => { alive = false; unsub?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const track = useCallback((kind: EventKind, code?: TypeCode) => {
    const db = dbRef.current;
    if (!db) { pending.current.push({ kind, code }); return; }
    const id = idRef.current;
    if (!id || !writable.current || !mine.current) return;
    const d = mine.current;
    if (kind === "start") d.starts += 1;
    if (kind === "share") d.shares += 1;
    if (kind === "save") d.saves += 1;
    if (kind === "open") d.opens += 1;
    if (kind === "finish" && code) {
      d.plays += 1;
      d.types[code] = (d.types[code] ?? 0) + 1;
      d.last = code;
    }
    d.updatedAt = Date.now();
    const body = JSON.parse(JSON.stringify(d));
    // one write at a time to our own document
    chain.current = chain.current
      .then(() => db.doc(`plays/${id}`).set(body))
      .catch((e: { code?: string }) => {
        if (e?.code === "invalid_argument" || e?.code === "not_granted") { writable.current = false; setCanWrite(false); }
      });
  }, []);

  return { ready, canWrite, isOwner, totals, track };
}
