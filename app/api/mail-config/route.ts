import { NextRequest, NextResponse } from "next/server";
import { DELETE as deleteMailConfig, GET as getMailConfig, POST as postMailConfig } from "@/app/api/mail/config/route";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    return await getMailConfig();
  } catch (error) {
    console.error("Failed to fetch mail config via legacy route:", error);
    return jsonError("Failed to fetch mail config", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await postMailConfig(req);
  } catch (error) {
    console.error("Failed to save mail config via legacy route:", error);
    return jsonError("Failed to save mail config", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await deleteMailConfig(req);
  } catch (error) {
    console.error("Failed to disconnect mail config via legacy route:", error);
    return jsonError("Failed to disconnect mailbox", 500);
  }
}
