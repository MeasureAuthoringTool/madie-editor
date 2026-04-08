import { useOktaTokens } from "@madie/madie-util";

export interface ClaraChatMessage {
  role: string;
  content: string;
}

// Mode 1: reference a key saved in the ai-service
export interface ClaraChatRequestSavedKey {
  key_id: string;
  model: string;
  messages: ClaraChatMessage[];
  session_id?: string;
  context?: string;
  context_type?: string;
}

// Mode 2: pass the key per-call (never persisted server-side)
export interface ClaraChatRequestInlineKey {
  api_key: string;
  provider: string;
  model: string;
  messages: ClaraChatMessage[];
  session_id?: string;
  context?: string;
  context_type?: string;
}

export type ClaraChatRequest =
  | ClaraChatRequestSavedKey
  | ClaraChatRequestInlineKey;

export interface AiKeySummary {
  id: string;
  provider: string;
  label: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Session types ──────────────────────────────────────────────────────────────

export interface MeasureContext {
  measure_name?: string;
  library_name?: string;
  description?: string;
  model?: string;
}

export interface ChatSessionMessage {
  role: string;
  content: string;
}

export interface ChatSessionSummary {
  id: string;
  measure_id: string;
  message_count: number;
  context: MeasureContext;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionDetail {
  id: string;
  measure_id: string;
  messages: ChatSessionMessage[];
  context: MeasureContext;
  created_at: string;
  updated_at: string;
}

const BASE_URL = "http://localhost:8091/api";

export class AIServiceApi {
  constructor(private getAccessToken: () => string) {}

  private authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getAccessToken()}`,
    };
  }

  async claraChat(request: ClaraChatRequest): Promise<any> {
    const response = await fetch(`${BASE_URL}/ai/completions`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ClaraChat request failed [${response.status} ${response.statusText}]: ${errorText}`
      );
    }
    return response.json();
  }

  async listKeys(): Promise<AiKeySummary[]> {
    const response = await fetch(`${BASE_URL}/ai/keys`, {
      headers: this.authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to list keys: ${response.status}`);
    return response.json();
  }

  async saveKey(
    provider: string,
    apiKey: string,
    label?: string
  ): Promise<AiKeySummary> {
    const response = await fetch(`${BASE_URL}/ai/keys`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({
        provider,
        api_key: apiKey,
        label: label ?? `CLARA - ${provider}`,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save key: ${errorText}`);
    }
    return response.json();
  }

  async deleteKey(keyId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/ai/keys/${keyId}`, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to delete key: ${response.status}`);
  }

  // ── Session methods ──────────────────────────────────────────────────────────

  async createSession(
    measureId: string,
    context?: MeasureContext
  ): Promise<ChatSessionDetail> {
    const response = await fetch(`${BASE_URL}/ai/sessions`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({ measure_id: measureId, context: context ?? {} }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create session: ${errorText}`);
    }
    return response.json();
  }

  async getSession(sessionId: string): Promise<ChatSessionDetail> {
    const response = await fetch(`${BASE_URL}/ai/sessions/${sessionId}`, {
      headers: this.authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to get session: ${response.status}`);
    return response.json();
  }

  async listSessions(measureId?: string): Promise<ChatSessionSummary[]> {
    const url = new URL(`${BASE_URL}/ai/sessions`);
    if (measureId) url.searchParams.set("measure_id", measureId);
    const response = await fetch(url.toString(), {
      headers: this.authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to list sessions: ${response.status}`);
    return response.json();
  }

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/ai/sessions/${sessionId}`, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Failed to delete session: ${response.status}`);
  }

  claraChatStream(
    request: ClaraChatRequest,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): { abort: () => void } {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/ai/completions/stream`, {
          method: "POST",
          headers: this.authHeaders(),
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Stream request failed [${response.status} ${response.statusText}]: ${errorText}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const dataStr = line.slice(5).trim();
              if (!dataStr) continue;
              try {
                const data = JSON.parse(dataStr);
                if (currentEvent === "chunk" && data.content) {
                  onChunk(data.content);
                } else if (currentEvent === "done") {
                  onDone();
                  return;
                } else if (currentEvent === "error") {
                  throw new Error(data.error || "Stream error");
                }
              } catch (parseErr) {
                if (parseErr instanceof SyntaxError) continue;
                throw parseErr;
              }
            }
          }
        }
        // Stream ended without a done event — treat as done
        onDone();
      } catch (err: any) {
        if (err.name === "AbortError") return;
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    })();

    return { abort: () => controller.abort() };
  }

  async compactSession(
    sessionId: string,
    keyId: string,
    model?: string
  ): Promise<ChatSessionDetail> {
    const response = await fetch(
      `${BASE_URL}/ai/sessions/${sessionId}/compact`,
      {
        method: "POST",
        headers: this.authHeaders(),
        body: JSON.stringify({ key_id: keyId, model: model ?? "gpt-4o-mini" }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to compact session: ${errorText}`);
    }
    return response.json();
  }
}

export default async function useAIServiceApi(): Promise<AIServiceApi> {
  const { getAccessToken } = useOktaTokens();
  return new AIServiceApi(getAccessToken);
}
