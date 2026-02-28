"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function EmailPasteForm() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    // Store in sessionStorage instead of URL
    sessionStorage.setItem("emailContent", email)
    router.push("/analysis")
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <Mail className="size-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Paste Your Email</CardTitle>
            <CardDescription>
              Paste the full email content below and submit it for processing.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="email-input" className="sr-only">
            Email content
          </label>
          <Textarea
            id="email-input"
            placeholder="Paste your email here..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[240px] resize-y text-base leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {email.length > 0
                ? `${email.length.toLocaleString()} characters`
                : "No content yet"}
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!email.trim()}
            >
              <Send className="size-4 mr-2" />
              Analyze Email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}