import { AuthShell } from "@/components/app/auth-shell";
import { redirectIfAuthenticated } from "@/lib/session";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await redirectIfAuthenticated();

  return <AuthShell>{children}</AuthShell>;
}
