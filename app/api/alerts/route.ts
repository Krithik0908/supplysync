import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

export async function GET() {
  try {
    const supplierKey = SUPPLIER_KEY;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("alerts");

    const alerts = await collection
      .find({ supplierKey })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(
      alerts.map((alert) => ({
        id: alert._id.toString(),
        analysisId: alert.analysisId,
        level: alert.level,
        type: alert.type,
        title: typeof alert.title === "string" && alert.title.trim().length > 0
          ? alert.title
          : (typeof alert.message === "string" && alert.message.includes(":"))
            ? alert.message.split(":").slice(1).join(":").trim()
            : "Supplier email",
        message: alert.message,
        createdAt: alert.createdAt instanceof Date ? alert.createdAt.toISOString() : new Date(alert.createdAt).toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}
