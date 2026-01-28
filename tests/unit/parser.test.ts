import { describe, it, expect } from 'vitest';
import { parseToolCalls, hasDoneToolCall, getDoneMessage } from '../../src/agent/parser.js';

describe('parseToolCalls', () => {
  it('should parse JSON code blocks', () => {
    const text = `
I will read the file.

\`\`\`json
{
  "tool": "read_file",
  "args": {
    "path": "test.txt"
  }
}
\`\`\`
`;

    const toolCalls = parseToolCalls(text);

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0].tool).toBe('read_file');
    expect(toolCalls[0].args.path).toBe('test.txt');
  });

  it('should parse multiple tool calls', () => {
    const text = `
\`\`\`json
{
  "tool": "read_file",
  "args": {
    "path": "test.txt"
  }
}
\`\`\`

\`\`\`json
{
  "tool": "write_file",
  "args": {
    "path": "output.txt",
    "content": "Hello"
  }
}
\`\`\`
`;

    const toolCalls = parseToolCalls(text);

    expect(toolCalls).toHaveLength(2);
    expect(toolCalls[0].tool).toBe('read_file');
    expect(toolCalls[1].tool).toBe('write_file');
  });

  it('should return empty array for text without tool calls', () => {
    const text = 'Just a regular response without any tools';

    const toolCalls = parseToolCalls(text);

    expect(toolCalls).toHaveLength(0);
  });

  it('should handle malformed JSON gracefully', () => {
    const text = `
\`\`\`json
{
  "tool": "read_file"
  "args": "missing comma"
}
\`\`\`
`;

    const toolCalls = parseToolCalls(text);

    expect(toolCalls).toHaveLength(0);
  });
});

describe('hasDoneToolCall', () => {
  it('should detect done tool call', () => {
    const toolCalls = [
      { tool: 'read_file', args: { path: 'test.txt' } },
      { tool: 'done', args: { message: 'Complete' } },
    ];

    expect(hasDoneToolCall(toolCalls)).toBe(true);
  });

  it('should return false when no done tool call', () => {
    const toolCalls = [
      { tool: 'read_file', args: { path: 'test.txt' } },
    ];

    expect(hasDoneToolCall(toolCalls)).toBe(false);
  });
});

describe('getDoneMessage', () => {
  it('should extract done message', () => {
    const toolCalls = [
      { tool: 'done', args: { message: 'Task completed successfully!' } },
    ];

    const message = getDoneMessage(toolCalls);

    expect(message).toBe('Task completed successfully!');
  });

  it('should return null when no done tool call', () => {
    const toolCalls = [
      { tool: 'read_file', args: { path: 'test.txt' } },
    ];

    const message = getDoneMessage(toolCalls);

    expect(message).toBe(null);
  });
});
