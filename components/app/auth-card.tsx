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
  mode: "sign-in" | "sign-up" | "forgot-password" | "reset-password";
  resetPasswordError?: string | null;
  resetPasswordToken?: string | null;
};

export function AuthCard({
  mode,
  resetPasswordError,
  resetPasswordToken,
}: AuthCardProps) {
  const content = {
    "sign-in": {
      description: "Sign in to continue your daily rhythm.",
      helper:
        "Email and password auth is mounted in the root app with guarded routes, auth-aware redirects, and a recovery path for lost access.",
      footerPrompt: "Need an account?",
      footerHref: "/sign-up",
      footerLabel: "Go to sign up",
    },
    "sign-up": {
      description: "Create your account to start shaping your recurring rhythm.",
      helper:
        "New accounts land in the same root app flow immediately, including default category bootstrap and the shared dashboard shell.",
      footerPrompt: "Already have an account?",
      footerHref: "/sign-in",
      footerLabel: "Go to sign in",
    },
    "forgot-password": {
      description: "Request a reset link if you need to recover access.",
      helper:
        "Reset links point back to the root app and can be delivered by a real email provider later. Local development falls back to server logs when mail delivery is not configured.",
      footerPrompt: "Remembered your password?",
      footerHref: "/sign-in",
      footerLabel: "Back to sign in",
    },
    "reset-password": {
      description: "Choose a new password and return to your rhythm.",
      helper:
        "Reset tokens are short-lived and single-use. Successful resets revoke older sessions so the new password becomes the only valid path back in.",
      footerPrompt: "Need another reset link?",
      footerHref: "/forgot-password",
      footerLabel: "Request a new link",
    },
  }[mode];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Rythm</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "sign-in" || mode === "sign-up" ? (
          <AuthForm mode={mode} />
        ) : mode === "forgot-password" ? (
          <RequestPasswordResetForm />
        ) : (
          <ResetPasswordForm
            searchError={resetPasswordError ?? null}
            token={resetPasswordToken ?? null}
          />
        )}

        <div className="rounded-[calc(var(--radius)-0.25rem)] bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          {content.helper}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground">
          {content.footerPrompt}{" "}
          <Link
            href={content.footerHref}
            className="font-semibold text-foreground hover:text-primary"
          >
            {content.footerLabel}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
