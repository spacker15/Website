import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cached) return cached;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  cached = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return cached;
}

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendMailResult =
  | { ok: true; id: string }
  | { ok: false; error: "not-configured" | "send-failed"; message?: string };

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const transport = getTransport();
  if (!transport) {
    return { ok: false, error: "not-configured" };
  }
  try {
    const info = await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    return {
      ok: false,
      error: "send-failed",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
