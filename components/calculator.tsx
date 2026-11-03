"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { ITEMS, OPERATORS, PLACES, PREFECTURES, type Item, type Operator, type Place, type Prefecture } from "@/lib/lost";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";
import { VERDICT_LABEL, VERDICT_STYLE } from "@/lib/verdict";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

const ITEM_LABEL: Record<Item, string> = {
  wallet: "Wallet 財布", cash: "Cash 現金", phone: "Phone スマホ", passport: "Passport", residence_card: "Residence card 在留カード", mynumber_card: "My Number card",
  credit_card: "Credit / bank card", ic_card: "Suica / PASMO / ICOCA", drivers_license: "Driving licence", keys: "Keys 鍵", bag: "Bag かばん", laptop: "Laptop",
  camera: "Camera", jewelry: "Jewellery / watch", umbrella: "Umbrella 傘", clothing: "Clothing 衣類", other: "Something else",
};
const PLACE_LABEL: Record<Place, string> = {
  train: "Train / station (電車・駅)", subway: "Subway (地下鉄)", shinkansen: "Shinkansen (新幹線)", bus: "Bus (バス)", taxi: "Taxi (タクシー)", airport: "Airport (空港)",
  plane: "On a plane (機内)", shop: "Shop / restaurant / konbini (店)", hotel: "Hotel / ryokan", street: "Street / park (路上)", unknown: "Not sure (不明)",
};
const OP_LABEL: Record<Operator, string> = {
  jr_east: "JR East", jr_central: "JR Central (Tokaido Shinkansen)", jr_west: "JR West", tokyo_metro: "Tokyo Metro", toei: "Toei (Tokyo)", osaka_metro: "Osaka Metro",
  tokyo_taxi: "Tokyo taxi", narita: "Narita Airport", haneda: "Haneda Airport", kansai: "Kansai Airport", other: "Other operator", unknown: "Not sure / none",
};

