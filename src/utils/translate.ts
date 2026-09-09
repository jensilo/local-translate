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
      reasoning_content?: string;
      thinking?: string;
    };
  }>;
}

const LANGUAGE_NAMES: Record<string, string> = {
  SV: "Swedish",
  EN: "English",
  DE: "German",
};

const inFlightTranslations = new Map<string, Promise<string>>();

function buildSystemPrompt(context: string): string {
  const basePrompt =
    "You translate faithfully between Swedish, English, and German. Preserve meaning, tone, terminology, formatting, names, code, URLs, and line breaks. Return only a JSON object with one translation string. Never include reasoning, analysis, labels, alternatives, commentary, or quotation marks outside that JSON object.";

  return context.trim()
    ? `${basePrompt}\n\nContext: ${context.trim()}`
    : basePrompt;
}

function parseTranslation(content: string): string | undefined {
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>\s*/g, "")
    .replace(/<\|channel>thought[\s\S]*?<channel\|>\s*/g, "")
    .trim();

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "translation" in parsed &&
      typeof parsed.translation === "string"
    ) {
      return parsed.translation.trim();
    }
  } catch {
    // The structured-output error below explains how to retry.
  }

  return undefined;
}

function buildUserPrompt(
  text: string,
  sourceCode: string,
  targetCode: string,
): string {
  const sourceLang = LANGUAGE_NAMES[sourceCode];
  const targetLang = LANGUAGE_NAMES[targetCode];

  return `Translate ${sourceLang} (${sourceCode}) to ${targetLang} (${targetCode}).\n\nText:\n${text}`;
}

async function requestTranslation(
  apiKey: string,
  host: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch(`${host}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      top_p: 0.95,
      top_k: 64,
      enable_thinking: false,
      preserve_thinking: false,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "translation",
          schema: {
            type: "object",
            properties: {
              translation: { type: "string" },
            },
            required: ["translation"],
            additionalProperties: false,
          },
        },
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unsloth error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as UnslothResponse;
  const content = data.choices?.[0]?.message?.content;
  const translation = content ? parseTranslation(content) : undefined;
  if (!translation) {
    throw new Error(
      "Unsloth did not return a valid structured translation. Reload and try again.",
    );
  }
  return translation;
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
  const systemPrompt = buildSystemPrompt(translationContext);
  const userPrompt = buildUserPrompt(text, sourceCode, targetCode);
  const requestKey = JSON.stringify({
    host,
    unslothModel,
    systemPrompt,
    userPrompt,
  });
  const existingRequest = inFlightTranslations.get(requestKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = requestTranslation(
    unslothApiKey,
    host,
    unslothModel,
    systemPrompt,
    userPrompt,
  );
  inFlightTranslations.set(requestKey, request);

  try {
    return await request;
  } finally {
    if (inFlightTranslations.get(requestKey) === request) {
      inFlightTranslations.delete(requestKey);
    }
  }
}
