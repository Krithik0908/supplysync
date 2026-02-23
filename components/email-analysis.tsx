"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";

interface AnalysisData {
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
}

// Simple rule-based analyzer
function analyzeEmailLocally(emailText: string): AnalysisData {
  const text = emailText.toLowerCase();

  // Determine purpose
  let purpose = "General Inquiry";
  if (text.includes("purchase order") || text.includes("po ")) purpose = "Purchase Order";
  else if (text.includes("invoice") || text.includes("payment")) purpose = "Invoice";
  else if (text.includes("compliance") || text.includes("audit")) purpose = "Compliance Request";

  // Check for payment delay
  const paymentDelayed = text.includes("delay") || text.includes("late") || text.includes("overdue");

  // Risk level based on urgency words
  let riskLevel: "low" | "medium" | "high" = "low";
  if (text.includes("urgent") || text.includes("immediate") || text.includes("overdue")) riskLevel = "high";
  else if (text.includes("review") || text.includes("pending") || paymentDelayed) riskLevel = "medium";

  // Suggested action
  let suggestedAction = "Monitor and respond appropriately.";
  if (purpose === "Purchase Order") suggestedAction = "Acknowledge receipt and confirm delivery dates.";
  else if (purpose === "Invoice") suggestedAction = "Check payment terms and prepare for payment.";
  else if (paymentDelayed) suggestedAction = "Follow up with accounts payable to resolve delay.";

  // Draft reply
  const draftedReply = `Subject: Re: ${emailText.split('\n')[0] || 'Your email'}

Dear [Contact Name],

Thank you for your email. ${purpose === "Invoice" ? "We have received your invoice and will process it according to our payment terms." : 
  purpose === "Purchase Order" ? "We acknowledge receipt of your purchase order and will begin processing." :
  "We will review your request and get back to you shortly."}

${paymentDelayed ? "Regarding the payment delay, we are looking into it and will update you soon." : ""}

Best regards,
[Your Name]
[Your Company]`;

  return {
    purpose,
    paymentDelayed,
    riskLevel,
    suggestedAction,
    draftedReply
  };
}

export function EmailAnalysis() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      router.push("/");
      return;
    }

    setLoading(true);
    // Simulate processing delay (remove if you want instant results)
    setTimeout(() => {
      const result = analyzeEmailLocally(email);
      setAnalysis(result);
      setLoading(false);
    }, 800); // 800ms delay – gives a realistic feel
  }, [email, router]);

  const handleGenerate = () => {
    if (!analysis) return;
    // Save data to sessionStorage to pass to response page
    sessionStorage.setItem("analysis", JSON.stringify(analysis));
    sessionStorage.setItem("email", email || "");
    router.push("/response");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing email...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const riskColor = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Email Analysis</CardTitle>
          <CardDescription>
            AI-powered insights from your supplier email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Purpose */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Email Purpose</h3>
            <p className="text-lg font-semibold">{analysis.purpose}</p>
          </div>

          {/* Payment Status & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Status</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className={analysis.paymentDelayed ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {analysis.paymentDelayed ? "⚠️ Payment Delayed" : "✅ On Time"}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk Level</h3>
              <Badge className={`${riskColor[analysis.riskLevel]} px-3 py-1`}>
                {analysis.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Suggested Action */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Suggested Action</AlertTitle>
            <AlertDescription>{analysis.suggestedAction}</AlertDescription>
          </Alert>

          {/* Generate Button */}
          <div className="pt-4">
            <Button onClick={handleGenerate} size="lg" className="w-full md:w-auto">
              Generate Follow-up Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}