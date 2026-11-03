import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { EXAMPLE_GET } from "@/lib/api";
import { SOURCES } from "@/lib/lost";
import { EXAMPLE_SHARED, EXAMPLE_TAXI, EXAMPLE_UMBRELLA, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "Lost something in Japan? Who to contact, what to stop first and how long it's kept (free Japan lost item check)";
const description =
  "Free checker for lost items in Japan: wallet, phone, passport, residence card (在留カード), bag or umbrella lost on a train, subway, Shinkansen, taxi, at an airport, shop or on the street. Get the right lost-and-found contact (Tokyo Metro, JR, taxi, airport, police search), what to stop first, the 3-month holding period under 遺失物法, the finder's reward and the residence card 14-day reissue deadline. Free JSON API for AI agents. Educational, not official.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan Lost Item Check",
  alternateName: ["落とし物 どうする 日本", "忘れ物 電車 問い合わせ", "在留カード 紛失 再交付 期限", "遺失物 保管期間 3か月", "Japan lost and found checker"],
  url: PUBLIC_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free guide to what to do after losing something in Japan, with a keyless JSON API. Not affiliated with the police, the National Police Agency, immigration or any railway. Not legal advice.",
};

const faq: FaqItem[] = [
  {
    q: "I lost my wallet / phone in Japan. What should I do first?",
    a: `1) Stop credit and cash cards and lock the phone (the National Police Agency says do this first). 2) Ask the place you lost it the same day: station staff, the shop, hotel desk or taxi company. 3) File a lost property report (遺失届) at any police box (交番) and keep the acceptance number. 4) Search the police found-items lists online. This free checker puts those steps in order for your item and place, with the right contacts and dates. AI agents can call ${PUBLIC_URL}/api/check.`,
  },
  {
    q: "How long do the police keep lost items in Japan?",
    a: "3 months from the day the item is handed in. After that it goes to the finder (who has 2 months to collect it) or to the prefecture; items with personal information (phones, cards, IDs) never go to the finder. Umbrellas, clothing and similar items can be sold or thrown away if nobody claims them within 2 weeks of the police notice.",
  },
  {
    q: "I left something on a train or subway. Where does it go?",
    a: "First the station, usually for the day. Railways, route buses, airlines and airports are 'special facility operators' (特例施設占有者) under the Lost Property Act: they can keep items themselves if they tell the police within 2 weeks, or hand them over (items worth ¥100,000 or more within 1 week). Tokyo Metro, for example, keeps items at the station on the day, at the Iidabashi Lost and Found Center from the next day to 4 days later, then sends them to the Tokyo Metropolitan Police Lost and Found Center. Many lines run through onto other companies' tracks, so ask the connecting operator too.",
  },
  {
    q: "I lost something in a taxi, shop or hotel.",
    a: "Call the taxi company on your receipt, or ask the shop or hotel. They must keep it and pass it to the police within 1 week. In Tokyo, the Tokyo Taxi Center lists the radio groups' lost-and-found lines if you don't know the company.",
  },
  {
    q: "I lost my residence card (在留カード). What's the deadline?",
    a: "Report it to the police first and get the acceptance number. Then apply for a new card at the regional immigration office for your address within 14 days of noticing the loss (入管法 19条の12), or within 14 days of re-entering Japan if you noticed abroad. Bring your passport, a photo and the 陳述書 with the police number. It is usually issued the same day. If you're late, apply anyway with a written reason.",
  },
  {
    q: "Do I have to pay the finder a reward?",
    a: "If the finder asks, the owner pays 5–20% of the item's value (for cash, of the amount). If it was found inside a shop, station or other facility, the reward is split between the finder and the facility, 2.5–10% each. The finder can waive it, and can only ask within 1 month after you get the item back.",
  },
  {
    q: "I'm a tourist and leaving Japan. Can I still get it back?",
    a: "Yes, often. File the report before you leave, giving an email and phone number that work abroad and, if possible, someone in Japan who can collect for you with a letter of proxy. Shipping abroad is at your cost. You can't file a Japanese report for something you lost outside Japan.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}${EXAMPLE_GET} (keyless, CORS open), rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_lost_item_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "落とし物をしたら、まず何をすればいいですか？",
    a: "クレジットカードやキャッシュカード、スマホの利用停止を先に行い、落とした場所（駅、店、ホテル、タクシー会社）に当日中に問い合わせます。そのうえで最寄りの交番・警察署に遺失届を出し、受理番号を控えてください。拾得物は届出日から3か月間保管されます（傘や衣類は公告から2週間で売却・廃棄されることがあります）。都道府県警察のサイトで拾得物を検索できます。",
  },
  {
    q: "在留カードをなくしたら、いつまでに再交付申請が必要ですか？",
    a: "紛失に気づいた日から14日以内（海外で気づいた場合は再入国した日から14日以内）に、住居地を管轄する地方出入国在留管理官署で再交付申請をします。先に警察へ遺失届を出し、受理番号を陳述書に記入します。パスポートと写真が必要で、原則として即日交付です。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 落とし物 · 忘れ物 · 遺失物法</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Lost something in Japan?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          Japan returns a lot of lost property, but only if you ask the right place in time. Found items are kept <strong>3 months</strong> (umbrellas and clothing can go after <strong>2 weeks</strong>). Shops pass them to the police within <strong>1 week</strong>, railways and airports within <strong>2 weeks</strong> or keep them themselves. A lost <strong>residence card</strong> must be replaced within <strong>14 days</strong>. Pick what you lost and where to get your steps, contacts and dates.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            wallet and residence card on Tokyo Metro
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_TAXI)}>
            tourist&apos;s phone in a Tokyo taxi
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_UMBRELLA)}>
            umbrella on a JR train 19 days ago
          </a>
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-5xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The rules in one table</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Where it was lost</th>
                <th className="px-4 py-3 font-medium">Who holds it</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Street, park (路上)</td><td className="px-4 py-3">Finder → police box (交番)</td><td className="px-4 py-3">Finder must hand in within 7 days to keep reward rights</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Shop, hotel, taxi (施設)</td><td className="px-4 py-3">The business, then police</td><td className="px-4 py-3">To police within 1 week (finder → staff within 24 h)</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Train, subway, bus, airport, plane (特例施設)</td><td className="px-4 py-3">The operator may keep it itself</td><td className="px-4 py-3">Reports to police within 2 weeks; ¥100,000+ items to police within 1 week</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Anywhere</td><td className="px-4 py-3">Police or operator</td><td className="px-4 py-3">Kept 3 months from hand-in; umbrellas, clothing: may go 2 weeks after notice</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Residence card (在留カード)</td><td className="px-4 py-3">You → police → immigration</td><td className="px-4 py-3">New card within 14 days of noticing</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">My Number card</td><td className="px-4 py-3">You → 0120-95-0178 (24 h)</td><td className="px-4 py-3">Suspend now; reissue at the city office</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          Sources:{" "}
          {SOURCES.slice(0, 10).map((s, i) => (
            <span key={s}>
              {i ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace("https://", "").replace("www.", "").slice(0, 60)}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="mt-12 max-w-3xl rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
        <p className="mt-2 text-sm text-muted">
          Keyless JSON, CORS open, GET or POST:{" "}
          <a className="font-mono text-foreground underline underline-offset-2 break-all" href={EXAMPLE_GET}>
            {EXAMPLE_GET}
          </a>
          . Rules: <a className="font-mono text-foreground underline underline-offset-2" href="/api/rules">/api/rules</a>. Docs: <a className="underline underline-offset-2" href="/openapi.json">OpenAPI</a>,{" "}
          <a className="underline underline-offset-2" href="/llms.txt">llms.txt</a>, MCP tool <span className="font-mono text-foreground">japan_lost_item_check</span> on{" "}
          <a className="underline underline-offset-2" href="https://free-agent-tools.vercel.app" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="Lost item questions" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
