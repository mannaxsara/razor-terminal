# RazorTerminal — Razorpay AI Buildathon Submission Guide

> **Hackathon Submission Packet: Pitch, Track Alignment & Demo Video Script**  
> **Project Name:** RazorTerminal  
> **Repository:** https://github.com/mannaxsara/razor-terminal  

---

## 1. Track Alignment & Eligibility

### Primary Track: Track 04 — AI Finance Controller
* **Objective**: *"Run the books and the cash position. Build an agent that closes one finance-ops loop across a 50+ record batch of synthetic data, reporting its match rate and the exceptions it could not resolve."*
* **How RazorTerminal Delivers**:
  * Ingests a **55-invoice AP ledger**, **47 corporate bank debits**, **5 gateway credits**, and **5 RazorpayX settlements** (totaling ₹89,40,079).
  * Executes a **7-stage autonomous reconciliation pipeline** solving statutory TDS withholding (§194C, §194J, §194I), Razorpay MDR fee deductions (2% fee + 18% GST), and foreign currency conversions ($USD \rightarrow \text{INR}$).
  * Reports a **96.2% automated match rate** (50/52 items) with **zero false positives (100% precision)** in **< 25 milliseconds**.
  * Routes the remaining 2 items into an honest **AI Exception Queue** with bounded human sign-off (`[A]` to Approve adjustment, `[R]` to Reject & Dispute).

### Secondary Track: Track 03 — Revenue & Cash Recovery
* Reconciles gateway settlement fee splits, flags vendor overcharges (e.g. ₹40k variance), identifies rogue recurring subscriptions, and projects 30-day working capital liquidity runway (18.4 months).

---

## 2. 2-Minute Elevator Pitch & Submission Narrative

> *"Finance teams in India lose hundreds of hours reconciling bank statements against vendor bills. Why? Because payouts in India almost never match the invoice total — whether it's due to 2% TDS on AWS, 10% TDS on legal retainers, Razorpay's 2% gateway processing fee, or spot FX rate markups on USD software like Slack."*
>
> *"We built **RazorTerminal** — an autonomous AI Finance Controller and Treasury Workstation. Powered by a 7-stage deterministic matching engine and a Blade Dark high-density terminal interface, it ingests multi-bank statements, accounts payable ledgers, and RazorpayX settlements simultaneously. In under 25 milliseconds, it reconciles an ₹89.4 Lakh batch with 96.2% accuracy, calculates statutory tax withholdings, isolates rogue discrepancies into a bounded exception queue, and forecasts 30-day working capital runway."*

---

## 3. Video Demo Script (2 to 3 Minutes)

### [0:00 - 0:30] The Problem & Introduction
* **Visual**: Show a messy spreadsheet with invoice numbers, bank debits, and unmatched variances.
* **Voiceover**: *"Every month, finance controllers struggle to reconcile bank statements with vendor invoices because statutory TDS (§194C, §194J), gateway MDR fees, and USD foreign exchange make direct 1-to-1 matching impossible. Introducing RazorTerminal."*

### [0:30 - 1:15] Launching the Terminal & Multi-Source Ingestion
* **Visual**: Open terminal and run `bun run dev`. The 4-pane Razorpay Blade Dark workstation opens.
* **Voiceover**: *"On the left, RazorTerminal loads 55 vendor invoices in Accounts Payable. In the center, real-time corporate bank statement streams from ICICI, HDFC, and RazorpayX. On the right, the 7-stage Autonomous Reconciliation Workstation."*

### [1:15 - 1:50] The 7-Stage Engine & Explainability Audits
* **Visual**: Navigate through reconciled matches in `REC` pane. Highlight the Audit Drawer at the bottom.
* **Voiceover**: *"Selecting the AWS transaction shows RazorTerminal automatically detected and calculated the 2% TDS under Section 194C. Selecting the Slack invoice shows automatic spot FX conversion from $500 USD to INR at ₹84.30. Selecting the Razorpay credit shows automatic 2% MDR + 18% GST settlement breakdown."*

### [1:50 - 2:30] AI Exception Queue, Treasury Runway & Benchmark Runner
* **Visual**: Focus `EXC` pane. Show the flagged price mismatch and press `[A]` to approve adjustment. Then run `bun run eval` in terminal to show the 96.2% benchmark metrics.
* **Voiceover**: *"Items requiring human sign-off land in the bounded AI Exception Queue. Controllers can approve or reject with one keystroke. Finally, our 30-day Treasury Forecaster projects real-time cash runway and liquidity. In our 52-record ground truth evaluation, RazorTerminal processed ₹89.4 Lakhs in under 25 milliseconds with 96.2% match rate and zero false positives."*

---

## 4. Key Metrics Summary for Judges

| Metric | RazorTerminal Result | Industry Benchmark |
| :--- | :--- | :--- |
| **Ground Truth Precision** | **100.0%** (0 False Positives) | ~70–85% |
| **Autonomous Match Rate** | **96.2%** (50 / 52 Txns) | ~60% |
| **Processing Speed** | **< 25 ms** (> 2,000 tx/sec) | Hours / Days (Manual) |
| **Statutory Tax Coverage** | **§194C (2%), §194J (10%), §194I (10%)** | None (Manual) |
| **FX & Gateway Deductions** | **USD Spot Bands + Razorpay MDR 2% + 18% GST** | Manual Spreadsheets |
| **Safety & Governance** | **Bounded Sign-Off Gate ($>₹5\text{L}$ / Discrepancies)** | Unchecked Auto-rules |
