import { normalizeDomain } from "./domainNormalization.js";

export function levenshteinDistance(source, target) {
  const left = String(source ?? "");
  const right = String(target ?? "");

  if (left === right) {
    return 0;
  }

  if (left.length === 0) {
    return right.length;
  }

  if (right.length === 0) {
    return left.length;
  }

  const previous = new Array(right.length + 1);
  const current = new Array(right.length + 1);

  for (let col = 0; col <= right.length; col += 1) {
    previous[col] = col;
  }

  for (let row = 1; row <= left.length; row += 1) {
    current[0] = row;

    for (let col = 1; col <= right.length; col += 1) {
      const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1;
      current[col] = Math.min(
        current[col - 1] + 1,
        previous[col] + 1,
        previous[col - 1] + substitutionCost
      );
    }

    for (let col = 0; col <= right.length; col += 1) {
      previous[col] = current[col];
    }
  }

  return previous[right.length];
}

export function calculateDomainSimilarity(leftDomain, rightDomain) {
  const left = normalizeDomain(leftDomain);
  const right = normalizeDomain(rightDomain);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const longest = Math.max(left.length, right.length);
  if (longest === 0) {
    return 1;
  }

  const distance = levenshteinDistance(left, right);
  const ratio = 1 - distance / longest;
  return Math.max(0, Math.min(1, Number(ratio.toFixed(4))));
}
