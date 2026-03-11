import { AuthCard } from "@/components/app/auth-card";
import { AuthShell } from "@/components/app/auth-shell";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readString(
  value: string | string[] | undefined,
) {
  return typeof value === "string" ? value : null;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthShell>
      <AuthCard
        mode="reset-password"
        resetPasswordError={readString(resolvedSearchParams.error)}
        resetPasswordToken={readString(resolvedSearchParams.token)}
      />
    </AuthShell>
  );
}
