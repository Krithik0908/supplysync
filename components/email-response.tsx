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
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowLeft, Download } from "lucide-react";

interface AnalysisData {
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
}

export function EmailResponse() {
  const [responseEmail, setResponseEmail] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const analysisJson = sessionStorage.getItem("analysis");
    if (!analysisJson) {
      router.push("/");
      return;
    }
    const analysis = JSON.parse(analysisJson);
    setAnalysisData(analysis);
    setResponseEmail(analysis.draftedReply || "No reply generated.");
  }, [router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!analysisData) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisData }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "payment-reminder.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Your Follow-up Email</CardTitle>
            <div className="w-20"></div>
          </div>
          <CardDescription>
            Review and copy the professionally drafted email below, or download as PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-muted p-6 whitespace-pre-wrap font-mono text-sm">
            {responseEmail}
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button onClick={downloadPDF} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}