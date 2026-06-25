import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { T } from "@/components/ui";
import { C, interFont, R, S, titleFont } from "@/constants/coachfit";

/** Cabeçalho de marca das telas de auth (logo + título + subtítulo). */
export function AuthHero({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <View style={authStyles.hero}>
      <View style={authStyles.logo}>
        <Ionicons name="barbell" size={28} color={C.accent} />
      </View>
      <T
        size={12}
        weight="700"
        c="accentDeep"
        style={{ letterSpacing: 1.2, marginTop: S.lg }}
      >
        COACHFIT
      </T>
      <T
        size={28}
        weight="800"
        style={{ letterSpacing: -0.6, marginTop: 4, fontFamily: titleFont() }}
      >
        {titulo}
      </T>
      <T c="textSec" size={15} style={{ marginTop: 6, lineHeight: 21 }}>
        {sub}
      </T>
    </View>
  );
}

/** Campo de input rotulado com ícone à esquerda. */
export function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}) {
  return (
    <View style={authStyles.field}>
      <T size={13} weight="600">
        {label}
      </T>
      <View style={authStyles.inputWrap}>
        <Ionicons name={icon} size={18} color={C.textTer} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textTer}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={authStyles.input}
        />
      </View>
    </View>
  );
}

export const authStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, padding: S.xl, paddingTop: S.xxxl },
  hero: { alignItems: "flex-start", marginBottom: S.xxl },
  logo: {
    width: 60,
    height: 60,
    borderRadius: R.lg,
    backgroundColor: C.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: S.lg },
  field: { gap: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    height: 50,
    paddingHorizontal: S.md,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontFamily: interFont("400"),
  },
  forgot: { alignSelf: "flex-end", marginTop: 2 },
  cta: {
    marginTop: S.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 54,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: S.xl,
    flexWrap: "wrap",
  },
});
