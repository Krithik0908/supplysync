import { Suspense } from "react";
import { EmailResponse } from "@/components/email-response";

export default function ResponsePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <EmailResponse />
      </Suspense>
    </main>
  );
}