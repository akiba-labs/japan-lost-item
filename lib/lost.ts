// Japan Lost Item Check: what to do, who to contact and the deadlines after losing something in Japan.
// Educational reading of 遺失物法 (Lost Property Act, 平成18年法律第73号) arts. 4, 7, 9, 17, 28, 29, 34, 遺失物法施行令 arts. 5–6,
// 民法 240, the National Police Agency lost-property site, 入管法 19条の12 (residence card reissue within 14 days),
// the My Number card 24h suspension line and operator lost-and-found pages (Tokyo Metro, JR East / Central / West,
// Osaka Metro, Tokyo Taxi Center, Narita, Haneda, Kansai). Rules as of 2026-11-03.

export const RULES_AS_OF = "2026-11-03";

export const SOURCES = [
  "https://laws.e-gov.go.jp/law/418AC0000000073",
  "https://laws.e-gov.go.jp/law/419CO0000000021",
  "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/en/index.html",
  "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/en/lost-institution.html",
  "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/en/loss.html",
  "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/en/others.html",
  "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/todofukenishitubutu.html",
  "https://www.police.pref.kanagawa.jp/tetsuzuki/otoshimono/mesa1905.html",
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri10_00010.html",
  "https://services.digital.go.jp/mynumbercard/lost-stolen/",
  "https://www.keishicho.metro.tokyo.lg.jp/multilingual/english/finding_services/lost_and_found/lost_found.html",
  "https://www.tokyometro.jp/lang_en/support/lost/index.html",
] as const;

export const DISCLAIMER =
  "Educational guide built from public rules, not legal advice and not an official service. Not affiliated with the National Police Agency, any prefectural police, the Immigration Services Agency, the Digital Agency, any railway, airport or taxi company, or any government body. It cannot search for or find your item; dates are estimates from the legal periods, and the real ones run from the day the item was handed in. Rules as of 2026-11-03.";

export const ITEMS = [
  "wallet", "cash", "phone", "passport", "residence_card", "mynumber_card", "credit_card", "ic_card", "drivers_license",
  "keys", "bag", "laptop", "camera", "jewelry", "umbrella", "clothing", "other",
] as const;
export const PLACES = ["train", "subway", "shinkansen", "bus", "taxi", "airport", "plane", "shop", "hotel", "street", "unknown"] as const;
export const OPERATORS = ["jr_east", "jr_central", "jr_west", "tokyo_metro", "toei", "osaka_metro", "tokyo_taxi", "narita", "haneda", "kansai", "other", "unknown"] as const;
export const PREFECTURES = [
  "hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima", "ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa",
  "niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu", "shizuoka", "aichi", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara",
  "wakayama", "tottori", "shimane", "okayama", "hiroshima", "yamaguchi", "tokushima", "kagawa", "ehime", "kochi", "fukuoka", "saga", "nagasaki",
  "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa", "unknown",
] as const;

export type Item = (typeof ITEMS)[number];
export type Place = (typeof PLACES)[number];
export type Operator = (typeof OPERATORS)[number];
export type Prefecture = (typeof PREFECTURES)[number];
export type Verdict = "act_now" | "in_window" | "window_closing" | "likely_gone";
export type FacilityKind = "special_facility" | "facility" | "none";

export class RuleInputError extends Error {}

export const RULES = {
  policeHoldMonths: 3,
  shortHoldDays: 14,
  shortHoldItems: ["umbrella", "clothing"] as Item[],
  facilityToPoliceDays: 7,
  specialFacilityToPoliceDays: 14,
  highValueYen: 100_000,
  highValueToPoliceDays: 7,
  finderHandInDays: 7,
  finderHandInHoursInFacility: 24,
  rewardMinPct: 5,
  rewardMaxPct: 20,
  rewardFacilitySplitPct: [2.5, 10],
  rewardClaimMonthsAfterReturn: 1,
  finderPickupMonths: 2,
  residenceCardReissueDays: 14,
  mynumberSuspendPhone: "0120-95-0178",
  immigrationInfoPhone: "0570-013904",
  policeEmergency: "110",
  policeConsultation: "#9110",
  specialFacilityOperators: "railways (passenger), licensed route buses, scheduled ferries and scheduled airlines by law (遺失物法施行令 5条1–4号); department stores, amusement parks etc. only if designated by the prefectural public safety commission",
  personalInfoItemsNeverGoToFinder: ["phone", "passport", "residence_card", "mynumber_card", "credit_card", "ic_card", "drivers_license"] as Item[],
} as const;

