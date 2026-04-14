import axios from "axios";

const SAMBANOVA_API_BASE_URL = process.env.SAMBANOVA_API_BASE_URL ?? "https://api.sambanova.ai/v1";
const SAMBANOVA_MODEL =
  process.env.SAMBANOVA_MODEL ?? "Llama-4-Maverick-17B-128E-Instruct";
const SAMBANOVA_MAX_RETRIES = Math.max(1, Number(process.env.SAMBANOVA_MAX_RETRIES ?? 4));
const SAMBANOVA_RETRY_BASE_MS = Math.max(100, Number(process.env.SAMBANOVA_RETRY_BASE_MS ?? 700));
const SAMBANOVA_RETRY_CAP_MS = Math.max(500, Number(process.env.SAMBANOVA_RETRY_CAP_MS ?? 8_000));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(error) {
  const header = error?.response?.headers?.["retry-after"];
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  return null;
}

function isRetryableSambaError(error) {
  const status = Number(error?.response?.status);
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const code = String(error?.code ?? "").toUpperCase();
  return ["ECONNABORTED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND"].includes(code);
}

export function isSambaNovaConfigured() {
  return Boolean(process.env.SAMBANOVA_API_KEY);
}

export async function generateLlamaResponse(prompt) {
  if (!isSambaNovaConfigured()) {
    throw new Error("SAMBANOVA_API_KEY is not configured");
  }

  let lastError = null;

  for (let attempt = 1; attempt <= SAMBANOVA_MAX_RETRIES; attempt += 1) {
    try {
      const response = await axios.post(
        `${SAMBANOVA_API_BASE_URL}/chat/completions`,
        {
          model: SAMBANOVA_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a cyber threat intelligence assistant. Return strict JSON only without markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60_000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("SambaNova response did not contain completion content");
      }

      return content;
    } catch (error) {
      lastError = error;
      if (!isRetryableSambaError(error) || attempt === SAMBANOVA_MAX_RETRIES) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);
      const exponential = SAMBANOVA_RETRY_BASE_MS * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * 200);
      const waitMs = retryAfterMs ?? Math.min(SAMBANOVA_RETRY_CAP_MS, exponential + jitter);
      await sleep(waitMs);
    }
  }

  throw lastError ?? new Error("SambaNova request failed after retries");
}