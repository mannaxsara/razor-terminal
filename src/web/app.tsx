import React, { useState } from "react";
import { Header } from "./components/Header";
import { KpiGrid } from "./components/KpiGrid";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ReconciliationTable } from "./components/ReconciliationTable";
import { ExceptionWorkbench } from "./components/ExceptionWorkbench";
import { TreasuryRunway } from "./components/TreasuryRunway";
import { CopilotChat } from "./components/CopilotChat";
import { DisputeModal } from "./components/DisputeModal";
import { getReconciledBatchData, getTreasuryState } from "./data";
import type { WebExceptionItem } from "./types";
import "./styles.css";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reconciliation" | "exceptions" | "treasury" | "copilot"
  >("dashboard");
  const [activeDispute, setActiveDispute] = useState<WebExceptionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const batchData = getReconciledBatchData();
  const treasuryState = getTreasuryState();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchCount={batchData.matches.length}
        exceptionCount={batchData.exceptions.length}
        runwayDays={treasuryState.projectedRunwayDays}
        throughputTps={batchData.kpis.throughputTps}
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
          <ReconciliationTable matches={batchData.matches} />
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice" role="status">
          Done: {toastMessage}
        </div>
      )}
    </div>
  );
};
