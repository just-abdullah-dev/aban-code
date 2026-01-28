import chalk from 'chalk';

/**
 * Color scheme for the CLI
 */
export const colors = {
  user: chalk.cyan,
  ai: chalk.green,
  tool: chalk.yellow,
  error: chalk.red,
  success: chalk.green,
  warning: chalk.yellow,
  info: chalk.blue,
  dim: chalk.dim,
  bold: chalk.bold,
};

/**
 * Prefixes for different message types
 */
export const prefixes = {
  user: colors.user('❯'),
  ai: colors.ai('🤖'),
  tool: colors.tool('📝'),
  thinking: colors.dim('🧠'),
  error: colors.error('✗'),
  success: colors.success('✓'),
  warning: colors.warning('⚠️'),
  info: colors.info('ℹ'),
};

/**
 * Format user message
 */
export function formatUserMessage(message: string): string {
  return `${prefixes.user} ${colors.user(message)}`;
}

/**
 * Format AI message
 */
export function formatAIMessage(message: string): string {
  return colors.ai(message);
}

/**
 * Format tool execution message
 */
export function formatToolMessage(toolName: string, args?: any): string {
  if (args) {
    return `${prefixes.tool} ${colors.tool(toolName)}: ${colors.dim(JSON.stringify(args))}`;
  }
  return `${prefixes.tool} ${colors.tool(toolName)}`;
}

/**
 * Format error message
 */
export function formatError(message: string): string {
  return `${prefixes.error} ${colors.error(message)}`;
}

/**
 * Format success message
 */
export function formatSuccess(message: string): string {
  return `${prefixes.success} ${colors.success(message)}`;
}

/**
 * Format warning message
 */
export function formatWarning(message: string): string {
  return `${prefixes.warning} ${colors.warning(message)}`;
}

/**
 * Format info message
 */
export function formatInfo(message: string): string {
  return `${prefixes.info} ${colors.info(message)}`;
}

/**
 * Create a separator line
 */
export function separator(char: string = '─', length: number = 50): string {
  return colors.dim(char.repeat(length));
}

/**
 * Create a section header
 */
export function sectionHeader(title: string): string {
  return colors.bold(colors.info(title));
}
