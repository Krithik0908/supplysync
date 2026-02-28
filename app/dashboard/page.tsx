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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, FileText } from "lucide-react";

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
    emailContent: "",
  },
  {
    id: "2",
    purpose: "Purchase Order Confirmation",
    paymentDelayed: false,
    riskLevel: "low",
    suggestedAction: "Acknowledge receipt and confirm delivery dates.",
    draftedReply: "Dear Team, Thank you for the purchase order...",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    emailContent: "",
  },
  {
    id: "3",
    purpose: "Compliance Document Request",
    paymentDelayed: false,
    riskLevel: "medium",
    suggestedAction: "Prepare and submit compliance documents within 5 days.",
    draftedReply: "Dear Team, We acknowledge your compliance request...",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    emailContent: "",
  },
];

export default function Dashboard() {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const totalEmails = analyses.length;
  const highRiskCount = analyses.filter((a) => a.riskLevel === "high").length;
  const paymentDelayedCount = analyses.filter((a) => a.paymentDelayed).length;
  const recentAnalyses = analyses.slice(0, 5);

  const riskColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmails}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Delays</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{paymentDelayedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>Last 5 email analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Payment Delayed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAnalyses.map((analysis) => (
                <TableRow key={analysis.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {analysis.purpose}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${riskColor[analysis.riskLevel]} border-0`}>
                      {analysis.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {analysis.paymentDelayed ? (
                      <span className="text-red-600 font-medium">⚠️ Yes</span>
                    ) : (
                      <span className="text-green-600 font-medium">✅ No</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}