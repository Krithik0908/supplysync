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
import { Calendar, Clock, AlertCircle, FileText } from "lucide-react";

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
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
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
        <h1 className="text-3xl font-bold">Email History</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className={riskColor[analysis.riskLevel]}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2 mt-2">
                {analysis.purpose}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {analysis.emailContent.substring(0, 150)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={analysis.paymentDelayed ? "text-red-600 font-medium" : "text-green-600"}>
                    Payment {analysis.paymentDelayed ? "⚠️ Delayed" : "✅ On Time"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="line-clamp-1">{analysis.suggestedAction}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
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