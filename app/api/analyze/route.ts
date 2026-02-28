import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // <-- import the MongoDB client

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { emailContent } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant helping small suppliers analyze emails. Always respond in valid JSON only, no extra text, no markdown.",
        },
        {
          role: "user",
          content: `Analyze this supplier email and respond in this exact JSON format:
          {
            "purpose": "brief description of what the email is about",
            "paymentDelayed": true or false,
            "riskLevel": "low" or "medium" or "high",
            "suggestedAction": "what the supplier should do",
            "draftedReply": "a professional follow-up email"
          }
          
          Email:
          ${emailContent}`,
        },
      ],
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    // Save to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db(); // uses database from connection string (supplysync)
      const collection = db.collection("analyses");

      await collection.insertOne({
        emailContent,
        purpose: data.purpose,
        paymentDelayed: data.paymentDelayed,
        riskLevel: data.riskLevel,
        suggestedAction: data.suggestedAction,
        draftedReply: data.draftedReply,
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error("MongoDB save error:", dbError);
      // Optionally, you could return an error if saving fails, but we'll still return the analysis
      // to not break user experience. For debugging, log it.
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze email" },
      { status: 500 }
    );
  }
}