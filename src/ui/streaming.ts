import { colors } from './colors.js';
import { stopSpinner } from './spinner.js';

/**
 * Stream tokens to the console with formatting
 */
export class StreamRenderer {
  private currentLine = '';
  private tokenBuffer = '';

  constructor(private prefix: string = '') {}

  /**
   * Process a single token from the stream
   */
  processToken(token: string): void {
    // Stop any active spinner when first token arrives
    if (this.tokenBuffer === '' && this.currentLine === '') {
      stopSpinner();

      // Print prefix if provided
      if (this.prefix) {
        process.stdout.write(this.prefix + ' ');
      }
    }

    this.tokenBuffer += token;

    // Write to output
    process.stdout.write(colors.ai(token));

    // Track current line for newline handling
    if (token.includes('\n')) {
      this.currentLine = '';
    } else {
      this.currentLine += token;
    }
  }

  /**
   * Finalize the stream (add newline if needed)
   */
  finalize(): string {
    if (this.currentLine && !this.currentLine.endsWith('\n')) {
      process.stdout.write('\n');
    }

    const result = this.tokenBuffer;
    this.reset();
    return result;
  }

  /**
   * Reset the renderer state
   */
  reset(): void {
    this.currentLine = '';
    this.tokenBuffer = '';
  }

  /**
   * Get the accumulated text
   */
  getAccumulated(): string {
    return this.tokenBuffer;
  }
}

/**
 * Render a complete message (non-streaming)
 */
export function renderMessage(message: string, prefix?: string): void {
  if (prefix) {
    console.log(`${prefix} ${message}`);
  } else {
    console.log(message);
  }
}

/**
 * Render a multiline message with indentation
 */
export function renderMultiline(message: string, indent: number = 2): void {
  const lines = message.split('\n');
  const indentation = ' '.repeat(indent);

  for (const line of lines) {
    console.log(indentation + line);
  }
}

/**
 * Clear the current line
 */
export function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

/**
 * Move cursor up N lines
 */
export function moveCursorUp(lines: number): void {
  process.stdout.write(`\x1b[${lines}A`);
}

/**
 * Move cursor down N lines
 */
export function moveCursorDown(lines: number): void {
  process.stdout.write(`\x1b[${lines}B`);
}
