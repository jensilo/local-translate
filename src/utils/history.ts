import { LocalStorage } from "@raycast/api";

export interface HistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

const HISTORY_KEY = "translation_history";
const MAX_ENTRIES = 50;

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await LocalStorage.getItem<string>(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function addToHistory(
  entry: Omit<HistoryEntry, "id" | "timestamp">,
): Promise<void> {
  const history = await getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
  await LocalStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function deleteFromHistory(id: string): Promise<void> {
  const history = await getHistory();
  const updated = history.filter((e) => e.id !== id);
  await LocalStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await LocalStorage.removeItem(HISTORY_KEY);
}
