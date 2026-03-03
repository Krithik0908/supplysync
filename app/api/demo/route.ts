import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SUPPLIER_KEY } from "@/lib/supplier-key";

interface DemoAnalysis {
  supplierKey: string;
  source: "demo";
  subject: string;
  supplierEmail: string;
  emailContent: string;
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
  invoiceAmount: number;
  delayDays: number;
  confidenceScore: number;
  reasoning: string;
  responseSent: boolean;
  createdAt: Date;
  isDemo: true;
}

function getDemoRecords(supplierKey: string): DemoAnalysis[] {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000);

  return [
    {
      supplierKey,
      source: "demo",
      subject: "Invoice INV-3024 overdue by 45 days",
      supplierEmail: "ap@northstarretail.com",
      emailContent: "Subject: Invoice INV-3024 overdue by 45 days\n\nThis is a final reminder that invoice INV-3024 for $5,400 remains unpaid after 45 days. Please provide payment confirmation today.",
      purpose: "Final follow-up for significantly overdue invoice INV-3024",
      paymentDelayed: true,
      riskLevel: "high",
      suggestedAction: "Escalate to accounts payable lead and request immediate payment commitment in writing.",
      draftedReply: "Dear Northstar AP Team,\n\nInvoice INV-3024 for $5,400 is now 45 days overdue. Please share payment confirmation and remittance reference by end of day.\n\nBest regards,\nSupplySync Team",
      invoiceAmount: 5400,
      delayDays: 45,
      confidenceScore: 92,
      reasoning: "Risk is high because the invoice is severely overdue and the email tone indicates escalation urgency.",
      responseSent: false,
      createdAt: daysAgo(28),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Urgent: Payment hold on INV-4410",
      supplierEmail: "finance@crestlinefoods.com",
      emailContent: "Subject: Urgent: Payment hold on INV-4410\n\nYour invoice INV-4410 for $3,200 is on hold pending internal approval and has crossed 32 days. We need revised payment terms.",
      purpose: "Escalation on invoice INV-4410 delayed due to payment hold",
      paymentDelayed: true,
      riskLevel: "high",
      suggestedAction: "Negotiate immediate partial settlement and set a concrete due date for remaining balance.",
      draftedReply: "Dear Crestline Finance Team,\n\nThanks for the update. Since INV-4410 is already 32 days overdue, please confirm a partial payment release this week and final settlement date.\n\nRegards,\nSupplySync Team",
      invoiceAmount: 3200,
      delayDays: 32,
      confidenceScore: 88,
      reasoning: "Risk is high due to explicit payment hold language and overdue status beyond a full billing cycle.",
      responseSent: false,
      createdAt: daysAgo(24),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Second reminder for invoice INV-8891",
      supplierEmail: "accounts@tridentlogistics.io",
      emailContent: "Subject: Second reminder for invoice INV-8891\n\nInvoice INV-8891 for $6,150 is 27 days overdue. Please prioritize this payment to avoid service disruption.",
      purpose: "Second overdue reminder for invoice INV-8891",
      paymentDelayed: true,
      riskLevel: "high",
      suggestedAction: "Send final notice and align on payment release timeline with procurement manager.",
      draftedReply: "Dear Trident Accounts Team,\n\nInvoice INV-8891 ($6,150) is now 27 days overdue. Please confirm payment date to avoid operational impact.\n\nBest,\nSupplySync Team",
      invoiceAmount: 6150,
      delayDays: 27,
      confidenceScore: 85,
      reasoning: "Risk is high because the invoice is overdue and the communication signals potential operational consequences.",
      responseSent: false,
      createdAt: daysAgo(20),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Payment update for INV-7742",
      supplierEmail: "payables@glowmart.com",
      emailContent: "Subject: Payment update for INV-7742\n\nInvoice INV-7742 ($2,450) will be processed next week due to batch processing delays.",
      purpose: "Payment timeline clarification for delayed invoice INV-7742",
      paymentDelayed: true,
      riskLevel: "medium",
      suggestedAction: "Confirm exact payment date and request remittance reference before processing week closes.",
      draftedReply: "Dear Glowmart Payables,\n\nThanks for the update on INV-7742. Please confirm the exact payment date and share remittance details once processed.\n\nRegards,\nSupplySync Team",
      invoiceAmount: 2450,
      delayDays: 12,
      confidenceScore: 79,
      reasoning: "Risk is medium because the invoice is delayed but the buyer has communicated an expected payment window.",
      responseSent: false,
      createdAt: daysAgo(16),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Pending finance approval for INV-5530",
      supplierEmail: "ap@zenithworks.co",
      emailContent: "Subject: Pending finance approval for INV-5530\n\nInvoice INV-5530 for $1,980 is delayed by 9 days pending approver signoff.",
      purpose: "Moderate payment delay due to internal approval",
      paymentDelayed: true,
      riskLevel: "medium",
      suggestedAction: "Request escalation to backup approver and follow up within 48 hours.",
      draftedReply: "Dear Zenith AP Team,\n\nPlease help escalate approval for INV-5530 ($1,980), currently delayed by 9 days. We would appreciate an updated payment date.\n\nBest regards,\nSupplySync Team",
      invoiceAmount: 1980,
      delayDays: 9,
      confidenceScore: 74,
      reasoning: "Risk is medium because payment is delayed with process friction, but there is no severe escalation language.",
      responseSent: false,
      createdAt: daysAgo(12),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Purchase Order PO-12091 confirmation",
      supplierEmail: "procurement@everlinegroup.com",
      emailContent: "Subject: Purchase Order PO-12091 confirmation\n\nPlease confirm acceptance of PO-12091 and planned dispatch date for next week.",
      purpose: "Purchase order acknowledgement request",
      paymentDelayed: false,
      riskLevel: "low",
      suggestedAction: "Acknowledge PO receipt and share dispatch schedule.",
      draftedReply: "Dear Everline Procurement,\n\nWe confirm receipt of PO-12091 and will dispatch as per the agreed schedule next week.\n\nRegards,\nSupplySync Team",
      invoiceAmount: 0,
      delayDays: 0,
      confidenceScore: 93,
      reasoning: "Risk is low because this email is operational and contains no overdue payment indicators.",
      responseSent: false,
      createdAt: daysAgo(8),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "PO-9931 delivery timeline check",
      supplierEmail: "ops@marineretail.net",
      emailContent: "Subject: PO-9931 delivery timeline check\n\nCan you confirm dispatch ETA for PO-9931? Payment terms remain unchanged.",
      purpose: "Routine purchase order delivery coordination",
      paymentDelayed: false,
      riskLevel: "low",
      suggestedAction: "Provide ETA and confirm logistics details.",
      draftedReply: "Dear Marine Retail Ops,\n\nThank you for your email. Dispatch ETA for PO-9931 is confirmed for Friday with tracking details to follow.\n\nBest,\nSupplySync Team",
      invoiceAmount: 0,
      delayDays: 0,
      confidenceScore: 91,
      reasoning: "Risk is low because the communication is purely delivery planning with stable payment terms.",
      responseSent: false,
      createdAt: daysAgo(5),
      isDemo: true,
    },
    {
      supplierKey,
      source: "demo",
      subject: "Compliance documents required for vendor renewal",
      supplierEmail: "compliance@atlasstores.org",
      emailContent: "Subject: Compliance documents required for vendor renewal\n\nPlease share updated tax certificate and insurance documents by Friday for annual vendor renewal.",
      purpose: "Compliance documentation request for vendor renewal",
      paymentDelayed: false,
      riskLevel: "medium",
      suggestedAction: "Submit requested compliance documents before deadline and confirm receipt.",
      draftedReply: "Dear Atlas Compliance Team,\n\nWe acknowledge your request and will share updated tax and insurance documents before Friday.\n\nRegards,\nSupplySync Team",
      invoiceAmount: 0,
      delayDays: 0,
      confidenceScore: 81,
      reasoning: "Risk is medium because missed compliance deadlines can impact supplier continuity even without payment delay.",
      responseSent: false,
      createdAt: daysAgo(2),
      isDemo: true,
    },
  ];
}

export async function POST() {
  try {
    const supplierKey = SUPPLIER_KEY;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analyses");

    const demoRecords = getDemoRecords(supplierKey);
    const result = await collection.insertMany(demoRecords);

    return NextResponse.json({ success: true, inserted: Object.keys(result.insertedIds).length });
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    return NextResponse.json({ error: "Failed to load demo data" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supplierKey = SUPPLIER_KEY;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analyses");

    const result = await collection.deleteMany({ supplierKey, isDemo: true });
    return NextResponse.json({ success: true, deleted: result.deletedCount || 0 });
  } catch (error) {
    console.error("Failed to clear demo data:", error);
    return NextResponse.json({ error: "Failed to clear demo data" }, { status: 500 });
  }
}
