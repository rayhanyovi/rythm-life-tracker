import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm">
            <WifiOff className="size-5" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">
              You&apos;re offline.
            </CardTitle>
            <CardDescription className="max-w-lg text-sm leading-7">
              Rythm keeps offline support intentionally small. You can reopen
              the app shell and cached assets, but quest writes and history
              updates still need a connection.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
            Reconnect to continue sign-in, sync completions, or refresh the live
            dashboard data.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/sign-in">Try sign in again</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Retry app entry</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
