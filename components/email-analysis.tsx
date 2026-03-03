"use client";

import { useRouter } from "next/navigation";
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
  confidenceScore?: number;
  reasoning?: string;
  suggestedAction: string;
  draftedReply: string;
}

export function EmailAnalysis() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("emailContent");
    if (!storedEmail) {
      router.push("/");
      return;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailContent: storedEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [router]);

  const handleGenerate = () => {
    if (!analysis) return;
    sessionStorage.setItem("analysis", JSON.stringify(analysis));
    router.push("/response");
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white/65">Analyzing email with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-red-300">Something went wrong. Please try again.</p>
          <Button className="mt-4 bg-white/10 text-white hover:bg-white/20" onClick={() => router.push("/")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const riskColor = {
    low: "border-emerald-300/40 bg-emerald-500/20 text-emerald-200",
    medium: "border-amber-300/40 bg-amber-500/20 text-amber-200",
    high: "border-rose-300/40 bg-rose-500/20 text-rose-200",
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Email Analysis</CardTitle>
          <CardDescription className="text-white/65">
            AI-powered insights from your supplier email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <h3 className="mb-2 text-sm font-medium text-white/60">
              Email Purpose
            </h3>
            <p className="text-lg font-semibold">{analysis.purpose}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">
                Payment Status
              </h3>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span
                  className={
                    analysis.paymentDelayed
                      ? "font-medium text-rose-300"
                      : "font-medium text-emerald-300"
                  }
                >
                  {analysis.paymentDelayed
                    ? "⚠️ Payment Delayed"
                    : "✅ On Time"}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">
                Risk Level
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${riskColor[analysis.riskLevel]} px-3 py-1`}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <Badge className="border-cyan-300/40 bg-cyan-500/20 px-3 py-1 text-cyan-200">
                  AI Confidence: {Math.max(0, Math.min(100, Number(analysis.confidenceScore) || 0))}%
                </Badge>
              </div>
              <p className="mt-3 text-sm text-white/80">
                {analysis.reasoning || "Risk level is based on payment delay, language urgency, and business impact in the email."}
              </p>
            </div>
          </div>

          <Alert className="border-white/10 bg-black/25 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Suggested Action</AlertTitle>
            <AlertDescription>{analysis.suggestedAction}</AlertDescription>
          </Alert>

          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              size="lg"
              className="w-full bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400 md:w-auto"
            >
              Generate Follow-up Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}