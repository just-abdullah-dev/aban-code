export interface ToolCall {
  tool: string;
  args: Record<string, any>;
}

/**
 * Extract tool calls from AI response text
 * Looks for JSON blocks containing tool calls
 */
export function parseToolCalls(text: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];

  // Pattern 1: JSON code blocks with ```json
  const jsonBlockPattern = /```json\s*\n([\s\S]*?)\n```/g;
  let match;

  while ((match = jsonBlockPattern.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);

      if (isValidToolCall(parsed)) {
        toolCalls.push(parsed);
      }
    } catch (error) {
      // Invalid JSON in code block, skip
      continue;
    }
  }

  // Pattern 2: Standalone JSON objects (not in code blocks)
  if (toolCalls.length === 0) {
    const standaloneJsonPattern = /\{[\s\S]*?"tool"\s*:[\s\S]*?"args"\s*:[\s\S]*?\}/g;

    while ((match = standaloneJsonPattern.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);

        if (isValidToolCall(parsed)) {
          toolCalls.push(parsed);
        }
      } catch (error) {
        // Invalid JSON, skip
        continue;
      }
    }
  }

  return toolCalls;
}

/**
 * Validate that a parsed object is a valid tool call
 */
function isValidToolCall(obj: any): obj is ToolCall {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.tool === 'string' &&
    obj.tool.length > 0 &&
    typeof obj.args === 'object' &&
    obj.args !== null
  );
}

/**
 * Extract plain text from response (remove tool call JSON)
 */
export function extractPlainText(text: string): string {
  // Remove JSON code blocks
  let cleaned = text.replace(/```json\s*\n[\s\S]*?\n```/g, '');

  // Remove standalone JSON tool calls
  cleaned = cleaned.replace(/\{[\s\S]*?"tool"\s*:[\s\S]*?"args"\s*:[\s\S]*?\}/g, '');

  return cleaned.trim();
}

/**
 * Check if response contains a "done" tool call
 */
export function hasDoneToolCall(toolCalls: ToolCall[]): boolean {
  return toolCalls.some(call => call.tool === 'done');
}

/**
 * Get the done tool call message
 */
export function getDoneMessage(toolCalls: ToolCall[]): string | null {
  const doneCall = toolCalls.find(call => call.tool === 'done');

  if (doneCall && typeof doneCall.args.message === 'string') {
    return doneCall.args.message;
  }

  return null;
}
