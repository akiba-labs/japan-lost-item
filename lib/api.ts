import { InputError, type Endpoint, type Input } from "./agent-api";
import { DISCLAIMER, ITEMS, OPERATORS, PLACES, PREFECTURES, RULES_AS_OF, RuleInputError, checkLost, type Item, type Operator, type Place, type Prefecture } from "./lost";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-lost-item.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?items=wallet,residence_card&place=subway&operator=tokyo_metro&lostDate=2026-11-01&today=2026-11-03";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function tb(v: unknown, name: string): boolean | undefined {
  const f = first(v);
  if (typeof f === "boolean") return f;
  if (f === undefined || f === null || String(f).trim() === "") return undefined;
  const t = String(f).trim();
  if (/^(1|true|yes|y|on|はい)$/i.test(t)) return true;
  if (/^(0|false|no|n|off|いいえ)$/i.test(t)) return false;
  throw new InputError(`${name} must be true or false`);
}
function n(v: unknown, name: string): number | undefined {
  const f = s(v);
  if (f === null) return undefined;
  const x = Number(f.normalize("NFKC").replace(/[,¥円\s]/g, ""));
  if (!Number.isFinite(x)) throw new InputError(`${name} must be a number (yen)`);
  return x;
}

const ITEM_ALIASES: Record<string, Item> = {
  purse: "wallet", 財布: "wallet", money: "cash", 現金: "cash", smartphone: "phone", mobile: "phone", iphone: "phone", android: "phone", cellphone: "phone", スマホ: "phone", 携帯: "phone", 携帯電話: "phone",
  パスポート: "passport", 旅券: "passport", zairyu_card: "residence_card", zairyu: "residence_card", residence: "residence_card", 在留カード: "residence_card",
  my_number: "mynumber_card", mynumber: "mynumber_card", my_number_card: "mynumber_card", マイナンバーカード: "mynumber_card", マイナカード: "mynumber_card",
  card: "credit_card", credit: "credit_card", debit_card: "credit_card", cash_card: "credit_card", bank_card: "credit_card", クレジットカード: "credit_card", キャッシュカード: "credit_card",
  suica: "ic_card", pasmo: "ic_card", icoca: "ic_card", transit_card: "ic_card", 交通系icカード: "ic_card",
  license: "drivers_license", licence: "drivers_license", driving_licence: "drivers_license", driver_license: "drivers_license", 免許証: "drivers_license", 運転免許証: "drivers_license",
  key: "keys", 鍵: "keys", backpack: "bag", suitcase: "bag", luggage: "bag", かばん: "bag", 鞄: "bag", バッグ: "bag", pc: "laptop", computer: "laptop", パソコン: "laptop",
  カメラ: "camera", ring: "jewelry", watch: "jewelry", jewellery: "jewelry", 指輪: "jewelry", 時計: "jewelry", 傘: "umbrella", coat: "clothing", jacket: "clothing", clothes: "clothing", 服: "clothing", 衣類: "clothing",
};
const PLACE_ALIASES: Record<string, Place> = {
  jr: "train", railway: "train", rail: "train", station: "train", 電車: "train", 駅: "train", metro: "subway", 地下鉄: "subway", 新幹線: "shinkansen", bullet_train: "shinkansen",
  バス: "bus", cab: "taxi", タクシー: "taxi", 空港: "airport", flight: "plane", airplane: "plane", aircraft: "plane", 飛行機: "plane",
  store: "shop", restaurant: "shop", cafe: "shop", department_store: "shop", konbini: "shop", 店: "shop", コンビニ: "shop", ホテル: "hotel", ryokan: "hotel", 旅館: "hotel",
  road: "street", outside: "street", park: "street", 路上: "street", 道: "street", "?": "unknown", dont_know: "unknown", 不明: "unknown",
};
const OPERATOR_ALIASES: Record<string, Operator> = {
  jreast: "jr_east", jr東日本: "jr_east", jrcentral: "jr_central", jr東海: "jr_central", tokaido_shinkansen: "jr_central", jrwest: "jr_west", jr西日本: "jr_west",
  metro: "tokyo_metro", tokyometro: "tokyo_metro", 東京メトロ: "tokyo_metro", 都営: "toei", toei_subway: "toei", osakametro: "osaka_metro", 大阪メトロ: "osaka_metro",
  taxi: "tokyo_taxi", nrt: "narita", 成田: "narita", hnd: "haneda", 羽田: "haneda", kix: "kansai", 関空: "kansai", kansai_airport: "kansai",
};
const PREF_ALIASES: Record<string, Prefecture> = { 東京: "tokyo", 東京都: "tokyo", 大阪: "osaka", 大阪府: "osaka", 京都: "kyoto", 京都府: "kyoto", 北海道: "hokkaido", 神奈川: "kanagawa", 神奈川県: "kanagawa", 千葉: "chiba", 千葉県: "chiba", 愛知: "aichi", 福岡: "fukuoka", 沖縄: "okinawa", 兵庫: "hyogo", 埼玉: "saitama" };

