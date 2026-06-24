import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, dataFont, R, S } from "@/constants/coachfit";
import { Exercicio, treinos } from "@/data/aluno";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function SessaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const treino = treinos.find((t) => t.id === id);
  const [idx, setIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!treino) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={st.center}>
          <T size={17} weight="700">
            Treino não encontrado
          </T>
          <Pressable style={st.linkBtn} onPress={() => router.back()}>
            <T c="brand" size={14} weight="700">
              Voltar
            </T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const total = treino.exercicios.length;

  if (finished) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={st.center}>
          <View style={st.successIcon}>
            <Ionicons name="checkmark" size={42} color={C.accentDeep} />
          </View>
          <T size={23} weight="800" style={{ textAlign: "center" }}>
            Treino concluído!
          </T>
          <T c="textSec" size={15} style={{ textAlign: "center", lineHeight: 22 }}>
            Mandou bem. {total} exercícios feitos — sua aderência agradece.
          </T>
          <Pressable style={st.successBtn} onPress={() => router.dismissAll()}>
            <T c="brand" size={15} weight="700">
              Voltar pro início
            </T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const ex = treino.exercicios[idx];
  const last = idx === total - 1;
  const pct = ((idx + 1) / total) * 100;

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="close" size={24} color={C.text} />
        </Pressable>
        <View style={{ flex: 1, gap: 6 }}>
          <T size={12} weight="700" c="textTer" style={{ textAlign: "center" }}>
            EXERCÍCIO {idx + 1} DE {total}
          </T>
          <View style={st.progressTrack}>
            <View style={[st.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
        <View style={st.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseBody key={ex.id} ex={ex} />
      </ScrollView>

      <View style={st.footer}>
        {idx > 0 ? (
          <Pressable
            style={({ pressed }) => [st.prevBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setIdx((i) => i - 1)}
          >
            <Ionicons name="chevron-back" size={20} color={C.text} />
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [st.nextBtn, pressed && { opacity: 0.85 }]}
          onPress={() => (last ? setFinished(true) : setIdx((i) => i + 1))}
        >
          <T c="brand" size={16} weight="700">
            {last ? "Concluir treino" : "Próximo exercício"}
          </T>
          <Ionicons
            name={last ? "checkmark" : "chevron-forward"}
            size={20}
            color={C.brand}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ExerciseBody({ ex }: { ex: Exercicio }) {
  const detalhe = ex.seriesDetalhe;
  const restFor = (i: number) => detalhe?.[i]?.descansoSeg ?? ex.descansoSeg;

  const [carga, setCarga] = useState(ex.ultimaCarga ?? "");
  const [setsDone, setSetsDone] = useState(0);
  const [baseRest, setBaseRest] = useState(restFor(0));
  const [left, setLeft] = useState(restFor(0));
  const [running, setRunning] = useState(false);

  const runRef = useRef(false);
  runRef.current = running && left > 0;
  useEffect(() => {
    const t = setInterval(() => {
      setLeft((s) => (runRef.current ? (s <= 1 ? 0 : s - 1) : s));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const todasFeitas = setsDone >= ex.series;
  const done = left === 0;

  const concluirSerie = () => {
    const r = restFor(Math.min(ex.series - 1, setsDone));
    setSetsDone((n) => Math.min(ex.series, n + 1));
    setBaseRest(r);
    setLeft(r);
    setRunning(true);
  };

  return (
    <View style={{ gap: S.md }}>
      {/* Exercício */}
      <Card>
        <T c="textTer" size={11} weight="700" style={{ letterSpacing: 0.6 }}>
          {ex.grupo.toUpperCase()}
        </T>
        <T size={24} weight="800" style={{ letterSpacing: -0.5, marginTop: 4 }}>
          {ex.nome}
        </T>

        {detalhe ? null : (
          <View style={st.specRow}>
            <Spec label="Séries" value={String(ex.series)} />
            <Spec label="Reps" value={ex.reps} />
            <Spec label="Descanso" value={`${ex.descansoSeg}s`} />
          </View>
        )}

        {ex.video ? (
          <Pressable style={st.videoLink}>
            <Ionicons name="play-circle" size={20} color={C.accentDeep} />
            <T c="accentDeep" size={13} weight="600">
              Ver vídeo de execução
            </T>
          </Pressable>
        ) : null}

        {/* Plano de séries — detalhado (aquecimento/válidas) ou dots simples */}
        <View style={st.setsBlock}>
          <T c="textTer" size={11} weight="700" style={{ letterSpacing: 0.5 }}>
            {detalhe ? "PLANO DE SÉRIES" : "SÉRIES FEITAS"} · {setsDone}/{ex.series}
          </T>

          {detalhe ? (
            <View style={{ gap: 6, marginTop: 2 }}>
              {detalhe.map((sp, i) => {
                const feita = i < setsDone;
                const atual = i === setsDone && !todasFeitas;
                return (
                  <View
                    key={i}
                    style={[st.planRow, atual && st.planRowAtual]}
                  >
                    <View
                      style={[
                        st.planNum,
                        (feita || atual) && st.planNumOn,
                      ]}
                    >
                      {feita ? (
                        <Ionicons name="checkmark" size={14} color={C.brand} />
                      ) : (
                        <T
                          size={12}
                          weight="700"
                          c={atual ? "brand" : "textTer"}
                          style={{ fontFamily: dataFont("700") }}
                        >
                          {i + 1}
                        </T>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T size={13} weight="700">
                        {sp.rotulo} · {sp.reps} reps
                      </T>
                      {sp.obs ? (
                        <T
                          c="textSec"
                          size={12}
                          style={{ marginTop: 1, lineHeight: 16 }}
                        >
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
                );
              })}
            </View>
          ) : (
            <View style={st.setDots}>
              {Array.from({ length: ex.series }).map((_, i) => {
                const on = i < setsDone;
                return (
                  <Pressable
                    key={i}
                    hitSlop={4}
                    onPress={() => setSetsDone(on ? i : i + 1)}
                    style={[st.setDot, on && st.setDotOn]}
                  >
                    <T
                      size={13}
                      weight="700"
                      c={on ? "brand" : "textTer"}
                      style={{ fontFamily: dataFont("700") }}
                    >
                      {i + 1}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Carga */}
        <View style={st.cargaRow}>
          <T c="textTer" size={11} weight="700" style={{ letterSpacing: 0.5 }}>
            CARGA QUE VOCÊ USOU
          </T>
          <View style={st.cargaWrap}>
            <TextInput
              value={carga}
              onChangeText={setCarga}
              placeholder="ex.: 40 kg"
              placeholderTextColor={C.textTer}
              style={st.cargaInput}
            />
          </View>
        </View>
      </Card>

      {/* Orientação do coach */}
      {ex.observacoes ? (
        <View style={st.coachNote}>
          <Ionicons name="chatbubble-ellipses" size={16} color={C.accentDeep} />
          <View style={{ flex: 1 }}>
            <T size={11} weight="700" c="accentDeep" style={{ letterSpacing: 0.3 }}>
              ORIENTAÇÃO DO COACH
            </T>
            <T c="textSec" size={14} style={{ marginTop: 4, lineHeight: 20 }}>
              {ex.observacoes}
            </T>
          </View>
        </View>
      ) : null}

      {/* Cronômetro de descanso */}
      <View style={st.timer}>
        <View style={st.timerTop}>
          <View style={st.timerEyebrow}>
            <Ionicons name="time-outline" size={14} color={C.accent} />
            <T size={12} weight="700" style={{ color: C.accent, letterSpacing: 0.4 }}>
              {done ? "DESCANSO CONCLUÍDO" : "CRONÔMETRO DE DESCANSO"}
            </T>
          </View>
        </View>

        <T style={st.timerValue}>{fmt(left)}</T>

        <View style={st.timerBarTrack}>
          <View
            style={[
              st.timerBarFill,
              { width: `${Math.min(100, (left / Math.max(1, baseRest)) * 100)}%` },
            ]}
          />
        </View>

        <View style={st.timerControls}>
          <TimerBtn
            icon="refresh"
            label="Reiniciar"
            onPress={() => {
              setLeft(baseRest);
              setRunning(false);
            }}
          />
          <Pressable
            style={({ pressed }) => [st.timerMain, pressed && { opacity: 0.85 }]}
            onPress={() => {
              if (done) {
                setLeft(baseRest);
                setRunning(true);
              } else {
                setRunning((r) => !r);
              }
            }}
          >
            <Ionicons
              name={done ? "refresh" : running ? "pause" : "play"}
              size={22}
              color={C.brand}
            />
            <T c="brand" size={15} weight="700">
              {done ? "De novo" : running ? "Pausar" : "Iniciar"}
            </T>
          </Pressable>
          <TimerBtn icon="add" label="+15s" onPress={() => setLeft((s) => s + 15)} />
        </View>

        <Pressable
          style={({ pressed }) => [st.serieBtn, pressed && { opacity: 0.85 }]}
          onPress={concluirSerie}
        >
          <Ionicons
            name={todasFeitas ? "checkmark-done" : "checkmark"}
            size={18}
            color={C.accent}
          />
          <T size={14} weight="700" style={{ color: C.accent }}>
            {todasFeitas ? "Todas as séries feitas" : "Concluí a série — descansar"}
          </T>
        </Pressable>
      </View>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.spec}>
      <T c="textTer" size={11} weight="600">
        {label}
      </T>
      <T size={16} weight="700" style={{ fontFamily: dataFont("700") }}>
        {value}
      </T>
    </View>
  );
}

function TimerBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [st.timerSide, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={20} color={C.textOnDark} />
      <T size={11} weight="600" style={{ color: C.textOnDarkMuted }}>
        {label}
      </T>
    </Pressable>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: S.lg,
    padding: S.xxl,
  },
  linkBtn: { paddingHorizontal: S.lg, paddingVertical: S.sm },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: S.sm,
  },
  successBtn: {
    marginTop: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    paddingHorizontal: S.xl,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  progressTrack: {
    height: 6,
    backgroundColor: C.surfaceMuted,
    borderRadius: R.pill,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: C.accent, borderRadius: R.pill },
  content: { padding: S.lg, paddingBottom: S.xxxl * 3, gap: S.md },
  specRow: { flexDirection: "row", gap: S.sm, marginTop: S.md },
  spec: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    gap: 2,
  },
  videoLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: S.md,
  },
  setsBlock: {
    marginTop: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: S.sm,
  },
  setDots: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  setDot: {
    width: 38,
    height: 38,
    borderRadius: R.sm,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  setDotOn: { backgroundColor: C.accentSoft },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: R.sm,
    backgroundColor: C.surfaceAlt,
  },
  planRowAtual: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(124,211,187,0.5)",
  },
  planNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  planNumOn: { backgroundColor: C.accent },
  planRest: { flexDirection: "row", alignItems: "center", gap: 3 },
  cargaRow: {
    marginTop: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cargaWrap: {
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: R.sm,
    paddingHorizontal: S.md,
    minWidth: 120,
  },
  cargaInput: {
    height: 40,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: dataFont("700"),
    color: C.text,
  },
  coachNote: {
    flexDirection: "row",
    gap: S.sm,
    backgroundColor: C.accentSoft,
    borderRadius: R.lg,
    padding: S.lg,
  },
  timer: {
    backgroundColor: C.surfaceDark,
    borderRadius: R.xl,
    padding: S.xl,
    alignItems: "center",
    gap: S.md,
  },
  timerTop: { alignItems: "center" },
  timerEyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timerValue: {
    fontFamily: dataFont("700"),
    fontWeight: "700",
    fontSize: 64,
    letterSpacing: -1,
    color: C.textOnDarkStrong,
    lineHeight: 70,
  },
  timerBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(224,236,234,0.16)",
    borderRadius: R.pill,
    overflow: "hidden",
  },
  timerBarFill: { height: 6, backgroundColor: C.accent, borderRadius: R.pill },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.lg,
    marginTop: S.sm,
  },
  timerSide: { alignItems: "center", gap: 3, width: 56 },
  timerMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    paddingHorizontal: S.xl,
    height: 48,
  },
  serieBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(124,211,187,0.4)",
    borderRadius: R.pill,
    height: 44,
    width: "100%",
    marginTop: S.xs,
  },
  footer: {
    flexDirection: "row",
    gap: S.sm,
    padding: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  prevBtn: {
    width: 54,
    height: 54,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 54,
  },
});
