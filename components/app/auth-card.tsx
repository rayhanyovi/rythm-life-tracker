import type { ReactNode } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

import { AuthForm } from "@/components/app/auth-form";
import { RequestPasswordResetForm } from "@/components/app/request-password-reset-form";
import { ResetPasswordForm } from "@/components/app/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AuthCardProps = {
  authNotice?: {
    description: string;
    title: string;
    variant?: "default" | "destructive";
  } | null;
  mode: "sign-in" | "sign-up" | "forgot-password" | "reset-password";
  resetPasswordError?: string | null;
  resetPasswordToken?: string | null;
};

export function AuthCard({
  authNotice,
  mode,
  resetPasswordError,
  resetPasswordToken,
}: AuthCardProps) {
  const content: Record<
    AuthCardProps["mode"],
    {
      description: string;
      footerHref: string;
      footerLabel: string;
      footerPrompt: string;
      helper: ReactNode;
    }
  > = {
    "sign-in": {
      description: "Sign in to continue your daily rhythm.",
      helper:
        "Use the account you created for Rythm. If verification is pending, resend the email from here.",
      footerPrompt: "Need an account?",
      footerHref: "/sign-up",
      footerLabel: "Go to sign up",
    },
    "sign-up": {
      description: "Create your account to start shaping your recurring rhythm.",
      helper:
        "After your first sign-in, Rythm seeds a starter set of Habit Lists so Today is not empty.",
      footerPrompt: "Already have an account?",
      footerHref: "/sign-in",
      footerLabel: "Go to sign in",
    },
    "forgot-password": {
      description: "Request a reset link if you need to recover access.",
      helper:
        "Use the reset link to choose a new password. Local development may show the email preview in server logs.",
      footerPrompt: "Remembered your password?",
      footerHref: "/sign-in",
      footerLabel: "Back to sign in",
    },
    "reset-password": {
      description: "Choose a new password and return to your rhythm.",
      helper:
        "Choose a new password; older sessions are revoked after a successful reset.",
      footerPrompt: "Need another reset link?",
      footerHref: "/forgot-password",
      footerLabel: "Request a new link",
    },
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Rythm</CardTitle>
            <CardDescription>{content[mode].description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "sign-in" || mode === "sign-up" ? (
          <AuthForm mode={mode} initialNotice={authNotice} />
        ) : mode === "forgot-password" ? (
          <RequestPasswordResetForm />
        ) : (
          <ResetPasswordForm
            searchError={resetPasswordError ?? null}
            token={resetPasswordToken ?? null}
          />
        )}

        <div className="rounded-lg bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          {content[mode].helper}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground">
          {content[mode].footerPrompt}{" "}
          <Link
            href={content[mode].footerHref}
            className="font-semibold text-foreground hover:text-primary"
          >
            {content[mode].footerLabel}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
