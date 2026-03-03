import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SUPPLIER_KEY } from '@/lib/supplier-key';

export async function GET() {
  try {
    const supplierKey = SUPPLIER_KEY;
    const client = await clientPromise;
    const db = client.db(); // uses database from connection string (supplysync)
    const collection = db.collection('analyses');

    const query = { supplierKey };

    // Fetch all documents, sort by createdAt descending, convert _id to string for client
    const analyses = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100) // optional limit to prevent overwhelming response
      .toArray();

    // Convert MongoDB _id to string and ensure dates are serializable
    const formattedAnalyses = analyses.map((doc) => ({
      id: doc._id.toString(),
      emailContent: doc.emailContent,
      subject: doc.subject || "",
      supplierEmail: doc.supplierEmail || "",
      purpose: doc.purpose,
      paymentDelayed: doc.paymentDelayed,
      riskLevel: doc.riskLevel,
      confidenceScore: Number(doc.confidenceScore) || 0,
      reasoning: doc.reasoning || "",
      suggestedAction: doc.suggestedAction,
      draftedReply: doc.draftedReply,
      invoiceAmount: Number(doc.invoiceAmount) || 0,
      delayDays: Number(doc.delayDays) || 0,
      responseSent: Boolean(doc.responseSent),
      respondedAt: doc.respondedAt ? new Date(doc.respondedAt).toISOString() : null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date(doc.createdAt).toISOString(),
      isDemo: Boolean(doc.isDemo),
      supplierKey: doc.supplierKey || 'default',
    }));

    return NextResponse.json(formattedAnalyses);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}