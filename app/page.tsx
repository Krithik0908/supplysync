import { EmailPasteForm } from "@/components/email-paste-form";
import { Shield, Zap, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-12">
      
      {/* Hero Section */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1 rounded-full mb-4">
          AI-Powered Supplier Assistant
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Stop Losing Money to<br />
          <span className="text-blue-600">Missed Payments & Delayed Responses</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          SupplySync analyzes supplier emails instantly, detects payment delays, 
          assesses risk, and generates professional follow-up emails — in seconds.
        </p>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <Zap className="h-4 w-4" />
          Instant AI Analysis
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
          <Shield className="h-4 w-4" />
          Risk Detection
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          <FileText className="h-4 w-4" />
          Auto Response Draft
        </div>
      </div>

      {/* Form */}
      <EmailPasteForm />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 mt-12 text-center max-w-lg">
        <div>
          <p className="text-3xl font-bold text-blue-600">3sec</p>
          <p className="text-sm text-muted-foreground">Analysis Time</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-600">98%</p>
          <p className="text-sm text-muted-foreground">Accuracy Rate</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-600">10x</p>
          <p className="text-sm text-muted-foreground">Faster Responses</p>
        </div>
      </div>

    </main>
  );
}