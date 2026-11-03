import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES, EXAMPLE_SHARED, isIndexable, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

test("share links round-trip and compute", () => {
  for (const ex of EXAMPLES) {
    const back = parseShared(new URLSearchParams(sharedQuery(ex)));
    assert.deepEqual(back, ex);
    assert.ok(isIndexable(ex));
    assert.ok(safeCheck(ex), JSON.stringify(ex));
  }
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?it=wallet,residence_card&p=subway&o=tokyo_metro&d=2026-11-01&t=2026-11-03");
  assert.equal(safeCheck(EXAMPLES[0])!.verdict, "act_now");
  assert.equal(safeCheck(EXAMPLES[2])!.verdict, "window_closing");
});

test("bad share params → null or defaults", () => {
  assert.equal(parseShared(new URLSearchParams("it=dragon")), null);
  assert.equal(parseShared(new URLSearchParams("it=phone&p=moon"))!.place, "unknown");
  assert.equal(parseShared(new URLSearchParams("it=phone&d=soon"))!.lostDate, null);
  assert.equal(safeCheck(parseShared(new URLSearchParams("it=phone&d=2099-01-01"))!), null);
});
