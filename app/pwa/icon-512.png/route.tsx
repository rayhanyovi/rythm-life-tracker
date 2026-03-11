import { createRythmIcon } from "@/lib/pwa/icon";

export async function GET() {
  return createRythmIcon({
    size: 512,
    dark: true,
  });
}
