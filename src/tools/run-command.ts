import { execa } from 'execa';
import { ToolResult } from './index.js';
import { isCommandAllowed } from '../security/command-filter.js';
import { confirmCommand } from '../security/confirmation.js';

export interface RunCommandArgs {
  command: string;
}

/**
 * Execute a shell command
 */
export async function runCommand(args: Record<string, any>): Promise<ToolResult> {
  // Validate arguments
  if (!args.command || typeof args.command !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "command" argument',
    };
  }

  const { command } = args as RunCommandArgs;

  try {
    // Check if command is allowed (security filter)
    if (!isCommandAllowed(command)) {
      return {
        success: false,
        error: `Command blocked for security reasons: ${command}`,
      };
    }

    // Request user confirmation
    const confirmed = await confirmCommand(command);

    if (!confirmed) {
      return {
        success: false,
        error: 'Command execution cancelled by user',
      };
    }

    // Execute command
    const result = await execa(command, {
      shell: true,
      timeout: 300000, // 5 minute timeout
      reject: false, // Don't throw on non-zero exit codes
    });

    return {
      success: result.exitCode === 0,
      data: {
        command,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      },
    };
  } catch (error) {
    if ((error as any).isCanceled) {
      return {
        success: false,
        error: 'Command execution timed out',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
