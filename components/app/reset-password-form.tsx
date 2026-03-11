"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetErrorMessages: Record<string, string> = {
  INVALID_TOKEN: "This reset link is invalid or has expired. Request a fresh one.",
};

type ResetPasswordFormProps = {
  searchError: string | null;
  token: string | null;
};

export function ResetPasswordForm({
  searchError,
  token,
}: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resolvedSearchError = searchError
    ? (resetErrorMessages[searchError] ?? "This reset link can no longer be used.")
    : null;
  const canSubmit = Boolean(token) && !resolvedSearchError && !isSuccess;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing a token. Request a fresh one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const response = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (response.error) {
        setError(response.error.message ?? "Password reset failed.");
        return;
      }

      setIsSuccess(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {resolvedSearchError ? (
        <Alert variant="destructive">
          <AlertTitle>Reset link unavailable</AlertTitle>
          <AlertDescription>{resolvedSearchError}</AlertDescription>
        </Alert>
      ) : null}

      {!token && !resolvedSearchError ? (
        <Alert variant="destructive">
          <AlertTitle>Missing token</AlertTitle>
          <AlertDescription>
            Open the link from your email again, or request a new reset link.
          </AlertDescription>
        </Alert>
      ) : null}

      {isSuccess ? (
        <Alert>
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>
            Your password has been reset successfully. Existing sessions were
            revoked, so sign in again with your new password.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="reset-password-new">New password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-password-new"
                type="password"
                placeholder="••••••••"
                className="pl-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">Confirm password</Label>
            <Input
              id="reset-password-confirm"
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Reset failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="w-full" disabled={isPending || !canSubmit}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Reset password
            {!isPending ? <ArrowRight className="size-4" /> : null}
          </Button>
        </>
      )}

      <div className="text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-semibold text-foreground hover:text-primary">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
