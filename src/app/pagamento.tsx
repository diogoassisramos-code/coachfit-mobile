import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge, Card, T } from "@/components/ui";
import { C, dataFont, R, S, titleFont } from "@/constants/coachfit";
import { aluno, type MetodoPagamento, pagamento } from "@/data/aluno";

const PGTO = {
  em_dia: { label: "Em dia", tone: "success" as const },
  pendente: { label: "Pendente", tone: "warning" as const },
  atrasado: { label: "Atrasado", tone: "danger" as const },
};

export default function PagamentoScreen() {
  const router = useRouter();
  const pgto = PGTO[aluno.statusPagamento];

  // Estado efêmero (protótipo, sem backend): método selecionado vs. salvo.
  const [salvo, setSalvo] = useState<MetodoPagamento>(pagamento.metodo);
  const [metodo, setMetodo] = useState<MetodoPagamento>(pagamento.metodo);
  const [confirmado, setConfirmado] = useState(false);
  const mudou = metodo !== salvo;

  function selecionar(m: MetodoPagamento) {
    setMetodo(m);
    setConfirmado(false);
  }

  function salvar() {
    setSalvo(metodo);
    setConfirmado(true);
  }

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={st.back}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T c="textTer" size={11} weight="600" style={st.eyebrow}>
            PLANO & COBRANÇA
          </T>
          <T size={22} weight="800" style={{ fontFamily: titleFont() }}>
            Pagamento
          </T>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Plano */}
        <Card>
          <View style={st.planTop}>
            <View style={{ flex: 1 }}>
              <T c="textTer" size={11} weight="600" style={st.label}>
                SEU PLANO
              </T>
              <T size={18} weight="700">
                {aluno.plano}
              </T>
              <T c="textSec" size={13} style={{ marginTop: 2 }}>
                {aluno.consultoria} · {aluno.consultor}
              </T>
            </View>
            <Badge tone={pgto.tone}>{pgto.label}</Badge>
          </View>

          <View style={st.valorRow}>
            <T size={28} weight="800" style={{ fontFamily: dataFont("700"), letterSpacing: -0.5 }}>
              {pagamento.valor}
            </T>
            <T c="textTer" size={15}>
              {" "}
              /{pagamento.recorrencia.toLowerCase()}
            </T>
          </View>

          <View style={st.vencRow}>
            <Ionicons name="calendar-outline" size={16} color={C.textTer} />
            <T c="textSec" size={13}>
              Próxima cobrança em {aluno.proximoVencimento}
            </T>
          </View>
        </Card>

        {/* Forma de pagamento */}
        <View style={{ gap: S.md }}>
          <View>
            <T size={17} weight="700">
              Forma de pagamento
            </T>
            <T c="textSec" size={13} style={{ marginTop: 2 }}>
              Escolha como quer pagar sua mensalidade.
            </T>
          </View>

          {/* Seletor Cartão / Pix */}
          <View style={st.seg}>
            <SegBtn
              icon="card"
              label="Cartão de crédito"
              active={metodo === "cartao"}
              onPress={() => selecionar("cartao")}
            />
            <SegBtn
              icon="qr-code"
              label="Pix"
              active={metodo === "pix"}
              onPress={() => selecionar("pix")}
            />
          </View>

          {metodo === "cartao" ? <CartaoView /> : <PixView />}
        </View>
      </ScrollView>

      {/* Rodapé fixo */}
      <View style={st.footer}>
        {confirmado ? (
          <View style={st.toast}>
            <Ionicons name="checkmark-circle" size={18} color={C.accentDeep} />
            <T c="accentDeep" size={13} weight="600">
              Forma de pagamento atualizada para{" "}
              {salvo === "cartao" ? "cartão de crédito" : "Pix"}.
            </T>
          </View>
        ) : null}
        <Pressable
          onPress={salvar}
          disabled={!mudou}
          style={({ pressed }) => [
            st.cta,
            !mudou && st.ctaOff,
            pressed && mudou && { opacity: 0.85 },
          ]}
        >
          <T c={mudou ? "brand" : "textTer"} size={16} weight="700">
            {mudou ? "Salvar forma de pagamento" : "Forma de pagamento salva"}
          </T>
          {mudou ? (
            <Ionicons name="arrow-forward" size={20} color={C.brand} />
          ) : null}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** Botão do seletor segmentado. */
function SegBtn({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.segBtn, active && st.segBtnOn]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? C.brand : C.textTer}
      />
      <T
        size={13}
        weight="700"
        c={active ? "brand" : "textSec"}
        numberOfLines={1}
      >
        {label}
      </T>
    </Pressable>
  );
}

