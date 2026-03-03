import Groq from "groq-sdk";

export interface ParsedEmailAnalysis {
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  confidenceScore: number;
  reasoning: string;
  suggestedAction: string;
  draftedReply: string;
  invoiceAmount: number;
  delayDays: number;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeSupplierEmail(emailContent: string): Promise<ParsedEmailAnalysis> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You analyze supplier payment emails. Always return strict JSON only with the required keys. No markdown.",
      },
      {
        role: "user",
        content: `Analyze this supplier email and return JSON:
{
  "purpose": "brief purpose",
  "paymentDelayed": true or false,
  "riskLevel": "low" | "medium" | "high",
  "confidenceScore": number (0-100),
  "reasoning": "one sentence on why this risk level was assigned",
  "suggestedAction": "recommended next step",
  "draftedReply": "professional follow-up reply",
  "invoiceAmount": number (0 if unknown),
  "delayDays": number (0 if unknown)
}

Email:
${emailContent}`,
      },
    ],
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<ParsedEmailAnalysis>;

  const riskLevel =
    parsed.riskLevel === "high" || parsed.riskLevel === "medium" || parsed.riskLevel === "low"
      ? parsed.riskLevel
      : "medium";

  return {
    purpose: String(parsed.purpose || "Supplier email inquiry"),
    paymentDelayed: Boolean(parsed.paymentDelayed),
    riskLevel,
    confidenceScore: Math.max(0, Math.min(100, Number(parsed.confidenceScore) || 70)),
    reasoning: String(
      parsed.reasoning ||
        "Risk level is based on payment timeline, urgency language, and the operational impact described in the email."
    ),
    suggestedAction: String(parsed.suggestedAction || "Review and respond to supplier email."),
    draftedReply: String(parsed.draftedReply || "Dear Team,\n\nThank you for your email. We are reviewing this and will revert shortly.\n\nBest regards."),
    invoiceAmount: Number.isFinite(Number(parsed.invoiceAmount)) ? Number(parsed.invoiceAmount) : 0,
    delayDays: Number.isFinite(Number(parsed.delayDays)) ? Number(parsed.delayDays) : 0,
  };
}
