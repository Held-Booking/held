export const THEME_COOKIE = "held_theme";
export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COLORS = {
  dark: "#07080a",
  light: "#f4f5f7",
} as const;

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "dark" || value === "light";
}

export function nextTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}
