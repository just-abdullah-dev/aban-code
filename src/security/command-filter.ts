/**
 * List of dangerous command patterns that should be blocked
 */
const DANGEROUS_PATTERNS = [
  // Destructive file operations
  /rm\s+(-rf|-fr|-r|-f)\s+\//,  // rm -rf /, rm -r /, etc.
  /rm\s+(-rf|-fr)\s+\*/,         // rm -rf *
  /rmdir\s+\/\s+(-s|-r)/,        // rmdir / -s
  /del\s+\/[sS]\s+\*/,           // Windows: del /S *
  /rd\s+\/[sS]\s+\\/,            // Windows: rd /S \

  // Disk operations
  /\bdd\s+if=/,                  // dd command (can wipe disks)
  /\bmkfs\./,                    // Format filesystem
  /\bfdisk\b/,                   // Disk partitioning
  /\bparted\b/,                  // Disk partitioning

  // Privilege escalation
  /\bsudo\s+rm/,                 // sudo rm
  /\bsudo\s+dd/,                 // sudo dd
  /\bsudo\s+.*>/,                // sudo with redirection

  // Dangerous permissions
  /chmod\s+777/,                 // chmod 777 (world writable)
  /chmod\s+-R\s+777/,            // chmod -R 777

  // System control
  /\bshutdown\b/,                // System shutdown
  /\breboot\b/,                  // System reboot
  /\bhalt\b/,                    // System halt
  /\bpoweroff\b/,                // Power off

  // Fork bombs and resource exhaustion
  /:\(\)\{.*:\|:.*\};:/,         // Fork bomb pattern
  /\bwhile true.*do\b/,          // Infinite loops (basic)

  // Dangerous writes
  />\s*\/dev\/sd[a-z]/,          // Write to disk devices
  />\s*\/dev\/hd[a-z]/,          // Write to disk devices
  />\s*\/etc\//,                 // Write to /etc

  // Package manager dangers
  /npm\s+install\s+-g.*sudo/,    // Global npm with sudo
  /pip\s+install.*--break-system-packages/, // Break system Python
];

/**
 * Commands that should always be allowed (whitelist)
 */
const SAFE_COMMANDS = [
  /^git\s+/,
  /^npm\s+(install|i|ci|run|test|build)/,
  /^yarn\s+(install|add|run|test|build)/,
  /^pnpm\s+(install|add|run|test|build)/,
  /^node\s+/,
  /^python\s+/,
  /^python3\s+/,
  /^ls\s+/,
  /^dir\s+/,
  /^cat\s+/,
  /^type\s+/,
  /^echo\s+/,
  /^mkdir\s+/,
  /^touch\s+/,
  /^grep\s+/,
  /^find\s+/,
  /^code\s+/,
  /^vim\s+/,
  /^nano\s+/,
];

/**
 * Check if a command is allowed to execute
 */
export function isCommandAllowed(command: string): boolean {
  const trimmedCommand = command.trim();

  // Check if command matches safe patterns
  for (const safePattern of SAFE_COMMANDS) {
    if (safePattern.test(trimmedCommand)) {
      // Even safe commands shouldn't contain dangerous patterns
      for (const dangerousPattern of DANGEROUS_PATTERNS) {
        if (dangerousPattern.test(trimmedCommand)) {
          return false;
        }
      }
      return true;
    }
  }

  // Check for dangerous patterns
  for (const dangerousPattern of DANGEROUS_PATTERNS) {
    if (dangerousPattern.test(trimmedCommand)) {
      return false;
    }
  }

  // Unknown commands are allowed but will require user confirmation
  return true;
}

/**
 * Get the reason why a command was blocked
 */
export function getBlockReason(command: string): string | null {
  const trimmedCommand = command.trim();

  for (const dangerousPattern of DANGEROUS_PATTERNS) {
    if (dangerousPattern.test(trimmedCommand)) {
      return `Command matches dangerous pattern: ${dangerousPattern.toString()}`;
    }
  }

  return null;
}

/**
 * Check if a command is in the safe list
 */
export function isCommandSafe(command: string): boolean {
  const trimmedCommand = command.trim();

  for (const safePattern of SAFE_COMMANDS) {
    if (safePattern.test(trimmedCommand)) {
      return true;
    }
  }

  return false;
}
