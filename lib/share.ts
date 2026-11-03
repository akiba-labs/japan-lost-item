import { ITEMS, OPERATORS, PLACES, PREFECTURES, checkLost, type Item, type LostInput, type Operator, type Place, type Prefecture } from "./lost";

export { PUBLIC_URL } from "./api";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, k: string): string | null {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  const f = Array.isArray(v) ? v[0] : v;
  return f === undefined || f === null || f === "" ? null : String(f);
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function date(p: Params, k: string): string | null {
  const v = one(p, k);
  return v && ISO.test(v) ? v : null;
}
function oneOf<T extends string>(p: Params, k: string, allowed: readonly T[], fallback: T): T {
  const v = one(p, k);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
function optNum(p: Params, k: string): number | null {
  const v = one(p, k);
  return v !== null && /^\d{1,10}$/.test(v) ? Number(v) : null;
}

export type Shared = {
  items: Item[];
  place: Place;
  operator: Operator;
  prefecture: Prefecture;
  lostDate: string | null;
  today: string | null;
  visitor: boolean;
  valueJPY: number | null;
  cashJPY: number | null;
};

const BASE: Shared = { items: ["wallet"], place: "unknown", operator: "unknown", prefecture: "unknown", lostDate: null, today: null, visitor: false, valueJPY: null, cashJPY: null };
export const EXAMPLE_SHARED: Shared = { ...BASE, items: ["wallet", "residence_card"], place: "subway", operator: "tokyo_metro", lostDate: "2026-11-01", today: "2026-11-03" };
export const EXAMPLE_TAXI: Shared = { ...BASE, items: ["phone"], place: "taxi", operator: "tokyo_taxi", lostDate: "2026-11-02", today: "2026-11-03", visitor: true };
export const EXAMPLE_UMBRELLA: Shared = { ...BASE, items: ["umbrella"], place: "train", operator: "jr_east", prefecture: "tokyo", lostDate: "2026-10-15", today: "2026-11-03" };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_TAXI, EXAMPLE_UMBRELLA];

export function parseShared(p: Params): Shared | null {
  const raw = one(p, "it");
  const items = (raw ? raw.split(",") : ["wallet"]).filter((x): x is Item => (ITEMS as readonly string[]).includes(x));
  if (!items.length) return null;
  return {
    items: [...new Set(items)].slice(0, 12),
    place: oneOf(p, "p", PLACES, "unknown"),
    operator: oneOf(p, "o", OPERATORS, "unknown"),
    prefecture: oneOf(p, "f", PREFECTURES, "unknown"),
    lostDate: date(p, "d"),
    today: date(p, "t"),
    visitor: one(p, "v") === "1",
    valueJPY: optNum(p, "x"),
    cashJPY: optNum(p, "c"),
  };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("it", s.items.join(","));
  if (s.place !== "unknown") q.set("p", s.place);
  if (s.operator !== "unknown") q.set("o", s.operator);
  if (s.prefecture !== "unknown") q.set("f", s.prefecture);
  if (s.lostDate) q.set("d", s.lostDate);
  if (s.today) q.set("t", s.today);
  if (s.visitor) q.set("v", "1");
  if (s.valueJPY !== null) q.set("x", String(s.valueJPY));
  if (s.cashJPY !== null) q.set("c", String(s.cashJPY));
  return q.toString().replace(/%2C/g, ",");
}

export function toCheckInput(s: Shared): LostInput {
  return { ...s };
}
export function safeCheck(s: Shared) {
  try {
    return checkLost(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
