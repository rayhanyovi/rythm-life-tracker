import { getAuthEmailFrom, getResendApiKey } from "@/lib/env";

type AuthEmailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

async function sendWithResend(payload: AuthEmailPayload) {
  const resendApiKey = getResendApiKey();
  const from = getAuthEmailFrom();

  if (!resendApiKey || !from) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: [payload.to],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email delivery failed: ${response.status} ${details}`);
  }

  return true;
}

function buildPasswordResetEmail(resetUrl: string): AuthEmailPayload {
  return {
    to: "",
    subject: "Reset your Rythm password",
    text: `Use this link to reset your Rythm password: ${resetUrl}`,
    html: [
      "<p>You requested a password reset for <strong>Rythm</strong>.</p>",
      `<p><a href="${resetUrl}">Reset your password</a></p>`,
      "<p>If you did not request this change, you can ignore this email.</p>",
    ].join(""),
  };
}

export async function sendPasswordResetEmail(options: {
  email: string;
  name: string | null | undefined;
  resetUrl: string;
}) {
  const emailPayload = {
    ...buildPasswordResetEmail(options.resetUrl),
    to: options.email,
  };

  const delivered = await sendWithResend(emailPayload);

  if (delivered) {
    return;
  }

  console.info("[Rythm auth email fallback]", {
    previewOnly: true,
    subject: emailPayload.subject,
    to: emailPayload.to,
    resetUrl: options.resetUrl,
    userName: options.name ?? null,
  });
}
