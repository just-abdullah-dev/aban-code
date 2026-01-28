/**
 * Application configuration
 */
export interface Config {
  ollamaBaseUrl: string;
  defaultModel: string;
  maxIterations: number;
  debug: boolean;
}

/**
 * Default configuration values
 */
const defaults: Config = {
  ollamaBaseUrl: 'http://localhost:11434',
  defaultModel: 'qwen2.5-coder:7b',
  maxIterations: 15,
  debug: false,
};

/**
 * Load configuration from environment variables and defaults
 */
export function loadConfig(): Config {
  return {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || defaults.ollamaBaseUrl,
    defaultModel: process.env.OLLAMA_MODEL || defaults.defaultModel,
    maxIterations: parseInt(process.env.MAX_ITERATIONS || String(defaults.maxIterations), 10),
    debug: process.env.DEBUG === 'true' || defaults.debug,
  };
}

/**
 * Override configuration with CLI options
 */
export function mergeConfig(config: Config, options: Partial<Config>): Config {
  return {
    ...config,
    ...options,
  };
}
