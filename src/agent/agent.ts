import { OllamaClient, Message } from '../llm/ollama.js';
import { buildSystemMessage } from './prompt.js';
import { parseToolCalls, hasDoneToolCall, getDoneMessage } from './parser.js';

export interface AgentConfig {
  model: string;
  maxIterations: number;
  ollamaBaseUrl?: string;
  debug?: boolean;
}

export interface AgentResult {
  success: boolean;
  message: string;
  iterations: number;
  error?: string;
}

export interface ToolExecutor {
  executeTool(toolName: string, args: Record<string, any>): Promise<any>;
}

export class Agent {
  private client: OllamaClient;
  private config: AgentConfig;
  private toolExecutor: ToolExecutor;
  private messages: Message[] = [];
  private iterationCount = 0;

  constructor(config: AgentConfig, toolExecutor: ToolExecutor) {
    this.config = config;
    this.client = new OllamaClient(config.ollamaBaseUrl);
    this.toolExecutor = toolExecutor;

    // Initialize with system message
    this.messages.push({
      role: 'system',
      content: buildSystemMessage(),
    });
  }

  /**
   * Run the agent with a user task
   */
  async run(
    task: string,
    onToken?: (token: string) => void,
    onToolCall?: (tool: string, args: any) => void,
    onToolResult?: (result: any) => void
  ): Promise<AgentResult> {
    // Add user task to messages
    this.messages.push({
      role: 'user',
      content: task,
    });

    try {
      // Main ReAct loop
      while (this.iterationCount < this.config.maxIterations) {
        this.iterationCount++;

        if (this.config.debug) {
          console.log(`\n[Debug] Iteration ${this.iterationCount}/${this.config.maxIterations}`);
        }

        // Get AI response
        const response = await this.getAIResponse(onToken);

        // Add assistant response to history
        this.messages.push({
          role: 'assistant',
          content: response,
        });

        // Parse tool calls from response
        const toolCalls = parseToolCalls(response);

        if (this.config.debug) {
          console.log(`[Debug] Found ${toolCalls.length} tool call(s)`);
        }

        // Check if done
        if (hasDoneToolCall(toolCalls)) {
          const message = getDoneMessage(toolCalls) || 'Task completed';

          return {
            success: true,
            message,
            iterations: this.iterationCount,
          };
        }

        // Execute tool calls
        if (toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            // Skip done tool (already handled above)
            if (toolCall.tool === 'done') {
              continue;
            }

            if (onToolCall) {
              onToolCall(toolCall.tool, toolCall.args);
            }

            try {
              const result = await this.toolExecutor.executeTool(
                toolCall.tool,
                toolCall.args
              );

              if (onToolResult) {
                onToolResult(result);
              }

              // Add tool result to conversation
              this.messages.push({
                role: 'user',
                content: `Tool "${toolCall.tool}" result:\n${JSON.stringify(result, null, 2)}`,
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);

              // Add error to conversation so AI can handle it
              this.messages.push({
                role: 'user',
                content: `Tool "${toolCall.tool}" error: ${errorMessage}`,
              });
            }
          }
        } else {
          // No tool calls found - AI might be just explaining
          // Continue to next iteration
          if (this.config.debug) {
            console.log('[Debug] No tool calls in response, continuing...');
          }
        }
      }

      // Max iterations reached
      return {
        success: false,
        message: 'Maximum iterations reached without completion',
        iterations: this.iterationCount,
        error: 'MAX_ITERATIONS',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Agent failed: ${errorMessage}`,
        iterations: this.iterationCount,
        error: errorMessage,
      };
    }
  }

  /**
   * Get AI response via streaming
   */
  private async getAIResponse(onToken?: (token: string) => void): Promise<string> {
    let fullResponse = '';

    try {
      const stream = this.client.streamChat(this.messages, this.config.model);

      for await (const token of stream) {
        fullResponse += token;

        if (onToken) {
          onToken(token);
        }
      }

      return fullResponse;
    } catch (error) {
      throw new Error(
        `Failed to get AI response: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current conversation history
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Get iteration count
   */
  getIterationCount(): number {
    return this.iterationCount;
  }
}
