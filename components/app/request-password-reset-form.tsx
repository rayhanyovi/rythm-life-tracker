"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RequestPasswordResetForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const redirectTo = new URL("/reset-password", window.location.origin).toString();
      const response = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo,
      });

      if (response.error) {
        setError(response.error.message ?? "Password reset request failed.");
        return;
      }

      setSubmittedEmail(email.trim());
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-password-email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="forgot-password-email"
            type="email"
            placeholder="you@example.com"
            className="pl-11"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      {submittedEmail ? (
        <Alert>
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            If <span className="font-medium text-foreground">{submittedEmail}</span> exists in
            Rythm, a reset link has been issued. In local development without an
            email provider, the link may appear in server logs.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Send reset link
        {!isPending ? <ArrowRight className="size-4" /> : null}
      </Button>
    </form>
  );
}
