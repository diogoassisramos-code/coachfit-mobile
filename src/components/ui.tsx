import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { C, R, S, Shadow } from "@/constants/coachfit";

/** Tela base: fundo + safe area + scroll com padding. */
export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={st.scrollContent}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={st.header}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={st.eyebrow}>{eyebrow}</Text> : null}
        <Text style={st.h1}>{title}</Text>
        {subtitle ? <Text style={st.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  flat,
}: {
  children: ReactNode;
  style?: ViewStyle;
  flat?: boolean;
}) {
  return (
    <View style={[st.card, !flat && Shadow, style]}>{children}</View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={st.sectionTitle}>{children}</Text>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: C.brandSoft, fg: C.brand },
  success: { bg: C.successSoft, fg: C.success },
  warning: { bg: C.warningSoft, fg: C.warning },
  danger: { bg: C.dangerSoft, fg: C.danger },
  neutral: { bg: C.surfaceMuted, fg: C.textSec },
};

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const t = TONES[tone];
  return (
    <View style={[st.badge, { backgroundColor: t.bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={t.fg} /> : null}
      <Text style={[st.badgeText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (
    <View
      style={[
        st.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[st.avatarText, { fontSize: size <= 40 ? 13 : 16 }]}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}

/** Texto utilitário com cor de tema. */
export function T({
  children,
  style,
  c = "text",
  size = 14,
  weight = "400",
  numberOfLines,
}: {
  children: ReactNode;
  style?: TextStyle;
  c?: keyof typeof C;
  size?: number;
  weight?: TextStyle["fontWeight"];
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: C[c] as string, fontSize: size, fontWeight: weight }, style]}
    >
      {children}
    </Text>
  );
}

export const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollContent: {
    padding: S.lg,
    paddingBottom: S.xxxl * 2,
    gap: S.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    marginTop: S.xs,
  },
  eyebrow: {
    color: C.textTer,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  h1: {
    color: C.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: { color: C.textSec, fontSize: 14, marginTop: 2 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.pill,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  avatar: {
    backgroundColor: C.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.textSec, fontWeight: "700" },
});
