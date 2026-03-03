import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

interface SupplierSettings {
  companyName: string;
  contactPerson: string;
  email: string;
  paymentTerms: string;
  currencyPreference: string;
}

const DEFAULT_SETTINGS: SupplierSettings = {
  companyName: "",
  contactPerson: "",
  email: "",
  paymentTerms: "Net 30",
  currencyPreference: "USD",
};

export async function GET() {
  try {
    const supplierKey = SUPPLIER_KEY;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("supplierSettings");

    const document = await collection.findOne({ supplierKey });

    if (!document) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }

    return NextResponse.json({
      settings: {
        companyName: document.companyName || "",
        contactPerson: document.contactPerson || "",
        email: document.email || "",
        paymentTerms: document.paymentTerms || "Net 30",
        currencyPreference: document.currencyPreference || "USD",
      },
    });
  } catch (error) {
    console.error("Error fetching supplier settings:", error);
    return NextResponse.json({ error: "Failed to fetch supplier settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supplierKey = SUPPLIER_KEY;

    const body = await req.json();
    const settings = body?.settings as SupplierSettings | undefined;

    if (!settings) {
      return NextResponse.json({ error: "Settings are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("supplierSettings");

    await collection.updateOne(
      { supplierKey },
      {
        $set: {
          supplierKey,
          companyName: settings.companyName || "",
          contactPerson: settings.contactPerson || "",
          email: settings.email || "",
          paymentTerms: settings.paymentTerms || "Net 30",
          currencyPreference: settings.currencyPreference || "USD",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving supplier settings:", error);
    return NextResponse.json({ error: "Failed to save supplier settings" }, { status: 500 });
  }
}