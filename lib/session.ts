import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type AppSession = typeof auth.$Infer.Session;

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }
}
