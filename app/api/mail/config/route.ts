import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getMailProviderDefaults, MailProvider } from "@/lib/mail-provider";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

interface MailConfig {
  provider: MailProvider;
  email: string;
  appPassword: string;
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
    return NextResponse.json({ error: "Failed to fetch mail config" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supplierKey = SUPPLIER_KEY;

    const body = (await req.json()) as { config?: MailConfig };
    const config = body.config;

    if (!config?.email || !config?.appPassword || !config.provider) {
      return NextResponse.json({ error: "provider, email, and appPassword are required" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save mail config:", error);
    return NextResponse.json({ error: "Failed to save mail config" }, { status: 500 });
  }
}
