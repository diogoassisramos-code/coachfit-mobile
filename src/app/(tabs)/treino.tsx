import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Badge, Card, Screen, ScreenHeader, T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { Exercicio, treinos } from "@/data/aluno";

export default function TreinoScreen() {
  const [cargas, setCargas] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      treinos.flatMap((t) => t.exercicios).map((e) => [e.id, e.ultimaCarga ?? ""])
    )
  );
  const [feitos, setFeitos] = useState<Record<string, boolean>>({});

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Seu programa"
        title="Treino"
        subtitle={`Enviado por ${treinos.length} treinos · ajuste a carga que você usou`}
      />

      {treinos.map((t) => (
        <View key={t.id} style={{ gap: S.md }}>
          <View style={s.treinoHead}>
            <T size={17} weight="700">
              {t.nome}
            </T>
            <Badge tone={t.diaSemana === "Hoje" ? "brand" : "neutral"}>
              {t.diaSemana}
            </Badge>
          </View>

          {t.exercicios.map((e) => (
            <ExercicioCard
              key={e.id}
              ex={e}
              carga={cargas[e.id]}
              onCarga={(v) => setCargas((c) => ({ ...c, [e.id]: v }))}
              feito={!!feitos[e.id]}
              onToggle={() => setFeitos((f) => ({ ...f, [e.id]: !f[e.id] }))}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}

function ExercicioCard({
  ex,
  carga,
  onCarga,
  feito,
  onToggle,
}: {
  ex: Exercicio;
  carga: string;
  onCarga: (v: string) => void;
  feito: boolean;
  onToggle: () => void;
}) {
  return (
    <Card style={feito ? { opacity: 0.6 } : undefined}>
      <View style={s.exHead}>
        <View style={{ flex: 1 }}>
          <T size={15} weight="700">
            {ex.nome}
          </T>
          <T c="textTer" size={11} weight="600" style={s.grupo}>
            {ex.grupo.toUpperCase()}
          </T>
        </View>
        <Pressable onPress={onToggle} hitSlop={8}>
          <Ionicons
            name={feito ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={feito ? C.success : C.textTer}
          />
        </Pressable>
      </View>

      <View style={s.specRow}>
        <Spec label="Séries" value={String(ex.series)} />
        <Spec label="Reps" value={ex.reps} />
        <Spec label="Descanso" value={`${ex.descansoSeg}s`} />
      </View>

      {ex.video ? (
        <Pressable style={s.video}>
          <Ionicons name="play-circle" size={20} color={C.brand} />
          <T c="brand" size={13} weight="600">
            Ver vídeo de execução
          </T>
        </Pressable>
      ) : null}

      {ex.observacoes ? (
        <View style={s.obs}>
          <Ionicons name="information-circle" size={16} color={C.warning} />
          <T c="textSec" size={13} style={{ flex: 1, lineHeight: 18 }}>
            {ex.observacoes}
          </T>
        </View>
      ) : null}

      {/* Registro de carga (do aluno) */}
      <View style={s.cargaRow}>
        <T c="textTer" size={11} weight="600" style={{ letterSpacing: 0.5 }}>
          CARGA QUE VOCÊ USOU
        </T>
        <View style={s.cargaInputWrap}>
          <TextInput
            value={carga}
            onChangeText={onCarga}
            placeholder="ex.: 40 kg"
            placeholderTextColor={C.textTer}
            style={s.cargaInput}
          />
        </View>
      </View>
    </Card>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.spec}>
      <T c="textTer" size={11} weight="600">
        {label}
      </T>
      <T size={15} weight="700">
        {value}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  treinoHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: S.sm,
  },
  exHead: { flexDirection: "row", alignItems: "flex-start", gap: S.sm },
  grupo: { letterSpacing: 0.5, marginTop: 2 },
  specRow: {
    flexDirection: "row",
    gap: S.sm,
    marginTop: S.md,
  },
  spec: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    borderRadius: R.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    gap: 2,
  },
  video: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: S.md,
  },
  obs: {
    flexDirection: "row",
    gap: 6,
    marginTop: S.md,
    backgroundColor: C.warningSoft,
    borderRadius: R.sm,
    padding: S.md,
  },
  cargaRow: {
    marginTop: S.lg,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cargaInputWrap: {
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: R.sm,
    paddingHorizontal: S.md,
    minWidth: 110,
  },
  cargaInput: {
    height: 38,
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
});
