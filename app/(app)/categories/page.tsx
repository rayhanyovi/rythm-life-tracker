import { permanentRedirect } from "next/navigation";

export default function CategoriesRedirectPage() {
  permanentRedirect("/attributes");
}
