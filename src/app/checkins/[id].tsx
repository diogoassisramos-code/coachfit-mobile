import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, dataFont, R, S } from "@/constants/coachfit";
import { aluno, checkins, getCheckin } from "@/data/aluno";

export default function CheckinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = getCheckin(id);

  if (!c) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={st.center}>
          <Ionicons name="document-outline" size={40} color={C.textTer} />
          <T size={17} weight="700">
            Check-in não encontrado
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

  const anterior = checkins.find((x) => x.semana === c.semana - 1);
  const delta = anterior ? c.peso - anterior.peso : null;

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <T size={15} weight="700">
          Semana {c.semana}
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
              {c.data}
            </T>
          </View>
          <View style={st.heroPesoRow}>
            <T
              size={36}
              weight="800"
              style={{
                color: C.textOnDarkStrong,
                fontFamily: dataFont("700"),
                letterSpacing: -1,
              }}
            >
              {c.peso}
            </T>
            <T size={16} style={{ color: C.textOnDarkMuted, marginBottom: 6 }}>
              kg
            </T>
            {delta !== null ? (
              <View style={st.deltaPill}>
                <Ionicons
                  name={delta <= 0 ? "arrow-down" : "arrow-up"}
                  size={12}
                  color={C.accent}
                />
                <T
                  size={12}
                  weight="700"
                  style={{ color: C.accent, fontFamily: dataFont("700") }}
                >
                  {Math.abs(delta).toFixed(1)} kg
                </T>
              </View>
            ) : null}
          </View>
          <T size={13} style={{ color: C.textOnDarkMuted, marginTop: 2 }}>
            Peso registrado na semana {c.semana}
          </T>
        </View>

        {/* Resposta do coach */}
        {c.respostaCoach ? (
          <View style={st.coachNote}>
            <Ionicons name="chatbubble-ellipses" size={16} color={C.accentDeep} />
            <View style={{ flex: 1 }}>
              <T size={11} weight="700" c="accentDeep" style={{ letterSpacing: 0.3 }}>
                RESPOSTA DE {aluno.consultor.toUpperCase()}
              </T>
              <T c="textSec" size={14} style={{ marginTop: 4, lineHeight: 20 }}>
                {c.respostaCoach}
              </T>
            </View>
          </View>
        ) : null}

        {/* Fotos de progresso */}
        {c.fotos && c.fotos.length > 0 ? (
          <View style={{ gap: S.sm }}>
            <T size={11} weight="700" c="textTer" style={st.sectionLabel}>
              FOTOS DE PROGRESSO
            </T>
            <View style={st.fotos}>
              {c.fotos.map((f) => (
                <View key={f.angulo} style={st.foto}>
                  <Ionicons name="image-outline" size={22} color={C.accent} />
                  <T c="textOnDarkMuted" size={12} style={{ marginTop: 4 }}>
                    {f.angulo}
                  </T>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Avaliações */}
        {c.energia || c.sono || c.dietaNota ? (
          <Card>
            <T size={11} weight="700" c="textTer" style={st.cardLabel}>
              COMO VOCÊ SE AVALIOU
            </T>
            <StarRow label="Energia" value={c.energia} />
            <StarRow label="Sono" value={c.sono} />
            <StarRow label="Dieta" value={c.dietaNota} last />
          </Card>
        ) : null}

        {/* Comentário do aluno */}
        {c.comentario ? (
          <Card>
            <T size={11} weight="700" c="textTer" style={st.cardLabel}>
              O QUE VOCÊ ESCREVEU
            </T>
            <T c="textSec" size={14} style={{ lineHeight: 21 }}>
              “{c.comentario}”
            </T>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StarRow({
  label,
  value,
  last,
}: {
  label: string;
  value?: number;
  last?: boolean;
}) {
  return (
    <View style={[st.ratingRow, !last && st.ratingBorder]}>
      <T size={15} weight="600">
        {label}
      </T>
      <View style={st.stars}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = !!value && n <= value;
          return (
            <Ionicons
              key={n}
              name={on ? "star" : "star-outline"}
              size={18}
              color={on ? C.accentDeep : C.borderStrong}
            />
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: S.md,
    padding: S.xxl,
  },
  linkBtn: { paddingHorizontal: S.lg, paddingVertical: S.sm },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  content: { padding: S.lg, paddingBottom: S.xxxl * 2, gap: S.md },
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
  heroPesoRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: S.md,
  },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(124,211,187,0.16)",
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: S.sm,
    alignSelf: "center",
  },
  coachNote: {
    flexDirection: "row",
    gap: S.sm,
    backgroundColor: C.accentSoft,
    borderRadius: R.lg,
    padding: S.lg,
  },
  sectionLabel: { letterSpacing: 0.8, marginTop: S.xs },
  cardLabel: { letterSpacing: 0.6, marginBottom: S.md },
  fotos: { flexDirection: "row", gap: S.md },
  foto: {
    flex: 1,
    aspectRatio: 0.78,
    backgroundColor: C.surfaceDarkAlt,
    borderRadius: R.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: S.md,
  },
  ratingBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  stars: { flexDirection: "row", gap: 4 },
});
