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
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowLeft, Download } from "lucide-react";

interface AnalysisData {
  id?: string;
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  confidenceScore?: number;
  reasoning?: string;
  suggestedAction: string;
  draftedReply: string;
  supplierEmail?: string;
  subject?: string;
}

export function EmailResponse() {
  const [responseEmail, setResponseEmail] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const router = useRouter();

  const riskColor = {
    low: "border-emerald-300/40 bg-emerald-500/20 text-emerald-200",
    medium: "border-amber-300/40 bg-amber-500/20 text-amber-200",
    high: "border-rose-300/40 bg-rose-500/20 text-rose-200",
  };

  useEffect(() => {
    const analysisJson = sessionStorage.getItem("analysis");
    if (!analysisJson) {
      router.push("/");
      return;
    }
    const analysis = JSON.parse(analysisJson);
    setAnalysisData(analysis);
    setResponseEmail(analysis.draftedReply || "No reply generated.");
    setRecipientEmail(analysis.supplierEmail || "");
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

  const sendReply = async () => {
    if (!analysisData || !recipientEmail.trim() || !responseEmail.trim()) return;

    setSending(true);
    setSendMessage("");

    try {
      const response = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisData.id,
          toEmail: recipientEmail.trim(),
          subject: analysisData.subject ? `Re: ${analysisData.subject}` : "Follow-up on supplier email",
          body: responseEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send email");
      }

      setSendMessage("Reply sent successfully.");
    } catch (error) {
      setSendMessage(error instanceof Error ? error.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  if (!analysisData) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
          <CardContent className="py-12 text-center text-white/70">
            Loading response details...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="ui-interactive ui-press ui-focus text-white/80 hover:bg-white/10 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Your Follow-up Email</CardTitle>
            <div className="w-20"></div>
          </div>
          <CardDescription className="text-white/65">
            Review and copy the professionally drafted email below, or download as PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${riskColor[analysisData.riskLevel]} px-3 py-1`}>
                {analysisData.riskLevel.toUpperCase()}
              </Badge>
              <Badge className="border-cyan-300/40 bg-cyan-500/20 px-3 py-1 text-cyan-200">
                AI Confidence: {Math.max(0, Math.min(100, Number(analysisData.confidenceScore) || 0))}%
              </Badge>
            </div>
            <p className="mt-3 text-sm text-white/80">
              {analysisData.reasoning || "Risk level is based on payment delay, language urgency, and business impact in the email."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
              placeholder="supplier@example.com"
            />
          </div>

          <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-6 font-mono text-sm text-white/90">
            {responseEmail}
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={copyToClipboard} variant="outline" className="ui-interactive ui-press ui-focus border-white/20 bg-white/5 text-white hover:bg-white/10">
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
            <Button onClick={downloadPDF} disabled={downloading} className="ui-interactive ui-press ui-focus bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400">
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button onClick={sendReply} disabled={sending || !recipientEmail.trim()} className="ui-interactive ui-press ui-focus bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400">
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
          {sendMessage && <p className="text-sm text-white/80">{sendMessage}</p>}
        </CardContent>
      </Card>
    </div>
  );
}