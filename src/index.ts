#!/usr/bin/env node

import { Command } from 'commander';
import { Agent, AgentConfig, ToolExecutor } from './agent/agent.js';
import { OllamaClient } from './llm/ollama.js';
import { executeTool } from './tools/index.js';
import { loadConfig, mergeConfig } from './utils/config.js';
import { formatErrorMessage } from './utils/errors.js';
import {
  displayUserTask,
  createResponseRenderer,
  displayToolExecution,
  displayToolResult,
  displayFinalResult,
  displayError,
  displayOllamaError,
  displayModelNotFoundError,
} from './ui/display.js';

const program = new Command();

program
  .name('ai-code')
  .description('Terminal-based AI coding assistant using local LLMs via Ollama')
  .version('1.0.0');

program
  .argument('<task>', 'Natural language description of the task to perform')
  .option('-m, --model <model>', 'Ollama model to use')
  .option('-d, --debug', 'Enable debug logging', false)
  .option('--ollama-url <url>', 'Ollama base URL')
  .action(async (task: string, options) => {
    try {
      // Load configuration
      const baseConfig = loadConfig();
      const config = mergeConfig(baseConfig, {
        defaultModel: options.model || baseConfig.defaultModel,
        debug: options.debug || baseConfig.debug,
        ollamaBaseUrl: options.ollamaUrl || baseConfig.ollamaBaseUrl,
      });

      // Validate Ollama connection
      const client = new OllamaClient(config.ollamaBaseUrl);
      const isConnected = await client.validateConnection();

      if (!isConnected) {
        displayOllamaError();
        process.exit(1);
      }

      // Check if model is available
      const hasModel = await client.hasModel(config.defaultModel);

      if (!hasModel) {
        displayModelNotFoundError(config.defaultModel);
        process.exit(1);
      }

      // Display user task
      displayUserTask(task);

      // Create tool executor
      const toolExecutor: ToolExecutor = {
        executeTool: async (toolName: string, args: Record<string, any>) => {
          return await executeTool(toolName, args);
        },
      };

      // Create agent configuration
      const agentConfig: AgentConfig = {
        model: config.defaultModel,
        maxIterations: config.maxIterations,
        ollamaBaseUrl: config.ollamaBaseUrl,
        debug: config.debug,
      };

      // Create and run agent
      const agent = new Agent(agentConfig, toolExecutor);

      // Create stream renderer for token streaming
      const renderer = createResponseRenderer();

      const result = await agent.run(
        task,
        // onToken callback - handle streaming
        (token: string) => {
          renderer.processToken(token);
        },
        // onToolCall callback
        (toolName: string, args: any) => {
          displayToolExecution(toolName, args);
        },
        // onToolResult callback
        (result: any) => {
          displayToolResult(result);
        }
      );

      // Display final result
      displayFinalResult(result.success, result.message);

      // Exit with appropriate code
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? formatErrorMessage(error)
        : String(error);

      displayError(errorMessage);
      process.exit(1);
    }
  });

program.parse();
