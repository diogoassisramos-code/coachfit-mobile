import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, dataFont, interFont, R, S, titleFont } from "@/constants/coachfit";
import { aluno } from "@/data/aluno";
import {
  useCheckinSolicitado,
  useDieta,
  useMe,
  useMyCheckins,
  useProtocolo,
  useTreinos,
} from "@/lib/db";
import { supabaseEnabled } from "@/lib/supabase";

export default function HojeScreen() {
  const router = useRouter();
  const { me, loading: carregandoMe, refetch: refetchMe } = useMe();
  // proto = sem Supabase (demo): pode usar o mock da Ana. Em modo real, nunca —
  // cada aluno vê só o que é dele (senão mostra estado vazio "—").
  const proto = !supabaseEnabled;
  const nomeExibicao = me?.nome ?? aluno.nome;
  const consultoriaNome = me?.consultoria ?? (proto ? aluno.consultoria : "Revo");
  const consultorNome =
    me?.consultor ?? (proto ? aluno.consultor : "seu treinador");
  const anamnesePendente = !!me?.anamnesePendente;
  const { treinos, refetch: refetchTreinos } = useTreinos();
  const { refeicoes, refetch: refetchDieta } = useDieta();
  const { protocolo, refetch: refetchProto } = useProtocolo();
  const { checkins, refetch: refetchCheckins } = useMyCheckins();
  const {
    solicitado,
    msg: solicitacaoMsg,
    refetch: refetchSolic,
  } = useCheckinSolicitado();
  // Re-lê check-ins e a solicitação ao voltar pra home (ex.: após enviar).
  useFocusEffect(
    useCallback(() => {
      refetchCheckins();
      refetchSolic();
      refetchMe();
      refetchTreinos();
      refetchDieta();
      refetchProto();
    }, [
      refetchCheckins,
      refetchSolic,
      refetchMe,
      refetchTreinos,
      refetchDieta,
      refetchProto,
    ])
  );

  const treinoHoje = treinos[0];
  const kcal = refeicoes.reduce(
    (s, r) => s + r.alimentos.reduce((x, a) => x + a.macros.kcal, 0),
    0
  );
  const protocoloItens = protocolo.reduce((n, b) => n + b.itens.length, 0);

  // Estado do check-in a partir do último envio do aluno (banco).
  const ultimo = checkins.length ? checkins[checkins.length - 1] : undefined;
  const semanaAtual = ultimo ? ultimo.semana + 1 : 1;
  const aguardando = ultimo?.status === "pendente" ? ultimo : undefined;

  // Peso e aderência: do último check-in; senão do cadastro do aluno; senão "—".
  const pesoBase = me?.pesoAtual ?? (proto ? aluno.pesoAtual : undefined);
  const pesoInicialBase =
    me?.pesoInicial ?? (proto ? aluno.pesoInicial : undefined);
  const pesoAtual = ultimo?.peso ?? pesoBase; // number | undefined
  const deltaPeso =
    pesoAtual != null && pesoInicialBase != null
      ? pesoAtual - pesoInicialBase
      : null;
  const aderencia =
    ultimo && ultimo.treinosTotais > 0
      ? Math.round((ultimo.treinosFeitos / ultimo.treinosTotais) * 100)
      : proto
        ? aluno.aderencia
        : null; // number | null

  // Loading inicial (modo real): enquanto não sabemos QUEM é o aluno, mostra um
  // spinner em vez de vazar o mock (evita o flash "Olá, Ana" antes de resolver).
  if (supabaseEnabled && carregandoMe && !me) {
    return (
      <Screen>
        <View style={s.loading}>
          <ActivityIndicator size="large" color={C.accentDeep} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow={consultoriaNome}
        title={`Olá, ${nomeExibicao.split(" ")[0]}`}
        subtitle="Vamos pro treino de hoje?"
        right={<Avatar name={nomeExibicao} size={48} />}
      />

      {/* Anamnese no 1º acesso — aparece no lugar do check-in até responder */}
      {anamnesePendente ? (
        <View style={hero.card}>
          <View style={hero.diamond} />
          <View style={hero.eyebrowPill}>
            <Ionicons name="clipboard-outline" size={13} color={C.accent} />
            <Text style={hero.eyebrowText}>Antes de começar</Text>
          </View>
          <Text style={hero.title}>Responda sua anamnese</Text>
          <Text style={hero.body}>
            {consultorNome} precisa te conhecer pra montar seu plano. Leva 2
            minutos — depois disso você libera o check-in.
          </Text>
          <Pressable
            style={({ pressed }) => [hero.cta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/anamnese")}
          >
            <Ionicons name="clipboard-outline" size={18} color={C.brand} />
            <Text style={hero.ctaText}>Responder anamnese</Text>
          </Pressable>
        </View>
      ) : (
      /* Check-in da semana — módulo petrol com losango mint */
      <View style={hero.card}>
        <View style={hero.diamond} />
        <View style={hero.eyebrowPill}>
          <Ionicons
            name={
              aguardando
                ? "checkmark-circle"
                : solicitado
                  ? "notifications"
                  : "calendar-outline"
            }
            size={13}
            color={C.accent}
          />
          <Text style={hero.eyebrowText}>
            {aguardando
              ? `Check-in da semana ${aguardando.semana}`
              : solicitado
                ? "Pedido do seu treinador"
                : `Check-in da semana ${semanaAtual}`}
          </Text>
        </View>
        {aguardando ? (
          <>
            <Text style={hero.title}>Check-in enviado!</Text>
            <Text style={hero.body}>
              Recebemos seu check-in. {consultorNome} vai analisar e responder
              em breve.
            </Text>
          </>
        ) : (
          <>
            <Text style={hero.title}>
              {solicitado
                ? `${consultorNome} pediu seu check-in!`
                : "Hora do seu check-in semanal"}
            </Text>
            <Text style={hero.body}>
              {solicitado && solicitacaoMsg
                ? solicitacaoMsg
                : `Registre peso, fotos e como foi a semana pro ${consultorNome} ajustar seu plano.`}
            </Text>
            <Pressable
              style={({ pressed }) => [hero.cta, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/checkin")}
            >
              <Ionicons name="camera-outline" size={18} color={C.brand} />
              <Text style={hero.ctaText}>Fazer check-in</Text>
            </Pressable>
          </>
        )}
      </View>
      )}

      {/* Resposta do consultor — aparece quando o último check-in foi respondido */}
      {ultimo?.status === "respondido" && ultimo.respostaCoach ? (
        <Card>
          <View style={s.coachRow}>
            <View style={s.coachIcon}>
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={C.accentDeep}
              />
            </View>
            <View style={{ flex: 1 }}>
              <T c="textTer" size={10} weight="700" style={s.metricLabel}>
                RESPOSTA DO CONSULTOR · SEMANA {ultimo.semana}
              </T>
              <T c="textSec" size={14} style={{ lineHeight: 20, marginTop: 2 }}>
                “{ultimo.respostaCoach}”
              </T>
            </View>
          </View>
        </Card>
      ) : null}

      {/* Métricas rápidas */}
      <View style={s.metrics}>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="700" style={s.metricLabel}>
            PESO ATUAL
          </T>
          <Text style={s.metricValue}>
            {pesoAtual != null ? `${pesoAtual} kg` : "—"}
          </Text>
          {deltaPeso != null ? (
            <Text style={[s.metricDelta, { color: C.accentDeep }]}>
              {deltaPeso >= 0 ? "+" : ""}
              {deltaPeso.toFixed(1)} kg
            </Text>
          ) : (
            <Text style={[s.metricDelta, { color: C.textTer }]}>
              sem histórico
            </Text>
          )}
        </Card>
        <Card style={s.metric}>
          <T c="textTer" size={11} weight="700" style={s.metricLabel}>
            ADERÊNCIA
          </T>
          <Text style={s.metricValue}>
            {aderencia != null ? `${aderencia}%` : "—"}
          </Text>
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
        title={`${kcal.toLocaleString("pt-BR")} kcal`}
        meta={`${refeicoes.length} refeições planejadas`}
        label="SUA DIETA"
        onPress={() => router.push("/dieta")}
      />

      {/* Protocolo */}
      <NavCard
        icon="medkit"
        tone="lilac"
        title="Protocolo & suplementos"
        meta={`${protocoloItens} itens`}
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
  loading: { alignItems: "center", justifyContent: "center", paddingVertical: 140 },
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
  coachRow: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
  coachIcon: {
    width: 40,
    height: 40,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
