import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { C, interFont, R, S, Shadow } from "@/constants/coachfit";

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Ícone por rota: preenchido quando ativo, contornado quando inativo. */
const ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  index: { active: "today", inactive: "today-outline" },
  treino: { active: "barbell", inactive: "barbell-outline" },
  dieta: { active: "restaurant", inactive: "restaurant-outline" },
  protocolo: { active: "medkit", inactive: "medkit-outline" },
  perfil: { active: "person", inactive: "person-outline" },
};

const FALLBACK_ICON: { active: IoniconName; inactive: IoniconName } = {
  active: "ellipse",
  inactive: "ellipse-outline",
};

const ICON_SIZE = 24;
/** Cor de destaque do item ativo — mint, a "faísca" do CoachFit. */
const ACCENT = C.accentDeep;

/**
 * Subconjunto do contrato que o expo-router/react-navigation passa para um
 * `tabBar` customizado. Tipamos só o que usamos; o boundary em `_layout.tsx`
 * faz o cast a partir do `BottomTabBarProps` completo.
 */
export type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/**
 * Tab bar flutuante estilo "interactive menu": o item ativo mostra ícone +
 * rótulo com um **sublinhado** de destaque e um pequeno **bounce** no ícone ao
 * ser selecionado; os inativos ficam só com o ícone contornado.
 *
 * Porte do componente web shadcn (`modern-mobile-menu`) para primitivos React
 * Native — sem Tailwind / lucide. O estado visual é declarativo (derivado de
 * `focused`), o que é o caminho confiável com o React Compiler ligado; o bounce
 * é uma animação de *mount* (dispara ao trocar o ícone para a variante ativa).
 */
export function BottomNavBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.band,
        { paddingBottom: Math.max(insets.bottom, S.sm) + S.sm },
      ]}
    >
      <View style={[styles.bar, Shadow]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key]?.options.title ?? route.name;
          const icon = ICONS[route.name] ?? FALLBACK_ICON;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              hitSlop={6}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              {focused ? (
                <BounceIcon name={icon.active} color={ACCENT} />
              ) : (
                <Ionicons
                  name={icon.inactive}
                  size={ICON_SIZE}
                  color={C.textTer}
                />
              )}

              {focused ? (
                <View style={styles.labelCol}>
                  <Text numberOfLines={1} style={styles.label}>
                    {label}
                  </Text>
                  <View style={styles.underline} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Ícone do item ativo com um "pulo" sutil ao montar (= ao virar ativo). */
function BounceIcon({ name, color }: { name: IoniconName; color: string }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(t, {
        toValue: -5,
        duration: 130,
        useNativeDriver: false,
      }),
      Animated.spring(t, {
        toValue: 0,
        friction: 4,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();
  }, [t]);

  return (
    <Animated.View style={{ transform: [{ translateY: t }] }}>
      <Ionicons name={name} size={ICON_SIZE} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: S.sm,
    paddingHorizontal: S.lg,
    backgroundColor: C.bg,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
    maxWidth: "100%",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: R.pill,
  },
  itemActive: {
    // Em telas estreitas só o item ativo encolhe (rótulo trunca), sem
    // empurrar/cortar os demais.
    flexShrink: 1,
    minWidth: 0,
  },
  itemPressed: {
    opacity: 0.55,
  },
  labelCol: {
    alignItems: "center",
    flexShrink: 1,
  },
  label: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: interFont("700"),
    letterSpacing: 0.2,
  },
  underline: {
    marginTop: 3,
    height: 2,
    borderRadius: 1,
    backgroundColor: ACCENT,
    alignSelf: "stretch",
  },
});

export default BottomNavBar;
