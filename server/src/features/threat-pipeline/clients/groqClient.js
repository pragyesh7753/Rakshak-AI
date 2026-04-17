import axios from "axios";

const GROQ_API_BASE_URL =
  process.env.GROQ_API_BASE_URL ?? "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const GROQ_MAX_TOKENS = Math.max(128, Number(process.env.GROQ_MAX_TOKENS ?? 700));
const GROQ_MAX_RETRIES = Math.max(1, Number(process.env.GROQ_MAX_RETRIES ?? 4));
const GROQ_RETRY_BASE_MS = Math.max(100, Number(process.env.GROQ_RETRY_BASE_MS ?? 700));
const GROQ_RETRY_CAP_MS = Math.max(500, Number(process.env.GROQ_RETRY_CAP_MS ?? 8_000));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(error) {
  const retryAfter = Number(error?.response?.headers?.["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return null;
}

function isRetryableGroqError(error) {
  const status = Number(error?.response?.status);
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const code = String(error?.code ?? "").toUpperCase();
  return ["ECONNABORTED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND"].includes(code);
}

function getGroqApiKey() {
  return String(process.env.GROQ_API_KEY ?? "").trim();
}

function isPlaceholderValue(value) {
  const lower = String(value ?? "").toLowerCase();
  return lower.includes("your_") || lower.includes("replace") || lower.includes("paste");
}

export function isGroqConfigured() {
  const key = getGroqApiKey();
  return key.length > 0 && !isPlaceholderValue(key);
}

export function getGroqModel() {
  return GROQ_MODEL;
}

export async function generateGroqReasoning(prompt) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  let lastError = null;

  for (let attempt = 1; attempt <= GROQ_MAX_RETRIES; attempt += 1) {
    try {
      const response = await axios.post(
        `${String(GROQ_API_BASE_URL).replace(/\/+$/, "")}/chat/completions`,
        {
          model: GROQ_MODEL,
          max_tokens: GROQ_MAX_TOKENS,
          messages: [
            {
              role: "system",
              content:
                "You are a cyber threat intelligence reasoning assistant. Return strict JSON only without markdown or commentary.",
            },
            {
              role: "user",
              content: String(prompt ?? ""),
            },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 90_000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Groq response did not contain completion content");
      }

      return content;
    } catch (error) {
      const status = Number(error?.response?.status);
      if (status === 402) {
        throw new Error(
          "GroqCloud credits/budget exceeded. Add credits or lower GROQ_MAX_TOKENS in server/.env"
        );
      }

      if (status === 429 && attempt === GROQ_MAX_RETRIES) {
        throw new Error(
          "GroqCloud rate limit reached after retries. Reduce GROQ_REASONING_CAP_PER_CYCLE or GROQ_MAX_TOKENS."
        );
      }

      lastError = error;
      if (!isRetryableGroqError(error) || attempt === GROQ_MAX_RETRIES) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);
      const exponential = GROQ_RETRY_BASE_MS * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * 200);
      const waitMs = retryAfterMs ?? Math.min(GROQ_RETRY_CAP_MS, exponential + jitter);
      await sleep(waitMs);
    }
  }

  throw lastError ?? new Error("Groq request failed after retries");
}
