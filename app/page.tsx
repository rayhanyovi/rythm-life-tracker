import { LandingPage } from "@/components/marketing/landing-page";
import { redirectIfAuthenticated } from "@/lib/session";

export default async function Home() {
  await redirectIfAuthenticated();

  return <LandingPage />;
}
