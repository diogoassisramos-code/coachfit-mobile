import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, dataFont, R, S } from "@/constants/coachfit";
import { type Refeicao, metaKcal } from "@/data/aluno";
import { useDieta } from "@/lib/db";

const refKcal = (r: Refeicao) =>
  r.alimentos.reduce((s, a) => s + a.macros.kcal, 0);

export default function DietaScreen() {
  const { refeicoes } = useDieta();
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const consumido = refeicoes.reduce(
    (s, r) => s + (marcadas[r.id] ? refKcal(r) : 0),
    0
  );
  const feitas = refeicoes.filter((r) => marcadas[r.id]).length;

  return (
    <Screen>
      <ScreenHeader eyebrow="Plano alimentar" title="Dieta" />

      <Card>
        <View style={s.metaRow}>
          <Ionicons name="flame" size={20} color={C.accentDeep} />
          <T size={24} weight="700" style={{ fontFamily: dataFont("700") }}>
            {consumido.toLocaleString("pt-BR")}
          </T>
          <T c="textTer" size={14}>
            / {metaKcal.toLocaleString("pt-BR")} kcal consumidas
          </T>
        </View>
        <View style={s.barTrack}>
          <View
            style={[
              s.barFill,
              { width: `${Math.min(100, (consumido / metaKcal) * 100)}%` },
            ]}
          />
        </View>
        <T c="textTer" size={12} style={{ marginTop: S.sm }}>
          {feitas} de {refeicoes.length} refeições · marque ao comer pra somar as
          calorias do dia
        </T>
      </Card>

      {refeicoes.map((r) => (
        <RefeicaoCard
          key={r.id}
          r={r}
          done={!!marcadas[r.id]}
          onToggle={() => setMarcadas((m) => ({ ...m, [r.id]: !m[r.id] }))}
        />
      ))}
    </Screen>
  );
}

function RefeicaoCard({
  r,
  done,
  onToggle,
}: {
  r: Refeicao;
  done: boolean;
  onToggle: () => void;
}) {
  const kcal = refKcal(r);
  return (
    <Card>
      <View style={s.refHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
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
        <View style={[s.kcalPill, done && s.kcalPillDone]}>
          <T
            c={done ? "accentDeep" : "textSec"}
            size={13}
            weight="700"
            style={{ fontFamily: dataFont("700") }}
          >
            {kcal} kcal
          </T>
        </View>
        <Pressable onPress={onToggle} hitSlop={8}>
          <Ionicons
            name={done ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={done ? C.accentDeep : C.textTer}
          />
        </Pressable>
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
  barFill: { height: 8, backgroundColor: C.accent, borderRadius: R.pill },
  refHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
  },
  kcalPillDone: { backgroundColor: C.accentSoft },
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
