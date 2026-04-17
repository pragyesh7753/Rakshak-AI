import axios from "axios";

const HUGGINGFACE_API_BASE_URL =
  process.env.HUGGINGFACE_API_BASE_URL ?? "https://router.huggingface.co/hf-inference/models";
const HF_MINILM_MODEL =
  process.env.HF_MINILM_MODEL ?? "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const HF_XLMR_MODEL = process.env.HF_XLMR_MODEL ?? "cardiffnlp/twitter-xlm-roberta-base-sentiment";
const HF_XLMR_MAX_CHARS = Math.max(128, Number(process.env.HF_XLMR_MAX_CHARS ?? 1200));
const HF_XLMR_FALLBACK_MAX_CHARS = Math.max(
  64,
  Number(process.env.HF_XLMR_FALLBACK_MAX_CHARS ?? 500)
);
const HUGGINGFACE_MAX_RETRIES = Math.max(1, Number(process.env.HUGGINGFACE_MAX_RETRIES ?? 4));
const HUGGINGFACE_RETRY_BASE_MS = Math.max(
  100,
  Number(process.env.HUGGINGFACE_RETRY_BASE_MS ?? 700)
);
const HUGGINGFACE_RETRY_CAP_MS = Math.max(
  500,
  Number(process.env.HUGGINGFACE_RETRY_CAP_MS ?? 8_000)
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildModelUrl(model) {
  const base = String(HUGGINGFACE_API_BASE_URL).replace(/\/+$/, "");
  const normalizedModel = String(model).replace(/^\/+/, "");
  return `${base}/${normalizedModel}`;
}

function getRetryAfterMs(error) {
  const retryAfter = Number(error?.response?.headers?.["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return null;
}

function getModelLoadingWaitMs(error) {
  const estimatedTime = Number(error?.response?.data?.estimated_time ?? error?.response?.data?.estimatedTime);
  if (Number.isFinite(estimatedTime) && estimatedTime > 0) {
    return Math.min(HUGGINGFACE_RETRY_CAP_MS, Math.round(estimatedTime * 1000));
  }

  const message = String(error?.response?.data?.error ?? error?.message ?? "").toLowerCase();
  if (message.includes("currently loading") || message.includes("model is loading")) {
    return Math.min(HUGGINGFACE_RETRY_CAP_MS, 2_500);
  }

  return null;
}

function isRetryableHuggingFaceError(error) {
  const status = Number(error?.response?.status);
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const message = String(error?.response?.data?.error ?? error?.message ?? "").toLowerCase();
  if (message.includes("currently loading") || message.includes("model is loading")) {
    return true;
  }

  const code = String(error?.code ?? "").toUpperCase();
  return ["ECONNABORTED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND"].includes(code);
}

function getHuggingFaceApiKey() {
  return String(process.env.HUGGINGFACE_API_KEY ?? "").trim();
}

export function isHuggingFaceConfigured() {
  return getHuggingFaceApiKey().length > 0;
}

async function runHuggingFaceModel(model, payload) {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not configured");
  }

  let lastError = null;

  for (let attempt = 1; attempt <= HUGGINGFACE_MAX_RETRIES; attempt += 1) {
    try {
      const response = await axios.post(buildModelUrl(model), payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60_000,
      });

      if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
        const errorMessage = response.data.error;
        if (errorMessage) {
          const syntheticError = new Error(String(errorMessage));
          syntheticError.response = {
            status: 503,
            data: response.data,
            headers: response.headers,
          };
          throw syntheticError;
        }
      }

      return response.data;
    } catch (error) {
      lastError = error;
      if (!isRetryableHuggingFaceError(error) || attempt === HUGGINGFACE_MAX_RETRIES) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);
      const loadingWaitMs = getModelLoadingWaitMs(error);
      const exponential = HUGGINGFACE_RETRY_BASE_MS * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * 200);
      const waitMs =
        retryAfterMs ??
        loadingWaitMs ??
        Math.min(HUGGINGFACE_RETRY_CAP_MS, exponential + jitter);
      await sleep(waitMs);
    }
  }

  throw lastError ?? new Error("Hugging Face inference failed after retries");
}

function normalizeSimilarityScores(raw, expectedCount) {
  if (expectedCount <= 0) {
    return [];
  }

  let values = [];
  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      values = raw[0];
    } else {
      values = raw;
    }
  } else if (Number.isFinite(Number(raw))) {
    values = [Number(raw)];
  }

  const normalized = values
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
    .slice(0, expectedCount);

  while (normalized.length < expectedCount) {
    normalized.push(0);
  }

  return normalized;
}

