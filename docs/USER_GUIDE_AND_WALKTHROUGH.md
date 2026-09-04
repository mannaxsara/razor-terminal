# RazorTerminal — User Guide & Workstation Walkthrough

> **Interactive Terminal & GUI Guide for Finance Controllers and Reviewers**

---

## 1. How to Launch

In your terminal or PowerShell:

```powershell
# Launch the high-density interactive terminal
bun run dev
```

---

## 2. Workstation Panes Overview

RazorTerminal boots directly into a 4-pane **Finance Controller Layout**:

```
┌──────────────────────────┬──────────────────────────┬─────────────────────────────────────────────────────────┐
│ Invoices Ledger (AP)     │ Corporate Bank Feeds     │ Reconciliation Workstation                              │
│ (Left Column)            │ (Center Column)          │ (Right Column)                                          │
│                          │                          │                                                         │
│ Shows all 55 Accounts    │ Live corporate bank      │ The heart of the AI Engine:                             │
│ Payable vendor invoices  │ statement streams (ICICI,│ Auto-matches bank transactions against invoices,        │
│ with statutory TDS       │ HDFC, RazorpayX PG) with │ displays match confidence, and shows the explainable    │
│ deductions (§194C/J/I).  │ UTR reference codes.     │ audit drawer with tax / FX / fee breakdowns.            │
├──────────────────────────┴──────────────────────────┴─────────────────────────────────────────────────────────┤
│ Treasury Liquidity & 30-Day Cash Runway Forecast (Bottom Row)                                                 │
│ Real-time working capital telemetry: Net Runway (18.4 Mos), Total Liquidity (₹1.48 Cr), Reconciled (₹89.4L)    │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Navigation & Interactive Controls

| Key / Mouse Action | What It Does |
| :--- | :--- |
| **Mouse Click** | Click on any row, button, or header to focus or select |
| `Tab` / `Shift+Tab` | Cycle focus between the 4 workstation panes |
| `↑` / `↓` Arrow Keys | Move cursor up and down through transactions or invoices |
| `REC` | Focus the **3-Way Reconciliation Workstation** |
| `EXC` | Focus the **AI Exception Queue** |
| `AP` | Focus the **Invoices Ledger** |
| `BANK` | Focus the **Bank Feeds Stream** |
| `CASH` | Focus the **Treasury Runway Forecaster** |
| `Ctrl+P` | Open Global Command Palette & Fuzzy Search |

---

## 4. Inspecting Reconciliation Audits

When focused on the **Reconciliation Workstation (`REC`)**, selecting any transaction displays its **Audit Log Drawer** at the bottom of the pane:

### Examples of Audit Traces:
1. **TDS Withholding Match**:
   * `TXN-ICICI-1001` (₹1,45,000) ──▶ `INV-2026-001` (AWS India, ₹1,47,500)
   * **Audit Log**: `Matched Amazon Web Services India net of ₹2,500 TDS under Section 194C.`
   * **Rule Applied**: `TDS_SECTION_194C_NET_PAYABLE` | UTR: `ICIC260814001923`

2. **Cross-Border FX Conversion**:
   * `TXN-HDFC-1003` (₹42,150) ──▶ `INV-2026-003` (Slack Technologies, $500 USD)
   * **Audit Log**: `Converted $500 USD at effective spot rate ₹84.30/USD.`
   * **Rule Applied**: `FX_SPOT_TOLERANCE_BAND` | UTR: `HDFC260808001124`

3. **Gateway MDR Net Settlement**:
   * `TXN-ICICI-2001` (₹4,88,200) ──▶ `INV-2026-029` (Razorpay Software, ₹5,00,000)
   * **Audit Log**: `Matched Razorpay PG settlement net of 2% fee (₹10,000) + 18% GST on fee (₹1,800).`
   * **Rule Applied**: `RAZORPAY_GATEWAY_MDR_NET_SPLIT` | UTR: `RZPSETL260802001`

---

## 5. How to Handle the AI Exception Queue

Switch to the **AI Exception Queue (`EXC`)** to triage flagged discrepancies:

1. **Unidentified Debits**: A debit in the bank statement with no corresponding invoice in Accounts Payable (e.g. `TXN-HDFC-1029`, ₹48,500).
2. **Price Mismatches**: A transaction where the billed amount differed from the contract (e.g. `TXN-ICICI-1028`, Billed ₹3,24,000 net, debited ₹2,84,000).

### Controller Sign-off Actions:
* **Press `[A]` or Click `[A] APPROVE ADJUSTMENT`**: Auto-creates a ledger variance adjustment entry and approves the transaction.
* **Press `[R]` or Click `[R] REJECT & FLAG VENDOR`**: Rejects the charge, freezes payment processing, and flags the vendor for dispute.

---

## 6. Running the Benchmark Evaluation Suite

To test the reconciliation engine against the complete 52-record ground truth dataset:

```powershell
bun run eval
```

Output metrics include:
* Total Processed Volume (₹89,40,079)
* Autonomous Match Rate (96.2%)
* Actionable Anomaly Queue (2 items)
* Ground Truth Precision (100.0% — zero false positives)
* Engine Throughput Speed (< 25 ms)
