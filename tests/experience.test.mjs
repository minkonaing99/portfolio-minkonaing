import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("experience renderer does not parse fetched content as HTML", async () => {
  const source = await readFile(new URL("../js/experience.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /innerHTML/);
  assert.match(source, /\.textContent\s*=/);
  assert.match(source, /replaceChildren\(\)/);
});
