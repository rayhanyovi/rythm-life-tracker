import type { LucideIcon } from "lucide-react";

export type AppNavItem = {
  aliases?: string[];
  badge?: number | string;
  disabled?: boolean;
  href?: string;
  label: string;
  summary: string;
  icon: LucideIcon;
};

export type AppNavGroup = {
  label: string;
  items: AppNavItem[];
};
