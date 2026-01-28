import ora, { Ora } from 'ora';

let currentSpinner: Ora | null = null;

/**
 * Start a spinner with a message
 */
export function startSpinner(message: string): Ora {
  // Stop any existing spinner
  if (currentSpinner) {
    currentSpinner.stop();
  }

  currentSpinner = ora({
    text: message,
    color: 'cyan',
  }).start();

  return currentSpinner;
}

/**
 * Update spinner message
 */
export function updateSpinner(message: string): void {
  if (currentSpinner) {
    currentSpinner.text = message;
  }
}

/**
 * Stop spinner with success
 */
export function succeedSpinner(message?: string): void {
  if (currentSpinner) {
    if (message) {
      currentSpinner.succeed(message);
    } else {
      currentSpinner.succeed();
    }
    currentSpinner = null;
  }
}

/**
 * Stop spinner with failure
 */
export function failSpinner(message?: string): void {
  if (currentSpinner) {
    if (message) {
      currentSpinner.fail(message);
    } else {
      currentSpinner.fail();
    }
    currentSpinner = null;
  }
}

/**
 * Stop spinner with warning
 */
export function warnSpinner(message?: string): void {
  if (currentSpinner) {
    if (message) {
      currentSpinner.warn(message);
    } else {
      currentSpinner.warn();
    }
    currentSpinner = null;
  }
}

/**
 * Stop spinner with info
 */
export function infoSpinner(message?: string): void {
  if (currentSpinner) {
    if (message) {
      currentSpinner.info(message);
    } else {
      currentSpinner.info();
    }
    currentSpinner = null;
  }
}

/**
 * Stop spinner without message
 */
export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

/**
 * Check if spinner is currently active
 */
export function isSpinnerActive(): boolean {
  return currentSpinner !== null && currentSpinner.isSpinning;
}
