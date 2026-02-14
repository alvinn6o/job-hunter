import { NextResponse } from "next/server";
import { parseResumePdf } from "~/server/lib/resume-parser";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { resumeBase64?: string };

    if (!body.resumeBase64 || typeof body.resumeBase64 !== "string") {
      return NextResponse.json(
        { error: "resumeBase64 is required" },
        { status: 400 },
      );
    }

    const pdfBuffer = Buffer.from(body.resumeBase64, "base64");
    const profile = await parseResumePdf(pdfBuffer);

    return NextResponse.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
