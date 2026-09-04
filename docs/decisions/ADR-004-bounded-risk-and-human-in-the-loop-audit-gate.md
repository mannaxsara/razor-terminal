# ADR-004: Bounded Risk & Human-in-the-Loop Audit Gate

## Status
Accepted

## Date
2026-09-01

## Context
Full end-to-end automation in enterprise treasury carries systemic financial risk if rogue debits or billing errors are settled without oversight. Autonomous agents must have strict safety boundaries:
1. Low-value, high-confidence matches (routine cloud SaaS, statutory TDS, known gateway fees) should not block finance controllers.
2. High-value transactions or transactions with price discrepancies must require explicit authorization.

## Decision
We established a **Bounded-Risk Policy Framework**:
1. **Auto-Approval Boundary**:
   - Matches with $\ge 95\%$ confidence and total transaction amount $< ₹5,00,000$ INR are marked for `AUTO_RECONCILE`, `AUTO_ADJUST_TDS`, or `AUTO_ADJUST_FX`.
2. **Mandatory Human Sign-Off Gate**:
   - Any transaction $> ₹5,00,000$ INR or flagged with confidence $< 95\%$ is routed to the **AI Exception Queue (`[EXC]`)**.
   - Anomaly types (`PRICE_MISMATCH`, `UNIDENTIFIED_DEBIT`, `DUPLICATE_INVOICE`) require explicit keyboard or click sign-off (`[A] Approve Adjustment` / `[R] Reject & Flag Dispute`).
3. **Immutable Audit Trace**:
   - All approvals and rejections record the user ID, timestamp, original narration, and reason code into an immutable audit trace.

## Consequences
- Protects treasury capital against unauthorized outflows and vendor overbilling.
- Meets internal corporate governance and statutory statutory audit standards.
- Eliminates 95%+ of routine manual data entry while keeping humans in control of risk.
