import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Form,
  getPreferenceValues,
  getSelectedText,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { addToHistory } from "./history";
import { translate } from "./translate";

interface Preferences {
  inputMethod: "clipboard" | "selection";
}

interface Props {
  sourceCode: string;
  targetCode: string;
  sourceLang: string;
  targetLang: string;
}

async function getInputText(
  inputMethod: "clipboard" | "selection",
  sourceLang: string,
): Promise<string> {
  if (inputMethod === "clipboard") {
    const text = await Clipboard.readText();
    if (!text?.trim()) {
      throw new Error(
        `Clipboard is empty — copy some ${sourceLang} text first, then run this command.`,
      );
    }
    return text.trim();
  } else {
    const text = await getSelectedText();
    if (!text?.trim()) {
      throw new Error(
        `No text selected — select some ${sourceLang} text first, then run this command.`,
      );
    }
    return text.trim();
  }
}

export function TranslateView({
  sourceCode,
  targetCode,
  sourceLang,
  targetLang,
}: Props) {
  const [translated, setTranslated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceText, setSourceText] = useState<string>("");
  const [refreshCount, setRefreshCount] = useState(0);
  const hasStartedRun = useRef(false);
  const runVersion = useRef(0);

  const title = `${sourceLang} → ${targetLang}`;
  const { inputMethod } = getPreferenceValues<Preferences>();

  const refresh = useCallback(() => {
    runVersion.current += 1;
    hasStartedRun.current = false;
    setTranslated("");
    setError(null);
    setSourceText("");
    setIsLoading(true);
    setRefreshCount((c) => c + 1);
  }, []);

  useEffect(() => {
    // Raycast local extensions run under React Strict Mode, which invokes an
    // Effect setup twice. Only the first setup may start a translation.
    if (hasStartedRun.current) {
      return;
    }
    hasStartedRun.current = true;
    const currentRunVersion = runVersion.current;
    const isCurrentRun = () => runVersion.current === currentRunVersion;

    // Reset state at the start of every run (covers Raycast caching the component between opens)
    setTranslated("");
    setError(null);
    setSourceText("");
    setIsLoading(true);

    async function run() {
      let text: string;

      try {
        text = await getInputText(inputMethod, sourceLang);
      } catch (err) {
        if (isCurrentRun()) {
          setError(String(err));
          setIsLoading(false);
        }
        return;
      }

      if (!isCurrentRun()) {
        return;
      }
      setSourceText(text);

      await showToast({
        style: Toast.Style.Animated,
        title: `Translating ${sourceLang} → ${targetLang}…`,
      });

      try {
        const result = await translate(text, sourceCode, targetCode);
        if (!isCurrentRun()) {
          return;
        }

        setTranslated(result);
        await addToHistory({
          sourceText: text,
          translatedText: result,
          sourceLang,
          targetLang,
        });
        if (!isCurrentRun()) {
          return;
        }

        await showToast({
          style: Toast.Style.Success,
          title: "Translation ready",
        });
      } catch (err) {
        if (!isCurrentRun()) {
          return;
        }

        setError(String(err));
        await showToast({
          style: Toast.Style.Failure,
          title: "Translation failed",
          message: String(err),
        });
      } finally {
        if (isCurrentRun()) {
          setIsLoading(false);
        }
      }
    }

    run();
  }, [refreshCount]);

  const actions = (
    <ActionPanel>
      {!isLoading && translated && (
        <>
          <Action.CopyToClipboard
            title="Copy Translation"
            content={translated}
          />
          <Action.CopyToClipboard
            title="Copy Source Text"
            content={sourceText}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        </>
      )}
      <Action
        title="Reload"
        icon={Icon.ArrowClockwise}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
        onAction={refresh}
      />
    </ActionPanel>
  );

  if (error) {
    return (
      <Detail
        markdown={`## ⚠️ Error\n\n${error}`}
        navigationTitle={title}
        actions={actions}
      />
    );
  }

  return (
    <Form isLoading={isLoading} navigationTitle={title} actions={actions}>
      <Form.TextArea
        id="translation"
        title={title}
        placeholder="Translation will appear here…"
        value={translated}
        onChange={setTranslated}
        enableMarkdown={false}
      />
    </Form>
  );
}
