import { createRythmIcon } from "@/lib/pwa/icon";

export async function GET() {
  return createRythmIcon({
    size: 192,
    dark: true,
  });
}
