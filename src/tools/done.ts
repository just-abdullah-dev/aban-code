import { ToolResult } from './index.js';

export interface DoneArgs {
  message: string;
}

/**
 * Signal that the task is complete
 */
export async function done(args: Record<string, any>): Promise<ToolResult> {
  // Validate arguments
  if (!args.message || typeof args.message !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "message" argument',
    };
  }

  const { message } = args as DoneArgs;

  return {
    success: true,
    data: {
      message,
      completed: true,
    },
  };
}
