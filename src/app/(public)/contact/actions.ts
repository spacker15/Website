"use server";

import { headers } from "next/headers";
import { sendMail } from "@/lib/email/send-mail";
import { rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { contactSchema, type ContactInput } from "./schema";

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ContactInput, string>> };

const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function submitContact(
  input: ContactInput,
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        fieldErrors[key as keyof ContactInput] = issue.message;
      }
    }
    return { ok: false, error: "Please fix the errors and try again.", fieldErrors };
  }

  // Honeypot: silently succeed so bots don't learn what tripped them.
  if (parsed.data.website) {
    return { ok: true };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit(`contact:${ip}`, RATE);
  if (!rl.ok) {
    return {
      ok: false,
      error: "You've sent too many messages. Please try again in a few minutes.",
    };
  }

  const { name, email, subject, message } = parsed.data;

  const text = [
    `From: ${name} <${email}>`,
    `IP: ${ip}`,
    `Time: ${new Date().toISOString()}`,
    "",
    message,
  ].join("\n");

  const html = `
<div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0b1220;">
  <h2 style="margin:0 0 12px;color:#00808c;">New contact form submission</h2>
  <p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
  <p style="margin:0 0 8px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
  <p style="margin:0 0 8px;color:#64748b;font-size:12px;">IP ${escapeHtml(ip)} · ${new Date().toISOString()}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
  <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;">${escapeHtml(message)}</pre>
</div>`.trim();

  const result = await sendMail({
    to: siteConfig.contactEmail,
    replyTo: email,
    subject: `[Site contact] ${subject}`,
    text,
    html,
  });

  if (!result.ok) {
    if (result.error === "not-configured") {
      return {
        ok: false,
        error:
          "Email sending isn't configured yet. Please email us directly at " +
          siteConfig.contactEmail +
          ".",
      };
    }
    return {
      ok: false,
      error: "Sorry — something went wrong sending your message. Please try again.",
    };
  }

  return { ok: true };
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