function normalizeSentimentLabel(label) {
  const normalized = String(label ?? "neutral").toLowerCase();

  if (normalized.includes("neg") || normalized === "label_0") {
    return "negative";
  }
  if (normalized.includes("neu") || normalized === "label_1") {
    return "neutral";
  }
  if (normalized.includes("pos") || normalized === "label_2") {
    return "positive";
  }

  return "neutral";
}

function normalizeSingleSentiment(raw) {
  const candidateList = [];

  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      candidateList.push(...raw[0]);
    } else {
      candidateList.push(...raw);
    }
  } else if (raw && typeof raw === "object") {
    candidateList.push(raw);
  }

  const parsed = candidateList
    .map((item) => {
      const score = Number(item?.score);
      if (!Number.isFinite(score)) {
        return null;
      }
      return {
        label: normalizeSentimentLabel(item?.label),
        score,
      };
    })
    .filter(Boolean);

  if (parsed.length === 0) {
    return {
      label: "neutral",
      confidence: 0,
      score: 0,
      distribution: {
        negative: 0,
        neutral: 1,
        positive: 0,
      },
    };
  }

  parsed.sort((a, b) => b.score - a.score);

  const distribution = {
    negative: 0,
    neutral: 0,
    positive: 0,
  };

  for (const item of parsed) {
    distribution[item.label] = Math.max(distribution[item.label], item.score);
  }

  const top = parsed[0];
  const signedScore =
    top.label === "positive" ? top.score : top.label === "negative" ? -top.score : 0;

  return {
    label: top.label,
    confidence: top.score,
    score: signedScore,
    distribution,
  };
}

function normalizeSentimentBatch(raw, expectedCount) {
  if (expectedCount <= 0) {
    return [];
  }

  if (expectedCount === 1) {
    return [normalizeSingleSentiment(raw)];
  }

  if (!Array.isArray(raw)) {
    return Array.from({ length: expectedCount }, () => normalizeSingleSentiment(null));
  }

  return raw
    .slice(0, expectedCount)
    .map((entry) => normalizeSingleSentiment(entry))
    .concat(
      Array.from(
        { length: Math.max(0, expectedCount - raw.length) },
        () => normalizeSingleSentiment(null)
      )
    );
}

export function getHuggingFaceModelConfig() {
  return {
    minilm: HF_MINILM_MODEL,
    xlmr: HF_XLMR_MODEL,
    xlmrMaxChars: HF_XLMR_MAX_CHARS,
  };
}

export async function getMiniLMContextSimilarities(sourceSentence, candidateSentences) {
  const candidates = Array.isArray(candidateSentences)
    ? candidateSentences.map((entry) => String(entry ?? "")).filter((entry) => entry.length > 0)
    : [];

  if (candidates.length === 0) {
    return [];
  }

  const payload = {
    inputs: {
      source_sentence: String(sourceSentence ?? ""),
      sentences: candidates,
    },
    options: {
      wait_for_model: true,
      use_cache: true,
    },
  };

  const raw = await runHuggingFaceModel(HF_MINILM_MODEL, payload);
  return normalizeSimilarityScores(raw, candidates.length);
}

export async function getXLMRSentimentBatch(inputs) {
  const inputList = Array.isArray(inputs) ? inputs : [inputs];
  if (inputList.length === 0) {
    return [];
  }

  const normalizedInputs = inputList.map((entry) => String(entry ?? "").slice(0, HF_XLMR_MAX_CHARS));

  const payload = {
    inputs: normalizedInputs.length === 1 ? normalizedInputs[0] : normalizedInputs,
    parameters: {
      top_k: null,
    },
    options: {
      wait_for_model: true,
      use_cache: true,
    },
  };

  try {
    const raw = await runHuggingFaceModel(HF_XLMR_MODEL, payload);
    return normalizeSentimentBatch(raw, inputList.length);
  } catch (error) {
    const status = Number(error?.response?.status);
    if (status !== 400) {
      throw error;
    }

    // Some long/noisy texts can exceed sequence limits; degrade to single-item requests.
    const singleItemResults = [];
    for (const entry of inputList) {
      const singlePayload = {
        inputs: String(entry ?? "").slice(0, HF_XLMR_FALLBACK_MAX_CHARS),
        parameters: {
          top_k: null,
        },
        options: {
          wait_for_model: true,
          use_cache: true,
        },
      };

      try {
        const singleRaw = await runHuggingFaceModel(HF_XLMR_MODEL, singlePayload);
        singleItemResults.push(normalizeSingleSentiment(singleRaw));
      } catch {
        singleItemResults.push(normalizeSingleSentiment(null));
      }
    }

    return singleItemResults;
  }
}

export async function getXLMRSentiment(input) {
  const [result] = await getXLMRSentimentBatch([input]);
  return result;
}
