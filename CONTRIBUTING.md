# Contributing to RazorTerminal

## Running Locally

Requires [Bun](https://bun.sh) (v1.3+).

```bash
git clone https://github.com/mannaxsara/razor-terminal.git
cd razor-terminal
bun install
bun run dev
```

## Running the Ground-Truth Benchmark

```bash
bun run eval
```

## Running the Real-Time Streaming Ingestion Simulator

```bash
bun run simulate
```

## Running Typechecks and Tests

```bash
bun run typecheck
bun test
```
