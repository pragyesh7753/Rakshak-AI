import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const GEMINI_MAX_RETRIES = Math.max(1, Number(process.env.GEMINI_MAX_RETRIES ?? 2));
const GEMINI_RETRY_BASE_MS = Math.max(100, Number(process.env.GEMINI_RETRY_BASE_MS ?? 700));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiApiKey() {
  return String(process.env.GEMINI_API_KEY ?? "").trim();
}

function isPlaceholderValue(value) {
  const lower = String(value ?? "").toLowerCase();
  return lower.includes("your_") || lower.includes("replace") || lower.includes("paste");
}

function extractJsonPayload(text) {
  const clean = String(text ?? "").replace(/```json|```/gi, "").trim();

  if (clean.startsWith("{") && clean.endsWith("}")) {
    return JSON.parse(clean);
  }

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON payload found in Gemini response");
  }

  return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
}

function parseKeywordArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const entry of values) {
    const token = String(entry ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 80);

    if (token.length < 3 || seen.has(token)) {
      continue;
    }

    seen.add(token);
    normalized.push(token);
  }

  return normalized;
}

function flattenMultilingualVariants(value) {
  if (!value || typeof value !== "object") {
    return [];
  }

  const merged = [];
  for (const list of Object.values(value)) {
    if (Array.isArray(list)) {
      merged.push(...list);
    }
  }

  return merged;
}

function normalizeGeminiKeywordPayload(payload) {
  const baseKeywords = parseKeywordArray(payload?.base_keywords);
  const synonyms = parseKeywordArray(payload?.synonyms);
  const slang = parseKeywordArray(payload?.slang);
  const multilingual = parseKeywordArray(flattenMultilingualVariants(payload?.multilingual_variants));

  return {
    baseKeywords,
    synonyms,
    slang,
    multilingual,
  };
}

function buildKeywordPrompt({ orgName, sector, domain, description, userKeywords }) {
  const input = {
    org_name: orgName,
    sector,
    domain,
    description,
    user_keywords: userKeywords,
  };

  return `
You are helping build cyber threat intelligence search keywords for one organization.

Organization profile:
${JSON.stringify(input, null, 2)}

Task:
- Generate concise search keywords for finding relevant threat chatter in public forums.
- Include terms that match likely breach, leak, credential abuse, ransomware, phishing, and access sale discussions relevant to this org profile.
- Include sector-specific terminology.
- Include multilingual/transliteration variants commonly seen in India-focused threat chatter when useful.
- Avoid generic words that create high noise (e.g. "security", "technology", "company").

Return STRICT JSON only with this schema:
{
  "base_keywords": ["..."],
  "synonyms": ["..."],
  "slang": ["..."],
  "multilingual_variants": {
    "hindi_or_hinglish": ["..."],
    "other": ["..."]
  }
}
`;
}

function getResponseText(response) {
  if (typeof response?.text === "string" && response.text.trim().length > 0) {
    return response.text;
  }

  const fallbackText = response?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join("\n");

  return String(fallbackText ?? "");
}

export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return key.length > 0 && !isPlaceholderValue(key);
}

export function getGeminiModel() {
  return GEMINI_MODEL;
}

export async function generateGeminiKeywordDraft(input) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildKeywordPrompt(input);
  let lastError = null;

  for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const payload = extractJsonPayload(getResponseText(response));
      return normalizeGeminiKeywordPayload(payload);
    } catch (error) {
      lastError = error;
      if (attempt === GEMINI_MAX_RETRIES) {
        throw error;
      }
      const waitMs = GEMINI_RETRY_BASE_MS * attempt;
      await sleep(waitMs);
    }
  }

  throw lastError ?? new Error("Gemini keyword generation failed after retries");
}
