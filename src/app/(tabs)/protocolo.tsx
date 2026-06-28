import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { type ProtocoloItem } from "@/data/aluno";
import { useProtocolo } from "@/lib/db";

export default function ProtocoloScreen() {
  const { protocolo } = useProtocolo();
  const [tomados, setTomados] = useState<Record<string, boolean>>({});
  const total = protocolo.reduce((n, b) => n + b.itens.length, 0);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Extras"
        title="Protocolo"
        subtitle={`${total} itens · toque pra ver como usar`}
      />

      {protocolo.map((bloco) => (
        <View key={bloco.id} style={{ gap: S.md }}>
          <T size={13} weight="700" c="textTer" style={s.blocoTitle}>
            {bloco.nome.toUpperCase()}
          </T>
          {bloco.itens.map((it) => (
            <ItemCard
              key={it.id}
              it={it}
              done={!!tomados[it.id]}
              onToggle={() =>
                setTomados((t) => ({ ...t, [it.id]: !t[it.id] }))
              }
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}

function ItemCard({
  it,
  done,
  onToggle,
}: {
  it: ProtocoloItem;
  done: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const temDetalhe =
    !!(it.comoUsar || it.comOQue || it.beneficio || it.duracao || it.observacoes);

  return (
    <Card style={{ padding: 0, overflow: "hidden", opacity: done ? 0.6 : 1 }}>
      <Pressable
        onPress={() => temDetalhe && setOpen((o) => !o)}
        style={({ pressed }) => [
          s.itemHead,
          pressed && temDetalhe && { opacity: 0.7 },
        ]}
      >
        <View style={s.dose}>
          <Ionicons name="medkit" size={18} color={C.lilac} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T size={15} weight="700">
            {it.nome}
          </T>
          <T c="textSec" size={13}>
            {it.dose} · {it.horario}
          </T>
        </View>
        <Pressable hitSlop={8} onPress={onToggle}>
          <Ionicons
            name={done ? "checkmark-circle" : "ellipse-outline"}
            size={26}
            color={done ? C.success : C.textTer}
          />
        </Pressable>
        {temDetalhe ? (
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color={C.textTer}
          />
        ) : null}
      </Pressable>

      {open && temDetalhe ? (
        <View style={s.detail}>
          {it.comoUsar ? (
            <View style={s.howNote}>
              <Ionicons name="bulb" size={16} color={C.lilac} />
              <View style={{ flex: 1 }}>
                <T size={11} weight="700" style={s.howLabel}>
                  COMO USAR
                </T>
                <T c="textSec" size={14} style={{ marginTop: 4, lineHeight: 20 }}>
                  {it.comoUsar}
                </T>
              </View>
            </View>
          ) : null}

          {it.comOQue || it.duracao ? (
            <View style={s.factGrid}>
              {it.comOQue ? <Fact label="Com o quê" value={it.comOQue} /> : null}
              {it.duracao ? <Fact label="Duração" value={it.duracao} /> : null}
            </View>
          ) : null}

          {it.beneficio ? (
            <View>
              <T c="textTer" size={11} weight="700" style={{ letterSpacing: 0.3 }}>
                PARA QUE SERVE
              </T>
              <T c="textSec" size={13} style={{ marginTop: 2, lineHeight: 18 }}>
                {it.beneficio}
              </T>
            </View>
          ) : null}

          {it.observacoes ? (
            <View style={s.warn}>
              <Ionicons name="alert-circle" size={15} color={C.warning} />
              <T c="textSec" size={13} style={{ flex: 1, lineHeight: 18 }}>
                {it.observacoes}
              </T>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.fact}>
      <T c="textTer" size={11} weight="600" style={{ letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </T>
      <T size={13} weight="700" style={{ marginTop: 2 }}>
        {value}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  blocoTitle: { letterSpacing: 0.5, marginTop: S.sm },
  itemHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    padding: S.lg,
  },
  dose: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.lilacSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detail: {
    paddingHorizontal: S.lg,
    paddingBottom: S.lg,
    gap: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: S.md,
  },
  howNote: {
    flexDirection: "row",
    gap: S.sm,
    backgroundColor: C.lilacSoft,
    borderRadius: R.md,
    padding: S.md,
  },
  howLabel: { color: C.lilac, letterSpacing: 0.3 },
  factGrid: { flexDirection: "row", gap: S.sm },
  fact: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    gap: 2,
  },
  warn: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: C.warningSoft,
    borderRadius: R.sm,
    padding: S.md,
  },
});
