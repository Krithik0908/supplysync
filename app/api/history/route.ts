import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // uses database from connection string (supplysync)
    const collection = db.collection('analyses');

    // Fetch all documents, sort by createdAt descending, convert _id to string for client
    const analyses = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // optional limit to prevent overwhelming response
      .toArray();

    // Convert MongoDB _id to string and ensure dates are serializable
    const formattedAnalyses = analyses.map((doc) => ({
      id: doc._id.toString(),
      emailContent: doc.emailContent,
      purpose: doc.purpose,
      paymentDelayed: doc.paymentDelayed,
      riskLevel: doc.riskLevel,
      suggestedAction: doc.suggestedAction,
      draftedReply: doc.draftedReply,
      createdAt: doc.createdAt.toISOString(),
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