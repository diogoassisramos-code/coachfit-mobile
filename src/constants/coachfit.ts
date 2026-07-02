/**
 * Tokens de design do **Revo Design System** (identidade editorial:
 * grounds petrol profundo, accent mint, lilac secundário, superfícies ice).
 * Mantemos os nomes de token já usados no app e remapeamos para a paleta DS.
 */
export const C = {
  // Marca / âncora escura
  brand: "#022128", // petrol-deep — botões/âncora escura, headings
  brandSoft: "#e3f6f0", // mint-100 — fill suave da marca
  petrol: "#004860", // petrol-700
  petrolSoft: "#d8e9ee", // petrol-100

  // Accent (a faísca) — mint
  accent: "#7CD3BB", // mint-400 — CTAs/active/destaque
  accentSoft: "#e3f6f0", // mint-100
  accentDeep: "#2f8f74", // mint-700 — texto accent sobre claro
  accentPress: "#5fc2a4", // mint-500

  // Secundário
  lilac: "#6A6DC0",
  lilacSoft: "#e7e8f8",

  // Superfícies
  bg: "#f4f8f7", // ice-50 — canvas claro do app
  surface: "#FFFFFF", // cards
  surfaceAlt: "#E0ECEA", // ice-100 — painel interno
  surfaceMuted: "#d8e9ee", // petrol-100 — chips / fills
  surfaceDark: "#022128", // petrol-deep — módulo escuro
  surfaceDarkAlt: "#004860", // petrol-700 — card no escuro

  border: "rgba(2,33,40,0.12)",
  borderStrong: "rgba(2,33,40,0.20)",
  borderOnDark: "rgba(224,236,234,0.16)",

  // Texto (claro)
  text: "#022128", // petrol-deep
  textSec: "#3a4845", // gray-700
  textTer: "#6b7a77", // gray-500
  // Texto (escuro)
  textOnDark: "#E0ECEA", // ice-100
  textOnDarkStrong: "#FFFFFF",
  textOnDarkMuted: "#7fb3c2", // petrol-300

  // Status (tonalizados pra paleta)
  success: "#2f8f74", // mint-700 (fg legível)
  successSoft: "#e3f6f0",
  warning: "#8a5a12",
  warningSoft: "#f7ecd6",
  danger: "#bd463f",
  dangerSoft: "#f7e2e0",

  white: "#FFFFFF",
} as const;

/** Espaçamentos (px) — escala base 4. */
export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Raios — generosos e consistentes (módulos grandes; controles em pill). */
export const R = {
  sm: 10,
  md: 16,
  lg: 22, // cards
  xl: 28, // módulos grandes
  xxl: 36, // heros / telas
  pill: 999,
} as const;

/** Elevação suave, fria — nunca pesada. */
export const Shadow = {
  shadowColor: "#022128",
  shadowOpacity: 0.08,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const;

/** Famílias estáticas (carregadas via expo-google-fonts no nativo). */
const HANKEN = {
  regular: "HankenGrotesk_400Regular",
  medium: "HankenGrotesk_500Medium",
  semibold: "HankenGrotesk_600SemiBold",
  bold: "HankenGrotesk_700Bold",
  extrabold: "HankenGrotesk_800ExtraBold",
} as const;

const SPACE = {
  regular: "SpaceGrotesk_400Regular",
  medium: "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold: "SpaceGrotesk_700Bold",
} as const;

/**
 * Fonte de texto/display = **Hanken Grotesk**, por peso. Em nativo E web usamos
 * as famílias estáticas carregadas via `useFonts` no `_layout` — no web export
 * SPA o `+html.tsx` (Google Fonts) não é aplicado, então as fontes do `useFonts`
 * (registradas em runtime) são a fonte de verdade nos dois ambientes. É preciso
 * setar explicitamente porque o react-native-web aplica a fonte do sistema em
 * todo `Text`.
 *
 * (Mantém o nome `interFont` por compatibilidade com os imports existentes.)
 */
export function interFont(weight?: string | number): string | undefined {
  switch (String(weight)) {
    case "800":
    case "900":
      return HANKEN.extrabold;
    case "700":
    case "bold":
      return HANKEN.bold;
    case "600":
      return HANKEN.semibold;
    case "500":
      return HANKEN.medium;
    default:
      return HANKEN.regular;
  }
}

/** Fonte de dados/números = **Space Grotesk** (pesos, R$, métricas). */
export function dataFont(weight?: string | number): string | undefined {
  switch (String(weight)) {
    case "700":
    case "800":
    case "bold":
      return SPACE.bold;
    case "600":
      return SPACE.semibold;
    case "500":
      return SPACE.medium;
    default:
      return SPACE.regular;
  }
}

/**
 * Fonte de **títulos / display de marca** = **Blandy Grotesque** (peso único),
 * carregada via `useFonts` no `_layout` (família "BlandyGrotesque") — em nativo
 * e web.
 */
export function titleFont(): string {
  return "BlandyGrotesque";
}
