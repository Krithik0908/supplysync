import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { emailContent } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this supplier email and respond in JSON format only, no extra text:
    {
      "purpose": "brief description of what the email is about",
      "paymentDelayed": true or false,
      "riskLevel": "low" or "medium" or "high",
      "suggestedAction": "what the supplier should do",
      "draftedReply": "a professional follow-up email"
    }
    
    Email:
    ${emailContent}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(cleaned);

  return NextResponse.json(data);
}