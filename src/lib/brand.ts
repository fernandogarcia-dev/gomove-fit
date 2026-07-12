/** GoMove logo brand colors (from logotipo.svg / favicon.svg) */
export const BRAND = {
  /** Dark green — "Go", arrow base */
  dark: "#009b59",
  /** Bright green — "Move", arrow tip */
  light: "#00d48d",
  /** UI primary — same hue family as the logo, tuned lightness for buttons/text on screen */
  primary: "#00b87a",
} as const;

/** HSL values for CSS custom properties (Tailwind hsl(var(--primary))), computed exactly from the hex above — keep the decimals, rounding to whole degrees causes a visible drift */
export const BRAND_HSL = {
  dark: "154.5 100% 30.4%",
  light: "159.9 100% 41.6%",
  primary: "159.8 100% 36.1%",
} as const;
