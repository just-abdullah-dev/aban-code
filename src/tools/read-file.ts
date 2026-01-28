import { promises as fs } from 'fs';
import { ToolResult } from './index.js';
import { validatePath } from '../security/sandbox.js';

export interface ReadFileArgs {
  path: string;
}

/**
 * Read the contents of a file
 */
export async function readFile(args: Record<string, any>): Promise<ToolResult> {
  // Validate arguments
  if (!args.path || typeof args.path !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "path" argument',
    };
  }

  const { path } = args as ReadFileArgs;

  try {
    // Validate path is safe (sandboxing)
    const safePath = validatePath(path);

    // Read file
    const content = await fs.readFile(safePath, 'utf-8');

    return {
      success: true,
      data: {
        path: safePath,
        content,
        size: content.length,
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        success: false,
        error: `File not found: ${path}`,
      };
    }

    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return {
        success: false,
        error: `Permission denied: ${path}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
