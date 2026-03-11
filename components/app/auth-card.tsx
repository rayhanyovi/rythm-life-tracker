import Link from "next/link";
import { ArrowRight, Compass, LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                : "Create your account before wiring Better Auth in the next slice."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled className="space-y-4 opacity-70">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`${mode}-email`}
                type="email"
                placeholder="you@example.com"
                className="pl-11"
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
              />
            </div>
          ) : null}
          <Button className="w-full" disabled>
            {isSignIn ? "Continue with Better Auth" : "Create account with Better Auth"}
            <ArrowRight className="size-4" />
          </Button>
        </fieldset>

        <div className="rounded-[calc(var(--radius)-0.25rem)] bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          Auth UI is already in place. The next slice will connect this flow to
          Better Auth sessions, handlers, and server-side redirects.
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
