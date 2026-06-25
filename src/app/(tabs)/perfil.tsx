import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Avatar, Badge, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { aluno, checkins } from "@/data/aluno";
import { useAuth } from "@/lib/auth";

const PGTO = {
  em_dia: { label: "Em dia", tone: "success" as const },
  pendente: { label: "Pendente", tone: "warning" as const },
  atrasado: { label: "Atrasado", tone: "danger" as const },
};

export default function PerfilScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const pgto = PGTO[aluno.statusPagamento];

  return (
    <Screen>
      <ScreenHeader eyebrow="Você" title="Perfil" />

      <Card>
        <View style={s.profileRow}>
          <Avatar name={aluno.nome} size={56} />
          <View style={{ flex: 1 }}>
            <T size={18} weight="700">
              {aluno.nome}
            </T>
            <T c="textSec" size={14}>
              {aluno.objetivo}
            </T>
          </View>
        </View>
      </Card>

      {/* Plano */}
      <Card>
        <T c="textTer" size={11} weight="600" style={s.label}>
          SEU PLANO
        </T>
        <Info icon="card-outline" label="Plano" value={aluno.plano} />
        <Info icon="business-outline" label="Consultoria" value={aluno.consultoria} />
        <Info icon="person-outline" label="Consultor" value={aluno.consultor} />
        <Info
          icon="calendar-outline"
          label="Próx. vencimento"
          value={aluno.proximoVencimento}
        />
        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <View style={s.infoLeft}>
            <Ionicons name="checkmark-circle-outline" size={18} color={C.textTer} />
            <T c="textSec" size={14}>
              Pagamento
            </T>
          </View>
          <Badge tone={pgto.tone}>{pgto.label}</Badge>
        </View>

        <Pressable
          onPress={() => router.push("/pagamento")}
          style={({ pressed }) => [s.manageBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="card-outline" size={18} color={C.accentDeep} />
          <T c="accentDeep" size={14} weight="700" style={{ flex: 1 }}>
            Gerenciar plano e pagamento
          </T>
          <Ionicons name="chevron-forward" size={18} color={C.accentDeep} />
        </Pressable>
      </Card>

      {/* Histórico de check-ins */}
      <View style={{ gap: S.md }}>
        <T size={17} weight="700">
          Histórico de check-ins
        </T>
        <Card flat style={{ padding: 0 }}>
          {checkins.map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() =>
                c.status === "aguardando"
                  ? router.push("/checkin")
                  : router.push({
                      pathname: "/checkins/[id]",
                      params: { id: c.id },
                    })
              }
              style={({ pressed }) => [
                s.checkRow,
                i > 0 && s.checkBorder,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <T size={14} weight="700">
                  Semana {c.semana}
                </T>
                <T c="textSec" size={13}>
                  {c.data} · {c.peso} kg
                </T>
                {c.respostaCoach ? (
                  <T c="textTer" size={12} style={{ marginTop: 2 }} numberOfLines={1}>
                    “{c.respostaCoach}”
                  </T>
                ) : null}
              </View>
              {c.status === "aguardando" ? (
                <Badge tone="brand">Responder</Badge>
              ) : (
                <Badge tone="success" icon="checkmark">
                  Respondido
                </Badge>
              )}
              <Ionicons name="chevron-forward" size={18} color={C.textTer} />
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Ações */}
      <Card flat style={{ padding: 0 }}>
        <Action icon="notifications-outline" label="Notificações" />
        <Action icon="lock-closed-outline" label="Conta e senha" />
        <Action icon="help-circle-outline" label="Ajuda e suporte" />
        <Action
          icon="log-out-outline"
          label="Sair"
          danger
          last
          onPress={() => signOut()}
        />
      </Card>
    </Screen>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoLeft}>
        <Ionicons name={icon} size={18} color={C.textTer} />
        <T c="textSec" size={14}>
          {label}
        </T>
      </View>
      <T size={14} weight="600">
        {value}
      </T>
    </View>
  );
}

function Action({
  icon,
  label,
  danger,
  last,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
  last?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.action, !last && s.checkBorder, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={20} color={danger ? C.danger : C.textSec} />
      <T size={15} weight="500" c={danger ? "danger" : "text"} style={{ flex: 1 }}>
        {label}
      </T>
      <Ionicons name="chevron-forward" size={18} color={C.textTer} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: S.md },
  label: { letterSpacing: 0.5, marginBottom: S.sm },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    marginTop: S.sm,
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: S.sm },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    padding: S.lg,
  },
  checkBorder: { borderTopWidth: 1, borderTopColor: C.border },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    padding: S.lg,
  },
});
