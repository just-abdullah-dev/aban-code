import { promises as fs } from 'fs';
import { dirname } from 'path';
import { ToolResult } from './index.js';
import { validatePath } from '../security/sandbox.js';

export interface WriteFileArgs {
  path: string;
  content: string;
}

/**
 * Write content to a file (creates parent directories if needed)
 */
export async function writeFile(args: Record<string, any>): Promise<ToolResult> {
  // Validate arguments
  if (!args.path || typeof args.path !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "path" argument',
    };
  }

  if (args.content === undefined || typeof args.content !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "content" argument',
    };
  }

  const { path, content } = args as WriteFileArgs;

  try {
    // Validate path is safe (sandboxing)
    const safePath = validatePath(path);

    // Create parent directories if they don't exist
    const dir = dirname(safePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(safePath, content, 'utf-8');

    return {
      success: true,
      data: {
        path: safePath,
        size: content.length,
        message: `Successfully wrote ${content.length} characters to ${path}`,
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return {
        success: false,
        error: `Permission denied: ${path}`,
      };
    }

    if ((error as NodeJS.ErrnoException).code === 'ENOSPC') {
      return {
        success: false,
        error: 'No space left on device',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
