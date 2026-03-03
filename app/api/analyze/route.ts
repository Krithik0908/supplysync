import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { analyzeSupplierEmail } from "@/lib/email-analysis";
import { sendAlertNotification } from "@/lib/alert-notify";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

export async function POST(req: NextRequest) {
  try {
    const normalizedSupplierKey = SUPPLIER_KEY;

    const { emailContent } = await req.json();
    const data = await analyzeSupplierEmail(emailContent);

    // Save to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db(); // uses database from connection string (supplysync)
      const collection = db.collection("analyses");
      const alertsCollection = db.collection("alerts");

      const result = await collection.insertOne({
        supplierKey: normalizedSupplierKey,
        emailContent,
        purpose: data.purpose,
        paymentDelayed: data.paymentDelayed,
        riskLevel: data.riskLevel,
        confidenceScore: data.confidenceScore,
        reasoning: data.reasoning,
        suggestedAction: data.suggestedAction,
        draftedReply: data.draftedReply,
        invoiceAmount: data.invoiceAmount,
        delayDays: data.delayDays,
        responseSent: false,
        createdAt: new Date(),
      });

      if (data.riskLevel === "high" || data.paymentDelayed) {
        const alertTitle = data.purpose?.trim() || "Supplier email";
        const alertMessage = data.paymentDelayed
          ? "Payment delay detected. Immediate follow-up recommended."
          : "High-risk email detected. Review and respond quickly.";

        await alertsCollection.insertOne({
          supplierKey: normalizedSupplierKey,
          analysisId: result.insertedId.toString(),
          level: data.riskLevel,
          type: data.paymentDelayed ? "overdue" : "high-risk",
          title: alertTitle,
          message: alertMessage,
          createdAt: new Date(),
        });

        await sendAlertNotification(
          db,
          normalizedSupplierKey,
          alertTitle,
          `${alertMessage}\n\nSuggested action: ${data.suggestedAction}`
        );
      }

      return NextResponse.json({ ...data, id: result.insertedId.toString() });
    } catch (dbError) {
      console.error("MongoDB save error:", dbError);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze email" },
      { status: 500 }
    );
  }
}