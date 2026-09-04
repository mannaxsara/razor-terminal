/**
 * RazorTerminal — Invoices Ledger (Accounts Payable) Pane
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
import { SYNTHETIC_INVOICES } from "../reconciliation/data";
import type { InvoiceRecord } from "../reconciliation/types";

type InvoiceColumnId = "id" | "vendor" | "category" | "currency" | "total" | "tds" | "net";
type InvoiceColumn = DataTableColumn & { id: InvoiceColumnId };

const INV_COLUMNS: InvoiceColumn[] = [
  { id: "id", label: "Invoice No", width: 14, align: "left" },
  { id: "vendor", label: "Vendor Name", width: 26, align: "left" },
  { id: "category", label: "Type", width: 12, align: "left" },
  { id: "currency", label: "Cur", width: 6, align: "left" },
  { id: "total", label: "Total Billed", width: 14, align: "right" },
  { id: "tds", label: "TDS Deduct", width: 14, align: "right" },
  { id: "net", label: "Net Payable", width: 15, align: "right" },
];

export function InvoicesLedgerPane({ focused, width, height }: PaneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rows = SYNTHETIC_INVOICES;

  const renderCell = useCallback((inv: InvoiceRecord, column: InvoiceColumn, _index: number, rowState: DataTableRowState): DataTableCell => {
    const selectedColor = rowState.selected ? colors.selectedText : undefined;
    switch (column.id) {
      case "id":
        return { text: inv.id, color: selectedColor ?? colors.headerText };
      case "vendor":
        return { text: inv.vendorName, color: selectedColor ?? colors.textBright };
      case "category":
        return { text: inv.category.toUpperCase(), color: selectedColor ?? colors.textMuted };
      case "currency":
        return { text: inv.currency, color: selectedColor ?? (inv.currency === "USD" ? colors.warning : colors.textDim) };
      case "total":
        return {
          text: inv.currency === "USD" ? `$${inv.totalAmount.toLocaleString()}` : `₹${inv.totalAmount.toLocaleString("en-IN")}`,
          color: selectedColor ?? colors.textBright,
        };
      case "tds":
        return {
          text: inv.tdsApplicable ? `§${inv.tdsSection} (-₹${(inv.expectedTdsAmount ?? 0).toLocaleString("en-IN")})` : "—",
          color: selectedColor ?? (inv.tdsApplicable ? colors.warning : colors.textDim),
        };
      case "net":
        return {
          text: inv.currency === "USD" ? `$${inv.netPayable.toLocaleString()}` : `₹${inv.netPayable.toLocaleString("en-IN")}`,
          color: selectedColor ?? colors.positive,
        };
    }
  }, []);

  usePaneFooter("invoices-ledger", () => ({
    info: [
      {
        id: "ap-footer",
        parts: [
          { text: `Total AP Invoices: ${rows.length}`, tone: "muted" },
          { text: " │ ", tone: "muted" },
          { text: `TDS Covered: ${rows.filter((i) => i.tdsApplicable).length}`, tone: "positive" },
        ],
      },
    ],
  }), [rows]);

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.bg}>
      {/* Header */}
      <Box paddingX={1} paddingY={0} backgroundColor={colors.panel} borderBottomColor={colors.border}>
        <Text color={colors.headerText}>📄 ACCOUNTS PAYABLE </Text>
        <Text color={colors.textDim}>│ Invoices: </Text>
        <Text color={colors.textBright}>{rows.length} </Text>
        <Text color={colors.textDim}>│ Statutory TDS: §194C / §194J / §194I</Text>
      </Box>

      {/* Grid */}
      <Box flexGrow={1} overflow="hidden">
        <DataTableView<InvoiceRecord, InvoiceColumn>
          focused={focused}
          selection={{
            kind: "index",
            selectedIndex: selectedIdx,
            onChange: (index) => setSelectedIdx(index),
          }}
          rootWidth={width}
          rootHeight={height ? height - 2 : undefined}
          rootBackgroundColor={colors.bg}
          columns={INV_COLUMNS}
          items={rows}
          sortColumnId={null}
          sortDirection="asc"
          onHeaderClick={() => {}}
          emptyStateTitle="No invoices"
          getItemKey={(inv) => inv.id}
          renderCell={renderCell}
        />
      </Box>
    </Box>
  );
}
