import { permanentRedirect } from "next/navigation";

export default function DashboardRedirectPage() {
  permanentRedirect("/today");
}
