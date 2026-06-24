import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { protocolo } from "@/data/aluno";

export default function ProtocoloScreen() {
  const [tomados, setTomados] = useState<Record<string, boolean>>({});
  const total = protocolo.reduce((n, b) => n + b.itens.length, 0);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Extras"
        title="Protocolo"
        subtitle={`${total} itens · suplementos e vitaminas`}
      />

      {protocolo.map((bloco) => (
        <View key={bloco.id} style={{ gap: S.md }}>
          <T size={13} weight="700" c="textTer" style={s.blocoTitle}>
            {bloco.nome.toUpperCase()}
          </T>
          {bloco.itens.map((it) => {
            const done = !!tomados[it.id];
            return (
              <Card key={it.id} style={done ? { opacity: 0.6 } : undefined}>
                <View style={s.itemHead}>
                  <View style={s.dose}>
                    <Ionicons name="medkit" size={18} color={C.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T size={15} weight="700">
                      {it.nome}
                    </T>
                    <T c="textSec" size={13}>
                      {it.dose} · {it.horario}
                    </T>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      setTomados((t) => ({ ...t, [it.id]: !t[it.id] }))
                    }
                  >
                    <Ionicons
                      name={done ? "checkmark-circle" : "ellipse-outline"}
                      size={26}
                      color={done ? C.success : C.textTer}
                    />
                  </Pressable>
                </View>
                {it.observacoes ? (
                  <View style={s.obs}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color={C.textTer}
                    />
                    <T c="textSec" size={13} style={{ flex: 1, lineHeight: 18 }}>
                      {it.observacoes}
                    </T>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  blocoTitle: { letterSpacing: 0.5, marginTop: S.sm },
  itemHead: { flexDirection: "row", alignItems: "center", gap: S.md },
  dose: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  obs: {
    flexDirection: "row",
    gap: 6,
    marginTop: S.md,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.sm,
    padding: S.md,
  },
});
