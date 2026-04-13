import axios from "axios";

const SAMBANOVA_API_BASE_URL = process.env.SAMBANOVA_API_BASE_URL ?? "https://api.sambanova.ai/v1";
const SAMBANOVA_MODEL =
  process.env.SAMBANOVA_MODEL ?? "Meta-Llama-4-Maverick-17B-128E-Instruct";

export function isSambaNovaConfigured() {
  return Boolean(process.env.SAMBANOVA_API_KEY);
}

export async function generateLlamaResponse(prompt) {
  if (!isSambaNovaConfigured()) {
    throw new Error("SAMBANOVA_API_KEY is not configured");
  }

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
}