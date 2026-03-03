import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import clientPromise from "@/lib/mongodb";
import { analyzeSupplierEmail } from "@/lib/email-analysis";
import { sendAlertNotification } from "@/lib/alert-notify";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

type ParsedAddress = { value?: Array<{ address?: string }> };

export async function POST() {
  let client: ImapFlow | null = null;

  try {
    const supplierKey = SUPPLIER_KEY;

    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    const configCollection = db.collection("mailConfigs");
    const analysesCollection = db.collection("analyses");
    const alertsCollection = db.collection("alerts");

    const config = await configCollection.findOne<{
      provider: "gmail" | "outlook";
      email: string;
      appPassword: string;
      imapHost: string;
      imapPort: number;
    }>({ supplierKey });

    if (!config) {
      return NextResponse.json({ error: "Mail integration not configured" }, { status: 400 });
    }

    client = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: true,
      auth: {
        user: config.email,
        pass: config.appPassword,
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    const syncedIds: string[] = [];

    try {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
      const messages = client.fetch(
        { since },
        { uid: true, envelope: true, source: true },
        { uid: true }
      );

      let processedCount = 0;
      for await (const message of messages) {
        if (processedCount >= 10) break;

        const messageId = message.envelope?.messageId || `${message.uid}`;
        if (!messageId) continue;

        const existing = await analysesCollection.findOne({ supplierKey, messageId });
        if (existing) continue;

        const parsedEmail = await simpleParser(message.source as Buffer);
        const subject = parsedEmail.subject || "No subject";
        const fromAddress = (parsedEmail.from as ParsedAddress)?.value?.[0]?.address || "";
        const bodyText = parsedEmail.text?.trim() || parsedEmail.html?.toString() || "";

        if (!bodyText) continue;

        const analysis = await analyzeSupplierEmail(bodyText);

        const insertResult = await analysesCollection.insertOne({
          supplierKey,
          source: config.provider,
          messageId,
          subject,
          supplierEmail: fromAddress,
          emailContent: bodyText,
          purpose: analysis.purpose,
          paymentDelayed: analysis.paymentDelayed,
          riskLevel: analysis.riskLevel,
          confidenceScore: analysis.confidenceScore,
          reasoning: analysis.reasoning,
          suggestedAction: analysis.suggestedAction,
          draftedReply: analysis.draftedReply,
          invoiceAmount: analysis.invoiceAmount,
          delayDays: analysis.delayDays,
          responseSent: false,
          createdAt: new Date(),
        });

        syncedIds.push(insertResult.insertedId.toString());
        processedCount += 1;

        if (analysis.riskLevel === "high" || analysis.paymentDelayed) {
          const alertTitle = subject || analysis.purpose || "Supplier email";
          const alertMessage = analysis.paymentDelayed
            ? "Payment delay detected. Immediate follow-up recommended."
            : "High-risk email detected. Review and respond quickly.";

          await alertsCollection.insertOne({
            supplierKey,
            analysisId: insertResult.insertedId.toString(),
            level: analysis.riskLevel,
            type: analysis.paymentDelayed ? "overdue" : "high-risk",
            title: alertTitle,
            message: alertMessage,
            createdAt: new Date(),
          });

          await sendAlertNotification(
            db,
            supplierKey,
            alertTitle,
            `${alertMessage}\n\nSuggested action: ${analysis.suggestedAction}`
          );
        }
      }
    } finally {
      lock.release();
    }

    return NextResponse.json({ success: true, synced: syncedIds.length, analysisIds: syncedIds });
  } catch (error) {
    console.error("Inbox sync failed:", error);
    const responseText = typeof (error as { responseText?: unknown })?.responseText === "string"
      ? (error as { responseText: string }).responseText
      : "";
    const responseStatus = typeof (error as { responseStatus?: unknown })?.responseStatus === "string"
      ? (error as { responseStatus: string }).responseStatus
      : "";
    const serverResponseCode = typeof (error as { serverResponseCode?: unknown })?.serverResponseCode === "string"
      ? (error as { serverResponseCode: string }).serverResponseCode
      : "";

    if (
      serverResponseCode === "AUTHENTICATIONFAILED" ||
      responseStatus === "NO" ||
      responseText.toLowerCase().includes("invalid credentials")
    ) {
      return NextResponse.json(
        { error: "Mailbox authentication failed. Re-save Supplier > Email Integration with a valid app password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to sync inbox. Check mailbox provider, app password, and IMAP access." },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.logout().catch(() => undefined);
    }
  }
}
