import { permanentRedirect } from "next/navigation";

export default function HistoryRedirectPage() {
  permanentRedirect("/activity-log");
}
