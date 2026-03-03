import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { getMailProviderDefaults, MailProvider } from "@/lib/mail-provider";

interface TestConnectionPayload {
  provider?: MailProvider;
  email?: string;
  appPassword?: string;
}

export async function POST(req: NextRequest) {
  let client: ImapFlow | null = null;

  try {
    const body = (await req.json()) as TestConnectionPayload;
    const provider = body.provider;
    const email = body.email?.trim().toLowerCase();
    const appPassword = body.appPassword?.replace(/\s+/g, "").trim();

    if (!provider || !email || !appPassword) {
      return NextResponse.json(
        { error: "provider, email, and appPassword are required" },
        { status: 400 }
      );
    }

    const defaults = getMailProviderDefaults(provider);

    client = new ImapFlow({
      host: defaults.imapHost,
      port: defaults.imapPort,
      secure: true,
      auth: {
        user: email,
        pass: appPassword,
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    lock.release();

    return NextResponse.json({ success: true, message: "Connection successful" });
  } catch (error) {
    const responseText = typeof (error as { responseText?: unknown })?.responseText === "string"
      ? (error as { responseText: string }).responseText
      : "";
    const serverResponseCode = typeof (error as { serverResponseCode?: unknown })?.serverResponseCode === "string"
      ? (error as { serverResponseCode: string }).serverResponseCode
      : "";

    if (serverResponseCode === "AUTHENTICATIONFAILED" || responseText.toLowerCase().includes("invalid credentials")) {
      return NextResponse.json(
        { error: "Invalid credentials. Use a valid mailbox app password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Connection failed. Check provider settings, IMAP access, and credentials." },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.logout().catch(() => undefined);
    }
  }
}
