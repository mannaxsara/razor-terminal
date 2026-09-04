/**
 * RazorTerminal — AI Exception Queue & Audit Sign-Off Gate Pane
 */

import { useState, useMemo, useCallback } from "react";
import {
  DataTableView,
  usePaneFooter,
  type DataTableCell,
  type DataTableColumn,
} from "../../../components";
import type { DataTableRowState } from "../../../components/ui/data-table/types";
import { colors } from "../../../theme/colors";
import { Box, Text } from "../../../ui";
import type { PaneProps } from "../../../types/plugin";
import { useShortcut } from "../../../react/input";
import { AutonomousReconciliationEngine } from "../reconciliation/engine";
import {
  SYNTHETIC_INVOICES,
  SYNTHETIC_BANK_DEBITS,
  SYNTHETIC_BANK_CREDITS,
  SYNTHETIC_RAZORPAY_SETTLEMENTS,
} from "../reconciliation/data";
import type { ReconciledMatch } from "../reconciliation/types";

type ExceptionColumnId = "id" | "bank" | "category" | "amount" | "suggested" | "review";
type ExceptionColumn = DataTableColumn & { id: ExceptionColumnId };

const EXC_COLUMNS: ExceptionColumn[] = [
  { id: "id", label: "Txn ID", width: 16, align: "left" },
  { id: "bank", label: "Bank", width: 10, align: "left" },
  { id: "category", label: "Anomaly Type", width: 22, align: "left" },
  { id: "amount", label: "Amount (INR)", width: 15, align: "right" },
  { id: "suggested", label: "Suggested Action", width: 28, align: "left" },
  { id: "review", label: "Sign-Off", width: 14, align: "left" },
];

export function ExceptionQueuePane({ focused, width, height }: PaneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [resolutionStatus, setResolutionStatus] = useState<Record<string, "APPROVED" | "REJECTED">>({});

  const engine = useMemo(() => new AutonomousReconciliationEngine(), []);
  const allTx = useMemo(() => [...SYNTHETIC_BANK_DEBITS, ...SYNTHETIC_BANK_CREDITS], []);
  const results = useMemo(() => engine.reconcileBatch(SYNTHETIC_INVOICES, allTx, SYNTHETIC_RAZORPAY_SETTLEMENTS), [engine, allTx]);

  const rows = results.exceptions;
  const selectedExc = rows[selectedIdx];

  const handleApprove = useCallback((id: string) => {
    setResolutionStatus((prev) => ({ ...prev, [id]: "APPROVED" }));
  }, []);

  const handleReject = useCallback((id: string) => {
    setResolutionStatus((prev) => ({ ...prev, [id]: "REJECTED" }));
  }, []);

  useShortcut((event) => {
    if (!focused || !selectedExc) return;
    if (event.name === "a" || event.name === "A") {
      event.preventDefault?.();
      event.stopPropagation?.();
      handleApprove(selectedExc.matchId);
    } else if (event.name === "r" || event.name === "R") {
      event.preventDefault?.();
      event.stopPropagation?.();
      handleReject(selectedExc.matchId);
    }
  });

  const renderCell = useCallback((exc: ReconciledMatch, column: ExceptionColumn, _index: number, rowState: DataTableRowState): DataTableCell => {
    const selectedColor = rowState.selected ? colors.selectedText : undefined;
    const status = resolutionStatus[exc.matchId];

    switch (column.id) {
      case "id":
        return { text: exc.transactionId, color: selectedColor ?? colors.textBright };
      case "bank":
        return { text: exc.bank, color: selectedColor ?? colors.textMuted };
      case "category": {
        const catLabel = exc.category === "PRICE_MISMATCH" ? "Price Overcharge" : "Unlinked Bank Debit";
        return { text: catLabel, color: selectedColor ?? colors.negative };
      }
      case "amount":
        return { text: `₹${exc.transactionAmount.toLocaleString("en-IN")}`, color: selectedColor ?? colors.textBright };
      case "suggested": {
        const sugLabel = exc.category === "PRICE_MISMATCH" ? "Draft Vendor Dispute Notice" : "Inquire Procurement for Inv";
        return { text: sugLabel, color: selectedColor ?? colors.warning };
      }
      case "review":
        if (status === "APPROVED") return { text: "[APPROVED]", color: colors.positive };
        if (status === "REJECTED") return { text: "[REJECTED]", color: colors.negative };
        return { text: "[PENDING]", color: selectedColor ?? colors.warning };
    }
  }, [resolutionStatus]);

  const pendingCount = rows.filter((r) => !resolutionStatus[r.matchId]).length;

  usePaneFooter("exception-queue", () => ({
    info: [
      {
        id: "exc-status",
        parts: [
          {
            text: pendingCount === 0 ? "Review: All Signed Off" : `Review: ${pendingCount} Awaiting Sign-Off`,
            tone: pendingCount === 0 ? "positive" : "warning",
          },
          { text: " │ ", tone: "muted" },
          { text: "Queue: Synced", tone: "positive" },
        ],
      },
    ],
  }), [pendingCount]);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Alert Header: Direct Metadata */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.negative}>Flagged: </Text>
        <Text color={colors.warning}>2 Anomalies Isolated </Text>
        <Text color={colors.textDim}>│ False Positives: </Text>
        <Text color={colors.positive}>0 (100% Precision) </Text>
        <Text color={colors.textDim}>│ Action: </Text>
        <Text color={colors.textBright}>[A] Approve  [R] Reject</Text>
      </Box>

      {/* Grid */}
      <Box flexGrow={1} overflow="hidden">
        <DataTableView<ReconciledMatch, ExceptionColumn>
          focused={focused}
          selection={{
            kind: "index",
            selectedIndex: selectedIdx,
            onChange: (index) => setSelectedIdx(index),
          }}
          rootWidth={width}
          rootHeight={height ? height - 5 : undefined}
          rootBackgroundColor={colors.bg}
          columns={EXC_COLUMNS}
          items={rows}
          sortColumnId={null}
          sortDirection="asc"
          onHeaderClick={() => {}}
          emptyStateTitle="No exceptions"
          getItemKey={(exc) => exc.matchId}
          renderCell={renderCell}
        />
      </Box>

      {/* Controller Sign-off Action Bar */}
      {selectedExc && (
        <Box
          paddingX={1}
          paddingY={0}
          backgroundColor={colors.panel}
          borderTopColor={colors.border}
          flexDirection="column"
        >
          <Box flexDirection="row">
            <Text color={colors.negative}>DIAGNOSIS: </Text>
            <Text color={colors.textBright}>{selectedExc.explanation}</Text>
          </Box>
          <Box flexDirection="row" marginTop={0}>
            <Text color={colors.textDim}>CONTROLLER ACTIONS: </Text>
            <Text
              color={colors.positive}
              onMouseDown={() => handleApprove(selectedExc.matchId)}
            >
              [A] APPROVE ADJUSTMENT
            </Text>
            <Text color={colors.textDim}>  </Text>
            <Text
              color={colors.negative}
              onMouseDown={() => handleReject(selectedExc.matchId)}
            >
              [R] REJECT & FLAG VENDOR
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