/** Cartão cadastrado + ação de troca (stub). */
function CartaoView() {
  const { bandeira, final, validade, nome } = pagamento.cartao;
  return (
    <View style={{ gap: S.md }}>
      <View style={st.creditCard}>
        <View style={st.ccDiamond} />
        <View style={st.ccTop}>
          <T c="textOnDarkMuted" size={11} weight="700" style={{ letterSpacing: 1 }}>
            CARTÃO DE CRÉDITO
          </T>
          <T c="textOnDarkStrong" size={15} weight="800" style={{ letterSpacing: 0.5 }}>
            {bandeira}
          </T>
        </View>
        <T
          c="textOnDarkStrong"
          size={20}
          weight="700"
          style={{ fontFamily: dataFont("700"), letterSpacing: 2, marginTop: S.lg }}
        >
          ••••  ••••  ••••  {final}
        </T>
        <View style={st.ccBottom}>
          <View>
            <T c="textOnDarkMuted" size={10} weight="600" style={{ letterSpacing: 0.5 }}>
              TITULAR
            </T>
            <T c="textOnDark" size={13} weight="600">
              {nome}
            </T>
          </View>
          <View>
            <T c="textOnDarkMuted" size={10} weight="600" style={{ letterSpacing: 0.5 }}>
              VALIDADE
            </T>
            <T c="textOnDark" size={13} weight="600" style={{ fontFamily: dataFont("600") }}>
              {validade}
            </T>
          </View>
        </View>
      </View>

      <Pressable style={({ pressed }) => [st.linkRow, pressed && { opacity: 0.6 }]}>
        <Ionicons name="swap-horizontal" size={18} color={C.textSec} />
        <T size={14} weight="600" style={{ flex: 1 }}>
          Trocar cartão
        </T>
        <Ionicons name="chevron-forward" size={18} color={C.textTer} />
      </Pressable>

      <View style={st.note}>
        <Ionicons name="shield-checkmark-outline" size={16} color={C.textTer} />
        <T c="textTer" size={12} style={{ flex: 1, lineHeight: 17 }}>
          Cobrança automática a cada vencimento. Seus dados ficam protegidos e você
          pode cancelar quando quiser.
        </T>
      </View>
    </View>
  );
}

/** Explicação do Pix recorrente. */
function PixView() {
  return (
    <View style={{ gap: S.md }}>
      <Card>
        <View style={st.pixHead}>
          <View style={st.pixIcon}>
            <Ionicons name="qr-code" size={22} color={C.accentDeep} />
          </View>
          <View style={{ flex: 1 }}>
            <T size={15} weight="700">
              Pagar com Pix
            </T>
            <T c="textSec" size={13} style={{ marginTop: 2, lineHeight: 18 }}>
              A cada vencimento geramos um Pix copia e cola e o QR Code aqui no app e
              no seu e-mail.
            </T>
          </View>
        </View>

        <View style={st.pixBenefits}>
          <PixBenefit icon="flash-outline" text="Aprovação na hora" />
          <PixBenefit icon="pricetag-outline" text="Sem taxa de cartão" />
          <PixBenefit icon="notifications-outline" text="Avisamos antes de vencer" />
        </View>
      </Card>

      <View style={st.note}>
        <Ionicons name="information-circle-outline" size={16} color={C.textTer} />
        <T c="textTer" size={12} style={{ flex: 1, lineHeight: 17 }}>
          O Pix não é cobrado automaticamente — você precisa pagar cada cobrança até
          o vencimento pra manter o plano ativo.
        </T>
      </View>
    </View>
  );
}

function PixBenefit({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={st.pixBenefit}>
      <Ionicons name={icon} size={16} color={C.accentDeep} />
      <T size={13} weight="500" style={{ flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingTop: S.xs,
    paddingBottom: S.md,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { letterSpacing: 0.6, marginBottom: 2 },
  content: { padding: S.lg, paddingTop: S.sm, paddingBottom: S.xxxl, gap: S.lg },

  label: { letterSpacing: 0.5, marginBottom: S.sm },
  planTop: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
  valorRow: { flexDirection: "row", alignItems: "baseline", marginTop: S.md },
  vencRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: S.sm,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  seg: {
    flexDirection: "row",
    gap: S.sm,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.md,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: S.md,
    borderRadius: R.sm,
  },
  segBtnOn: {
    backgroundColor: C.surface,
    ...{
      shadowColor: "#022128",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
  },

  creditCard: {
    backgroundColor: C.surfaceDark,
    borderRadius: R.xl,
    padding: S.xl,
    overflow: "hidden",
  },
  ccDiamond: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 150,
    height: 150,
    borderRadius: 44,
    backgroundColor: C.accent,
    opacity: 0.12,
    transform: [{ rotate: "45deg" }],
  },
  ccTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ccBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: S.lg,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
  },
  note: { flexDirection: "row", alignItems: "flex-start", gap: S.sm },

  pixHead: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
  pixIcon: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pixBenefits: {
    gap: S.sm,
    marginTop: S.lg,
    paddingTop: S.lg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  pixBenefit: { flexDirection: "row", alignItems: "center", gap: S.sm },

  footer: {
    padding: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    gap: S.md,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 54,
  },
  ctaOff: { backgroundColor: C.surfaceAlt },
});