function norm(raw: string): string {
  return raw.normalize("NFKC").toLowerCase().replace(/[\s-]+/g, "_").replace(/'/g, "");
}
function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string): T | undefined {
  if (!raw) return undefined;
  const k = norm(raw);
  const v = (aliases[k] ?? aliases[raw] ?? k) as T;
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}
function items(v: unknown): Item[] | undefined {
  const arr = Array.isArray(v) ? v : v === undefined || v === null ? [] : [v];
  const parts = arr.flatMap((x) => String(x).split(/[,、，|]/)).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return undefined;
  return parts.map((p) => pick(p, ITEMS, ITEM_ALIASES, "item")!);
}

export function computeCheck(input: Input) {
  try {
    return checkLost({
      items: items(input.items ?? input.item ?? input.what ?? input.落とし物),
      place: pick(s(input.place ?? input.where ?? input.location ?? input.場所), PLACES, PLACE_ALIASES, "place"),
      operator: pick(s(input.operator ?? input.company ?? input.line), OPERATORS, OPERATOR_ALIASES, "operator"),
      prefecture: pick(s(input.prefecture ?? input.pref ?? input.都道府県), PREFECTURES, PREF_ALIASES, "prefecture"),
      lostDate: s(input.lostDate ?? input.date ?? input.lost ?? input.紛失日),
      today: s(input.today ?? input.asOf),
      noticedDate: s(input.noticedDate ?? input.noticed),
      visitor: tb(input.visitor ?? input.tourist ?? input.leavingJapan, "visitor"),
      departureDate: s(input.departureDate ?? input.departure ?? input.flightDate),
      valueJPY: n(input.valueJPY ?? input.value ?? input.価格, "valueJPY") ?? null,
      cashJPY: n(input.cashJPY ?? input.cashAmount ?? input.現金額, "cashJPY") ?? null,
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanLostItemCheck",
    summary: "Lost something in Japan? Who to contact, what to stop first, and the deadlines: how long police and railways keep found items, residence card 14-day reissue, reward range.",
    description: `Applies Japan's Lost Property Act (遺失物法) and related rules as of ${RULES_AS_OF}: found items are kept 3 months from hand-in (umbrellas and clothing may be disposed of 2 weeks after notice); shops, hotels and taxis must pass items to the police within 1 week; railways, route buses, ferries, scheduled airlines and airports (特例施設占有者) can keep them themselves if they report within 2 weeks (items worth ¥100,000+ go to the police within 1 week); finder's reward 5–20% of value (split 2.5–10% each with the facility), claimable within 1 month of return; personal-information items never go to the finder. Residence card (在留カード): police report, then reissue at immigration within 14 days of noticing (入管法19条の12). My Number card: suspend on 0120-95-0178 (24 h). Returns verdict (act_now | in_window | window_closing | likely_gone), summary, facility {kind special_facility | facility | none, toPoliceWithinDays, highValue}, dates {safeLastClaimDate, daysLeft, likelyGoneAfter, shortHoldDisposalFrom}, timeline[], steps[], residenceCard {reissueBy, daysLeft, overdue}, reward {minJPY, maxJPY}, contacts {operator {name, url, phone, hours, note}, policeSearch}, links, note, sources, disclaimer. It cannot search for your item.`,
    params: [
      { name: "items", type: "string", default: "other", description: `Comma list: ${ITEMS.join(", ")} (aliases: 財布, スマホ, 在留カード, suica, purse…).` },
      { name: "place", type: "string", enum: PLACES, default: "unknown", description: "Where it was lost (aliases: 電車, 地下鉄, 新幹線, タクシー, コンビニ, 路上…)." },
      { name: "operator", type: "string", enum: OPERATORS, default: "unknown", description: "Operator for direct lost-and-found contact (shinkansen defaults to jr_central, taxi to tokyo_taxi)." },
      { name: "prefecture", type: "string", enum: PREFECTURES, default: "unknown", description: "Prefecture for the police found-items search (Tokyo and Osaka have their own; the other 45 share the NPA system)." },
      { name: "lostDate", type: "string", description: "YYYY-MM-DD the item was lost (default today in JST)." },
      { name: "today", type: "string", description: "Optional YYYY-MM-DD 'as of' date (default today in JST)." },
      { name: "noticedDate", type: "string", description: "Optional YYYY-MM-DD you noticed the loss (residence card 14 days run from here; default lostDate)." },
      { name: "visitor", type: "boolean", default: false, description: "Leaving Japan soon (adds overseas contact / proxy / shipping steps)." },
      { name: "departureDate", type: "string", description: "Optional YYYY-MM-DD you leave Japan." },
      { name: "valueJPY", type: "number", description: "Optional value of the item(s) in yen → reward range." },
      { name: "cashJPY", type: "number", description: "Optional cash inside in yen (≥ ¥100,000 = high-value rule; adds to reward basis)." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan Lost Item Check",
  nameForModel: "japan_lost_item",
  descriptionForHuman: "Lost something in Japan? Who to contact, what to stop first, and how long it's kept.",
  descriptionForModel:
    "Use when someone lost a wallet, phone, passport, residence card (在留カード), My Number card, bag or anything else in Japan (train, subway, Shinkansen, bus, taxi, airport, shop, hotel, street) and asks what to do, who to call, how long the police or railway keep found items, whether it's too late, the finder's reward, or the residence card reissue deadline. Gives dated deadlines and official contacts instead of guessing; relay the disclaimer (educational, can't search for the item).",
  logo: "/icon.svg",
};
