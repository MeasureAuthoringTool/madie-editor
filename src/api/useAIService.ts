import { useOktaTokens } from "@madie/madie-util";

export interface ClaraChatMessage {
  role: string;
  content: string;
}

export interface ClaraChatRequest {
  api_key: string;
  provider: string;
  model: string;
  messages: ClaraChatMessage[];
}

export class AIServiceApi {
  private readonly SERVICE_URL = "http://localhost:8091/api/ai/completions";

  constructor(private getAccessToken: () => string) {}

  async claraChat(request: ClaraChatRequest): Promise<any> {
    const response = await fetch(this.SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ClaraChat request failed [${response.status} ${response.statusText}]: ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error("ClaraChat response has no body / stream.");
    }
    return response.json();
  }
}

export default async function useAIServiceApi(): Promise<AIServiceApi> {
  const { getAccessToken } = useOktaTokens();
  return new AIServiceApi(getAccessToken);
}
