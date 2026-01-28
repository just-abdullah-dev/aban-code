# AI Code CLI

A terminal-based AI coding assistant that uses local LLMs via Ollama to help you with software development tasks.

## Features

- 🤖 Natural language task execution
- 📝 File reading and writing
- 🔧 Shell command execution with safety checks
- 🔒 Built-in security sandbox
- 🎨 Beautiful terminal UI with streaming responses
- 🚀 Fast local LLM inference via Ollama

## Prerequisites

1. **Node.js 18+**: [Download Node.js](https://nodejs.org/)
2. **Ollama**: [Install Ollama](https://ollama.ai)
3. **LLM Model**: Pull a code model (recommended: qwen2.5-coder:7b)

## Installation

### Option 1: Install Globally (Recommended)

```bash
npm install -g ai-code-cli
```

### Option 2: Install Locally

```bash
npm install ai-code-cli
npx ai-code "your task here"
```

### Option 3: Build from Source

```bash
git clone <repository-url>
cd cli_tool
npm install
npm run build
npm link
```

## Setup Ollama

1. **Install Ollama**:
   - Visit [ollama.ai](https://ollama.ai) and follow installation instructions
   - On Windows, download and run the installer
   - On macOS: `brew install ollama`
   - On Linux: `curl -fsSL https://ollama.ai/install.sh | sh`

2. **Start Ollama Service**:
   ```bash
   # Ollama usually starts automatically after installation
   # To verify it's running:
   curl http://localhost:11434/api/tags
   ```

3. **Pull a Code Model**:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```

   Other recommended models:
   - `deepseek-coder:6.7b` - DeepSeek Coder
   - `codellama:7b` - Meta's Code Llama
   - `qwen2.5-coder:14b` - Larger Qwen model (requires more RAM)

## Usage

### Basic Usage

```bash
ai-code "create a hello world file"
```

### Examples

**Create a file:**
```bash
ai-code "create a file named hello.txt with the content 'Hello, World!'"
```

**Generate code:**
```bash
ai-code "create a simple Express.js server in server.js"
```

**Read and modify:**
```bash
ai-code "read package.json and add a new script called 'dev'"
```

**Run commands:**
```bash
ai-code "install express using npm"
```

**Multi-step tasks:**
```bash
ai-code "create a React component for a login form with email and password fields"
```

### CLI Options

```bash
ai-code [options] <task>

Options:
  -V, --version          Output version number
  -m, --model <model>    Specify Ollama model (default: qwen2.5-coder:7b)
  -d, --debug            Enable debug logging
  --ollama-url <url>     Custom Ollama URL (default: http://localhost:11434)
  -h, --help             Display help
```

### Examples with Options

**Use a different model:**
```bash
ai-code -m deepseek-coder:6.7b "create a Python script"
```

**Enable debug mode:**
```bash
ai-code -d "create a test file"
```

**Custom Ollama URL:**
```bash
ai-code --ollama-url http://192.168.1.100:11434 "your task"
```

## How It Works

AI Code CLI uses a ReAct (Reasoning and Acting) agent loop:

1. **User Input**: You provide a natural language task
2. **AI Planning**: The LLM analyzes the task and plans actions
3. **Tool Execution**: The AI calls tools (read_file, write_file, run_command)
4. **Iteration**: The AI receives results and continues until task completion
5. **Completion**: The AI calls the "done" tool to signal success

### Available Tools

The AI has access to 4 tools:

1. **read_file**: Read file contents
2. **write_file**: Create or overwrite files
3. **run_command**: Execute shell commands (requires user confirmation)
4. **done**: Signal task completion

## Security Features

AI Code CLI includes multiple security layers:

### Path Sandboxing
- All file operations are restricted to the current project directory
- Prevents directory traversal attacks (e.g., `../../etc/passwd`)
- Blocks access to sensitive files (`.env`, SSH keys, etc.)

### Command Filtering
- Blocks destructive commands (`rm -rf /`, `sudo`, `chmod 777`, etc.)
- Validates all shell commands before execution
- Maintains a whitelist of safe commands

### User Confirmation
- **ALL** shell commands require user approval before execution
- Clear preview of what will be executed
- Easy y/n prompt for safety

### Iteration Limits
- Maximum 15 iterations per task (configurable)
- Prevents infinite loops
- Timeout handling for long-running processes

## Configuration

### Environment Variables

```bash
# Custom Ollama URL
export OLLAMA_BASE_URL=http://localhost:11434

# Default model
export OLLAMA_MODEL=qwen2.5-coder:7b

# Maximum iterations
export MAX_ITERATIONS=15

# Enable debug mode
export DEBUG=true
```

### Configuration File

Create `.ai-code.json` in your project root (coming soon):

```json
{
  "model": "qwen2.5-coder:7b",
  "maxIterations": 15,
  "ollamaUrl": "http://localhost:11434"
}
```

## Troubleshooting

### "Failed to connect to Ollama"

**Solution**:
1. Verify Ollama is installed: `ollama --version`
2. Check if Ollama is running: `curl http://localhost:11434/api/tags`
3. Start Ollama if not running (it usually auto-starts)
4. Try `ollama serve` to start manually

### "Model not found: qwen2.5-coder:7b"

**Solution**:
```bash
ollama pull qwen2.5-coder:7b
```

List available models:
```bash
ollama list
```

### "Command blocked for security reasons"

**Reason**: The command matched a dangerous pattern (e.g., `rm -rf`, `sudo`)

**Solution**:
- Manually run safe commands outside the CLI
- Check if the command is truly necessary
- File an issue if you believe a safe command is being blocked

### "Path outside project directory"

**Reason**: Attempted to access files outside the current working directory

**Solution**:
- Use relative paths within your project
- Navigate to the correct project directory first
- Security feature - cannot be disabled

### Command confirmation not appearing

**Reason**: Streaming output may interfere with prompts

**Solution**:
- Press Enter if you see a blank line
- The prompt is there, just not visible during streaming

## Performance Tips

1. **Use smaller models for faster responses**:
   - `qwen2.5-coder:7b` - Good balance
   - Larger models (14b, 34b) are more capable but slower

2. **Keep tasks focused and specific**:
   - Instead of: "build a web app"
   - Try: "create a simple Express server with one GET endpoint"

3. **Enable debug mode** to see what's happening:
   ```bash
   ai-code -d "your task"
   ```

## Limitations

- Requires Ollama to be running locally
- Model must be downloaded first (can be several GB)
- Performance depends on your hardware (GPU recommended)
- Cannot access network APIs or external services directly
- Limited to text-based file operations

## Project Structure

```
cli_tool/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── agent/                # Agent core
│   │   ├── agent.ts          # ReAct loop orchestrator
│   │   ├── prompt.ts         # System prompt
│   │   └── parser.ts         # Tool call parser
│   ├── llm/                  # LLM integration
│   │   ├── ollama.ts         # Ollama HTTP client
│   │   └── stream.ts         # Stream utilities
│   ├── tools/                # Tool implementations
│   │   ├── index.ts          # Tool registry
│   │   ├── read-file.ts      # File reading
│   │   ├── write-file.ts     # File writing
│   │   ├── run-command.ts    # Command execution
│   │   └── done.ts           # Task completion
│   ├── security/             # Security layer
│   │   ├── sandbox.ts        # Path validation
│   │   ├── command-filter.ts # Command blocking
│   │   └── confirmation.ts   # User prompts
│   ├── ui/                   # Terminal UI
│   │   ├── display.ts        # UI orchestrator
│   │   ├── streaming.ts      # Token rendering
│   │   ├── spinner.ts        # Spinners
│   │   └── colors.ts         # Color scheme
│   └── utils/                # Utilities
│       ├── config.ts         # Configuration
│       └── errors.ts         # Error handling
└── tests/                    # Tests
```

## Development

### Build

```bash
npm run build
```

### Development Mode (Watch)

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Local Testing

```bash
npm run build
npm link
ai-code "test task"
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Acknowledgments

- Built with [Ollama](https://ollama.ai) for local LLM inference
- Inspired by Claude Code CLI
- Uses [commander](https://github.com/tj/commander.js) for CLI
- Terminal UI powered by [chalk](https://github.com/chalk/chalk) and [ora](https://github.com/sindresorhus/ora)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

Made with ❤️ by the AI Code CLI team
