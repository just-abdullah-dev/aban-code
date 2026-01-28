import {
  formatUserMessage,
  formatToolMessage,
  formatError,
  formatSuccess,
  separator,
  prefixes,
} from './colors.js';
import { startSpinner } from './spinner.js';
import { StreamRenderer } from './streaming.js';

/**
 * Display the user's task
 */
export function displayUserTask(task: string): void {
  console.log();
  console.log(formatUserMessage(task));
  console.log();
}

/**
 * Display AI thinking spinner
 */
export function displayThinking(): void {
  startSpinner('AI is thinking...');
}

/**
 * Display AI response with streaming
 */
export function createResponseRenderer(): StreamRenderer {
  return new StreamRenderer(prefixes.ai);
}

/**
 * Display tool execution
 */
export function displayToolExecution(toolName: string, args: any): void {
  console.log();
  console.log(formatToolMessage(toolName, args));
}

/**
 * Display tool result
 */
export function displayToolResult(result: any): void {
  if (result.success) {
    if (result.data?.message) {
      console.log(formatSuccess(result.data.message));
    } else if (result.data?.content) {
      // For read_file, show snippet of content
      console.log(formatSuccess(`Read ${result.data.size} characters`));
    } else if (result.data?.stdout) {
      // For run_command, show output
      console.log(result.data.stdout);
      if (result.data.stderr) {
        console.error(result.data.stderr);
      }
    } else {
      console.log(formatSuccess('Done'));
    }
  } else {
    console.log(formatError(result.error || 'Tool execution failed'));
  }
}

/**
 * Display final result
 */
export function displayFinalResult(success: boolean, message: string): void {
  console.log();
  console.log(separator());

  if (success) {
    console.log(formatSuccess(message));
  } else {
    console.log(formatError(message));
  }

  console.log();
}

/**
 * Display error
 */
export function displayError(error: string): void {
  console.log();
  console.log(formatError(error));
  console.log();
}

/**
 * Display welcome message
 */
export function displayWelcome(): void {
  console.log();
  console.log('🤖 AI Code CLI');
  console.log(separator());
}

/**
 * Display Ollama connection error
 */
export function displayOllamaError(): void {
  console.log();
  console.log(formatError('Failed to connect to Ollama'));
  console.log();
  console.log('Make sure Ollama is running:');
  console.log('  1. Install Ollama: https://ollama.ai');
  console.log('  2. Start Ollama service');
  console.log('  3. Pull a model: ollama pull qwen2.5-coder:7b');
  console.log();
}

/**
 * Display model not found error
 */
export function displayModelNotFoundError(model: string): void {
  console.log();
  console.log(formatError(`Model not found: ${model}`));
  console.log();
  console.log('Pull the model with:');
  console.log(`  ollama pull ${model}`);
  console.log();
}
