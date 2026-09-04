/**
 * RazorTerminal — Settlement Q&A & Dispute Resolution Agent Pane
 */

import { useState, useMemo, useCallback } from "react";
import { usePaneFooter } from "../../../components";
import { colors } from "../../../theme/colors";
import { Box, Text } from "../../../ui";
import type { PaneProps } from "../../../types/plugin";
import { useShortcut } from "../../../react/input";
import { SettlementAgentEngine } from "./engine";
import { SUGGESTED_PROMPTS, type SettlementQaAnswer } from "./types";

export function SettlementAgentPane({ focused, width, height }: PaneProps) {
  const agent = useMemo(() => new SettlementAgentEngine(), []);
  
  // Seed with the first suggested prompt answer
  const [history, setHistory] = useState<SettlementQaAnswer[]>(() => [
    agent.answerQuery(SUGGESTED_PROMPTS[0]!.query),
  ]);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);

  const handleSelectPrompt = useCallback((idx: number) => {
    setSelectedPromptIdx(idx);
    const prompt = SUGGESTED_PROMPTS[idx];
    if (prompt) {
      const ans = agent.answerQuery(prompt.query);
      setHistory((prev) => [ans, ...prev.slice(0, 4)]);
    }
  }, [agent]);

  useShortcut((event) => {
    if (!focused) return;
    if (event.name === "1") handleSelectPrompt(0);
    else if (event.name === "2") handleSelectPrompt(1);
    else if (event.name === "3") handleSelectPrompt(2);
    else if (event.name === "4") handleSelectPrompt(3);
  });

  usePaneFooter(
    "settlement-agent",
    () => ({
      info: [
        {
          id: "agent-status",
          parts: [
            { text: "Agent: Ready", tone: "positive" },
            { text: " │ ", tone: "muted" },
            { text: "Session: Synced", tone: "positive" },
          ],
        },
      ],
    }),
    []
  );

  const latestAnswer = history[0];

  return (
    <Box flexDirection="column" width="100%" height="100%" backgroundColor={colors.panel}>
      {/* Quick Action Prompt Bar */}
      <Box flexDirection="column" paddingX={1} paddingY={1} backgroundColor={colors.header}>
        <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
          <Text color={colors.headerText} bold>QUICK DEMO QUERIES [1-4]:</Text>
          <Text color={colors.textDim}>[Click or Press 1-4 to Query]</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          {SUGGESTED_PROMPTS.map((p, idx) => {
            const isSelected = selectedPromptIdx === idx;
            return (
              <Box
                key={p.id}
                paddingX={1}
                backgroundColor={isSelected ? colors.selected : colors.commandBg}
                onMouseDown={() => handleSelectPrompt(idx)}
              >
                <Text color={isSelected ? colors.selectedText : colors.headerText} bold>
                  [{idx + 1}] {p.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box flexDirection="column" flexGrow={1} padding={1} gap={1} overflowY="hidden">
        {latestAnswer && (
          <Box flexDirection="column" gap={1}>
            {/* Active Question Box */}
            <Box flexDirection="row" gap={1} backgroundColor={colors.commandBg} padding={1}>
              <Text color={colors.warning} bold>USER QUERY:</Text>
              <Text color={colors.textBright}>{latestAnswer.query}</Text>
            </Box>

            {/* Answer Summary */}
            <Box flexDirection="column" backgroundColor={colors.panel} padding={1} gap={1}>
              <Box flexDirection="row" gap={1}>
                <Text color={colors.positive} bold>AGENT VERDICT:</Text>
                <Text color={colors.textBright} bold>{latestAnswer.summaryText}</Text>
              </Box>

              {/* Breakdown Lines */}
              <Box flexDirection="column" gap={0} paddingLeft={1}>
                {latestAnswer.breakdownLines.map((line, i) => (
                  <Text key={i} color={line.startsWith("• Net") || line.startsWith("• Total TDS") || line.startsWith("• Updated") ? colors.positive : colors.textMuted}>
                    {line}
                  </Text>
                ))}
              </Box>
            </Box>

            {/* If Dispute Draft is present, render formal letter preview */}
            {latestAnswer.disputeDraft && (
              <Box flexDirection="column" backgroundColor={colors.commandBg} padding={1} gap={1}>
                <Box flexDirection="row" justifyContent="space-between">
                  <Text color={colors.negative} bold>GENERATED FORMAL VENDOR DISPUTE NOTICE</Text>
                  <Text color={colors.textDim}>Status: Ready to Dispatch</Text>
                </Box>
                <Box flexDirection="column" backgroundColor={colors.panel} padding={1}>
                  <Text color={colors.textBright}>
                    {latestAnswer.disputeDraft.formattedLetter}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