const NPA_SEARCH = "https://lostproperty.pcf.npa.go.jp/ZDSERVFP/SZDSA0101";
const TOKYO_SEARCH = "https://www.keishicho.metro.tokyo.lg.jp/multilingual/english/finding_services/lost_and_found/lost_found.html";
const OSAKA_SEARCH = "https://www.police.pref.osaka.lg.jp/foreign_languag_selection/english/index.html";

type Contact = { name: string; url: string; phone?: string; hours?: string; note: string };
const OPERATOR_CONTACTS: Record<Exclude<Operator, "other" | "unknown">, Contact> = {
  jr_east: { name: "JR East Infoline (English, Chinese, Korean)", url: "https://www.jreast.co.jp/en/multi/customer_support/infoline.html", phone: "050-2016-1603", hours: "10:00–18:00 daily (not over New Year)", note: "Handles lost and found for JR East lines; same day, ask staff at the nearest station." },
  jr_central: { name: "JR Central Lost & Found (Tokaido Shinkansen, JR Central lines)", url: "https://global.jr-central.co.jp/en/lost-and-found/", phone: "050-3772-3910", note: "Use the online form or phone. Items go to its Lost & Found Center and can't be claimed 3 months after they were handed in." },
  jr_west: { name: "JR West lost-and-found chat (English, Chinese, Korean)", url: "https://faq-support.westjr.co.jp/hc/en-us/articles/38628451472409-What-are-the-points-to-note-when-using-the-lost-and-found-chat-service", hours: "9:00–20:00", note: "Machine-translated chat; for Sanyo Shinkansen and JR West lines." },
  tokyo_metro: { name: "Tokyo Metro Customer Relations Center", url: "https://www.tokyometro.jp/lang_en/support/lost/index.html", phone: "0570-033-777", hours: "9:00–17:00", note: "Same day: the station office. Next day to 4 days later: Lost and Found Center at Iidabashi Station (Namboku Line, outside the gates, 9:00–20:00). After about 5 days: sent to the Tokyo Metropolitan Police Lost and Found Center. Perishables kept 1 day." },
  toei: { name: "Toei Transportation lost and found", url: "https://www.kotsu.metro.tokyo.jp/eng/tips/found.html", note: "Toei Subway, Toden, Nippori-Toneri Liner and Toei Bus." },
  osaka_metro: { name: "Osaka Metro / City Bus Customer Center (English)", url: "https://subway.osakametro.co.jp/en/lostfounditems_tel.php", phone: "050-3355-8208", hours: "8:00–20:00", note: "Through-service lines (Kita-Osaka Kyuko, Hankyu, Kintetsu) have their own lost-and-found numbers on this page." },
  tokyo_taxi: { name: "Tokyo Taxi Center lost and found", url: "https://www.tokyo-tc.or.jp/en/lostandfound/", note: "Call the taxi company on your receipt first. If you don't know it, report to the police; the page lists the radio groups' lost-and-found lines." },
  narita: { name: "Narita Airport lost and found", url: "https://www.narita-airport.jp/en/service/information/lostandfound/", phone: "0476-34-8000", note: "Chat inquiry on the page. Items left on a plane: contact the airline." },
  haneda: { name: "Haneda Airport lost and found", url: "https://tokyo-haneda.com/en/lost/index.html", phone: "03-5757-8111", hours: "9:00–20:00", note: "Inquiry chat on the page. Items left on a plane: contact the airline." },
  kansai: { name: "Kansai Airport lost property form", url: "https://www.kansai-airport.or.jp/en/contact/lost-notes", note: "Online form; who holds the item depends on where in the airport it was lost. Items left on a plane: contact the airline." },
};

