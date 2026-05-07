const CATEGORY_COLORS: Record<string, string> = {
  Admin: "hsl(218 10% 48%)",
  Career: "hsl(223 39% 45%)",
  "Daily Rhythm": "hsl(223 39% 45%)",
  Finance: "hsl(155 35% 42%)",
  Health: "hsl(12 55% 52%)",
  "Personal Growth": "hsl(36 60% 48%)",
  Product: "hsl(223 39% 45%)",
  Relationship: "hsl(340 35% 52%)",
  Spiritual: "hsl(280 30% 55%)",
  Wellness: "hsl(155 35% 42%)",
};

export function getCategoryColor(name: string) {
  return CATEGORY_COLORS[name] ?? "hsl(218 10% 55%)";
}
