import { getAuthEmailFrom, getResendApiKey } from "@/lib/env";

type AuthEmailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

type AuthEmailFallbackMetadata = Record<string, string | null | undefined>;

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

function buildVerificationEmail(verificationUrl: string): AuthEmailPayload {
  return {
    to: "",
    subject: "Verify your Rythm email",
    text: `Use this link to verify your Rythm email: ${verificationUrl}`,
    html: [
      "<p>Welcome to <strong>Rythm</strong>.</p>",
      `<p><a href="${verificationUrl}">Verify your email</a></p>`,
      "<p>Once verified, you can sign in and continue building your recurring rhythm.</p>",
    ].join(""),
  };
}

async function deliverAuthEmail(options: {
  fallbackMetadata: AuthEmailFallbackMetadata;
  payload: AuthEmailPayload;
}) {
  const delivered = await sendWithResend(options.payload);

  if (delivered) {
    return;
  }

  console.info("[Rythm auth email fallback]", {
    previewOnly: true,
    subject: options.payload.subject,
    to: options.payload.to,
    ...options.fallbackMetadata,
  });
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

  await deliverAuthEmail({
    fallbackMetadata: {
      resetUrl: options.resetUrl,
      userName: options.name ?? null,
    },
    payload: emailPayload,
  });
}

export async function sendVerificationEmail(options: {
  email: string;
  name: string | null | undefined;
  verificationUrl: string;
}) {
  const emailPayload = {
    ...buildVerificationEmail(options.verificationUrl),
    to: options.email,
  };

  await deliverAuthEmail({
    fallbackMetadata: {
      userName: options.name ?? null,
      verificationUrl: options.verificationUrl,
    },
    payload: emailPayload,
  });
}
