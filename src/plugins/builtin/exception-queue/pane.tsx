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
  { id: "suggested", label: "Suggested Action", width: 26, align: "left" },
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

  const renderCell = useCallback((exc: ReconciledMatch, column: ExceptionColumn, _index: number, rowState: DataTableRowState): DataTableCell => {
    const selectedColor = rowState.selected ? colors.selectedText : undefined;
    const status = resolutionStatus[exc.matchId];

    switch (column.id) {
      case "id":
        return { text: exc.transactionId, color: selectedColor ?? colors.textBright };
      case "bank":
        return { text: exc.bank, color: selectedColor ?? colors.textMuted };
      case "category":
        return { text: exc.category, color: selectedColor ?? colors.negative };
      case "amount":
        return { text: `₹${exc.transactionAmount.toLocaleString("en-IN")}`, color: selectedColor ?? colors.textBright };
      case "suggested":
        return { text: exc.suggestedAction, color: selectedColor ?? colors.warning };
      case "review":
        if (status === "APPROVED") return { text: "✅ APPROVED", color: colors.positive };
        if (status === "REJECTED") return { text: "❌ REJECTED", color: colors.negative };
        return { text: "⏳ PENDING", color: selectedColor ?? colors.warning };
    }
  }, [resolutionStatus]);

  usePaneFooter("exception-queue", () => ({
    info: [
      {
        id: "exc-status",
        parts: [
          { text: `Unresolved Anomalies: ${rows.length}`, tone: rows.length > 0 ? "warning" : "positive" },
          { text: " │ ", tone: "muted" },
          { text: "Press [A] Approve Adjustment │ [R] Reject Anomaly", tone: "muted" },
        ],
      },
    ],
  }), [rows.length]);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Alert Header */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.negative}>🚨 AI EXCEPTION QUEUE </Text>
        <Text color={colors.textDim}>│ Flagged Anomalies: </Text>
        <Text color={colors.warning}>{rows.length} </Text>
        <Text color={colors.textDim}>│ Bounded Risk Guardrail: Active</Text>
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
