import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const prompt = `You are an assistant for small suppliers. Analyze the following email from a large company. Extract the following information and return ONLY a JSON object with these fields:
    - "purpose": string (e.g., "Purchase Order", "Invoice", "Compliance Request", etc.)
    - "paymentDelayed": boolean (true if payment is overdue or delayed)
    - "riskLevel": string ("low", "medium", or "high")
    - "suggestedAction": string (a brief next step)
    - "draftedReply": string (a professional follow-up email ready to send)

Email:
"""
${email}
"""

Return valid JSON only, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0,
      messages: [{ role: "user", content: prompt }]
    });

    const content = message.content[0].text;
    // Extract JSON from response
    const jsonMatch = content.match(/\{.*\}/s);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyze email" },
      { status: 500 }
    );
  }
}