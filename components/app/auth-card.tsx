import Link from "next/link";
import { Compass } from "lucide-react";

import { AuthForm } from "@/components/app/auth-form";
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
  mode: "sign-in" | "sign-up";
};

export function AuthCard({ mode }: AuthCardProps) {
  const isSignIn = mode === "sign-in";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Rythm</CardTitle>
            <CardDescription>
              {isSignIn
                ? "Sign in to continue your daily rhythm."
                : "Create your account to start shaping your recurring rhythm."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthForm mode={mode} />

        <div className="rounded-[calc(var(--radius)-0.25rem)] bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          Email and password auth is now mounted in the root app. Protected
          routes and auth-aware redirects are already wired server-side, while
          recovery flows stay outside the current MVP cut.
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <Separator />
        <p className="text-sm text-muted-foreground">
          {isSignIn ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-semibold text-foreground hover:text-primary"
          >
            {isSignIn ? "Go to sign up" : "Go to sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
