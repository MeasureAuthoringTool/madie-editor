const STORAGE_KEY = "madie-chat-sessions";

function getSessionMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getSessionId(measureId: string): string | null {
  return getSessionMap()[measureId] ?? null;
}

export function setSessionId(measureId: string, sessionId: string): void {
  const map = getSessionMap();
  map[measureId] = sessionId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function clearSessionId(measureId: string): void {
  const map = getSessionMap();
  delete map[measureId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
