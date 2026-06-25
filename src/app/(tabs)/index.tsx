import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, dataFont, interFont, R, S, titleFont } from "@/constants/coachfit";
import { aluno, checkins, metaKcal, totalKcal } from "@/data/aluno";
import { useTreinos } from "@/lib/db";

export default function HojeScreen() {
  const router = useRouter();
  const { treinos } = useTreinos();
  const treinoHoje = treinos[0];
  const kcal = totalKcal();
  const checkinAberto = checkins.find((c) => c.status === "aguardando");

  return (
    <Screen>
      <ScreenHeader
        eyebrow={aluno.consultoria}
        title="Olá, Ana"
        subtitle="Vamos pro treino de hoje?"
        right={<Avatar name={aluno.nome} size={48} />}
      />

      {/* Check-in da semana — módulo petrol com losango mint */}
      {checkinAberto ? (
        <View style={hero.card}>
          <View style={hero.diamond} />
          <View style={hero.eyebrowPill}>
            <Ionicons name="calendar-outline" size={13} color={C.accent} />
            <Text style={hero.eyebrowText}>
              Check-in da semana {checkinAberto.semana}
            </Text>
          </View>
          <Text style={hero.title}>Hora do seu check-in semanal</Text>
          <Text style={hero.body}>
            Registre peso, fotos e como foi a semana pro {aluno.consultor}{" "}
            ajustar seu plano.
          </Text>
          <Pressable
            style={({ pressed }) => [hero.cta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/checkin")}
          >
            <Ionicons name="camera-outline" size={18} color={C.brand} />
            <Text style={hero.ctaText}>Fazer check-in</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Métricas rápidas */}
      <View style={s.metrics}>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="700" style={s.metricLabel}>
            PESO ATUAL
          </T>
          <Text style={s.metricValue}>{aluno.pesoAtual} kg</Text>
          <Text style={[s.metricDelta, { color: C.accentDeep }]}>
            {(aluno.pesoAtual - aluno.pesoInicial).toFixed(1)} kg
          </Text>
        </Card>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="700" style={s.metricLabel}>
            ADERÊNCIA
          </T>
          <Text style={s.metricValue}>{aluno.aderencia}%</Text>
          <T c="textSec" size={12}>
            no treino
          </T>
        </Card>
      </View>

      {/* Treino de hoje */}
      <NavCard
        icon="barbell"
        tone="petrol"
        title={treinoHoje?.nome ?? "Sem treino hoje"}
        meta={treinoHoje ? `${treinoHoje.exercicios.length} exercícios` : "—"}
        label="TREINO DE HOJE"
        onPress={() => router.push("/treino")}
      />

      {/* Dieta */}
      <NavCard
        icon="restaurant"
        tone="mint"
        title={`${kcal.toLocaleString("pt-BR")} / ${metaKcal.toLocaleString("pt-BR")} kcal`}
        meta="3 refeições planejadas"
        label="SUA DIETA"
        onPress={() => router.push("/dieta")}
      />

      {/* Protocolo */}
      <NavCard
        icon="medkit"
        tone="lilac"
        title="Protocolo & suplementos"
        meta="5 itens hoje"
        label="EXTRAS"
        onPress={() => router.push("/protocolo")}
      />
    </Screen>
  );
}

function NavCard({
  icon,
  tone,
  title,
  meta,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: "petrol" | "mint" | "lilac";
  title: string;
  meta: string;
  label: string;
  onPress: () => void;
}) {
  const colors = {
    petrol: { bg: C.surfaceMuted, fg: C.petrol },
    mint: { bg: C.accentSoft, fg: C.accentDeep },
    lilac: { bg: C.lilacSoft, fg: C.lilac },
  }[tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <Card>
        <View style={s.navRow}>
          <View style={[s.navIcon, { backgroundColor: colors.bg }]}>
            <Ionicons name={icon} size={22} color={colors.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <T c="textTer" size={10} weight="700" style={s.metricLabel}>
              {label}
            </T>
            <T size={15} weight="700">
              {title}
            </T>
            <T c="textSec" size={13}>
              {meta}
            </T>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.textTer} />
        </View>
      </Card>
    </Pressable>
  );
}

const hero = StyleSheet.create({
  card: {
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
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(124,211,187,0.14)",
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eyebrowText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: interFont("700"),
    letterSpacing: 0.3,
  },
  title: {
    color: C.textOnDarkStrong,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: titleFont(),
    letterSpacing: -0.4,
    marginTop: S.md,
  },
  body: {
    color: C.textOnDarkMuted,
    fontSize: 14,
    fontFamily: interFont("400"),
    lineHeight: 20,
    marginTop: 4,
  },
  cta: {
    marginTop: S.lg,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
  },
  ctaText: {
    color: C.brand,
    fontWeight: "700",
    fontSize: 15,
    fontFamily: interFont("700"),
  },
});

const s = StyleSheet.create({
  metrics: { flexDirection: "row", gap: S.md },
  metric: { flex: 1, gap: 2 },
  metricLabel: { letterSpacing: 0.8, marginBottom: 2 },
  metricValue: {
    color: C.text,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: dataFont("700"),
    letterSpacing: -0.5,
  },
  metricDelta: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: dataFont("600"),
  },
  navRow: { flexDirection: "row", alignItems: "center", gap: S.md },
  navIcon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
