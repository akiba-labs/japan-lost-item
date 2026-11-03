import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} → act_now, residence card by 2026-11-15`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.verdict, "act_now");
  assert.equal(body.residenceCard.reissueBy, "2026-11-15");
  assert.equal(body.dates.safeLastClaimDate, "2027-02-01");
  assert.equal(body.rulesAsOf, "2026-11-03");
  assert.ok(body.sources.length >= 8);
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(url.searchParams)) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("aliases, Japanese values and JSON arrays", async () => {
  const b = await (await handler(new Request(`${PUBLIC_URL}${e.path}?item=${encodeURIComponent("財布、スマホ")}&where=${encodeURIComponent("タクシー")}&date=2026-11-02&today=2026-11-03&tourist=yes`))).json();
  assert.deepEqual(b.items, ["wallet", "phone"]);
  assert.equal(b.place, "taxi");
  assert.equal(b.operator, "tokyo_taxi");
  assert.equal(b.visitor, true);
  const p = await (await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: ["suica", "在留カード"], place: "電車", operator: "JR East", lostDate: "2026-11-03", today: "2026-11-03", value: "¥3,000" }) }))).json();
  assert.deepEqual(p.items, ["ic_card", "residence_card"]);
  assert.equal(p.operator, "jr_east");
  assert.equal(p.reward.maxJPY, 600);
});

test("bad inputs → 400 with example", async () => {
  for (const q of ["items=dragon", "place=moon", "operator=acme", "prefecture=atlantis", "lostDate=yesterday", "lostDate=2099-01-01", "visitor=maybe", "valueJPY=lots", "valueJPY=-5", "noticedDate=2026-13-01"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}?${q}`));
    assert.equal(res.status, 400, q);
    const body = await res.json();
    assert.equal(body.disclaimer, API_DISCLAIMER);
    assert.ok(body.example);
  }
});

test("malformed JSON body → 400", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{nope" }));
  assert.equal(res.status, 400);
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI lists /api/check GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { openapi: string; paths: Record<string, { get: { parameters: { name: string }[] }; post: unknown }> };
  assert.ok(spec.openapi.startsWith("3."));
  assert.ok(spec.paths["/api/check"]?.post);
  assert.ok(spec.paths["/api/check"].get.parameters.find((p) => p.name === "lostDate"));
});
