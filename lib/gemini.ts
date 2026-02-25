import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeEmail(emailContent: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an AI assistant helping small suppliers analyze emails from large companies.
    
    Analyze this email and respond in JSON format only, no extra text:
    {
      "purpose": "brief description of what the email is about",
      "paymentStatus": "delayed | on-time | unclear",
      "riskLevel": "low | medium | high",
      "suggestedAction": "what the supplier should do",
      "followUpEmail": "a professional follow-up email the supplier can send"
    }
    
    Email to analyze:
    ${emailContent}
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleaned = response.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}