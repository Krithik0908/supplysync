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
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowLeft } from "lucide-react";

export function EmailResponse() {
  const [responseEmail, setResponseEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const analysisJson = sessionStorage.getItem("analysis");
    if (!analysisJson) {
      router.push("/");
      return;
    }
    const analysis = JSON.parse(analysisJson);
    setResponseEmail(analysis.draftedReply || "No reply generated.");
  }, [router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Your Follow-up Email</CardTitle>
            <div className="w-20"></div> {/* spacer for alignment */}
          </div>
          <CardDescription>
            Review and copy the professionally drafted email below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-muted p-6 whitespace-pre-wrap font-mono text-sm">
            {responseEmail}
          </div>
          <div className="flex justify-end">
            <Button onClick={copyToClipboard} size="lg">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}