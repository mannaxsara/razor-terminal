import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { KpiGrid } from "./components/KpiGrid";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ReconciliationTable } from "./components/ReconciliationTable";
import { ExceptionWorkbench } from "./components/ExceptionWorkbench";
import { TreasuryRunway } from "./components/TreasuryRunway";
import { CopilotChat } from "./components/CopilotChat";
import { DisputeModal } from "./components/DisputeModal";
import {
  getReconciledBatchData,
  getTreasuryState,
  generateChaosBatch,
  parseBankStatementCsv,
  type ReconciliationBatchOutput,
} from "./data";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../plugins/builtin/reconciliation/data";
import type {
  InvoiceRecord,
  BankStatementRecord,
  RazorpaySettlementRecord,
} from "../plugins/builtin/reconciliation/types";
import type { WebExceptionItem } from "./types";
import "./styles.css";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot"
  >("dashboard");
  const [activeDispute, setActiveDispute] = useState<WebExceptionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active dataset state
  const [currentInvoices, setCurrentInvoices] = useState<InvoiceRecord[]>(SYNTHETIC_INVOICES);
  const [currentBankTxns, setCurrentBankTxns] = useState<BankStatementRecord[]>([
    ...SYNTHETIC_BANK_DEBITS,
    ...SYNTHETIC_BANK_CREDITS,
  ]);
  const [currentSettlements, setCurrentSettlements] = useState<RazorpaySettlementRecord[]>(
    SYNTHETIC_RAZORPAY_SETTLEMENTS
  );

  // Reconciled batch data
  const [batchData, setBatchData] = useState<ReconciliationBatchOutput>(() =>
    getReconciledBatchData()
  );

  const [treasuryState, setTreasuryState] = useState(getTreasuryState());
  const [isStreaming, setIsStreaming] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [lastStreamEvent, setLastStreamEvent] = useState<{
    vendor: string;
    utr: string;
    amount: number;
    latencyMs: number;
  } | null>(null);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recompute batch whenever datasets change
  const runReconciliation = (
    invs: InvoiceRecord[] = currentInvoices,
    txns: BankStatementRecord[] = currentBankTxns,
    setls: RazorpaySettlementRecord[] = currentSettlements
  ) => {
    setIsIngesting(true);
    const start = performance.now();
    const result = getReconciledBatchData(invs, txns, setls);
    const latency = Math.round((performance.now() - start) * 100) / 100;

    setBatchData(result);
    setIsIngesting(false);
    showToast(`Reconciliation completed in ${latency}ms (${result.kpis.matchRate}% Match Rate)`);
  };

  // 1. Re-Run Real-Time Ingestion
  const handleRunBatchIngestion = () => {
    setIsIngesting(true);
    showToast("Re-ingesting multi-source streams...");
    setTimeout(() => {
      runReconciliation(currentInvoices, currentBankTxns, currentSettlements);
    }, 400);
  };

  // 2. Load Standard 52-Record Ground Truth Batch
  const handleLoadStandardBatch = () => {
    const invs = SYNTHETIC_INVOICES;
    const txns = [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS];
    const setls = SYNTHETIC_RAZORPAY_SETTLEMENTS;

    setCurrentInvoices(invs);
    setCurrentBankTxns(txns);
    setCurrentSettlements(setls);
    runReconciliation(invs, txns, setls);
    showToast("Reset to Standard 52-Record Ground Truth Batch (96.2% Match Rate)");
  };

  // 3. Load High-Volume Chaos Batch
  const handleLoadChaosBatch = () => {
    const chaos = generateChaosBatch();
    setCurrentInvoices(chaos.invoices);
    setCurrentBankTxns(chaos.bankTxns);
    setCurrentSettlements(chaos.settlements);
    runReconciliation(chaos.invoices, chaos.bankTxns, chaos.settlements);
    showToast(`Loaded Chaos Batch: ${chaos.bankTxns.length} bank records across 50+ vendors!`);
  };

  // 4. Handle Custom CSV Upload
  const handleUploadCustomCsv = (csvText: string, filename: string) => {
    const parsed = parseBankStatementCsv(csvText, "ICICI");
    if (parsed.length === 0) {
      showToast("Error: No valid transaction rows found in CSV.");
      return;
    }

    const mergedTxns = [...parsed, ...currentBankTxns];
    setCurrentBankTxns(mergedTxns);
    runReconciliation(currentInvoices, mergedTxns, currentSettlements);
    showToast(`Uploaded ${filename}: Reconciled ${parsed.length} new bank statement records!`);
  };

  // 5. Silent Live Stream Simulator (Updates UI smoothly without popup toast spam)
  useEffect(() => {
    if (!isStreaming) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      setLastStreamEvent(null);
      return;
    }

    let streamSeq = 5000;
    const streamVendors = [
      { name: "DigitalOcean India", amount: 48500, sec: "194C", rate: 0.02 },
      { name: "Postman API Enterprise", amount: 88500, sec: "194J", rate: 0.10 },
      { name: "Delhivery Surface Freight", amount: 24500, sec: "194C", rate: 0.02 },
      { name: "AWS India Cloud", amount: 145000, sec: "194C", rate: 0.02 },
    ];

    streamTimerRef.current = setInterval(() => {
      streamSeq++;
      const v = streamVendors[streamSeq % streamVendors.length]!;
      const invId = `INV-STREAM-${streamSeq}`;
      const baseAmt = v.amount;
      const tdsAmt = Math.round(baseAmt * v.rate);
      const netPaid = baseAmt - tdsAmt;
      const utr = `STREAM2608${streamSeq}`;

      const newInv: InvoiceRecord = {
        id: invId,
        vendorName: v.name,
        category: "saas",
        invoiceDate: "2026-08-31",
        dueDate: "2026-09-10",
        currency: "INR",
        subtotal: baseAmt,
        taxRate: 0.18,
        taxAmount: Math.round(baseAmt * 0.18),
        totalAmount: baseAmt + Math.round(baseAmt * 0.18),
        tdsApplicable: true,
        tdsSection: v.sec as any,
        tdsRate: v.rate,
        expectedTdsAmount: tdsAmt,
        netPayable: netPaid,
      };

      const newTxn: BankStatementRecord = {
        id: `TXN-STREAM-${streamSeq}`,
        bank: streamSeq % 2 === 0 ? "ICICI" : "HDFC",
        transactionDate: "2026-08-31",
        valueDate: "2026-08-31",
        type: "DEBIT",
        amount: netPaid,
        utr: utr,
        narration: `NEFT-${v.name.toUpperCase()}-${invId}`,
        balanceAfter: 4500000,
      };

      const t0 = performance.now();
      setCurrentInvoices((prev) => {
        const nextInvs = [newInv, ...prev];
        setCurrentBankTxns((prevTxns) => {
          const nextTxns = [newTxn, ...prevTxns];
          const freshBatch = getReconciledBatchData(nextInvs, nextTxns, currentSettlements);
          setBatchData(freshBatch);
          return nextTxns;
        });
        return nextInvs;
      });
      const latency = Math.max(0.5, Math.round((performance.now() - t0) * 10) / 10);

      setLastStreamEvent({
        vendor: v.name,
        utr: utr,
        amount: netPaid,
        latencyMs: latency,
      });
    }, 3000);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming, currentSettlements]);

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchCount={batchData.matches.length}
        exceptionCount={batchData.exceptions.length}
        runwayDays={treasuryState.projectedRunwayDays}
        throughputTps={batchData.kpis.throughputTps}
        isStreaming={isStreaming}
        onToggleStream={() => {
          const next = !isStreaming;
          setIsStreaming(next);
          showToast(next ? "Live Webhook Stream started" : "Live stream paused");
        }}
        onRunBatchIngestion={handleRunBatchIngestion}
        isIngesting={isIngesting}
        lastStreamEvent={lastStreamEvent}
      />

      <main className="app-main">
        {/* KPI Metrics Summary */}
        <KpiGrid
          totalVolume={batchData.kpis.reconciledVolume}
          matchRate={batchData.kpis.matchRate}
          autoMatchedCount={batchData.kpis.autoMatchedCount}
          totalTransactions={batchData.kpis.totalTransactions}
          exceptionCount={batchData.kpis.exceptionCount}
          totalLiquidCash={treasuryState.totalLiquidCash}
          runwayDays={treasuryState.projectedRunwayDays}
          dailyBurn={treasuryState.dailyBurnRate}
        />

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <OverviewDashboard
            matches={batchData.matches}
            exceptions={batchData.exceptions}
            treasury={treasuryState}
            onSelectTab={setActiveTab}
            onOpenDispute={setActiveDispute}
            onShowToast={showToast}
          />
        )}

        {activeTab === "reconciliation" && (
          <ReconciliationTable
            matches={batchData.matches}
            onLoadStandardBatch={handleLoadStandardBatch}
            onLoadChaosBatch={handleLoadChaosBatch}
            onUploadCustomCsv={handleUploadCustomCsv}
            isIngesting={isIngesting}
          />
        )}

        {activeTab === "exceptions" && (
          <ExceptionWorkbench
            exceptions={batchData.exceptions}
            onShowToast={showToast}
          />
        )}

        {activeTab === "treasury" && (
          <TreasuryRunway treasury={treasuryState} />
        )}

        {activeTab === "copilot" && <CopilotChat />}
      </main>

      {/* Global Dispute Modal */}
      {activeDispute && (
        <DisputeModal
          exception={activeDispute}
          onClose={() => setActiveDispute(null)}
          onCopied={() => {
            showToast("Dispute notice copied to clipboard!");
          }}
        />
      )}

      {/* Toast Notification for explicit user actions only */}
      {toastMessage && (
        <div className="toast-notice" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
