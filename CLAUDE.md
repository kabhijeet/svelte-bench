# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SvelteBench is an LLM benchmark tool for Svelte 5 components based on the HumanEval methodology. It evaluates LLM-generated Svelte components by testing them against predefined test suites and calculates pass@k metrics.

**Core Architecture:**
- `index.ts` - Main benchmark orchestrator that manages the full test cycle
- `src/llms/` - Provider abstraction layer supporting OpenAI, Anthropic, Google, and OpenRouter
- `src/tests/` - Test definitions with `prompt.md` and `test.ts` pairs
- `src/utils/test-manager.ts` - Sequential HumanEval test execution logic (default)
- `src/utils/parallel-test-manager.ts` - Parallel HumanEval test execution logic (optional)
- `src/utils/test-runner.ts` - Vitest integration for component testing
- `tmp/` - Runtime directory for generated components (unique subdirs per test/sample)

## Execution Modes

SvelteBench supports two execution modes:

- **Sequential (default)**: Tests run one at a time, with samples generated sequentially. Full sample-level checkpointing and resumption support. Provides detailed progress output and is more reliable for long-running benchmarks.
- **Parallel**: Tests run one at a time, but samples within each test are generated in parallel for faster execution. Full sample-level checkpointing and resumption support with optimized output formatting. Set `PARALLEL_EXECUTION=true` to enable.

## Common Commands

```bash
# Run full benchmark (sequential execution)
pnpm start

# Run with parallel execution (faster but more verbose)
PARALLEL_EXECUTION=true pnpm start

# Run only tests (without building visualization)
pnpm run run-tests

# Run with context file (Svelte docs)
pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt

# Run with both parallel execution and context
PARALLEL_EXECUTION=true pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt

# Run specific test with vitest
pnpm test

# Build visualization from results
pnpm run build

# Verify benchmark results
pnpm run verify
```

## Environment Variables

Set environment variables to control execution behavior:

```bash
# Debug mode for faster development testing
DEBUG_MODE=true
DEBUG_PROVIDER=openrouter
DEBUG_MODEL=openai/gpt-oss-20b:free

# Enable parallel execution for faster benchmark runs
PARALLEL_EXECUTION=true
```

Multiple models can be specified: `DEBUG_MODEL=model1,model2,model3`

You can also skip specific benchmark tests by directory name:

```bash
SKIP_TESTS=inspect,experimental-widget
```

This will exclude those folders in `src/tests/` from all benchmark and verification runs.

## Test Structure

Each test in `src/tests/` requires:
- `prompt.md` - Instructions for the LLM to generate a Svelte component
- `test.ts` - Vitest tests that validate the generated component functionality

The benchmark generates components in `tmp/{provider}/` directories and runs tests using the integrated Vitest setup.

## Environment Setup

Copy `.env.example` to `.env` and configure API keys for desired providers:
- `OPENAI_API_KEY` - For GPT models
- `ANTHROPIC_API_KEY` - For Claude models
- `GEMINI_API_KEY` - For Gemini models
- `OPENROUTER_API_KEY` - For OpenRouter access

## Testing and Validation

- Tests use Vitest with @testing-library/svelte for component testing
- Each test runs with a 120-second timeout
- Pass@k metrics follow HumanEval methodology. By default **1 sample per test** is generated (low-cost fast iteration). Configure more with `NUM_SAMPLES` (e.g. 5, 10, 20) for more stable statistics.
- `NUM_SAMPLES` is ignored (forced to 1) for expensive models whose IDs start with `o1-pro`.
- `pass@10` is computed as `pass@min(10, n)` (n = valid samples).
- Results are saved to timestamped JSON files in `benchmarks/`.

### Sample Count Control

```bash
# Run each test with 5 samples
NUM_SAMPLES=5 pnpm start

# Classic HumanEval-style 10 samples
NUM_SAMPLES=10 pnpm start

# Parallel with 8 samples
PARALLEL_EXECUTION=true NUM_SAMPLES=8 pnpm start
```

If `DEBUG_TEST` is set and `NUM_SAMPLES` is not provided, execution uses 1 sample automatically.