export function Calculator({ initial }: { initial?: Shared }) {
  const [s, setS] = useState<Shared>(initial ?? EXAMPLE_SHARED);
  const set = <K extends keyof Shared>(k: K) => (v: Shared[K]) => setS((p) => ({ ...p, [k]: v }));
  const toggle = (i: Item) => setS((p) => {
    const has = p.items.includes(i);
    const next = has ? p.items.filter((x) => x !== i) : [...p.items, i];
    return { ...p, items: next.length ? next : p.items };
  });
  const r = safeCheck(s);
  const shareUrl = `${PUBLIC_URL}${resultPath(s)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">What did you lose? · 落とし物</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ITEMS.map((i) => (
            <button key={i} type="button" data-testid={`item-${i}`} onClick={() => toggle(i)} aria-pressed={s.items.includes(i)} className={`rounded-full border px-3 py-1 text-xs ${s.items.includes(i) ? "border-amber bg-amber/15 text-foreground" : "border-line text-muted hover:text-foreground"}`}>
              {ITEM_LABEL[i]}
            </button>
          ))}
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-medium text-foreground">Where? 場所</span>
          <select data-testid="place" className={field} value={s.place} onChange={(e) => set("place")(e.target.value as Place)}>
            {PLACES.map((p) => (
              <option key={p} value={p}>{PLACE_LABEL[p]}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="text-sm font-medium text-foreground">Operator (if any) 会社</span>
          <select data-testid="operator" className={field} value={s.operator} onChange={(e) => set("operator")(e.target.value as Operator)}>
            {OPERATORS.map((o) => (
              <option key={o} value={o}>{OP_LABEL[o]}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="text-sm font-medium text-foreground">Prefecture 都道府県</span>
          <select data-testid="prefecture" className={field} value={s.prefecture} onChange={(e) => set("prefecture")(e.target.value as Prefecture)}>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p === "unknown" ? "Not sure" : p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-foreground">Lost on 紛失日</span>
            <input data-testid="lost-date" type="date" className={field} value={s.lostDate ?? ""} onChange={(e) => setS((p) => ({ ...p, lostDate: e.target.value || null, today: null }))} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">As of (blank = today)</span>
            <input data-testid="today" type="date" className={field} value={s.today ?? ""} onChange={(e) => set("today")(e.target.value || null)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Value ¥ (optional)</span>
            <input data-testid="value" type="number" inputMode="numeric" min={0} className={field} value={s.valueJPY ?? ""} placeholder="—" onChange={(e) => set("valueJPY")(e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Cash inside ¥ (optional)</span>
            <input data-testid="cash" type="number" inputMode="numeric" min={0} className={field} value={s.cashJPY ?? ""} placeholder="—" onChange={(e) => set("cashJPY")(e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
          </label>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
          <input data-testid="visitor" type="checkbox" className="mt-1" checked={s.visitor} onChange={(e) => set("visitor")(e.target.checked)} />
          <span>I&apos;m a visitor / leaving Japan soon</span>
        </label>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {VERDICT_LABEL[r.verdict]} · lost {r.dates.lostDate} · {r.dates.daysSinceLost} days ago
              </p>
              <p className={`mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl ${VERDICT_STYLE[r.verdict]}`}>{r.summary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Safe last day to claim</p>
                  <p className="mt-1 font-mono text-xl text-foreground">{r.dates.safeLastClaimDate}</p>
                  <p className="text-xs text-muted">{Math.max(0, r.dates.daysLeft)} days left · 3-month hold</p>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">{r.residenceCard ? "New residence card by" : "To police within"}</p>
                  <p className={`mt-1 font-mono text-xl ${r.residenceCard?.overdue ? "text-rose-200" : "text-foreground"}`}>{r.residenceCard ? r.residenceCard.reissueBy : `${r.facility.toPoliceWithinDays} days`}</p>
                  <p className="text-xs text-muted">{r.residenceCard ? (r.residenceCard.overdue ? "Overdue: apply now with a reason" : `${r.residenceCard.daysLeft} days · 14-day rule`) : r.facility.kind === "none" ? "finder's 7-day rule" : "facility hand-over"}</p>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Finder&apos;s reward</p>
                  <p className="mt-1 font-mono text-xl text-foreground">{r.reward ? `¥${r.reward.minJPY.toLocaleString()}–${r.reward.maxJPY.toLocaleString()}` : "5–20%"}</p>
                  <p className="text-xs text-muted">{r.reward ? "if they ask (can waive)" : "of the value, if they ask"}</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-line p-4">
                <p className="text-sm font-semibold text-foreground">{r.facility.label}</p>
                {r.contacts.operator ? (
                  <p className="mt-1 text-sm text-muted">
                    <a className="underline underline-offset-2 hover:text-foreground" href={r.contacts.operator.url} target="_blank" rel="noopener noreferrer">{r.contacts.operator.name}</a>
                    {r.contacts.operator.phone ? ` · ${r.contacts.operator.phone}` : ""}
                    {r.contacts.operator.hours ? ` · ${r.contacts.operator.hours}` : ""}
                  </p>
                ) : null}
              </div>
              <h3 className="mt-6 text-sm font-semibold text-foreground">What to do, in order</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted" data-testid="steps">
                {r.steps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
              <h3 className="mt-6 text-sm font-semibold text-foreground">Timeline (earliest dates)</h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                {r.timeline.map((t) => (
                  <li key={t.date + t.event}>
                    <span className="mr-2 font-mono text-foreground">{t.date}</span>
                    {t.event}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                {r.links.slice(0, 4).map((l, i) => (
                  <span key={l.url + i}>
                    {i ? " · " : ""}
                    <a className="underline underline-offset-2 hover:text-foreground" href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </span>
                ))}
              </p>
              <p className="mt-3 text-xs text-muted">{r.note}</p>
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`Lost something in Japan: ${r.summary}`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Check the dates: the lost date can&apos;t be after today.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
