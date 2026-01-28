import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';

/**
 * Request user confirmation for a command execution
 */
export async function confirmCommand(command: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n' + chalk.yellow('⚠️  Command execution requested:'));
    console.log(chalk.cyan(`   ${command}`));
    console.log();

    const answer = await rl.question(chalk.bold('Proceed? (y/n) '));

    const confirmed = answer.toLowerCase().trim() === 'y' ||
                     answer.toLowerCase().trim() === 'yes';

    if (!confirmed) {
      console.log(chalk.red('✗ Command execution cancelled'));
    }

    return confirmed;
  } finally {
    rl.close();
  }
}

/**
 * Request user confirmation with custom message
 */
export async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question(chalk.bold(`${message} (y/n) `));

    return answer.toLowerCase().trim() === 'y' ||
           answer.toLowerCase().trim() === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * Display a warning message
 */
export function warn(message: string): void {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

/**
 * Display an error message
 */
export function error(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * Display a success message
 */
export function success(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}
