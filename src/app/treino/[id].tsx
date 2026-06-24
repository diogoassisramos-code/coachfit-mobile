import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, dataFont, R, S } from "@/constants/coachfit";
import { Exercicio, treinos } from "@/data/aluno";

export default function TreinoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const treino = treinos.find((t) => t.id === id);

  if (!treino) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={st.notFound}>
          <Ionicons name="barbell-outline" size={40} color={C.textTer} />
          <T size={17} weight="700">
            Treino não encontrado
          </T>
          <Pressable style={st.backBtn} onPress={() => router.back()}>
            <T c="brand" size={14} weight="700">
              Voltar
            </T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const series = treino.exercicios.reduce((n, e) => n + e.series, 0);
  const descansoTotal = treino.exercicios.reduce(
    (n, e) => n + e.descansoSeg * e.series,
    0
  );
  const minutos = Math.round((series * 45 + descansoTotal) / 60);

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <T size={15} weight="700">
          Treino
        </T>
        <View style={st.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo petrol */}
        <View style={st.hero}>
          <View style={st.diamond} />
          <View style={st.heroEyebrow}>
            <Ionicons name="calendar-outline" size={13} color={C.accent} />
            <T size={12} weight="700" style={{ color: C.accent, letterSpacing: 0.3 }}>
              {treino.diaSemana}
            </T>
          </View>
          <T
            size={23}
            weight="800"
            style={{ color: C.textOnDarkStrong, marginTop: S.md, letterSpacing: -0.4 }}
          >
            {treino.nome}
          </T>
          <View style={st.heroStats}>
            <HeroStat value={String(treino.exercicios.length)} label="exercícios" />
            <HeroStat value={String(series)} label="séries" />
            <HeroStat value={`~${minutos}`} label="minutos" />
          </View>
        </View>

        <T size={11} weight="700" c="textTer" style={st.sectionLabel}>
          EXERCÍCIOS
        </T>

        {treino.exercicios.map((ex, i) => (
          <ExerciseRow key={ex.id} ex={ex} index={i + 1} />
        ))}
      </ScrollView>

      <View style={st.footer}>
        <Pressable
          style={({ pressed }) => [st.startBtn, pressed && { opacity: 0.85 }]}
          onPress={() =>
            router.push({
              pathname: "/treino/[id]/sessao",
              params: { id: treino.id },
            })
          }
        >
          <Ionicons name="play" size={20} color={C.brand} />
          <T c="brand" size={16} weight="700">
            Iniciar treino
          </T>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={st.heroStat}>
      <T
        size={20}
        weight="700"
        style={{ color: C.textOnDarkStrong, fontFamily: dataFont("700") }}
      >
        {value}
      </T>
      <T size={12} style={{ color: C.textOnDarkMuted }}>
        {label}
      </T>
    </View>
  );
}

function ExerciseRow({ ex, index }: { ex: Exercicio; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={({ pressed }) => [st.exRow, pressed && { opacity: 0.7 }]}
      >
        <View style={st.exNum}>
          <T size={13} weight="700" c="textSec" style={{ fontFamily: dataFont("700") }}>
            {index}
          </T>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T size={15} weight="700" numberOfLines={1}>
            {ex.nome}
          </T>
          <T c="textTer" size={12} weight="600" style={{ marginTop: 2 }}>
            {ex.grupo.toUpperCase()}
          </T>
        </View>
        <View style={st.exSpec}>
          <T size={14} weight="700" style={{ fontFamily: dataFont("700") }}>
            {ex.series}×{ex.reps}
          </T>
          <View style={st.restTag}>
            <Ionicons name="time-outline" size={12} color={C.textTer} />
            <T c="textTer" size={11} weight="600" style={{ fontFamily: dataFont("600") }}>
              {ex.descansoSeg}s
            </T>
          </View>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={C.textTer}
        />
      </Pressable>

      {open ? (
        <View style={st.exDetail}>
          {ex.seriesDetalhe ? (
            <View style={{ gap: 6 }}>
              <T size={11} weight="700" c="textTer" style={{ letterSpacing: 0.5 }}>
                PLANO DE SÉRIES
              </T>
              {ex.seriesDetalhe.map((sp, i) => (
                <View key={i} style={st.planRow}>
                  <View style={st.planNum}>
                    <T
                      size={12}
                      weight="700"
                      c="textSec"
                      style={{ fontFamily: dataFont("700") }}
                    >
                      {i + 1}
                    </T>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T size={13} weight="700">
                      {sp.rotulo} · {sp.reps} reps
                    </T>
                    {sp.obs ? (
                      <T c="textSec" size={12} style={{ marginTop: 1, lineHeight: 16 }}>
                        {sp.obs}
                      </T>
                    ) : null}
                  </View>
                  <View style={st.planRest}>
                    <Ionicons name="time-outline" size={12} color={C.textTer} />
                    <T
                      c="textTer"
                      size={11}
                      weight="600"
                      style={{ fontFamily: dataFont("600") }}
                    >
                      {sp.descansoSeg}s
                    </T>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          {ex.observacoes ? (
            <View style={st.coachNote}>
              <Ionicons name="chatbubble-ellipses" size={15} color={C.accentDeep} />
              <View style={{ flex: 1 }}>
                <T size={11} weight="700" c="accentDeep" style={{ letterSpacing: 0.3 }}>
                  ORIENTAÇÃO DO COACH
                </T>
                <T c="textSec" size={13} style={{ marginTop: 3, lineHeight: 19 }}>
                  {ex.observacoes}
                </T>
              </View>
            </View>
          ) : (
            <T c="textTer" size={13} style={{ fontStyle: "italic" }}>
              Sem orientações específicas para este exercício.
            </T>
          )}
          {ex.video ? (
            <View style={st.videoLink}>
              <Ionicons name="play-circle" size={18} color={C.accentDeep} />
              <T c="accentDeep" size={13} weight="600">
                Ver vídeo de execução
              </T>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: S.md,
    padding: S.xxl,
  },
  backBtn: { marginTop: S.sm, paddingHorizontal: S.lg, paddingVertical: S.sm },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  content: { padding: S.lg, paddingBottom: S.xxxl * 3, gap: S.md },
  hero: {
    backgroundColor: C.surfaceDark,
    borderRadius: R.xl,
    padding: S.xl,
    overflow: "hidden",
  },
  diamond: {
    position: "absolute",
    right: -46,
    top: -46,
    width: 150,
    height: 150,
    borderRadius: 44,
    backgroundColor: C.accent,
    opacity: 0.1,
    transform: [{ rotate: "45deg" }],
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(124,211,187,0.14)",
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroStats: { flexDirection: "row", gap: S.xl, marginTop: S.lg },
  heroStat: { gap: 2 },
  sectionLabel: { letterSpacing: 0.8, marginTop: S.sm, marginBottom: 2 },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    padding: S.md,
  },
  exNum: {
    width: 30,
    height: 30,
    borderRadius: R.sm,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  exSpec: { alignItems: "flex-end", gap: 3 },
  restTag: { flexDirection: "row", alignItems: "center", gap: 3 },
  exDetail: {
    paddingHorizontal: S.md,
    paddingBottom: S.md,
    gap: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: S.md,
  },
  coachNote: {
    flexDirection: "row",
    gap: S.sm,
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    padding: S.md,
  },
  videoLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: R.sm,
    backgroundColor: C.surfaceAlt,
  },
  planNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  planRest: { flexDirection: "row", alignItems: "center", gap: 3 },
  footer: {
    padding: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 54,
  },
});
