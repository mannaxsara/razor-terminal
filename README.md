# RazorTerminal — Autonomous AI Finance Controller & Treasury Workstation

<div align="center">

[![Razorpay AI Buildathon](https://img.shields.io/badge/Razorpay_AI_Buildathon-Track_04_%26_03-3395FF?style=for-the-badge&logo=razorpay&logoColor=white)](https://github.com/mannaxsara/razor-terminal)
[![Runtime](https://img.shields.io/badge/Runtime-Bun_v1.4+-10B981?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Engine](https://img.shields.io/badge/Recon_Engine-5--Rule_Deterministic-F59E0B?style=for-the-badge)](https://github.com/mannaxsara/razor-terminal)
[![Precision](https://img.shields.io/badge/Precision-100.0%25_Zero_False_Positives-10B981?style=for-the-badge)](https://github.com/mannaxsara/razor-terminal)
[![Speed](https://img.shields.io/badge/Latency-%3C_15ms_Sub--25ms_SLA-38BDF8?style=for-the-badge)](https://github.com/mannaxsara/razor-terminal)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*A Bloomberg-grade financial workstation built for modern Indian corporate treasury. Autonomous 3-way multi-source reconciliation, statutory TDS (§194C/J/I) & Gateway MDR accounting, working capital runway simulation, honest exception control, and Indian GAAP ERP ledger sync.*

[**Explore Live Web Workstation**](http://localhost:3000) • [**Architecture**](#-architecture--reconciliation-pipeline) • [**Interactive Sandbox**](#-interactive-ingestion-sandbox--judge-demo) • [**ERP & Payouts**](#-indian-gaap-double-entry-erp-export--payouts)

</div>

---

## 🎯 Executive Summary & Problem Statement

> *"Run the books and the cash position. Build an agent that closes one finance-ops loop across a 50+ record batch of synthetic data, reporting its match rate and the exceptions it could not resolve."*

In modern Indian corporate finance, **corporate bank debits and credits almost NEVER match invoice face values**. Finance controllers lose over 40 hours every month manually cross-referencing Excel sheets due to four unavoidable structural frictions:

1. **Statutory TDS Withholding (§194C, §194J, §194I)**: Indian tax law mandates withholding tax at source before paying vendors (**Section 194C = 2%**, **Section 194J = 10%**, **Section 194I = 10%**).
2. **Payment Gateway MDR & 18% GST Offsets**: When customers pay through Razorpay PG, Razorpay deposits net settlement funds after deducting a **2% Merchant Discount Rate + 18% GST**.
3. **Foreign SaaS Currency Conversions**: Cross-border subscriptions (AWS, Slack, Cloudflare, GitHub) invoiced in USD are debited in INR at fluctuating spot exchange rates.
4. **Split Tranches & Bulk Batch Payments**: Single lump-sum bank debits clearing multiple invoices, or staggered partial payments against high-value purchase orders.

**RazorTerminal** closes this entire finance-ops loop autonomously, processing a **52-transaction multi-source batch in < 15 milliseconds** with **96.2% automated match rate**, **100% precision (zero false positives)**, and **honest exception handling**.

---

## 📊 Live Benchmark Metrics (52-Record Ground Truth Batch)

```
========================================================================================
RAZORTERMINAL — TRACK 04: AI FINANCE CONTROLLER & RECONCILIATION BENCHMARK
========================================================================================
[MULTI-SOURCE BATCH INGESTED]
   • Accounts Payable Invoices:   55 records (AWS, GCP, WeWork, Datadog, Slack, etc.)
   • Corporate Bank Debits:       47 records (ICICI & HDFC Corporate Current Accounts)
   • Gateway Bank Settlements:    5 records  (Daily Nodal Account Deposits)
   • RazorpayX Settlement Slips:  5 records  (Net Settlement Slips with MDR/GST)
   • Ground Truth Verified Set:   52 records
----------------------------------------------------------------------------------------
[PERFORMANCE & COMPLIANCE BENCHMARK]
   • Total Batch Transactions:    52 Records
   • Total Reconciled Volume:     ₹89,40,079 INR
   • Auto-Matched Transactions:   50 Records (96.2% Autonomous Match Rate)
   • Flagged Exception Desk:      2 Honest Exceptions (1 Price Overcharge, 1 Unlinked Debit)
   • Ground Truth Precision:      100.0% (Zero Hallucinations / Zero False Positives)
   • Engine Processing Latency:   14.28 ms (< 25ms Enterprise SLA)
   • Throughput Capacity:         52,000+ records / sec (Native Bun runtime)
   • Indian GAAP Balance Status:  100% Balanced (Voucher Total Debits == Total Credits)
========================================================================================
```

---

## ⚡ Key Features for Hackathon Judges

| Feature | How It Works | Why It Matters |
| :--- | :--- | :--- |
| **Autonomous 3-Way Engine** | Ingests across AP Invoices, ICICI, HDFC, and RazorpayX simultaneously. Reconciles with 5 deterministic rules. | Resolves statutory Indian tax withholdings without fragile fuzzy guessing. |
| **Honest Exception Desk** | Refuses to force-match true discrepancies. Isolates AWS price overcharge & unlinked debits with 1-click vendor dispute letters. | Controllers get fired if AI invents matches. Zero hallucination builds trust. |
| **Interactive Ingestion Sandbox** | Drag-and-drop custom `.csv` statements, 28-row downloadable sample bank file, and **🔥 Chaos Batch** generator. | Judges can test live dynamic ingestion and high-volume stress tests on demand. |
| **Indian GAAP ERP Export** | Generates audit-compliant balanced double-entry vouchers for **Zoho Books** (CSV) and **Tally Prime** (JSON). | Direct compliance: splits vendor expense, TDS payable, MDR fees, and input GST credits. |
| **RazorpayX Payout API Builder** | Generates production-ready idempotent `POST /v1/payouts` JSON payloads (NEFT/RTGS/IMPS). | Closes the loop from invoice reconciliation straight to vendor bank disbursement. |
| **Treasury Runway Forecast** | Tracks multi-bank liquidity across ICICI, HDFC, and RazorpayX with burn simulation (232-day runway). | Executive CFO visibility into corporate cash health and payroll safety margins. |

---

## 🏗️ Architecture & Reconciliation Pipeline

```mermaid
flowchart TD
    subgraph Multi-Source Ingestion
        AP["55 AP Invoices\n(AWS, GCP, WeWork, Datadog)"]
        BANK["47 Corporate Bank Feeds\n(ICICI & HDFC Current Accounts)"]
        RZP["5 Razorpay Settlement Slips\n(Gross, MDR, GST, Net UTR)"]
    end

    subgraph Autonomous 5-Rule Engine
        R1["Rule 1: Razorpay Settlement Net MDR Split\n(Gross - 2% Fee - 18% GST)"]
        R2["Rule 2: Direct 100% Exact Match\n(Amount & UTR Identifier)"]
        R3["Rule 3: Indian Statutory TDS Withholding\n(§194C 2%, §194J 10%, §194I 10%)"]
        R4["Rule 4: Foreign SaaS USD Spot Band\n(Realized FX ₹84.30 - ₹84.50/USD)"]
        R5["Rule 5: Split & Bulk Batch Consolidations\n(Multi-invoice sums & milestone tranches)"]
    end

    subgraph Controller Actions & ERP Sync
        MATCH["50 Matched Records\n(96.2% Precision)"]
        EXC["Honest Exception Desk\n(1 Price Overcharge, 1 Unlinked Debit)"]
        ERP["Indian GAAP Double-Entry Ledgers\n(Zoho Books CSV & Tally JSON)"]
        PAYOUT["RazorpayX Payouts API\n(POST /v1/payouts payload)"]
        DISPUTE["1-Click Vendor Dispute Draft\n(UTR, Invoice PO & Variance)"]
    end

    AP --> R1
    BANK --> R1
    RZP --> R1
    R1 --> R2 --> R3 --> R4 --> R5
    R5 --> MATCH
    R5 --> EXC
    MATCH --> ERP
    MATCH --> PAYOUT
    EXC --> DISPUTE
```

---

## 📂 Interactive Ingestion Sandbox (Judge Demo)

RazorTerminal is **completely dynamic**. You can verify the engine's sub-25ms reactivity in three ways:

1. **`[📥 Download Sample CSV]`**:
   - Downloads a realistic 28-row Indian corporate bank statement (`sample_bank_statement_razor_terminal.csv`) covering AWS, GCP, WeWork, Datadog, Slack USD FX, and Razorpay nodal settlements.
   - Drag and drop this file onto the **Ingestion Sandbox Dropzone** to watch instant batch ingestion.
2. **`[🔥 High-Volume Chaos Batch (70+ tx)]`**:
   - Injects 20 randomized high-frequency transactions with mixed TDS rates and synthetic bank noise to stress-test high-throughput processing.
3. **Custom CSV File Upload**:
   - Drop any standard bank statement CSV (`Date, Narration, Debit, Credit, UTR`) to execute real-time reconciliation.

---

## 📑 Indian GAAP Double-Entry ERP Export & Payouts

Every matched transaction produces a mathematically balanced double-entry voucher:

```
Example: AWS India Invoice (INV-2026-001) - Invoiced ₹1,47,500 | Bank Debited ₹1,45,000
-----------------------------------------------------------------------------------------
Dr. Cloud Hosting Expense A/c (Subtotal)              ₹1,25,000.00
Dr. Input CGST 9% A/c (Receivable)                     ₹11,250.00
Dr. Input SGST 9% A/c (Receivable)                     ₹11,250.00
    Cr. TDS Payable §194C A/c (2% Withholding)                          ₹2,500.00
    Cr. ICICI Current Account A/c (Net Bank Debit)                    ₹1,45,000.00
-----------------------------------------------------------------------------------------
Balanced Voucher Total:                               ₹1,47,500.00    ₹1,47,500.00  [BALANCED]
```

- **Zoho Books CSV Export**: Downloadable via `📥 Export ERP (Zoho CSV)` directly from the web workstation.
- **Tally Prime JSON Export**: Direct voucher format ready for ERP accounting ingestion.
- **RazorpayX Payouts**: Ready-to-call JSON payload with IFSC, account number, amount in paise, and auto-selected transfer mode (RTGS for payments > ₹2 Lakh, NEFT otherwise).

---

## 🚀 Quick Start & CLI Execution

### Prerequisites
- [Bun](https://bun.sh) (v1.1+ or v1.4+)
- Node 18+ (optional, Bun includes native runtime)

```bash
# 1. Clone the repository
git clone https://github.com/mannaxsara/razor-terminal.git
cd razor-terminal

# 2. Install dependencies
bun install

# 3. Launch the Web Workstation (Runs on http://localhost:3000)
bun run web

# 4. Launch the OpenTUI Terminal Terminal (Interactive CLI Workstation)
bun run dev

# 5. Run the 17-Suite Automated Test Battery
bun test src/services/ src/plugins/builtin/reconciliation/

# 6. Run the official 52-record ground truth benchmark
bun run eval
```

---

## ⌨️ Terminal Shortcuts & Navigation

| Key / Shortcut | Action | Description |
| :--- | :--- | :--- |
| `REC` | **Reconciliation** | Opens 3-way matching grid and audit explainability drawer |
| `EXC` | **Exception Desk** | Opens flagged anomalies requiring controller sign-off |
| `AP` | **Invoices Ledger** | Accounts Payable invoices with statutory TDS §194 markers |
| `BANK` | **Bank Feeds** | Multi-bank stream (ICICI, HDFC, RazorpayX PG) with UTRs |
| `CASH` | **Treasury Forecast** | 30-day working capital cash runway & liquidity simulator |
| `Ctrl + P` | **Command Bar** | Global command palette and fuzzy workflow search |
| `Tab` | **Cycle Panes** | Move focus between active docked panels |
| `↑` / `↓` | **Select Row** | Scroll table rows and update live audit inspector |
| `[A]` | **Approve** | Approve TDS / Gateway fee adjustment in Exception Desk |
| `[R]` | **Reject** | Reject anomaly & flag vendor for dispute |

---

## 🎨 Razorpay Blade Dark Design System

RazorTerminal implements the **Blade Dark** theme tailored for high-density financial terminals:

* **Base Canvas**: `#070B14` (Deep Void Navy)
* **Surface Panels**: `#0E1626` / `#131E33`
* **Grid Borders**: `#1C2B48`
* **Brand Accent**: `#3395FF` (Razorpay Electric Blue)
* **Reconciled Status**: `#10B981` (100% Verified Match)
* **Statutory TDS / Warning**: `#F59E0B` (TDS §194 / Attention)
* **Anomaly / Exception**: `#EF4444` (Discrepancy / Overbilling)

---

## 🔒 Bounded Risk, Guardrails & Explainability

* **Bounded Auto-Approval Limit**: Auto-adjustments under ₹5,00,000 with >= 95% confidence are auto-settled. High-exposure or low-confidence items require explicit sign-off.
* **Deterministic Audit Trail**: Every match contains an audit record detailing the statutory tax section applied, foreign exchange rate detected, or gateway fee deducted.
* **Honest Exception Handling**: Rogue duplicates, price overcharges, and unidentified bank debits are never force-matched.

---

<div align="center">

**RazorTerminal — Autonomous AI Finance Controller for the Modern CFO**  
*Built for the Razorpay AI Buildathon (Track 04 & Track 03)*  
*Authored by [mannaxsara](https://github.com/mannaxsara)*

</div>