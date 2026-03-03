import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

interface AnalysisDoc {
  riskLevel?: "low" | "medium" | "high";
  paymentDelayed?: boolean;
  invoiceAmount?: number;
  delayDays?: number;
  responseSent?: boolean;
  respondedAt?: Date;
  createdAt?: Date;
}

export async function GET() {
  try {
    const supplierKey = SUPPLIER_KEY;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analyses");

    const analyses = await collection.find<AnalysisDoc>({ supplierKey }).toArray();

    const overdueEntries = analyses.filter((item) => item.paymentDelayed);
    const overdueAmount = overdueEntries.reduce((sum, item) => sum + (Number(item.invoiceAmount) || 0), 0);

    const delayValues = overdueEntries
      .map((item) => Number(item.delayDays) || 0)
      .filter((value) => value > 0);
    const averagePaymentDelay = delayValues.length
      ? Math.round(delayValues.reduce((sum, value) => sum + value, 0) / delayValues.length)
      : 0;

    const respondedEntries = analyses.filter((item) => item.responseSent && item.respondedAt && item.createdAt);
    const avgResponseMs = respondedEntries.length
      ? respondedEntries.reduce((sum, item) => {
          const respondedAt = new Date(item.respondedAt as Date).getTime();
          const createdAt = new Date(item.createdAt as Date).getTime();
          return sum + Math.max(0, respondedAt - createdAt);
        }, 0) / respondedEntries.length
      : 0;

    const avgResponseHours = avgResponseMs > 0 ? Number((avgResponseMs / (1000 * 60 * 60)).toFixed(1)) : 0;

    const recoveryRate = overdueEntries.length
      ? Math.round((overdueEntries.filter((item) => item.responseSent).length / overdueEntries.length) * 100)
      : 0;

    const highRiskCount = analyses.filter((item) => item.riskLevel === "high").length;
    const mediumRiskCount = analyses.filter((item) => item.riskLevel === "medium").length;
    const totalAnalyses = analyses.length;

    const riskBySeverity = totalAnalyses
      ? ((highRiskCount * 1 + mediumRiskCount * 0.55) / totalAnalyses) * 100
      : 0;
    const delayPressure = totalAnalyses ? (overdueEntries.length / totalAnalyses) * 100 : 0;
    const responsePenalty = 100 - recoveryRate;
    const supplierRiskScore = Math.min(
      100,
      Math.max(0, Math.round(riskBySeverity * 0.5 + delayPressure * 0.3 + responsePenalty * 0.2))
    );

    return NextResponse.json({
      overdueAmount,
      moneyAtRisk: overdueAmount,
      atRiskInvoices: overdueEntries.length,
      averagePaymentDelay,
      averageResponseHours: avgResponseHours,
      recoveryRate,
      supplierRiskScore,
    });
  } catch (error) {
    console.error("Failed to calculate KPIs:", error);
    return NextResponse.json({ error: "Failed to load KPIs" }, { status: 500 });
  }
}
