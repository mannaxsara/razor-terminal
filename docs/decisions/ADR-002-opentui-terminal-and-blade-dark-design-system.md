# ADR-002: OpenTUI Terminal Architecture & Blade Dark Design System

## Status
Accepted

## Date
2026-08-30

## Context
Finance controllers and treasury analysts spend long hours monitoring high-density financial data across bank feeds, accounts payable registers, exception queues, and runway forecasts. Traditional web dashboards:
- Have slow cold-start times and high memory footprints.
- Suffer from poor information density (excessive whitespace, slow paginated tables).
- Lack keyboard-driven productivity workflows (similar to Bloomberg Terminal / FactSet).

## Decision
We chose **OpenTUI (React 19 Reconciler for Terminal User Interfaces)** combined with **Razorpay Blade Dark** design tokens:
1. **Multi-Pane Bloomberg Layout**: Docked 4-pane workstation with real-time reactive panes (`REC`, `EXC`, `AP`, `BANK`, `CASH`).
2. **Blade Dark Color Tokens**:
   - Canvas: `#070B14` (Deep Void Navy)
   - Panels: `#0E1626` / `#131E33`
   - Brand Accent: `#3395FF` (Razorpay Electric Blue)
   - Reconciled Emerald: `#10B981` (Verified Match)
   - Statutory TDS / Warning: `#F59E0B` (TDS §194 Attention)
   - Discrepancy Rose: `#EF4444` (Anomaly / Exception)
3. **Keyboard & Command-Driven Workflow**: Global fuzzy command bar (`Ctrl+P`), instant pane toggles (`Tab`), arrow navigation (`↑`/`↓`), and 1-click audit sign-off (`[A]` / `[R]`).

## Consequences
- **Instant Cold Start**: Launches in < 100 milliseconds via Bun runtime.
- **High Information Density**: Displays 50+ transactions, live audit drawer, and 30-day cash runway on a single screen without pagination lag.
- **Cross-Platform**: Runs seamlessly in standard terminal emulators, tmux sessions, and desktop wrappers.
