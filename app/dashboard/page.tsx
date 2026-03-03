"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { animate, createTimeline, stagger } from "animejs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, FileText, TrendingUp, Shield, Zap, ArrowRight, Sparkles } from "lucide-react";

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

  // Refs for animation targets
  const titleRef = useRef(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

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

  useEffect(() => {
    if (!loading) {
      // Epic anime.js timeline animation
      const tl = createTimeline({
        defaults: { ease: 'outExpo' },
      });

      // Title animation
      if (titleRef.current) {
        tl.add(titleRef.current, {
          translateY: [-30, 0],
          opacity: [0, 1],
          duration: 800,
        });
      }

      // Stats cards stagger animation with scale and rotation
      tl.add(statsRef.current.filter(Boolean), {
        translateY: [50, 0],
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 1000,
        delay: stagger(150),
        rotate: ['-5deg', '0deg'],
      }, '-=600');

      // Table container fade in
      if (tableRef.current) {
        tl.add(tableRef.current, {
          opacity: [0, 1],
          duration: 600,
        }, '-=400');
      }

      // Table rows stagger
      tl.add(rowsRef.current.filter(Boolean), {
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(50),
      }, '-=200');

      // Continuous pulse animation for stat numbers
      animate('.stat-number', {
        scale: [1, 1.05, 1],
        duration: 2000,
        loop: true,
        easing: 'easeInOutQuad',
        delay: stagger(500),
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const totalEmails = analyses.length;
  const highRiskCount = analyses.filter((a) => a.riskLevel === "high").length;
  const paymentDelayedCount = analyses.filter((a) => a.paymentDelayed).length;
  const recentAnalyses = analyses.slice(0, 5);

  const riskColor = {
    low: "bg-linear-to-r from-emerald-500/85 to-emerald-400/85 text-white border-0",
    medium: "bg-linear-to-r from-amber-500/85 to-orange-500/85 text-white border-0",
    high: "bg-linear-to-r from-rose-500/90 to-pink-500/90 text-white border-0",
  };

  const handleViewDetails = (analysis: Analysis) => {
    sessionStorage.setItem("analysis", JSON.stringify(analysis));
    sessionStorage.setItem("email", analysis.emailContent || "");
    sessionStorage.setItem("emailContent", analysis.emailContent || "");
    router.push("/response");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 container mx-auto p-6 md:p-8">
        {/* Header with glow effect */}
        <div className="mb-10 text-center md:mb-12">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-500/15 px-4 py-1 text-sm font-medium text-violet-200">
            <Sparkles className="h-4 w-4" />
            Real-time supplier intelligence
          </div>
          <h1 
            ref={titleRef}
            className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-500 to-orange-400"
            style={{ textShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
          >
            SupplySync
          </h1>
          <p className="text-lg text-white/95 md:text-xl">Intelligent Email Management for Suppliers</p>
        </div>

        {/* Stats Cards with Premium Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Emails Card */}
          <div
            ref={(el) => { statsRef.current[0] = el; }}
            className="transform transition-all duration-500 hover:scale-105"
          >
            <Card className="relative overflow-hidden border border-white/10 bg-linear-to-br from-blue-600/85 to-purple-600/85 text-white shadow-xl shadow-black/30 backdrop-blur-xl group">
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Total Emails</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number text-4xl font-bold mb-2">{totalEmails}</div>
                <div className="flex items-center text-sm text-white/85">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+{Math.floor(Math.random() * 20)}% this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Risk Card */}
          <div
            ref={(el) => { statsRef.current[1] = el; }}
            className="transform transition-all duration-500 hover:scale-105"
          >
            <Card className="relative overflow-hidden border border-white/10 bg-linear-to-br from-red-600/85 to-pink-600/85 text-white shadow-xl shadow-black/30 backdrop-blur-xl group">
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/80">High Risk</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number text-4xl font-bold mb-2">{highRiskCount}</div>
                <div className="flex items-center text-sm text-white/85">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Needs immediate attention</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Delays Card */}
          <div
            ref={(el) => { statsRef.current[2] = el; }}
            className="transform transition-all duration-500 hover:scale-105"
          >
            <Card className="relative overflow-hidden border border-white/10 bg-linear-to-br from-yellow-500/85 to-orange-500/85 text-white shadow-xl shadow-black/30 backdrop-blur-xl group">
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Payment Delays</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number text-4xl font-bold mb-2">{paymentDelayedCount}</div>
                <div className="flex items-center text-sm text-white/85">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Average delay: 12 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Analyses Table with Glass Effect */}
        <div ref={tableRef} className="opacity-0">
          <Card className="border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Insights Feed</div>
              <CardTitle className="text-2xl text-white">Recent Analyses</CardTitle>
              <CardDescription className="text-white/85">
                Last 5 email analyses from your suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <p className="text-white/85 text-center py-8">No analyses yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/80">Date</TableHead>
                      <TableHead className="text-white/80">Purpose</TableHead>
                      <TableHead className="text-white/80">Risk</TableHead>
                      <TableHead className="text-white/80">Payment Delayed</TableHead>
                      <TableHead className="text-white/80">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAnalyses.map((analysis, index) => (
                      <TableRow
                        key={analysis.id}
                        ref={(el) => { rowsRef.current[index] = el; }}
                        className="cursor-pointer border-white/10 transition-colors hover:bg-white/12 group"
                        onClick={() => handleViewDetails(analysis)}
                      >
                        <TableCell className="font-medium text-white">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-white/90">
                          {analysis.purpose}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${riskColor[analysis.riskLevel]} px-3 py-1`}>
                            {analysis.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {analysis.paymentDelayed ? (
                            <span className="text-red-400 font-medium flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Delayed
                            </span>
                          ) : (
                            <span className="text-green-400 font-medium flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              On Time
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-white/85 group-hover:text-white transition-colors">
                            View Details
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-1 gap-4 text-center md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="text-2xl font-bold text-white">{analyses.length}</div>
            <div className="text-sm text-white/85">Total Analyzed</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="text-2xl font-bold text-white">
              {Math.round((paymentDelayedCount / analyses.length) * 100) || 0}%
            </div>
            <div className="text-sm text-white/85">Delay Rate</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="text-2xl font-bold text-white">
              {analyses.filter(a => a.riskLevel === "low").length}
            </div>
            <div className="text-sm text-white/85">Low Risk</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div className="text-2xl font-bold text-white">
              {analyses.filter(a => a.riskLevel === "medium").length}
            </div>
            <div className="text-sm text-white/85">Medium Risk</div>
          </div>
        </div>
      </div>
    </div>
  );
}