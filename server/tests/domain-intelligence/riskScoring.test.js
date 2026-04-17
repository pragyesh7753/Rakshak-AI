import assert from "node:assert/strict";
import test from "node:test";
import { calculateRisk } from "../../src/features/domain-intelligence/services/riskScoring.service.js";

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

test("calculateRisk returns high severity with stacked high-risk signals", () => {
  const result = calculateRisk({
    domain: "securebankk.com",
    organizationDomain: "securebank.com",
    keywords: ["secure", "bank"],
    registeredAt: daysAgo(2),
    social: {
      mentions: 3,
      phishingPosts: 2,
    },
  });

  assert.equal(result.score, 100);
  assert.equal(result.severity, "high");
  assert.ok(result.flags.includes("new_domain"));
  assert.ok(result.flags.includes("typosquatting"));
  assert.ok(result.flags.includes("keyword_attack"));
  assert.ok(result.flags.includes("social_spread"));
  assert.ok(result.flags.includes("active_phishing"));
});

test("calculateRisk returns medium severity when only new-domain signal is present", () => {
  const result = calculateRisk({
    domain: "fresh-example.net",
    organizationDomain: "acme.com",
    keywords: [],
    registeredAt: daysAgo(1),
    social: {
      mentions: 0,
      phishingPosts: 0,
    },
  });

  assert.equal(result.score, 40);
  assert.equal(result.severity, "medium");
  assert.deepEqual(result.flags, ["new_domain"]);
});

test("calculateRisk returns low severity without risk signals", () => {
  const result = calculateRisk({
    domain: "trusted-example.org",
    organizationDomain: "acme.com",
    keywords: [],
    registeredAt: daysAgo(45),
    social: {
      mentions: 0,
      phishingPosts: 0,
    },
  });

  assert.equal(result.score, 0);
  assert.equal(result.severity, "low");
  assert.deepEqual(result.flags, []);
});