const DEFAULT_OPERATOR: Partial<Record<Place, Operator>> = { shinkansen: "jr_central", taxi: "tokyo_taxi" };

const LABEL: Record<Item, string> = {
  wallet: "wallet", cash: "cash", phone: "phone", passport: "passport", residence_card: "residence card (在留カード)", mynumber_card: "My Number card",
  credit_card: "credit / cash card", ic_card: "Suica / PASMO / ICOCA card", drivers_license: "driving licence", keys: "keys", bag: "bag", laptop: "laptop",
  camera: "camera", jewelry: "jewellery", umbrella: "umbrella", clothing: "clothing", other: "item",
};

export type LostInput = {
  items?: Item[];
  place?: Place;
  operator?: Operator;
  prefecture?: Prefecture;
  lostDate?: string | null;
  today?: string | null;
  noticedDate?: string | null;
  visitor?: boolean;
  departureDate?: string | null;
  valueJPY?: number | null;
  cashJPY?: number | null;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
function parseDate(v: string, name: string): Date {
  if (!ISO.test(v)) throw new RuleInputError(`${name} must be a date YYYY-MM-DD, e.g. 2026-11-01`);
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) throw new RuleInputError(`${name} "${v}" is not a real date`);
  return d;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}
function addMonths(d: Date, n: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}
const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);
export function todayJST(): string {
  return new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
}

function facilityKind(place: Place): FacilityKind {
  if (["train", "subway", "shinkansen", "bus", "airport", "plane"].includes(place)) return "special_facility";
  if (["taxi", "shop", "hotel"].includes(place)) return "facility";
  return "none";
}

function policeSearch(pref: Prefecture): { label: string; url: string } {
  if (pref === "tokyo") return { label: "Tokyo Metropolitan Police lost and found search (Keishicho)", url: TOKYO_SEARCH };
  if (pref === "osaka") return { label: "Osaka Prefectural Police lost property search", url: OSAKA_SEARCH };
  return { label: pref === "unknown" ? "Police lost property search (45 prefectures share the NPA system; Tokyo and Osaka run their own)" : `Police lost property search for ${pref[0].toUpperCase()}${pref.slice(1)} (NPA shared system)`, url: NPA_SEARCH };
}

