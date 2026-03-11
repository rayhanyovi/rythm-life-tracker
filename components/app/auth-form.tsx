"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignIn = mode === "sign-in";
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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
      const response = isSignIn
        ? await authClient.signIn.email({
            email: email.trim(),
            password,
          })
        : await authClient.signUp.email({
            email: email.trim(),
            password,
            name: name.trim(),
          });

      if (response.error) {
        setError(response.error.message ?? "Authentication failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor={`${mode}-password`}>Password</Label>
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
        <div className="rounded-[calc(var(--radius)-0.25rem)] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isSignIn ? "Sign in with Better Auth" : "Create account with Better Auth"}
        {!isPending ? <ArrowRight className="size-4" /> : null}
      </Button>
    </form>
  );
}
