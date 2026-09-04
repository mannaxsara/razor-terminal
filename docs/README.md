# ⚡ RazorTerminal Documentation Suite

> **Official Documentation for Razorpay AI Buildathon (Track 04: AI Finance Controller & Track 03: Revenue Recovery)**  
> **Autonomous AI Finance Controller & Treasury Workstation for RazorpayX**

---

## 🏆 Hackathon & Solution Core Documents

| Document | Purpose | Key Topics |
| :--- | :--- | :--- |
| [**🏛️ Master System Architecture & Spec**](./SYSTEM_DOCUMENTATION_AND_ARCHITECTURE.md) | Full technical specification & architecture blueprint | Complete problem statement, 7-stage engine, UI panes, security guardrails, benchmark scorecard |
| [**🎯 Problem Statement & Solution Architecture**](./PROBLEM_STATEMENT_AND_SOLUTION.md) | The core real-world finance friction & how we solved it | Multi-source reconciliation, Statutory TDS (§194C/J/I), Gateway MDR offsets, 7-stage engine, benchmark metrics |
| [**📘 User Guide & Workstation Walkthrough**](./USER_GUIDE_AND_WALKTHROUGH.md) | How to run and interact with the workstation | Panes overview, keyboard shortcuts (`REC`, `EXC`, `AP`, `BANK`, `CASH`), audit trail inspection, exception resolution |
| [**🏆 Hackathon Submission & Pitch Guide**](./HACKATHON_SUBMISSION_GUIDE.md) | Complete submission packet for judges | 2-minute elevator pitch, demo video script, track alignment breakdown, evaluation criteria |

---

## 🏛️ Architecture Decision Records (ADRs)

| ADR | Title | Status | Summary |
| :--- | :--- | :--- | :--- |
| [**ADR-001**](./decisions/ADR-001-7-stage-deterministic-reconciliation-pipeline.md) | 7-Stage Deterministic Reconciliation Pipeline vs Black-Box LLM | **Accepted** | Why deterministic mathematical engines were chosen over pure LLM prompts to guarantee 100% precision. |
| [**ADR-002**](./decisions/ADR-002-opentui-terminal-and-blade-dark-design-system.md) | OpenTUI Terminal & Blade Dark Design System | **Accepted** | High-density keyboard-driven Bloomberg layout with Blade Dark theme tokens. |
| [**ADR-003**](./decisions/ADR-003-in-memory-indexing-for-sub-millisecond-throughput.md) | In-Memory Indexing & Fuzzy Tokenizer | **Accepted** | $O(1)$ Hash Map indexing and single-pass normalization for sub-millisecond execution. |
| [**ADR-004**](./decisions/ADR-004-bounded-risk-and-human-in-the-loop-audit-gate.md) | Bounded Risk & Human-in-the-Loop Audit Gate | **Accepted** | ₹5,00,000 threshold and mandatory controller authorization for anomalies. |

---

## 📚 Technical Subsystem & Developer Guides

| Document | Description | Key Topics |
| :--- | :--- | :--- |
| [**1. System Overview**](./OVERVIEW.md) | High-level mental model & system design | Multi-surface model, core stack (Bun + React 19 + OpenTUI / Electrobun), repository structure |
| [**2. Architecture & Renderers**](./ARCHITECTURE.md) | Deep subsystem architecture & UI abstractions | UI host abstraction (`src/ui`), OpenTUI terminal engine, Electrobun desktop engine, Browser & Cloudflare builds |
| [**3. Market Data & Feeds**](./MARKET_DATA_SYSTEM.md) | Market data coordinator & provider pipelines | `MarketDataCoordinator`, `QueryStore`, `AssetDataRouter`, Corporate feeds, Gloom Cloud streaming & quotes |
| [**4. Plugin System & Extensibility**](./PLUGIN_SYSTEM.md) | Writing & extending financial plugins | `GloomPlugin`, `PluginContext`, Panes, Column definitions, Shortcuts, Context menus, Slot widgets |
| [**5. State, Persistence & Cloud Sync**](./STATE_PERSISTENCE_SYNC.md) | Application state, local storage & synchronization | App state reducer & context, Config store, SQLite cache, `CloudSyncController`, Broker sync |
| [**6. CLI, Headless & Remote Control**](./CLI_AND_HEADLESS.md) | CLI commands, automation & IPC/Remote server | Headless CLI dispatch, formatted outputs (`--json`, `--csv`), Pane screenshots, Remote WebSocket server |
| [**7. Developer & Modification Guide**](./DEVELOPMENT_GUIDE.md) | How to build, test, and safely modify the codebase | Environment setup (Bun on Windows/macOS/Linux), scripts, test conventions, recipes for adding features |

---

## 🚀 Quick Launch

```powershell
# 1. Run the live interactive terminal workstation
bun run dev

# 2. Run the 52-record ground truth benchmark
bun run eval

# 3. Run real-time streaming ingestion simulator
bun run simulate

# 4. Run headless CLI reconciliation
bun run src/index.tsx rec
```
