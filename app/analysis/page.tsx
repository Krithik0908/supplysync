import { Suspense } from "react";
import { EmailAnalysis } from "@/components/email-analysis";

export default function AnalysisPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-white/70">Loading analysis...</div>}>
        <EmailAnalysis />
      </Suspense>
    </main>
  );
}