import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar, Badge, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { aluno, checkins, metaKcal, totalKcal, treinos } from "@/data/aluno";

export default function HojeScreen() {
  const router = useRouter();
  const treinoHoje = treinos[0];
  const kcal = totalKcal();
  const checkinAberto = checkins.find((c) => c.status === "aguardando");

  return (
    <Screen>
      <ScreenHeader
        eyebrow={aluno.consultoria}
        title="Olá, Ana 👋"
        subtitle="Vamos pro treino de hoje?"
        right={<Avatar name={aluno.nome} size={48} />}
      />

      {/* Check-in da semana */}
      {checkinAberto ? (
        <Card style={{ borderColor: C.brand, borderWidth: 1.5 }}>
          <View style={s.cardTop}>
            <Badge tone="brand" icon="calendar-outline">
              Check-in da semana {checkinAberto.semana}
            </Badge>
          </View>
          <T size={15} weight="600" style={{ marginTop: S.sm }}>
            Hora do seu check-in semanal
          </T>
          <T c="textSec" style={{ marginTop: 2 }}>
            Registre peso, fotos e como foi a semana pro {aluno.consultor} ajustar
            seu plano.
          </T>
          <Pressable style={s.cta} onPress={() => router.push("/checkin")}>
            <Ionicons name="camera-outline" size={18} color={C.white} />
            <Text style={s.ctaText}>Fazer check-in</Text>
          </Pressable>
        </Card>
      ) : null}

      {/* Métricas rápidas */}
      <View style={s.metrics}>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="600" style={s.metricLabel}>
            PESO ATUAL
          </T>
          <T size={22} weight="700">
            {aluno.pesoAtual} kg
          </T>
          <T c="success" size={12} weight="600">
            {(aluno.pesoAtual - aluno.pesoInicial).toFixed(1)} kg
          </T>
        </Card>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="600" style={s.metricLabel}>
            ADERÊNCIA
          </T>
          <T size={22} weight="700">
            {aluno.aderencia}%
          </T>
          <T c="textSec" size={12}>
            no treino
          </T>
        </Card>
      </View>

      {/* Treino de hoje */}
      <NavCard
        icon="barbell"
        tone="brand"
        title={treinoHoje.nome}
        meta={`${treinoHoje.exercicios.length} exercícios`}
        label="TREINO DE HOJE"
        onPress={() => router.push("/treino")}
      />

      {/* Dieta */}
      <NavCard
        icon="restaurant"
        tone="success"
        title={`${kcal.toLocaleString("pt-BR")} / ${metaKcal.toLocaleString("pt-BR")} kcal`}
        meta="3 refeições planejadas"
        label="SUA DIETA"
        onPress={() => router.push("/dieta")}
      />

      {/* Protocolo */}
      <NavCard
        icon="medkit"
        tone="warning"
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
  tone: "brand" | "success" | "warning";
  title: string;
  meta: string;
  label: string;
  onPress: () => void;
}) {
  const colors = {
    brand: { bg: C.brandSoft, fg: C.brand },
    success: { bg: C.successSoft, fg: C.success },
    warning: { bg: C.warningSoft, fg: C.warning },
  }[tone];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <Card>
        <View style={s.navRow}>
          <View style={[s.navIcon, { backgroundColor: colors.bg }]}>
            <Ionicons name={icon} size={22} color={colors.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <T c="textTer" size={10} weight="600" style={s.metricLabel}>
              {label}
            </T>
            <T size={15} weight="600">
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

const s = StyleSheet.create({
  cardTop: { flexDirection: "row" },
  cta: {
    marginTop: S.lg,
    backgroundColor: C.brand,
    borderRadius: R.md,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
  },
  ctaText: { color: C.white, fontWeight: "700", fontSize: 15 },
  metrics: { flexDirection: "row", gap: S.md },
  metric: { flex: 1, gap: 2 },
  metricLabel: { letterSpacing: 0.5, marginBottom: 2 },
  navRow: { flexDirection: "row", alignItems: "center", gap: S.md },
  navIcon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
