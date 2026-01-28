/**
 * Custom error for Ollama connection failures
 */
export class OllamaConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaConnectionError';
  }
}

/**
 * Custom error for tool execution failures
 */
export class ToolExecutionError extends Error {
  constructor(message: string, public toolName: string) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

/**
 * Custom error for agent failures
 */
export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Custom error for security violations
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: Error): string {
  if (error instanceof OllamaConnectionError) {
    return (
      `Failed to connect to Ollama.\n\n` +
      `Troubleshooting steps:\n` +
      `1. Make sure Ollama is installed: https://ollama.ai\n` +
      `2. Start the Ollama service\n` +
      `3. Verify it's running: curl http://localhost:11434/api/tags\n`
    );
  }

  if (error instanceof ToolExecutionError) {
    return `Tool "${error.toolName}" failed: ${error.message}`;
  }

  if (error instanceof AgentError) {
    return `Agent error: ${error.message}`;
  }

  if (error instanceof SecurityError) {
    return `Security error: ${error.message}`;
  }

  return error.message || 'An unknown error occurred';
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: Error): boolean {
  // Tool execution errors are recoverable (agent can try again)
  if (error instanceof ToolExecutionError) {
    return true;
  }

  // Security errors are not recoverable
  if (error instanceof SecurityError) {
    return false;
  }

  // Ollama connection errors are not recoverable
  if (error instanceof OllamaConnectionError) {
    return false;
  }

  return false;
}
