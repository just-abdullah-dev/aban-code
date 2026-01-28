export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaChatOptions {
  model: string;
  messages: Message[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Stream chat completions from Ollama
   */
  async *streamChat(
    messages: Message[],
    model: string = 'qwen2.5-coder:7b'
  ): AsyncGenerator<string, void, unknown> {
    const requestBody: OllamaChatOptions = {
      model,
      messages,
      stream: true,
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      throw new Error(
        `Failed to connect to Ollama at ${this.baseUrl}. ` +
        `Is Ollama running? Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama API error (${response.status}): ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error('No response body from Ollama');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed: OllamaResponse = JSON.parse(line);

              if (parsed.message?.content) {
                yield parsed.message.content;
              }

              if (parsed.done) {
                return;
              }
            } catch (parseError) {
              console.error('Failed to parse Ollama response line:', line);
              continue;
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const parsed: OllamaResponse = JSON.parse(buffer);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch (parseError) {
          // Ignore final parse errors
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Validate connection to Ollama
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific model is available
   */
  async hasModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json() as { models?: Array<{ name: string }> };
      const models = data.models || [];

      return models.some((model: any) =>
        model.name === modelName || model.name.startsWith(`${modelName}:`)
      );
    } catch {
      return false;
    }
  }
}
