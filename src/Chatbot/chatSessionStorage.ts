const STORAGE_KEY = "madie-chat-sessions";
const MODEL_KEY = "madie-chat-model";

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

export function getPreferredModel(defaultModel: string): string {
  try {
    return localStorage.getItem(MODEL_KEY) || defaultModel;
  } catch {
    return defaultModel;
  }
}

export function setPreferredModel(model: string): void {
  try {
    localStorage.setItem(MODEL_KEY, model);
  } catch {
    // localStorage unavailable — silently ignore
  }
}
