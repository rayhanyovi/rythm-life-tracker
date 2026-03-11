import { AuthCard } from "@/components/app/auth-card";
import { AuthShell } from "@/components/app/auth-shell";
import { redirectIfAuthenticated } from "@/lib/session";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell>
      <AuthCard mode="forgot-password" />
    </AuthShell>
  );
}
