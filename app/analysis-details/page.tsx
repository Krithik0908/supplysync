"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Clock } from "lucide-react";

interface AnalysisData {
  id: string;
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
  createdAt: string;
  emailContent: string;
}

export default function AnalysisDetailsPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const analysisJson = sessionStorage.getItem("analysis");
    if (!analysisJson) {
      router.push("/dashboard");
      return;
    }
    const selectedAnalysis = JSON.parse(analysisJson);
    const timer = setTimeout(() => {
      setAnalysis(selectedAnalysis);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  const riskColor = {
    low: "border-emerald-300/40 bg-emerald-500/20 text-emerald-200",
    medium: "border-amber-300/40 bg-amber-500/20 text-amber-200",
    high: "border-rose-300/40 bg-rose-500/20 text-rose-200",
  };

  if (isLoading || !analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-white/75">Loading analysis details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <Button
          variant="ghost"
          className="text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Analysis Details</CardTitle>
            <CardDescription className="text-white/65">
              Detailed view for the selected supplier email analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">Email Purpose</h3>
              <p className="text-lg font-semibold">{analysis.purpose}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <h3 className="mb-2 text-sm font-medium text-white/60">Payment Status</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className={analysis.paymentDelayed ? "font-medium text-rose-300" : "font-medium text-emerald-300"}>
                    {analysis.paymentDelayed ? "⚠️ Payment Delayed" : "✅ On Time"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <h3 className="mb-2 text-sm font-medium text-white/60">Risk Level</h3>
                <Badge className={`${riskColor[analysis.riskLevel]} px-3 py-1`}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Alert className="border-white/10 bg-black/25 text-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Suggested Action</AlertTitle>
              <AlertDescription>{analysis.suggestedAction}</AlertDescription>
            </Alert>

            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">Analyzing with AI</h3>
              <p className="whitespace-pre-wrap text-sm text-white/85">
                {analysis.emailContent || "No original email content available."}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">Drafted Reply</h3>
              <p className="whitespace-pre-wrap text-sm text-white/85">
                {analysis.draftedReply || "No drafted reply available."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}