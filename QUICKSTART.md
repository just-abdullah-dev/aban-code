# Quick Start Guide

Get started with AI Code CLI in 5 minutes!

## Step 1: Install Ollama

**Windows:**
1. Visit https://ollama.ai
2. Download the Windows installer
3. Run the installer
4. Ollama will start automatically

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Step 2: Pull a Model

```bash
ollama pull qwen2.5-coder:7b
```

This will download ~4.7GB. Wait for it to complete.

## Step 3: Verify Ollama is Running

```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with your models.

## Step 4: Install AI Code CLI

From this project directory:

```bash
npm install
npm run build
npm link
```

## Step 5: Run Your First Command

```bash
ai-code "create a file called hello.txt with the content 'Hello, World!'"
```

You should see:
1. The AI thinking about the task
2. Tool execution (write_file)
3. Success message

## Step 6: Try More Commands

**Generate code:**
```bash
ai-code "create a simple HTTP server in server.js using the built-in http module"
```

**Read and modify:**
```bash
ai-code "read package.json and show me the dependencies"
```

**Install packages:**
```bash
ai-code "install express and cors"
```

## Troubleshooting

**"Failed to connect to Ollama"**
- Check if Ollama is running: `curl http://localhost:11434/api/tags`
- Try starting Ollama manually: `ollama serve`

**"Model not found"**
- Make sure you pulled the model: `ollama pull qwen2.5-coder:7b`
- Check available models: `ollama list`

**Command confirmation not showing**
- The prompt is there, just type `y` and press Enter

## Next Steps

- Read the full [README.md](./README.md)
- Try different models with `-m` flag
- Check out the security features
- Contribute to the project!

## Examples to Try

1. **Create a React component:**
   ```bash
   ai-code "create a React component for a todo list item"
   ```

2. **Add a npm script:**
   ```bash
   ai-code "add a dev script to package.json that runs tsx watch"
   ```

3. **Generate tests:**
   ```bash
   ai-code "create a test file for the sandbox module"
   ```

4. **Multi-step task:**
   ```bash
   ai-code "create a simple Express API with GET and POST endpoints for todos"
   ```

Enjoy using AI Code CLI! 🚀
