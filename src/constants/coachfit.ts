/**
 * Tokens de design do CoachFit (espelham o dashboard do consultor).
 * Paleta da marca, espaçamentos e raios — usados em todo o app.
 */
export const C = {
  brand: "#2347E6",
  brandSoft: "#E7EEFC",

  bg: "#F5F4EF", // fundo do app
  surface: "#FFFFFF", // cards
  surfaceAlt: "#F5F4EF",
  surfaceMuted: "#EAE8E0",

  border: "rgba(26,25,22,0.12)",
  borderStrong: "rgba(26,25,22,0.20)",

  text: "#1A1916",
  textSec: "#5F5B53",
  textTer: "#928D83",

  success: "#1E7A4D",
  successSoft: "#E6F3EB",
  warning: "#9A6B12",
  warningSoft: "#FAEFDA",
  danger: "#C2391F",
  dangerSoft: "#FBE9E6",

  white: "#FFFFFF",
} as const;

/** Espaçamentos (px). */
export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Raios de borda. */
export const R = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;
