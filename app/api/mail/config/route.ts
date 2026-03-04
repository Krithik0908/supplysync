import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getMailProviderDefaults, MailProvider } from "@/lib/mail-provider";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

interface MailConfig {
  provider: MailProvider;
  email: string;
  appPassword: string;
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const supplierKey = SUPPLIER_KEY;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("mailConfigs");

    const document = await collection.findOne<{ provider: MailProvider; email: string }>({ supplierKey });

    if (!document) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        provider: document.provider,
        email: document.email,
        appPassword: "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch mail config:", error);
    return jsonError("Failed to fetch mail config", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supplierKey = SUPPLIER_KEY;

    const rawBody = await req.text();
    let body: { config?: MailConfig };
    try {
      body = JSON.parse(rawBody) as { config?: MailConfig };
    } catch {
      return jsonError("Invalid JSON request body", 400);
    }

    const config = body.config;

    if (!config?.email || !config?.appPassword || !config.provider) {
      return jsonError("provider, email, and appPassword are required", 400);
    }

    const defaults = getMailProviderDefaults(config.provider);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("mailConfigs");

    await collection.updateOne(
      { supplierKey },
      {
        $set: {
          supplierKey,
          provider: config.provider,
          email: config.email.trim().toLowerCase(),
          appPassword: config.appPassword.replace(/\s+/g, "").trim(),
          ...defaults,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to save mail config:", error);
    return jsonError("Failed to save mail config", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supplierKey = SUPPLIER_KEY;

    let deleteEmailData = false;
    const rawBody = await req.text();
    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody) as { deleteEmailData?: boolean };
        deleteEmailData = Boolean(parsed.deleteEmailData);
      } catch {
        return jsonError("Invalid JSON request body", 400);
      }
    }

    const client = await clientPromise;
    const db = client.db();
    const mailConfigsCollection = db.collection("mailConfigs");
    const analysesCollection = db.collection("analyses");
    const alertsCollection = db.collection("alerts");

    const result = await mailConfigsCollection.deleteOne({ supplierKey });

    let deletedAnalyses = 0;
    let deletedAlerts = 0;
    if (deleteEmailData) {
      const [analysisDeleteResult, alertsDeleteResult] = await Promise.all([
        analysesCollection.deleteMany({ supplierKey }),
        alertsCollection.deleteMany({ supplierKey }),
      ]);
      deletedAnalyses = analysisDeleteResult.deletedCount || 0;
      deletedAlerts = alertsDeleteResult.deletedCount || 0;
    }

    return NextResponse.json(
      {
        success: true,
        disconnected: result.deletedCount > 0,
        deleteEmailData,
        deletedAnalyses,
        deletedAlerts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to disconnect mail config:", error);
    return jsonError("Failed to disconnect mailbox", 500);
  }
}
