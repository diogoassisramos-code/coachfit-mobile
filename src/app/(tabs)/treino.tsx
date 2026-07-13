import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Badge, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { type Treino } from "@/data/aluno";
import { useTreinos } from "@/lib/db";

export default function TreinoScreen() {
  const { treinos, refetch } = useTreinos();
  // Relê ao focar a tela → pega treinos que o coach publicou depois do app abrir.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
  return (
    <Screen>
      <ScreenHeader
        eyebrow="Seu programa"
        title="Treinos"
        subtitle={`${treinos.length} treinos enviados pelo seu coach`}
      />

      {treinos.map((t, i) => (
        <TreinoCard key={t.id} treino={t} letra={String.fromCharCode(65 + i)} />
      ))}
    </Screen>
  );
}

function TreinoCard({ treino, letra }: { treino: Treino; letra: string }) {
  const router = useRouter();
  const grupos = [...new Set(treino.exercicios.map((e) => e.grupo))];
  const series = treino.exercicios.reduce((n, e) => n + e.series, 0);
  const hoje = treino.diaSemana === "Hoje";

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/treino/[id]", params: { id: treino.id } })
      }
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <View style={s.row}>
          <View style={[s.letra, hoje && s.letraHoje]}>
            <T size={20} weight="800" c={hoje ? "brand" : "petrol"}>
              {letra}
            </T>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={s.titleRow}>
              <T size={16} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                {treino.nome}
              </T>
              {treino.diaSemana ? (
                <Badge tone={hoje ? "brand" : "neutral"}>
                  {treino.diaSemana}
                </Badge>
              ) : null}
            </View>
            <T c="textSec" size={13} style={{ marginTop: 4 }}>
              {treino.exercicios.length} exercícios · {series} séries
            </T>
            <T c="textTer" size={12} style={{ marginTop: 2 }} numberOfLines={1}>
              {grupos.join(" · ")}
            </T>
          </View>
        </View>

        <Pressable
          onPress={() =>
        router.push({ pathname: "/treino/[id]", params: { id: treino.id } })
      }
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="play" size={16} color={C.brand} />
          <T c="brand" size={14} weight="700">
            {hoje ? "Iniciar treino de hoje" : "Abrir treino"}
          </T>
        </Pressable>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    padding: S.lg,
  },
  letra: {
    width: 48,
    height: 48,
    borderRadius: R.md,
    backgroundColor: C.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  letraHoje: {
    backgroundColor: C.accentSoft,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.accent,
    paddingVertical: 12,
  },
});
