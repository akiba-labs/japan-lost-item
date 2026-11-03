import assert from "node:assert/strict";
import test from "node:test";
import { checkLost, RuleInputError } from "./lost";

test("Tokyo Metro wallet + residence card, 2 days ago → act_now with deadlines", () => {
  const r = checkLost({ items: ["wallet", "residence_card"], place: "subway", operator: "tokyo_metro", lostDate: "2026-11-01", today: "2026-11-03" });
  assert.equal(r.verdict, "act_now");
  assert.equal(r.prefecture, "tokyo");
  assert.equal(r.facility.kind, "special_facility");
  assert.equal(r.facility.toPoliceWithinDays, 14);
  assert.equal(r.dates.safeLastClaimDate, "2026-02-01".replace("2026", "2027"));
  assert.equal(r.residenceCard!.reissueBy, "2026-11-15");
  assert.equal(r.residenceCard!.daysLeft, 12);
  assert.equal(r.contacts.operator!.phone, "0570-033-777");
  assert.ok(r.steps.some((s) => s.includes("through")));
  assert.ok(r.steps.some((s) => s.includes("card issuers")));
  assert.match(r.contacts.policeSearch.url, /keishicho/);
});

test("high-value cash on a train → 1 week to police", () => {
  const r = checkLost({ items: ["cash"], place: "train", cashJPY: 150000, lostDate: "2026-11-01", today: "2026-11-01" });
  assert.equal(r.facility.highValue, true);
  assert.equal(r.facility.toPoliceWithinDays, 7);
  assert.equal(r.reward!.minJPY, 7500);
  assert.equal(r.reward!.maxJPY, 30000);
});

test("shop → 1 week, street → finder 7 days, NPA shared search outside Tokyo/Osaka", () => {
  assert.equal(checkLost({ items: ["bag"], place: "shop", prefecture: "kyoto", lostDate: "2026-10-30", today: "2026-11-03" }).facility.toPoliceWithinDays, 7);
  const r = checkLost({ items: ["keys"], place: "street", prefecture: "fukuoka", lostDate: "2026-10-01", today: "2026-11-03" });
  assert.equal(r.facility.kind, "none");
  assert.equal(r.verdict, "in_window");
  assert.match(r.contacts.policeSearch.url, /lostproperty\.pcf\.npa\.go\.jp/);
  assert.equal(r.reward, null);
});

test("umbrella after 2 weeks → window_closing; 4 months → likely_gone", () => {
  const u = checkLost({ items: ["umbrella"], place: "train", operator: "jr_east", lostDate: "2026-10-15", today: "2026-11-03" });
  assert.equal(u.verdict, "window_closing");
  assert.equal(u.dates.shortHoldDisposalFrom, "2026-10-29");
  const g = checkLost({ items: ["bag"], place: "train", lostDate: "2026-06-01", today: "2026-11-03" });
  assert.equal(g.verdict, "likely_gone");
});

test("month-end arithmetic and overdue residence card", () => {
  const r = checkLost({ items: ["residence_card"], place: "street", lostDate: "2026-11-30", today: "2026-12-20" });
  assert.equal(r.dates.safeLastClaimDate, "2027-02-28");
  assert.equal(r.residenceCard!.overdue, true);
});

test("noticed abroad → 14 days from re-entry", () => {
  const r = checkLost({ items: ["residence_card"], lostDate: "2026-10-28", departureDate: "2026-10-29", noticedDate: "2026-10-30", today: "2026-11-03" });
  assert.match(r.residenceCard!.reissueBy, /re-entry/);
});

test("shinkansen defaults to JR Central; visitor adds overseas steps", () => {
  const r = checkLost({ items: ["laptop"], place: "shinkansen", visitor: true, lostDate: "2026-11-03", today: "2026-11-03" });
  assert.equal(r.operator, "jr_central");
  assert.ok(r.steps.some((s) => s.includes("Leaving Japan")));
});

test("bad dates throw", () => {
  assert.throws(() => checkLost({ lostDate: "2026-11-05", today: "2026-11-03" }), RuleInputError);
  assert.throws(() => checkLost({ lostDate: "2026-02-30" }), RuleInputError);
  assert.throws(() => checkLost({ lostDate: "2026-11-01", noticedDate: "2026-10-01", today: "2026-11-03" }), RuleInputError);
  assert.throws(() => checkLost({ valueJPY: -1 }), RuleInputError);
});
