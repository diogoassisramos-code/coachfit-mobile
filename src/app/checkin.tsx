import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, dataFont, interFont, R, S } from "@/constants/coachfit";

const ANGULOS = ["Frente", "Lado", "Costas"];

export default function CheckinScreen() {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [energia, setEnergia] = useState(0);
  const [sono, setSono] = useState(0);
  const [dieta, setDieta] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <SafeAreaView style={st.screen}>
        <View style={st.successWrap}>
          <View style={st.successIcon}>
            <Ionicons name="checkmark" size={40} color={C.success} />
          </View>
          <T size={22} weight="700" style={{ textAlign: "center" }}>
            Check-in enviado!
          </T>
          <T c="textSec" size={15} style={{ textAlign: "center", lineHeight: 22 }}>
            Seu consultor vai analisar e ajustar seu treino e dieta. Você recebe a
            resposta em breve.
          </T>
          <Pressable style={st.btn} onPress={() => router.back()}>
            <T c="brand" size={15} weight="700">
              Voltar
            </T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.screen}>
      <View style={st.topbar}>
        <View>
          <T c="textTer" size={11} weight="600" style={st.eyebrow}>
            CHECK-IN · SEMANA 6
          </T>
          <T size={20} weight="700">
            Como foi sua semana?
          </T>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} style={st.close}>
          <Ionicons name="close" size={22} color={C.textSec} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Peso */}
        <Card>
          <T c="textTer" size={11} weight="600" style={st.label}>
            PESO DA SEMANA
          </T>
          <View style={st.pesoWrap}>
            <TextInput
              value={peso}
              onChangeText={setPeso}
              placeholder="60,4"
              placeholderTextColor={C.textTer}
              keyboardType="decimal-pad"
              style={st.pesoInput}
            />
            <T c="textTer" size={16}>
              kg
            </T>
          </View>
        </Card>

        {/* Fotos */}
        <Card>
          <T c="textTer" size={11} weight="600" style={st.label}>
            FOTOS DE PROGRESSO
          </T>
          <View style={st.fotos}>
            {ANGULOS.map((a) => (
              <Pressable key={a} style={st.foto}>
                <Ionicons name="camera-outline" size={24} color={C.accent} />
                <T c="textOnDarkMuted" size={12} style={{ marginTop: 4 }}>
                  {a}
                </T>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Avaliações */}
        <Card>
          <Rating label="Energia" value={energia} onChange={setEnergia} />
          <Rating label="Sono" value={sono} onChange={setSono} />
          <Rating label="Dieta" value={dieta} onChange={setDieta} last />
        </Card>

        {/* Comentário */}
        <Card>
          <T c="textTer" size={11} weight="600" style={st.label}>
            COMO VOCÊ SE SENTIU?
          </T>
          <TextInput
            value={comentario}
            onChangeText={setComentario}
            placeholder="Conte pro seu consultor como foi a semana, dificuldades, evolução…"
            placeholderTextColor={C.textTer}
            multiline
            style={st.textarea}
          />
        </Card>
      </ScrollView>

      <View style={st.footer}>
        <Pressable
          style={[st.btn, !peso.trim() && { opacity: 0.5 }]}
          disabled={!peso.trim()}
          onPress={() => setEnviado(true)}
        >
          <Ionicons name="send" size={18} color={C.brand} />
          <T c="brand" size={15} weight="700">
            Enviar check-in
          </T>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Rating({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  last?: boolean;
}) {
  return (
    <View style={[st.rating, !last && st.ratingBorder]}>
      <T size={15} weight="600">
        {label}
      </T>
      <View style={st.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={4}>
            <Ionicons
              name={n <= value ? "star" : "star-outline"}
              size={26}
              color={n <= value ? C.accentDeep : C.borderStrong}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: S.lg,
    padding: S.xxl,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: S.sm,
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
  },
  eyebrow: { letterSpacing: 0.5, marginBottom: 2 },
  close: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: S.lg, gap: S.lg, paddingBottom: S.xxxl },
  label: { letterSpacing: 0.5, marginBottom: S.sm },
  pesoWrap: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  pesoInput: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: dataFont("700"),
    letterSpacing: -0.5,
    color: C.text,
    minWidth: 90,
  },
  fotos: { flexDirection: "row", gap: S.md },
  foto: {
    flex: 1,
    aspectRatio: 0.78,
    backgroundColor: C.surfaceDarkAlt,
    borderRadius: R.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: S.md,
  },
  ratingBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  dots: { flexDirection: "row", gap: S.sm },
  textarea: {
    minHeight: 90,
    fontSize: 15,
    fontFamily: interFont("400"),
    color: C.text,
    textAlignVertical: "top",
    lineHeight: 21,
  },
  footer: {
    padding: S.lg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    marginTop: S.lg,
  },
});
