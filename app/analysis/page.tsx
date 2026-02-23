import { Suspense } from "react";
import { EmailAnalysis } from "@/components/email-analysis";

export default function AnalysisPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <EmailAnalysis />
      </Suspense>
    </main>
  );
}