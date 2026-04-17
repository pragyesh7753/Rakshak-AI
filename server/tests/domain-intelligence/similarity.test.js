import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDomainSimilarity,
  levenshteinDistance,
} from "../../src/features/domain-intelligence/utils/similarity.js";

test("levenshteinDistance returns expected edit distances", () => {
  assert.equal(levenshteinDistance("kitten", "sitting"), 3);
  assert.equal(levenshteinDistance("domain", "domain"), 0);
  assert.equal(levenshteinDistance("", "abc"), 3);
});

test("calculateDomainSimilarity normalizes equivalent domains to exact match", () => {
  const similarity = calculateDomainSimilarity("https://www.example.com", "example.com");
  assert.equal(similarity, 1);
});

test("calculateDomainSimilarity is symmetric and bounded", () => {
  const closeA = calculateDomainSimilarity("example.com", "exampl3.com");
  const closeB = calculateDomainSimilarity("exampl3.com", "example.com");
  const far = calculateDomainSimilarity("example.com", "totallydifferent.org");

  assert.equal(closeA, closeB);
  assert.ok(closeA > far);
  assert.ok(closeA >= 0 && closeA <= 1);
  assert.ok(far >= 0 && far <= 1);
});
