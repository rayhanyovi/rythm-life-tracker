"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthNotice = {
  description: string;
  title: string;
  variant?: "default" | "destructive";
};

type AuthFormProps = {
  initialNotice?: AuthNotice | null;
  mode: "sign-in" | "sign-up";
};

function buildVerificationCallbackUrl() {
  return new URL("/sign-in?verified=1", window.location.origin).toString();
}

export function AuthForm({ initialNotice, mode }: AuthFormProps) {
  const router = useRouter();
  const isSignIn = mode === "sign-in";
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [infoNotice, setInfoNotice] = useState<AuthNotice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfoNotice(null);

    if (!isSignIn) {
      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    startTransition(async () => {
      const trimmedEmail = email.trim();
      const response = isSignIn
        ? await authClient.signIn.email({
            email: trimmedEmail,
            password,
          })
        : await authClient.signUp.email({
            callbackURL: buildVerificationCallbackUrl(),
            email: trimmedEmail,
            password,
            name: name.trim(),
          });

      if (response.error) {
        const isVerificationError =
          isSignIn &&
          (response.error.status === 403 ||
            /verify/i.test(response.error.message ?? ""));

        if (isVerificationError) {
          setVerificationEmail(trimmedEmail);
          setError(
            "Your email is not verified yet. Check your inbox or resend the verification email.",
          );
          return;
        }

        setError(response.error.message ?? "Authentication failed.");
        return;
      }

      if (!isSignIn) {
        router.push(`/sign-in?verification=sent&email=${encodeURIComponent(trimmedEmail)}`);
        router.refresh();
        return;
      }

      try {
        await fetch("/api/bootstrap/default-categories", {
          method: "POST",
        });
      } catch {
        // Best-effort seed: the user can still continue and create categories manually.
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  const handleResendVerification = () => {
    if (!verificationEmail) {
      return;
    }

    setError(null);
    setInfoNotice(null);

    startTransition(async () => {
      const response = await authClient.sendVerificationEmail({
        callbackURL: buildVerificationCallbackUrl(),
        email: verificationEmail,
      });

      if (response.error) {
        setError(response.error.message ?? "Verification email could not be sent.");
        return;
      }

      setInfoNotice({
        description:
          "A fresh verification link has been issued. In local development without a configured email provider, check the server logs for the fallback preview.",
        title: "Verification email sent",
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initialNotice ? (
        <Alert variant={initialNotice.variant}>
          <AlertTitle>{initialNotice.title}</AlertTitle>
          <AlertDescription>{initialNotice.description}</AlertDescription>
        </Alert>
      ) : null}

      {infoNotice ? (
        <Alert>
          <AlertTitle>{infoNotice.title}</AlertTitle>
          <AlertDescription>{infoNotice.description}</AlertDescription>
        </Alert>
      ) : null}

      {!isSignIn ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="pl-11"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${mode}-email`}
            type="email"
            placeholder="you@example.com"
            className="pl-11"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${mode}-password`}>Password</Label>
          {isSignIn ? (
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${mode}-password`}
            type="password"
            placeholder="••••••••"
            className="pl-11"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />
        </div>
      </div>

      {!isSignIn ? (
        <div className="space-y-2">
          <Label htmlFor="sign-up-confirm">Confirm password</Label>
          <Input
            id="sign-up-confirm"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Authentication failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isSignIn ? "Sign in" : "Create account"}
        {!isPending ? <ArrowRight className="size-4" /> : null}
      </Button>

      {isSignIn && verificationEmail ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleResendVerification}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Resend verification email
        </Button>
      ) : null}
    </form>
  );
}
