import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  unslothApiKey: string;
  unslothHost: string;
  unslothModel: string;
  translationContext: string;
}

interface UnslothResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const LANGUAGE_NAMES: Record<string, string> = {
  SV: "Swedish",
  EN: "English",
  DE: "German",
};

function buildSystemPrompt(context: string): string {
  const basePrompt =
    "You translate faithfully between Swedish, English, and German. Return only the translation. Preserve meaning, tone, terminology, formatting, names, code, URLs, and line breaks.";

  return context.trim()
    ? `${basePrompt}\n\nContext: ${context.trim()}`
    : basePrompt;
}

function buildUserPrompt(
  text: string,
  sourceCode: string,
  targetCode: string,
): string {
  const sourceLang = LANGUAGE_NAMES[sourceCode];
  const targetLang = LANGUAGE_NAMES[targetCode];

  return `Translate from ${sourceLang} (${sourceCode}) to ${targetLang} (${targetCode}).\n\nText:\n${text}`;
}

export async function translate(
  text: string,
  sourceCode: string,
  targetCode: string,
): Promise<string> {
  const { unslothApiKey, unslothHost, unslothModel, translationContext } =
    getPreferenceValues<Preferences>();

  if (!unslothApiKey.trim()) {
    throw new Error(
      "Set an Unsloth API key in this extension's Raycast preferences.",
    );
  }

  const host = unslothHost.replace(/\/$/, "");
  const response = await fetch(`${host}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${unslothApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: unslothModel,
      messages: [
        { role: "system", content: buildSystemPrompt(translationContext) },
        {
          role: "user",
          content: buildUserPrompt(text, sourceCode, targetCode),
        },
      ],
      temperature: 0.2,
      enable_thinking: false,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unsloth error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as UnslothResponse;
  const translation = data.choices?.[0]?.message?.content?.trim();
  if (!translation) {
    throw new Error(
      "Unsloth returned an empty or unexpected response. Is the model loaded?",
    );
  }
  return translation;
}
