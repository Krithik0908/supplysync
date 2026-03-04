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
import { Clock, AlertCircle, FileText, Activity, Download } from "lucide-react";

interface Analysis {
  id: string;
  purpose: string;
  paymentDelayed: boolean;
  riskLevel: "low" | "medium" | "high";
  suggestedAction: string;
  draftedReply: string;
  createdAt: string;
  emailContent: string;
  invoiceAmount?: number;
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
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "delayed" | "low">("all");
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

  const filteredAnalyses = analyses.filter((analysis) => {
    if (activeFilter === "high") return analysis.riskLevel === "high";
    if (activeFilter === "delayed") return analysis.paymentDelayed;
    if (activeFilter === "low") return analysis.riskLevel === "low";
    return true;
  });

  const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
      return `"${text.replace(/\"/g, '""')}"`;
    }
    return text;
  };

  const handleExportCsv = () => {
    const header = ["Date", "Purpose", "Risk Level", "Payment Delayed", "Suggested Action", "Amount"];
    const rows = filteredAnalyses.map((analysis) => [
      new Date(analysis.createdAt).toLocaleDateString(),
      analysis.purpose,
      analysis.riskLevel.toUpperCase(),
      analysis.paymentDelayed ? "Yes" : "No",
      analysis.suggestedAction,
      Number(analysis.invoiceAmount) || 0,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `supplysync-history-${date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const lowCount = analyses.filter((analysis) => analysis.riskLevel === "low").length;
  const mediumCount = analyses.filter((analysis) => analysis.riskLevel === "medium").length;
  const highCount = analyses.filter((analysis) => analysis.riskLevel === "high").length;
  const totalCount = analyses.length || 1;

  const lowPercent = Math.round((lowCount / totalCount) * 100);
  const mediumPercent = Math.round((mediumCount / totalCount) * 100);
  const highPercent = Math.round((highCount / totalCount) * 100);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const lowArc = (lowCount / totalCount) * circumference;
  const mediumArc = (mediumCount / totalCount) * circumference;
  const highArc = circumference - lowArc - mediumArc;

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
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Risk Distribution</CardTitle>
          <CardDescription className="text-white/65">
            Low vs Medium vs High risk emails
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle cx="70" cy="70" r={radius} className="fill-none stroke-white/10" strokeWidth="16" />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="fill-none text-emerald-400"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray={`${lowArc} ${circumference - lowArc}`}
                  strokeLinecap="butt"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="fill-none text-amber-400"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray={`${mediumArc} ${circumference - mediumArc}`}
                  strokeDashoffset={-lowArc}
                  strokeLinecap="butt"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="fill-none text-rose-400"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray={`${highArc} ${circumference - highArc}`}
                  strokeDashoffset={-(lowArc + mediumArc)}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/90">
                {analyses.length} Emails
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="rounded-lg border border-emerald-300/25 bg-emerald-500/10 p-3">
              <div className="font-medium text-emerald-200">Low Risk</div>
              <div className="text-white/80">{lowCount} emails ({lowPercent}%)</div>
            </div>
            <div className="rounded-lg border border-amber-300/25 bg-amber-500/10 p-3">
              <div className="font-medium text-amber-200">Medium Risk</div>
              <div className="text-white/80">{mediumCount} emails ({mediumPercent}%)</div>
            </div>
            <div className="rounded-lg border border-rose-300/25 bg-rose-500/10 p-3">
              <div className="font-medium text-rose-200">High Risk</div>
              <div className="text-white/80">{highCount} emails ({highPercent}%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          className={activeFilter === "all" ? "bg-linear-to-r from-blue-500 to-violet-500 text-white" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}
          onClick={() => setActiveFilter("all")}
        >
          All
        </Button>
        <Button
          variant={activeFilter === "high" ? "default" : "outline"}
          className={activeFilter === "high" ? "bg-linear-to-r from-blue-500 to-violet-500 text-white" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}
          onClick={() => setActiveFilter("high")}
        >
          High Risk
        </Button>
        <Button
          variant={activeFilter === "delayed" ? "default" : "outline"}
          className={activeFilter === "delayed" ? "bg-linear-to-r from-blue-500 to-violet-500 text-white" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}
          onClick={() => setActiveFilter("delayed")}
        >
          Payment Delayed
        </Button>
        <Button
          variant={activeFilter === "low" ? "default" : "outline"}
          className={activeFilter === "low" ? "bg-linear-to-r from-blue-500 to-violet-500 text-white" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}
          onClick={() => setActiveFilter("low")}
        >
          Low Risk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnalyses.map((analysis) => (
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

      {filteredAnalyses.length === 0 && (
        <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
          <CardContent className="py-8 text-center text-white/75">
            No emails match this filter.
          </CardContent>
        </Card>
      )}
    </div>
  );
}