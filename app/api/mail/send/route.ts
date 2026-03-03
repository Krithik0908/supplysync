import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

export async function POST(req: NextRequest) {
  try {
    const supplierKey = SUPPLIER_KEY;

    const { analysisId, toEmail, subject, body } = (await req.json()) as {
      analysisId?: string;
      toEmail?: string;
      subject?: string;
      body?: string;
    };

    if (!toEmail || !subject || !body) {
      return NextResponse.json({ error: "toEmail, subject, and body are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const configCollection = db.collection("mailConfigs");
    const analysesCollection = db.collection("analyses");

    const config = await configCollection.findOne<{
      email: string;
      appPassword: string;
      smtpHost: string;
      smtpPort: number;
      secureSmtp: boolean;
    }>({ supplierKey });

    if (!config) {
      return NextResponse.json({ error: "Mail integration not configured" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.secureSmtp,
      auth: {
        user: config.email,
        pass: config.appPassword,
      },
    });

    await transporter.sendMail({
      from: config.email,
      to: toEmail,
      subject,
      text: body,
    });

    if (analysisId) {
      if (ObjectId.isValid(analysisId)) {
        await analysesCollection.updateOne(
          { supplierKey, _id: new ObjectId(analysisId) },
          {
            $set: {
              responseSent: true,
              respondedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
