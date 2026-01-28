import { readFile } from './read-file.js';
import { writeFile } from './write-file.js';
import { runCommand } from './run-command.js';
import { done } from './done.js';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type ToolFunction = (args: Record<string, any>) => Promise<ToolResult>;

/**
 * Registry of all available tools
 */
const toolRegistry: Record<string, ToolFunction> = {
  read_file: readFile,
  write_file: writeFile,
  run_command: runCommand,
  done: done,
};

/**
 * Execute a tool by name with arguments
 */
export async function executeTool(
  toolName: string,
  args: Record<string, any>
): Promise<ToolResult> {
  const tool = toolRegistry[toolName];

  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}. Available tools: ${Object.keys(toolRegistry).join(', ')}`,
    };
  }

  try {
    return await tool(args);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get list of available tools
 */
export function getAvailableTools(): string[] {
  return Object.keys(toolRegistry);
}

/**
 * Check if a tool exists
 */
export function hasTool(toolName: string): boolean {
  return toolName in toolRegistry;
}
