export const SITE_NAME = "Japan Lost Item Check";

export const SITE_TAGLINE =
  "Lost a wallet, phone, passport or residence card in Japan? See who to contact first (station, Tokyo Metro, JR, taxi, airport, police), what to stop right away, how long found items are kept (3 months; umbrellas and clothing 2 weeks), the finder's reward and your residence card's 14-day reissue deadline.";

export const DISCLAIMER_SHORT = "Educational guide, not legal advice and not an official service. Not affiliated with the National Police Agency, any police force, the Immigration Services Agency, the Digital Agency, or any railway, airport or taxi company. It can't search for your item; dates are estimates. Rules as of 2026-11-03.";

export const HONESTY =
  "Rules as of 2026-11-03 from 遺失物法 and its cabinet order (e-Gov), the National Police Agency lost-property pages, the Immigration Services Agency residence card page, the Digital Agency My Number page and operators' lost-and-found pages. Periods run from the day an item is handed in, so the dates shown are the earliest, safest ones.";

export const SIBLING_TOOLS = [
  { href: "https://japan-medical-cost-cap.vercel.app", label: "Japan High-Cost Medical Expense Check" },
  { href: "https://japan-job-loss.vercel.app", label: "Japan Job Loss Check" },
  { href: "https://japan-disaster-prep.vercel.app", label: "Japan Disaster Prep Check" },
  { href: "https://japan-leaving-tax.vercel.app", label: "Japan Leaving Tax Check" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-pet-quarantine.vercel.app", label: "Japan Pet Quarantine Check" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://japan-intl-postage.vercel.app", label: "Japan Postage Calculator" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-hsp-points.vercel.app", label: "Japan HSP Points Calculator" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://japan-parttime-check.vercel.app", label: "Japan Part-time Work Check" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening Check" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing Check" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://house-rules-check.vercel.app", label: "House Rules Check" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-lost-item.vercel.app";
}
