import { EmailPasteForm } from "@/components/email-paste-form";
import { Shield, Zap, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 py-12 text-white">
      
      {/* Hero Section */}
      <div className="mb-10 max-w-3xl text-center">
        <h1 className="mb-5 text-4xl font-bold tracking-tight md:text-6xl">
          Turn Supplier Emails Into
          <br />
          <span className="bg-linear-to-r from-blue-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">Cashflow Decisions in Seconds</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/95">
          SupplySync analyzes supplier emails instantly, detects payment delays, 
          assesses risk, and generates professional follow-up emails — in seconds.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90">
          <span className="ui-interactive inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Payment risk detection
          </span>
          <span className="ui-interactive inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            AI-generated response drafts
          </span>
          <span className="ui-interactive inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Export-ready output
          </span>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <div className="ui-interactive flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200">
          <Zap className="h-4 w-4" />
          Instant AI Analysis
        </div>
        <div className="ui-interactive flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-200">
          <Shield className="h-4 w-4" />
          Risk Detection
        </div>
        <div className="ui-interactive flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-200">
          <FileText className="h-4 w-4" />
          Auto Response Draft
        </div>
      </div>

      {/* Form */}
      <EmailPasteForm />

      {/* Stats */}
      <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 text-center md:grid-cols-3">
        <div className="ui-card-hover rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
          <p className="text-3xl font-bold text-blue-300 md:text-4xl">3sec</p>
          <p className="text-sm text-white/85">Analysis Time</p>
        </div>
        <div className="ui-card-hover rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
          <p className="text-3xl font-bold text-blue-300 md:text-4xl">98%</p>
          <p className="text-sm text-white/85">Accuracy Rate</p>
        </div>
        <div className="ui-card-hover rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
          <p className="text-3xl font-bold text-blue-300 md:text-4xl">10x</p>
          <p className="text-sm text-white/85">Faster Responses</p>
        </div>
      </div>

    </main>
  );
}