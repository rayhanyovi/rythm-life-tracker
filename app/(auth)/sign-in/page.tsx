import { AuthCard } from "@/components/app/auth-card";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function buildSignInNotice(searchParams: Record<string, string | string[] | undefined>) {
  const verified = readString(searchParams.verified);
  const verificationState = readString(searchParams.verification);
  const email = readString(searchParams.email);
  const error = readString(searchParams.error);

  if (verified === "1") {
    return {
      description:
        "Your email is verified. Sign in again to continue into the dashboard.",
      title: "Email verified",
    };
  }

  if (verificationState === "sent") {
    return {
      description: email
        ? `A verification link was sent to ${email}. Open it before your first sign-in.`
        : "A verification link was sent. Open it before your first sign-in.",
      title: "Check your inbox",
    };
  }

  if (error === "INVALID_TOKEN" || error === "TOKEN_EXPIRED") {
    return {
      description:
        "That verification link is no longer valid. Sign in again to trigger a fresh verification email.",
      title: "Verification link expired",
      variant: "destructive" as const,
    };
  }

  return null;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthCard
      mode="sign-in"
      authNotice={buildSignInNotice(resolvedSearchParams)}
    />
  );
}