export function checkLost(input: LostInput) {
  const items: Item[] = input.items && input.items.length ? [...new Set(input.items)] : ["other"];
  if (items.length > 12) throw new RuleInputError("List at most 12 items.");
  const place: Place = input.place ?? "unknown";
  const operator: Operator = input.operator && input.operator !== "unknown" ? input.operator : (DEFAULT_OPERATOR[place] ?? "unknown");
  const prefecture: Prefecture = input.prefecture ?? (operator === "tokyo_metro" || operator === "toei" || operator === "tokyo_taxi" || operator === "haneda" ? "tokyo" : operator === "osaka_metro" ? "osaka" : "unknown");
  const todayS = input.today ?? todayJST();
  const today = parseDate(todayS, "today");
  const lostS = input.lostDate ?? todayS;
  const lost = parseDate(lostS, "lostDate");
  if (lost > today) throw new RuleInputError("lostDate can't be after today.");
  if (diffDays(today, lost) > 3650) throw new RuleInputError("lostDate must be within the last 10 years.");
  const noticed = input.noticedDate ? parseDate(input.noticedDate, "noticedDate") : lost;
  if (noticed < lost) throw new RuleInputError("noticedDate can't be before lostDate.");
  if (noticed > today) throw new RuleInputError("noticedDate can't be after today.");
  const departure = input.departureDate ? parseDate(input.departureDate, "departureDate") : null;
  for (const [k, v] of [["valueJPY", input.valueJPY], ["cashJPY", input.cashJPY]] as const) {
    if (v !== undefined && v !== null && (!Number.isFinite(v) || v < 0 || v > 1e10)) throw new RuleInputError(`${k} must be a yen amount from 0 to 10,000,000,000`);
  }
  const visitor = input.visitor ?? false;

  const kind = facilityKind(place);
  const cash = input.cashJPY ?? (items.includes("cash") || items.includes("wallet") ? null : 0);
  const value = input.valueJPY ?? null;
  const highValue = (cash ?? 0) >= RULES.highValueYen || (items.includes("jewelry") && (value ?? 0) >= RULES.highValueYen);
  const daysSinceLost = diffDays(today, lost);

  // Timeline. Real periods run from the hand-in / notice date, which is on or after the loss date,
  // so these are the earliest dates each step can happen: safe to plan against.
  const toPoliceDays = kind === "special_facility" ? (highValue ? RULES.highValueToPoliceDays : RULES.specialFacilityToPoliceDays) : RULES.facilityToPoliceDays;
  const holdEnds = addMonths(lost, RULES.policeHoldMonths);
  const holdEndsLatestTypical = addMonths(addDays(lost, kind === "special_facility" ? RULES.specialFacilityToPoliceDays : kind === "facility" ? RULES.facilityToPoliceDays : RULES.finderHandInDays), RULES.policeHoldMonths);
  const shortHold = items.some((i) => RULES.shortHoldItems.includes(i));
  const shortHoldFrom = shortHold ? addDays(lost, RULES.shortHoldDays) : null;
  const daysLeft = diffDays(holdEnds, today);

  const timeline: { date: string; event: string }[] = [{ date: iso(lost), event: "Lost. Ask the place you lost it today: items often stay at the station, shop or desk for the first day or so." }];
  if (kind === "special_facility") {
    timeline.push({ date: iso(addDays(lost, toPoliceDays)), event: highValue ? "By about now a railway / bus / airline / airport must hand items worth ¥100,000+ (cash, securities, jewellery) to the police (1 week)." : "By about now the railway / bus / airline / airport has either handed the item to the police or told the police it is keeping it itself (2 weeks, 特例施設占有者). Either way the police search lists it." });
  } else if (kind === "facility") {
    timeline.push({ date: iso(addDays(lost, toPoliceDays)), event: "By about now the shop, hotel or taxi company must hand the item to the police (1 week)." });
  } else {
    timeline.push({ date: iso(addDays(lost, RULES.finderHandInDays)), event: "A finder who keeps their reward rights must hand it to a police box (交番) within 7 days." });
  }
  if (shortHoldFrom) timeline.push({ date: iso(shortHoldFrom), event: "From about now umbrellas and clothing can be sold or thrown away if unclaimed (2 weeks after the public notice)." });
  timeline.push({ date: iso(holdEnds), event: "Safe last day to claim: found items are kept 3 months from the day they're handed in. If handed in later than the day you lost it, this moves later, never earlier." });
  timeline.push({ date: iso(holdEndsLatestTypical), event: "After about now, assume it's gone: it goes to the finder (2-month pickup window) or, for phones, cards and IDs, is destroyed." });

  // Steps.
  const steps: string[] = [];
  const op = operator !== "unknown" && operator !== "other" ? OPERATOR_CONTACTS[operator] : null;
  const has = (i: Item) => items.includes(i);
  if (has("credit_card") || has("wallet")) steps.push("Call your card issuers now to stop credit and cash cards (the number is on their website or the back of a card photo). The NPA says do this first.");
  if (has("phone")) steps.push("Lock or locate the phone (Find My / Find My Device) and call your carrier to suspend the SIM. Station staff may switch a found phone on to identify it.");
  if (has("mynumber_card")) steps.push(`My Number card: call ${RULES.mynumberSuspendPhone} (24 h, every day) to suspend it, then reissue at your city office with the police acceptance number.`);
  if (op) steps.push(`Contact ${op.name}${op.phone ? ` (${op.phone}${op.hours ? `, ${op.hours}` : ""})` : ""}: ${op.note}`);
  else if (place === "train" || place === "subway" || place === "shinkansen") steps.push("Ask staff at the nearest station or the operator's lost-and-found line the same day; give the line, direction, car number and time.");
  else if (place === "bus") steps.push("Call the bus company's office for that route; route buses keep found items like railways do.");
  else if (place === "taxi") steps.push("Call the taxi company on your receipt (or the app you used). If you have no receipt, the police route below still works.");
  else if (place === "shop" || place === "hotel") steps.push("Ask the shop or hotel first: they must keep it and pass it to the police within 1 week.");
  else if (place === "plane") steps.push("Contact the airline's lost-and-found (left on board) and the airport's lost-and-found (left in the terminal).");
  if (["train", "subway", "shinkansen"].includes(place)) steps.push("Many lines run through onto other companies' tracks (e.g. Tokyo Metro, Toei, Osaka Metro): ask the connecting operator too. Items can turn up at the last stop.");
  steps.push("File a lost property report (遺失届) at any police box (交番) or station, or online in many prefectures. Give the time, place, colour, brand, contents and any name or number on it. Keep the acceptance number (受理番号): insurance and reissues ask for it.");
  const ps = policeSearch(prefecture);
  steps.push(`Search found items online: ${ps.label} ${ps.url}. Items found in transit may be with the police near the final station.`);
  if (has("residence_card")) {
    const abroad = departure && noticed > departure;
    steps.push(`Residence card: after the police report, apply for a new card at the regional immigration office for your address within 14 days of noticing the loss${abroad ? " (or of your first re-entry, if you noticed abroad)" : ""}. Bring your passport, a photo and the 陳述書 with the police acceptance number. Usually issued the same day. Info centre ${RULES.immigrationInfoPhone}.`);
  }
  if (has("passport")) steps.push("Passport: report it to the police, then contact your embassy or consulate in Japan for a new passport or emergency travel document (Japanese nationals: the prefectural passport office). Do this before booking a flight home.");
  if (has("drivers_license")) steps.push("Japanese driving licence: reissue at a licence centre or police station that handles licences; bring ID and the police acceptance number. Foreign licences / IDPs: ask the issuing country.");
  if (has("ic_card")) steps.push("Suica / PASMO / ICOCA: only registered (personalised) cards can be stopped and reissued; ask at a ticket office with ID. Unregistered cards can't be blocked.");
  if (has("cash") || has("wallet")) steps.push("Cash is matched by amount, notes and wallet description: write down roughly how much and what else was inside.");
  if (visitor) steps.push("Leaving Japan soon: on the report, give an email and phone number that work abroad and, if you can, a person in Japan who can collect for you (with a letter of proxy). Shipping abroad is at your cost. You can't file a Japanese report for something lost outside Japan.");
  if (has("umbrella") || has("clothing")) steps.push("Umbrellas and clothing are only kept about 2 weeks after notice before they may be disposed of: check quickly.");

  // Residence card deadline.
  let residenceCard: { reissueBy: string; daysLeft: number; overdue: boolean; note: string } | null = null;
  if (has("residence_card")) {
    const base = departure && noticed > departure ? null : noticed;
    const by = base ? addDays(base, RULES.residenceCardReissueDays) : null;
    if (by) {
      const left = diffDays(by, today);
      residenceCard = { reissueBy: iso(by), daysLeft: left, overdue: left < 0, note: left < 0 ? "Past 14 days: still apply now and attach a written reason for the delay (入管 reference form)." : "Within 14 days of noticing (入管法 19条の12). No fee is listed on the ISA page." };
    } else {
      residenceCard = { reissueBy: "14 days after your first re-entry to Japan", daysLeft: RULES.residenceCardReissueDays, overdue: false, note: "Noticed while abroad: the 14 days run from the day you next enter Japan." };
    }
  }

  // Reward (owner pays if the finder asks).
  let reward: { minJPY: number; maxJPY: number; basisJPY: number; split: string; claimWindow: string } | null = null;
  const basis = (value ?? 0) + (input.cashJPY ?? 0);
  if (basis > 0) {
    reward = {
      basisJPY: basis,
      minJPY: Math.round((basis * RULES.rewardMinPct) / 100),
      maxJPY: Math.round((basis * RULES.rewardMaxPct) / 100),
      split: kind === "none" ? "All to the finder." : "Found inside a facility: split between the finder and the facility (2.5–10% of the value each). The national government and local governments (e.g. city offices) can't claim a reward.",
      claimWindow: "The finder can only ask within 1 month after you get the item back. They can also waive it.",
    };
  }

  // Verdict.
  const urgentItems = items.some((i) => ["wallet", "phone", "passport", "residence_card", "mynumber_card", "credit_card", "cash"].includes(i));
  let verdict: Verdict;
  if (diffDays(today, holdEndsLatestTypical) > 0) verdict = "likely_gone";
  else if (daysLeft <= 14 || (shortHoldFrom && today >= shortHoldFrom && items.every((i) => RULES.shortHoldItems.includes(i)))) verdict = "window_closing";
  else if (urgentItems || daysSinceLost <= 2 || (residenceCard && residenceCard.daysLeft <= 7)) verdict = "act_now";
  else verdict = "in_window";

  const what = items.map((i) => LABEL[i]).join(", ");
  const summary =
    verdict === "likely_gone"
      ? `Your ${what} was lost ${daysSinceLost} days ago, past the 3-month holding period. It has most likely gone to the finder or been disposed of. Check the police search once, then plan replacements.`
      : verdict === "window_closing"
        ? `Your ${what}: claim window closing. Safe last day ${iso(holdEnds)} (${Math.max(daysLeft, 0)} days)${shortHoldFrom && today >= shortHoldFrom ? "; umbrellas and clothing may already be disposed of" : ""}. Search the police list and call today.`
        : verdict === "act_now"
          ? `Your ${what}: act now. ${has("credit_card") || has("wallet") || has("phone") || has("mynumber_card") ? "Stop cards and phone first, then " : ""}${op ? `contact ${op.name.split(" (")[0]}` : "ask where you lost it"} and file a police report. Kept until at least ${iso(holdEnds)}.${residenceCard && typeof residenceCard.daysLeft === "number" && residenceCard.reissueBy.match(ISO) ? ` New residence card by ${residenceCard.reissueBy}.` : ""}`
          : `Your ${what}: still in the 3-month window (safe last day ${iso(holdEnds)}, ${daysLeft} days). File a police report and check the online search.`;

  const links: { label: string; url: string }[] = [];
  if (op) links.push({ label: op.name, url: op.url });
  links.push(ps);
  links.push({ label: "NPA: lost something? (English)", url: "https://www.npa.go.jp/bureau/soumu/ishitsubutsu/otoshimono/en/index.html" });
  if (has("residence_card")) links.push({ label: "ISA: residence card reissue after loss", url: "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri10_00010.html" });
  if (has("mynumber_card")) links.push({ label: "Digital Agency: My Number card lost or stolen", url: "https://services.digital.go.jp/mynumbercard/lost-stolen/" });

  return {
    verdict,
    summary,
    items,
    place,
    operator,
    prefecture,
    facility: {
      kind,
      label: kind === "special_facility" ? "Public transport / airport (特例施設占有者): may keep the item itself for the 3 months after telling the police" : kind === "facility" ? "Shop, hotel or taxi (施設占有者): must pass the item to the police within 1 week" : "Street or unknown: a finder takes it to a police box (交番)",
      toPoliceWithinDays: toPoliceDays,
      highValue,
    },
    dates: {
      today: iso(today),
      lostDate: iso(lost),
      daysSinceLost,
      safeLastClaimDate: iso(holdEnds),
      daysLeft,
      likelyGoneAfter: iso(holdEndsLatestTypical),
      shortHoldDisposalFrom: shortHoldFrom ? iso(shortHoldFrom) : null,
    },
    timeline,
    steps,
    residenceCard,
    reward,
    visitor,
    contacts: { police: { emergency: RULES.policeEmergency, consultation: RULES.policeConsultation }, operator: op, policeSearch: ps },
    links,
    note: "A lost property report only lets the police match it when someone hands it in; they don't go and search. It doesn't prove the loss. Items with personal information (phones, cards, IDs) never go to the finder.",
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
    disclaimer: DISCLAIMER,
  };
}

export type LostResult = ReturnType<typeof checkLost>;
