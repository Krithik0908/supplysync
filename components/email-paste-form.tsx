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
    <Card className="ui-card-hover w-full max-w-2xl border-white/10 bg-white/10 text-white backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20">
            <Mail className="size-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Paste Your Email</CardTitle>
            <CardDescription className="text-white/65">
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
            className="ui-focus min-h-60 resize-y border-white/15 bg-black/35 text-base leading-relaxed text-white placeholder:text-white/45"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60" aria-live="polite">
              {email.length > 0
                ? `${email.length.toLocaleString()} characters`
                : "No content yet"}
            </p>
            <Button
              type="submit"
              size="lg"
              className="ui-interactive ui-press ui-focus bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400"
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