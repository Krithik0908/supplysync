"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, FileText, Activity } from "lucide-react";

interface Analysis {
  id: string;
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
  createdAt: string;
  emailContent: string;
}

const FALLBACK_DATA: Analysis[] = [
  {
    id: "1",
    purpose: "Invoice Payment Overdue",
    paymentDelayed: true,
    riskLevel: "high",
    suggestedAction: "Follow up with accounts payable immediately.",
    draftedReply: "Dear Team, We would like to follow up on invoice #1042...",
    createdAt: new Date().toISOString(),
    emailContent: "Subject: Invoice #1042 - Payment Overdue. This invoice for $5,400 is now 45 days overdue.",
  },
  {
    id: "2",
    purpose: "Purchase Order Confirmation",
    paymentDelayed: false,
    riskLevel: "low",
    suggestedAction: "Acknowledge receipt and confirm delivery dates.",
    draftedReply: "Dear Team, Thank you for the purchase order...",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    emailContent: "Subject: Purchase Order #PO-2024. Please confirm receipt of this purchase order.",
  },
  {
    id: "3",
    purpose: "Compliance Document Request",
    paymentDelayed: false,
    riskLevel: "medium",
    suggestedAction: "Prepare and submit compliance documents within 5 days.",
    draftedReply: "Dear Team, We acknowledge your compliance request...",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    emailContent: "Subject: Compliance Audit Request. Please submit all compliance documents by end of week.",
  },
];

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnalyses(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch history, using fallback data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const riskColor = {
    low: "border-emerald-300/40 bg-emerald-500/20 text-emerald-200",
    medium: "border-amber-300/40 bg-amber-500/20 text-amber-200",
    high: "border-rose-300/40 bg-rose-500/20 text-rose-200",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-200">
            <Activity className="h-3.5 w-3.5" />
            Timeline of analyzed supplier emails
          </div>
          <h1 className="bg-linear-to-r from-white to-white/70 bg-clip-text text-3xl font-bold text-transparent">Email History</h1>
        </div>
        <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="flex flex-col border-white/10 bg-white/10 text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className={riskColor[analysis.riskLevel]}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <span className="text-xs text-white/55">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2 mt-2">
                {analysis.purpose}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-white/65">
                {analysis.emailContent.substring(0, 150)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="grow">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className={analysis.paymentDelayed ? "font-medium text-rose-300" : "font-medium text-emerald-300"}>
                    Payment {analysis.paymentDelayed ? "⚠️ Delayed" : "✅ On Time"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-white/60" />
                  <span className="line-clamp-1 text-white/85">{analysis.suggestedAction}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  sessionStorage.setItem("analysis", JSON.stringify(analysis));
                  sessionStorage.setItem("email", analysis.emailContent);
                  router.push("/response");
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Full Reply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}