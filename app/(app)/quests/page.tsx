import { permanentRedirect } from "next/navigation";

export default function QuestsRedirectPage() {
  permanentRedirect("/lists");
}
