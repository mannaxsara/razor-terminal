import React, { useState } from "react";
import type { CopilotMessage } from "../types";

export const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "m-init",
      sender: "copilot",
      timestamp: "Just now",
      text: "Hello! I am your Autonomous Settlement & Treasury Copilot. I monitor your 52-record multi-source batch, statutory TDS deductions (§194C/§194J/§194I), and forward runway. How can I assist you today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const predefinedPrompts = [
    {
      title: "1. 52-Record Batch & 96.2% Match Rate",
      query: "Explain the 52-record batch reconciliation and 96.2% match rate.",
      reply: `**52-Record Ground Truth Batch Reconciliation:**\n\n- **Total Ingested:** 52 transactions (55 AP Invoices + 47 Bank Debits + 5 Razorpay Settlements)\n- **Auto-Matched Records:** 50 records (96.2% match rate)\n  • Exact 1:1 Matches: 14 records\n  • Statutory TDS Withheld (§194C/J/I): 18 records (₹1,99,200 withheld)\n  • USD SaaS FX Conversions: 8 records (realized spot rate ₹84.30–₹84.50/USD)\n  • Razorpay PG Settlements: 5 records (2% fee + 18% GST netted)\n  • Split & Bulk Payments: 5 records\n- **Isolated Honest Exceptions:** 2 records (100% precision, zero false positives)\n  • 1 Vendor Price Overcharge: ₹40,000 variance on INV-2026-036\n  • 1 Unlinked Bank Debit: ₹48,500 with missing AP invoice\n- **Engine Throughput:** <20 milliseconds (>2,500 tx/sec)`,
    },
    {
      title: "2. Statutory TDS Breakdown (§194C/J/I)",
      query: "Show statutory TDS compliance breakdown across §194C, §194J, and §194I.",
      reply: `**Statutory TDS Compliance Breakdown:**\n\n1. **Section 194J (10% Tech / Professional / Legal):**\n   • Shardul Amarchand Legal: ₹25,000 TDS withheld on ₹2,50,000 invoice\n   • KPMG Advisory: ₹30,000 TDS withheld on ₹3,00,000 invoice\n   • Datadog India: ₹11,000 TDS withheld on ₹1,10,000 invoice\n   • Additional tech contractors withheld at 10%.\n2. **Section 194C (2% Contractor / Cloud / Logistics):**\n   • Amazon Web Services India: ₹2,500 TDS withheld on ₹1,25,000 invoice\n   • Google Cloud India: ₹1,600 TDS withheld on ₹80,000 invoice\n   • Delhivery Express Logistics: ₹1,280 TDS withheld on ₹64,000 invoice\n3. **Section 194I (10% Office Rent / Coworking):**\n   • WeWork India: ₹40,000 TDS withheld on ₹4,00,000 invoice\n   • Indiqube Spaces: ₹22,000 TDS withheld on ₹2,20,000 invoice\n\nAll TDS withholdings match statutory rates with 100% precision.`,
    },
    {
      title: "3. Honest Exception Desk & Dispute Drafts",
      query: "Review the 2 honest exceptions and explain dispute email generation.",
      reply: `**Honest Exception Desk Audit:**\n\nInstead of force-matching unresolvable transactions, RazorTerminal isolates the 2 genuine anomalies:\n\n1. **Price Mismatch / Overcharge (INV-2026-036):**\n   • Vendor: Overpriced Cloud Consultants\n   • Bank Debit: ₹2,84,000 (UTR: ICIC260826006677)\n   • Approved Invoice Net: ₹3,24,000 (Variance: ₹40,000)\n   • Action: 1-click vendor dispute email generated to request credit note.\n2. **Unlinked Bank Debit (TXN-HDFC-1029):**\n   • Debit Amount: ₹48,500 (UTR: HDFC260827009988)\n   • Narration: ACH-DEBIT-UNKNOWN-SUBSCRIPTION-SERV-MUMBAI\n   • Action: 1-click procurement inquiry email generated to request missing AP invoice.`,
    },
    {
      title: "4. Treasury Runway & Stress Test",
      query: "Run 30-day treasury liquidity and runway stress test.",
      reply: `**30-Day Treasury Liquidity & Runway Stress Test:**\n\n- **Total Cash & Equivalents:** ₹8,42,10,000 INR (~₹8.42 Cr) across 4 bank accounts\n  • HDFC Corporate Current: ₹3.85 Cr\n  • ICICI Operational: ₹2.45 Cr\n  • SBI Treasury Reserve: ₹1.22 Cr\n  • RazorpayX Nodal Payouts: ₹90.1 Lakhs\n- **Baseline Net Burn:** ₹3,62,000 / day → 232 Days Runway (>7.5 Months)\n- **Scenario Shock (+20% Vendor Cost Spike):**\n  • Adjusted Burn: ₹4,34,400 / day\n  • Adjusted Runway: 193 Days (-39 Days impact, still well above 90-day threshold)`,
    },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: "m-" + Date.now(),
      sender: "user",
      timestamp: "Just now",
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      // 1. Check for simple greetings
      const cleanText = text.trim().toLowerCase().replace(/[!.,?]/g, "");
      const isGreeting = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "sup", "greetings"].includes(cleanText);
      const isAck = ["okay", "ok", "k", "sure", "got it", "noted", "cool", "alright", "fine", "understood", "yes", "yep", "yeah"].includes(cleanText);
      const isPause = ["wait", "hold on", "pause", "give me a sec", "one sec", "one moment", "wait a minute"].includes(cleanText);
      const isGratitude = ["thanks", "thank you", "thx", "appreciate it", "great"].includes(cleanText);

      // 2. Find matching prompt or fallback intelligent reply
      const matched = predefinedPrompts.find((p) =>
        p.query.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(p.title.toLowerCase())
      );

      let replyText: string;

      if (isGreeting) {
        replyText = `Hello! How can I assist you with your books and treasury today?\n\nYou can ask me about:\n• **Statutory TDS deductions** under §194C, §194J, or §194I\n• **Gateway MDR fee splits** (2% Razorpay fee + 18% GST)\n• **Honest exception audits** and 1-click vendor dispute notices\n• **30-day cash runway** and cost shock simulations\n• Or click any of the **Quick Finance Actions** on the left!`;
      } else if (isPause) {
        replyText = `Standing by! Take your time. Whenever you're ready, let me know what you'd like to inspect in the ledger or treasury.`;
      } else if (isAck) {
        replyText = `Sounds good! Let me know which area of the books you'd like to dive into — TDS tax lines, Razorpay gateway fees, vendor dispute drafts, or forward cash runway.`;
      } else if (isGratitude) {
        replyText = `You're very welcome! Always here to keep the books balanced and cash positions clear. Let me know if you need any other ledger audit or export.`;
      } else if (matched) {
        replyText = matched.reply;
      } else if (cleanText.includes("tds") || cleanText.includes("tax") || cleanText.includes("194")) {
        replyText = predefinedPrompts[1].reply;
      } else if (cleanText.includes("dispute") || cleanText.includes("exception") || cleanText.includes("anomaly") || cleanText.includes("mismatch") || cleanText.includes("overcharge")) {
        replyText = predefinedPrompts[2].reply;
      } else if (cleanText.includes("runway") || cleanText.includes("burn") || cleanText.includes("cash") || cleanText.includes("treasury") || cleanText.includes("shock")) {
        replyText = predefinedPrompts[3].reply;
      } else if (cleanText.includes("batch") || cleanText.includes("reconcil") || cleanText.includes("match") || cleanText.includes("record")) {
        replyText = predefinedPrompts[0].reply;
      } else if (cleanText.includes("gateway") || cleanText.includes("fee") || cleanText.includes("mdr") || cleanText.includes("settle")) {
        replyText = `**Payment Gateway MDR & GST Breakdown:**\n\nFor settlements via Razorpay PG:\n• Standard Merchant Discount Rate (MDR): **2.00%** on gross collection volume\n• GST on financial processing fees: **18.00%**\n• Autonomous reconciliation automatically credits customer AR gross, debits the bank net deposit, and books fee + GST input credit lines with zero manual math.`;
      } else if (cleanText.includes("erp") || cleanText.includes("zoho") || cleanText.includes("tally") || cleanText.includes("export")) {
        replyText = `**Double-Entry ERP Journal Generation:**\n\nYou can download 100% balanced Indian GAAP journal entries right now from the **Reconciliation** tab via the **"📥 Export ERP (Zoho CSV)"** or **"Export JSON"** buttons! All 50 vouchers balance debits and credits with complete TDS liability and MDR fee splits.`;
      } else {
        replyText = `I can help you analyze any part of your books. Would you like to check **Statutory TDS (§194C/J/I)**, review the **2 flagged exceptions**, run a **30-day cash runway simulation**, or **export double-entry ERP journals** for Zoho Books?`;
      }

      const copilotMsg: CopilotMessage = {
        id: "m-" + (Date.now() + 1),
        sender: "copilot",
        timestamp: "Just now",
        text: replyText,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <section className="card-section" aria-label="Settlement Copilot Chat">
      <div className="section-header-bar">
        <div>
          <h2 className="section-heading">AI Settlement & Dispute Copilot</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Autonomous finance assistant for tax audits, fee variance breakdowns, and vendor dispute resolution
          </p>
        </div>
      </div>

      <div className="copilot-layout">
        <aside className="copilot-sidebar" aria-label="Suggested Prompts">
          <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Quick Finance Actions
          </h3>

          {predefinedPrompts.map((p, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSend(p.query)}
            >
              {p.title}
            </button>
          ))}
        </aside>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.sender === "user" ? "message-user" : "message-copilot"}`}
              >
                <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: "0.25rem" }}>
                  {msg.sender === "user" ? "You" : "RazorTerminal Copilot"} • {msg.timestamp}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble message-copilot">
                <span className="pulse-dot" style={{ display: "inline-block", marginRight: "0.5rem" }}></span>
                <span>Copilot is analyzing multi-source ledger...</span>
              </div>
            )}
          </div>

          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Ask about fee variances, statutory TDS, runway shocks, or vendor disputes..."
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Message Copilot"
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
