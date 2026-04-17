import assert from "node:assert/strict";
import test from "node:test";
import { generateDomains } from "../../src/features/domain-intelligence/services/domainGeneration.service.js";

test("generateDomains is deterministic for same input", () => {
  const inputDomain = "acme.com";
  const keywords = ["secure", "verify", "secure"];

  const firstRun = generateDomains(inputDomain, keywords);
  const secondRun = generateDomains(inputDomain, keywords);

  assert.deepEqual(firstRun, secondRun);
});

test("generateDomains includes typo and keyword combos across TLDs", () => {
  const generated = generateDomains("acme.com", ["secure", "verify"]);

  assert.ok(generated.length > 0);
  assert.ok(generated.includes("aacme.com"));
  assert.ok(generated.includes("acmesecure.com"));
  assert.ok(generated.includes("secureacme.net"));
  assert.ok(generated.includes("acmeverify.in"));
  assert.ok(!generated.includes("acme.com"));
});
