import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { Refeicao, metaKcal, refeicoes, totalKcal } from "@/data/aluno";

export default function DietaScreen() {
  const kcal = totalKcal();
  return (
    <Screen>
      <ScreenHeader eyebrow="Plano alimentar" title="Dieta" />

      <Card>
        <View style={s.metaRow}>
          <Ionicons name="flame" size={20} color={C.warning} />
          <T size={22} weight="700">
            {kcal.toLocaleString("pt-BR")}
          </T>
          <T c="textTer" size={14}>
            / {metaKcal.toLocaleString("pt-BR")} kcal por dia
          </T>
        </View>
        <View style={s.barTrack}>
          <View
            style={[
              s.barFill,
              { width: `${Math.min(100, (kcal / metaKcal) * 100)}%` },
            ]}
          />
        </View>
      </Card>

      {refeicoes.map((r) => (
        <RefeicaoCard key={r.id} r={r} />
      ))}
    </Screen>
  );
}

function RefeicaoCard({ r }: { r: Refeicao }) {
  const kcal = r.alimentos.reduce((s, a) => s + a.macros.kcal, 0);
  return (
    <Card>
      <View style={s.refHead}>
        <View>
          <T size={16} weight="700">
            {r.nome}
          </T>
          <View style={s.horaRow}>
            <Ionicons name="time-outline" size={13} color={C.textTer} />
            <T c="textTer" size={12}>
              {r.horario}
            </T>
          </View>
        </View>
        <View style={s.kcalPill}>
          <T c="textSec" size={13} weight="700">
            {kcal} kcal
          </T>
        </View>
      </View>

      {r.observacoes ? (
        <View style={s.obs}>
          <Ionicons name="information-circle" size={16} color={C.brand} />
          <T c="textSec" size={13} style={{ flex: 1, lineHeight: 18 }}>
            {r.observacoes}
          </T>
        </View>
      ) : null}

      <View style={{ marginTop: S.md, gap: S.md }}>
        {r.alimentos.map((a, i) => (
          <View
            key={a.id}
            style={[s.alimento, i > 0 && s.alimentoBorder]}
          >
            <View style={s.alimentoHead}>
              <T size={14} weight="600" style={{ flex: 1 }}>
                {a.nome}
              </T>
              <T c="textSec" size={13} weight="600">
                {a.quantidade}
              </T>
            </View>
            <T c="textTer" size={12} style={{ marginTop: 2 }}>
              {a.macros.kcal} kcal · P {a.macros.p} · C {a.macros.c} · G{" "}
              {a.macros.g}
            </T>
            {a.observacoes ? (
              <T c="textSec" size={12} style={{ marginTop: 4, fontStyle: "italic" }}>
                {a.observacoes}
              </T>
            ) : null}
            {a.substituicoes.length > 0 ? (
              <View style={s.subs}>
                <T c="textTer" size={11} weight="600" style={{ letterSpacing: 0.3 }}>
                  TROCAR POR:
                </T>
                {a.substituicoes.map((sub) => (
                  <View key={sub} style={s.subChip}>
                    <Ionicons name="swap-horizontal" size={11} color={C.textSec} />
                    <T c="textSec" size={12}>
                      {sub}
                    </T>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  metaRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  barTrack: {
    height: 8,
    backgroundColor: C.surfaceMuted,
    borderRadius: R.pill,
    marginTop: S.md,
    overflow: "hidden",
  },
  barFill: { height: 8, backgroundColor: C.warning, borderRadius: R.pill },
  refHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  horaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  kcalPill: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.pill,
  },
  obs: {
    flexDirection: "row",
    gap: 6,
    marginTop: S.md,
    backgroundColor: C.brandSoft,
    borderRadius: R.sm,
    padding: S.md,
  },
  alimento: { paddingTop: S.md },
  alimentoBorder: { borderTopWidth: 1, borderTopColor: C.border },
  alimentoHead: { flexDirection: "row", alignItems: "center", gap: S.sm },
  subs: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: S.sm,
  },
  subChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.pill,
    paddingHorizontal: S.sm,
    paddingVertical: 4,
  },
});
