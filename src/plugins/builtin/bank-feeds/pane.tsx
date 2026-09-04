/**
 * RazorTerminal — Bank Feeds (Multi-Bank Stream) Pane
 */

import { useState, useCallback } from "react";
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
import { SYNTHETIC_BANK_DEBITS, SYNTHETIC_BANK_CREDITS } from "../reconciliation/data";
import type { BankStatementRecord } from "../reconciliation/types";

type BankColumnId = "id" | "bank" | "date" | "type" | "amount" | "utr" | "narration";
type BankColumn = DataTableColumn & { id: BankColumnId };

const BANK_COLUMNS: BankColumn[] = [
  { id: "id", label: "Txn ID", width: 16, align: "left" },
  { id: "bank", label: "Bank", width: 8, align: "left" },
  { id: "date", label: "Val Date", width: 12, align: "left" },
  { id: "type", label: "Type", width: 8, align: "left" },
  { id: "amount", label: "Amount (INR)", width: 14, align: "right" },
  { id: "utr", label: "UTR Reference", width: 20, align: "left" },
  { id: "narration", label: "Bank Narration", width: 34, align: "left" },
];

export function BankFeedsPane({ focused, width, height }: PaneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rows = [...SYNTHETIC_BANK_CREDITS, ...SYNTHETIC_BANK_DEBITS];

  const renderCell = useCallback((tx: BankStatementRecord, column: BankColumn, _index: number, rowState: DataTableRowState): DataTableCell => {
    const selectedColor = rowState.selected ? colors.selectedText : undefined;
    switch (column.id) {
      case "id":
        return { text: tx.id, color: selectedColor ?? colors.textBright };
      case "bank":
        return { text: tx.bank, color: selectedColor ?? colors.textMuted };
      case "date":
        return { text: tx.valueDate, color: selectedColor ?? colors.textDim };
      case "type":
        return { text: tx.type, color: selectedColor ?? (tx.type === "CREDIT" ? colors.positive : colors.warning) };
      case "amount":
        return {
          text: `₹${tx.amount.toLocaleString("en-IN")}`,
          color: selectedColor ?? (tx.type === "CREDIT" ? colors.positive : colors.textBright),
        };
      case "utr":
        return { text: tx.utr, color: selectedColor ?? colors.headerText };
      case "narration":
        return { text: tx.narration, color: selectedColor ?? colors.textMuted };
    }
  }, []);

  usePaneFooter("bank-feeds", () => ({
    info: [
      {
        id: "bank-footer",
        parts: [
          { text: "Bank Feeds: Live Synced", tone: "positive" },
          { text: " │ ", tone: "muted" },
          { text: "UTR Stream: Connected", tone: "positive" },
        ],
      },
    ],
  }), []);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Header: Direct Metadata */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.headerText}>Transactions: </Text>
        <Text color={colors.textBright}>{rows.length} records </Text>
        <Text color={colors.textDim}>│ Feeds: </Text>
        <Text color={colors.textBright}>ICICI + HDFC + RZP-PG </Text>
        <Text color={colors.textDim}>│ UTR Index: </Text>
        <Text color={colors.positive}>Active</Text>
      </Box>

      {/* Grid */}
      <Box flexGrow={1} overflow="hidden">
        <DataTableView<BankStatementRecord, BankColumn>
          focused={focused}
          selection={{
            kind: "index",
            selectedIndex: selectedIdx,
            onChange: (index) => setSelectedIdx(index),
          }}
          rootWidth={width}
          rootHeight={height ? height - 2 : undefined}
          rootBackgroundColor={colors.bg}
          columns={BANK_COLUMNS}
          items={rows}
          sortColumnId={null}
          sortDirection="asc"
          onHeaderClick={() => {}}
          emptyStateTitle="No bank transactions"
          getItemKey={(tx) => tx.id}
          renderCell={renderCell}
        />
      </Box>
    </Box>
  );
}
