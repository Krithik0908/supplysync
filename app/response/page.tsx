import { Suspense } from "react";
import { EmailResponse } from "@/components/email-response";

export default function ResponsePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <Suspense fallback={<div className="text-white/70">Loading response...</div>}>
        <EmailResponse />
      </Suspense>
    </main>
  );
}