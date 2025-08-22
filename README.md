# SvelteBench

An LLM benchmark for Svelte 5 based on the OpenAI methodology from OpenAIs paper "Evaluating Large Language Models Trained on Code", using a similar structure to the HumanEval dataset.

**Work in progress**

## Overview

SvelteBench evaluates LLM-generated Svelte components by testing them against predefined test suites. It works by sending prompts to LLMs, generating Svelte components, and verifying their functionality through automated tests.

## Output Sanitization

Before compiling generated components, SvelteBench performs automatic cleaning:

- Strips markdown code fences (```svelte / ```html / ```js / bare ``` and stray backticks)
- Removes reasoning blocks wrapped in `<think>...</think>` (case-insensitive) emitted by some "thinking" / reasoning models (content + tags are fully deleted)
- Ensures `<svelte:options runes={true} />` is present at the top (injects if missing)

This prevents Svelte parser errors caused by non-code reasoning output and keeps samples comparable across providers. If future models introduce different reasoning tag names, extend `stripThinkTags` (in `src/utils/code-cleaner.ts`) or generalize the pattern.

## Supported Providers

SvelteBench supports multiple LLM providers:

- **OpenAI** - GPT-4, GPT-4o, o1, o3, o4 models
- **Anthropic** - Claude 3.5, Claude 4 models
- **Google** - Gemini 2.5 models
- **OpenRouter** - Access to multiple providers through a single API
- **Ollama** - Local models via Ollama server (set `OLLAMA_HOST` optionally)
- **LMStudio** - Local models served through LM Studio desktop/server (`LMSTUDIO_HOST`, `LMSTUDIO_MODEL`)
- **Z.ai** - GLM family models

## Setup

```bash
nvm use
npm install

# Create .env file from example
cp .env.example .env
```

Then edit the `.env` file and add your API keys:

```bash
# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter (optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE_URL=https://github.com/khromov/svelte-bench  # Optional
OPENROUTER_SITE_NAME=SvelteBench  # Optional

# Ollama (optional local)
OLLAMA_HOST=http://127.0.0.1:11434 # Optional, defaults shown

# LM Studio (optional local)
LMSTUDIO_MODEL=llama-3.2-1b-instruct   # Override default local model (LM Studio must be running)
```

You only need to configure the providers you want to test with.

## Running the Benchmark

```bash
# Run the benchmark with settings from .env file
npm start
```

**NOTE: This will run all providers and models that are available!**

### Skipping Specific Tests

You can skip one or more test directories via the `SKIP_TESTS` environment variable (comma‑separated list). Each entry should match the folder name under `src/tests/`.

```bash
# Skip the 'inspect' test (commonly skipped) and an experimental test
SKIP_TESTS=inspect,experimental-widget npm start
```

This affects both sequential and parallel execution modes as well as `verify.ts`. If `DEBUG_TEST` points to a skipped test, a warning is printed and it is ignored.

### Debug Mode

For faster development, or to run just one provider/model, you can enable debug mode in your `.env` file:

```
DEBUG_MODE=true
DEBUG_PROVIDER=anthropic
DEBUG_MODEL=claude-3-7-sonnet-20250219
DEBUG_TEST=counter
```

Debug mode runs only one provider/model combination, making it much faster for testing during development.

#### Running Multiple Models in Debug Mode

You can now specify multiple models to test in debug mode by providing a comma-separated list:

```
DEBUG_MODE=true
DEBUG_PROVIDER=anthropic
DEBUG_MODEL=claude-3-7-sonnet-20250219,claude-opus-4-20250514,claude-sonnet-4-20250514
```

This will run tests with all three models sequentially while still staying within the same provider.

### Controlling Number of Samples (NUM_SAMPLES)

By default SvelteBench now generates **1 sample per test** (minimizing cost and speeding up iteration). You can increase this using the `NUM_SAMPLES` environment variable to obtain more stable pass@k metrics.

```bash
# Run each test with 5 samples
NUM_SAMPLES=5 npm start

# Run each test with 10 samples (classic HumanEval style)
NUM_SAMPLES=10 npm start

# Parallel example
PARALLEL_EXECUTION=true NUM_SAMPLES=8 npm start
```

Notes:
- If `DEBUG_TEST` is set and `NUM_SAMPLES` is NOT provided, it stays at 1 for faster debugging.
- Expensive models whose IDs start with `o1-pro` are automatically limited to 1 sample even if a higher value is configured.
- `pass@10` is computed as `pass@min(10, n)` where `n` is the number of valid samples returned.
- Checkpointing works regardless of the value: partial progress is saved after each sample.

### Running with Context

You can provide a context file (like Svelte documentation) to help the LLM generate better components:

```bash
# Run with a context file
npm run run-tests -- --context ./context/svelte.dev/llms-small.txt && npm run build
```

The context file will be included in the prompt to the LLM, providing additional information for generating components.

## Visualizing Results

After running the benchmark, you can visualize the results using the built-in visualization tool:

```bash
npm run build
```

You can now find the visualization in the `dist` directory.

## Adding New Tests

To add a new test:

1. Create a new directory in `src/tests/` with the name of your test
2. Add a `prompt.md` file with instructions for the LLM
3. Add a `test.ts` file with Vitest tests for the generated component

Example structure:

```
src/tests/your-test/
├── prompt.md    # Instructions for the LLM
└── test.ts      # Tests for the generated component
```

## Benchmark Results

After running the benchmark, results are saved to a JSON file in the `benchmarks` directory. The file is named `benchmark-results-{timestamp}.json`.

When running with a context file, the results filename will include "with-context" in the name: `benchmark-results-with-context-{timestamp}.json`.
