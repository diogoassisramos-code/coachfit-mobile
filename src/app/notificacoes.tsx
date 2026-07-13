import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { useNotificacoes, type Notificacao } from "@/lib/db";

const ICONE: Record<
  Notificacao["tipo"],
  { nome: keyof typeof Ionicons.glyphMap; bg: string; fg: string }
> = {
  checkin: { nome: "chatbubble-ellipses", bg: C.accentSoft, fg: C.accentDeep },
  protocolo: { nome: "medkit", bg: C.lilacSoft, fg: C.lilac },
  pedido: { nome: "notifications", bg: C.surfaceMuted, fg: C.petrol },
};

export default function NotificacoesScreen() {
  const router = useRouter();
  const { notificacoes, loading, refetch } = useNotificacoes();
  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace("/perfil");
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={voltar} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <T size={15} weight="700">
          Notificações
        </T>
        <View style={st.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={st.center}>
            <ActivityIndicator color={C.accentDeep} />
          </View>
        ) : notificacoes.length === 0 ? (
          <View style={st.center}>
            <Ionicons name="notifications-off-outline" size={40} color={C.textTer} />
            <T c="textSec" size={14} style={{ textAlign: "center" }}>
              Nenhuma notificação por enquanto.
            </T>
          </View>
        ) : (
          <Card flat style={{ padding: 0 }}>
            {notificacoes.map((n, i) => {
              const ic = ICONE[n.tipo];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => n.href && router.push(n.href as never)}
                  style={({ pressed }) => [
                    st.row,
                    i > 0 && st.rowBorder,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <View style={[st.icon, { backgroundColor: ic.bg }]}>
                    <Ionicons name={ic.nome} size={18} color={ic.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T size={14} weight="700">
                      {n.titulo}
                    </T>
                    {n.descricao ? (
                      <T c="textSec" size={13} style={{ marginTop: 2 }} numberOfLines={2}>
                        {n.descricao}
                      </T>
                    ) : null}
                    {n.data ? (
                      <T c="textTer" size={11} weight="600" style={st.data}>
                        {n.data}
                      </T>
                    ) : null}
                  </View>
                  {n.href ? (
                    <Ionicons name="chevron-forward" size={18} color={C.textTer} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  content: { padding: S.lg, paddingBottom: S.xxxl * 2, gap: S.lg },
  center: { alignItems: "center", justifyContent: "center", gap: S.md, paddingTop: S.xxxl },
  row: { flexDirection: "row", alignItems: "flex-start", gap: S.md, padding: S.lg },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  icon: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
  },
  data: { marginTop: 4, letterSpacing: 0.4 },
});
