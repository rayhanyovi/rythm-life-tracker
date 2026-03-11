"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      <span className="hidden sm:inline">Sign out</span>
      <span className="sr-only sm:hidden">Sign out</span>
    </Button>
  );
}
