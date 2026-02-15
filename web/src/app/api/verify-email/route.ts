import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.gmailUser || !body.gmailAppPassword) {
    return NextResponse.json(
      { error: "Gmail address and App Password are required" },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: body.gmailUser.trim(),
      pass: body.gmailAppPassword.trim(),
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });

  try {
    await transporter.verify();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Authentication failed. Make sure you're using a Gmail App Password, not your regular password.",
      },
      { status: 401 },
    );
  }
}
