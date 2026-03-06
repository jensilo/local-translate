import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  clearHistory,
  deleteFromHistory,
  getHistory,
  HistoryEntry,
} from "./utils/history";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function truncate(text: string, maxLength = 60): string {
  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + "…"
    : text;
}

export default function Command() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadHistory() {
    setIsLoading(true);
    const history = await getHistory();
    setEntries(history);
    setIsLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleDelete(id: string) {
    await deleteFromHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await showToast({ style: Toast.Style.Success, title: "Entry deleted" });
  }

  async function handleClearAll() {
    const confirmed = await confirmAlert({
      title: "Clear Translation History",
      message:
        "This will permanently delete all history entries. Are you sure?",
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });
    if (confirmed) {
      await clearHistory();
      setEntries([]);
      await showToast({ style: Toast.Style.Success, title: "History cleared" });
    }
  }

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      navigationTitle="Translation History"
      searchBarPlaceholder="Search translations…"
      actions={
        entries.length > 0 ? (
          <ActionPanel>
            <Action
              title="Clear All History"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
              onAction={handleClearAll}
            />
          </ActionPanel>
        ) : undefined
      }
    >
      {entries.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Clock}
          title="No Translations Yet"
          description="Translations will appear here after you use any translation command."
        />
      ) : (
        entries.map((entry) => (
          <List.Item
            key={entry.id}
            icon={{ source: Icon.ArrowRight, tintColor: Color.Blue }}
            title={truncate(entry.translatedText)}
            subtitle={`${entry.sourceLang} → ${entry.targetLang}`}
            accessories={[{ text: formatDate(entry.timestamp) }]}
            detail={
              <List.Item.Detail
                markdown={`## ${entry.sourceLang} → ${entry.targetLang}\n\n**Original**\n\n${entry.sourceText}\n\n---\n\n**Translation**\n\n${entry.translatedText}`}
              />
            }
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Translation"
                  content={entry.translatedText}
                />
                <Action.CopyToClipboard
                  title="Copy Source Text"
                  content={entry.sourceText}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
                <Action
                  title="Delete Entry"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() => handleDelete(entry.id)}
                />
                <Action
                  title="Clear All History"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
                  onAction={handleClearAll}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
