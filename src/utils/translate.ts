import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  ollamaHost: string;
  ollamaModel: string;
}

interface OllamaResponse {
  response: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  SV: "Swedish",
  EN: "English",
  DE: "German",
};

function buildPrompt(
  text: string,
  sourceCode: string,
  targetCode: string,
): string {
  const sourceLang = LANGUAGE_NAMES[sourceCode];
  const targetLang = LANGUAGE_NAMES[targetCode];

  return `You are a professional ${sourceLang} (${sourceCode}) to ${targetLang} (${targetCode}) translator. Your goal is to accurately convey the meaning and nuances of the original ${sourceLang} text while adhering to ${targetLang} grammar, vocabulary, and cultural sensitivities.
Produce only the ${targetLang} translation, without any additional explanations or commentary. Please translate the following ${sourceLang} text into ${targetLang}:

${text}`;
}

export async function translate(
  text: string,
  sourceCode: string,
  targetCode: string,
): Promise<string> {
  const { ollamaHost, ollamaModel } = getPreferenceValues<Preferences>();

  const host = ollamaHost.replace(/\/$/, "");
  const prompt = buildPrompt(text, sourceCode, targetCode);

  const response = await fetch(`${host}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OllamaResponse;
  if (!data.response) {
    throw new Error(
      "Ollama returned an empty or unexpected response. Is the model loaded?",
    );
  }
  return data.response.trim();
}
