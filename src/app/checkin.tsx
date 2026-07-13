import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, dataFont, interFont, R, S } from "@/constants/coachfit";
import { saveCheckin, useMe, useMyCheckins } from "@/lib/db";

const ANGULOS = ["Frente", "Lado", "Costas"];

/**
 * Abre o seletor de arquivo do navegador (teste no computador) → data URL.
 * Redimensiona (máx 1080px) e recomprime (JPEG q0.7) antes de gerar o data URL:
 * foto full-size vira vários MB de base64 e estoura o timeout do envio. Assim
 * cada foto fica em ~150–300KB. Faz fallback pra imagem original se o canvas
 * falhar (ex.: navegador sem suporte).
 */
function pickWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const original = String(reader.result);
        // OBS: `Image` aqui é o componente do react-native (importado no topo),
        // não o construtor do DOM — por isso criamos o <img> via createElement.
        const img = document.createElement("img");
        img.onload = () => {
          try {
            const MAX = 1080;
            const escala = Math.min(1, MAX / Math.max(img.width, img.height));
            const w = Math.round(img.width * escala);
            const h = Math.round(img.height * escala);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(original);
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } catch {
            resolve(original);
          }
        };
        img.onerror = () => resolve(original);
        img.src = original;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

/** Rejeita se a promise passar de `ms` — evita travar em "Enviando…". */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

/** Traduz a falha do envio numa mensagem útil (em vez do genérico "acordando"). */
function mensagemErro(e: unknown): string {
  const raw =
    (e as { message?: string })?.message ?? (typeof e === "string" ? e : "");
  const m = raw.toLowerCase();
  if (m.includes("fetch") || m.includes("network") || m.includes("networkerror")) {
    return "Sem conexão com o servidor. Confira sua internet e desative bloqueador de anúncios/VPN, se houver, e tente de novo.";
  }
  if (m.includes("timeout")) {
    return "O servidor demorou a responder. Aguarde alguns segundos e tente de novo.";
  }
  if (m.includes("sem aluno")) {
    return "Sua conta não está vinculada a um aluno. Saia e entre de novo, ou fale com seu consultor.";
  }
  return raw
    ? `Não foi possível enviar: ${raw}`
    : "Não foi possível enviar o check-in. Tente de novo.";
}

export default function CheckinScreen() {
  const router = useRouter();
  // Gate: com anamnese pendente, o aluno responde a anamnese ANTES do check-in.
  const { me, loading: meLoading } = useMe();
  useEffect(() => {
    if (meLoading) return;
    if (me?.anamnesePendente) router.replace("/anamnese");
  }, [meLoading, me, router]);
  const [peso, setPeso] = useState("");
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [energia, setEnergia] = useState(0);
  const [sono, setSono] = useState(0);
  const [dieta, setDieta] = useState(0);
  const [treinosFeitos, setTreinosFeitos] = useState(0);
  const [treinosTotais, setTreinosTotais] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  // Último check-in do aluno (banco) → semana atual e peso de referência.
  const { checkins: meusCheckins } = useMyCheckins();
  const ultimo = meusCheckins.length
    ? meusCheckins[meusCheckins.length - 1]
    : undefined;
  const semanaAtual = ultimo ? ultimo.semana + 1 : 1;
  // Pré-preenche o peso com o do último check-in (parte-se da semana passada e
  // ajusta). Só uma vez, e sem sobrescrever o que o aluno já digitou.
  const pesoPreenchido = useRef(false);
  useEffect(() => {
    if (!pesoPreenchido.current && !peso && ultimo?.peso) {
      setPeso(String(ultimo.peso).replace(".", ","));
      pesoPreenchido.current = true;
    }
  }, [ultimo, peso]);

  async function pickImage(angulo: string) {
    // No navegador (teste no computador), abre o seletor de arquivo.
    if (Platform.OS === "web") {
      const url = await pickWeb();
      if (url) setFotos((p) => ({ ...p, [angulo]: url }));
      return;
    }
    // No app, abre a galeria de fotos.
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setFotos((p) => ({ ...p, [angulo]: res.assets[0].uri }));
    }
  }

  function removeFoto(angulo: string) {
    setFotos((p) => {
      const next = { ...p };
      delete next[angulo];
      return next;
    });
  }

  const podeEnviar = !!peso.trim() && !!energia && !!sono && !!dieta;

  async function enviar() {
    if (!podeEnviar || enviando) return;
    setEnviando(true);
    setErro("");
    const payload = {
      peso: peso ? Number(peso.replace(",", ".")) : undefined,
      fotos: ANGULOS.filter((a) => fotos[a]).map((a) => ({
        angulo: a,
        url: fotos[a],
      })),
      energia,
      sono,
      dieta,
      treinosFeitos,
      treinosTotais,
      comentario: comentario.trim() || undefined,
    };
    try {
      // A 1ª tentativa pode pegar o banco "dormindo" (cold-start, lento). Se
      // falhar/expirar, tenta UMA vez de novo — o banco já acordou. O envio é
      // idempotente (não duplica se já houver um check-in pendente).
      try {
        await withTimeout(saveCheckin(payload), 15000);
      } catch {
        await withTimeout(saveCheckin(payload), 15000);
      }
      setEnviado(true);
    } catch (e) {
      setErro(mensagemErro(e));
      // eslint-disable-next-line no-console
      console.warn("[checkin] falha no envio:", e);
    } finally {
      setEnviando(false);
    }
  }

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
          <Pressable
            style={[st.btn, st.btnFull]}
            onPress={() => router.back()}
          >
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
            CHECK-IN · SEMANA {semanaAtual}
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
            {ANGULOS.map((a) => {
              const uri = fotos[a];
              return (
                <Pressable key={a} style={st.foto} onPress={() => pickImage(a)}>
                  {uri ? (
                    <>
                      <Image source={{ uri }} style={st.fotoImg} />
                      <Pressable
                        style={st.fotoRemove}
                        onPress={() => removeFoto(a)}
                        hitSlop={6}
                      >
                        <Ionicons name="close" size={14} color={C.white} />
                      </Pressable>
                      <View style={st.fotoTag}>
                        <T c="textOnDarkStrong" size={11} weight="600">
                          {a}
                        </T>
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color={C.accent}
                      />
                      <T c="textOnDarkMuted" size={12} style={{ marginTop: 4 }}>
                        {a}
                      </T>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Avaliações */}
        <Card>
          <Rating label="Energia" value={energia} onChange={setEnergia} />
          <Rating label="Sono" value={sono} onChange={setSono} />
          <Rating label="Dieta" value={dieta} onChange={setDieta} last />
        </Card>

        {/* Treinos da semana */}
        <Card>
          <T c="textTer" size={11} weight="600" style={st.label}>
            TREINOS DA SEMANA
          </T>
          <View style={st.treinos}>
            <Stepper
              label="Feitos"
              value={treinosFeitos}
              onChange={setTreinosFeitos}
              max={treinosTotais}
            />
            <Stepper
              label="Planejados"
              value={treinosTotais}
              onChange={setTreinosTotais}
              min={1}
            />
          </View>
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
        {erro ? (
          <T
            c="danger"
            size={13}
            style={{ textAlign: "center", marginBottom: S.sm }}
          >
            {erro}
          </T>
        ) : null}
        <Pressable
          style={[st.btn, (!podeEnviar || enviando) && { opacity: 0.5 }]}
          disabled={!podeEnviar || enviando}
          onPress={enviar}
        >
          <Ionicons name="send" size={18} color={C.brand} />
          <T c="brand" size={15} weight="700">
            {enviando ? "Enviando…" : "Enviar check-in"}
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

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 14,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={st.stepperCol}>
      <T c="textTer" size={11} weight="600" style={st.label}>
        {label.toUpperCase()}
      </T>
      <View style={st.stepper}>
        <Pressable
          style={st.stepBtn}
          hitSlop={6}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Ionicons
            name="remove"
            size={18}
            color={value <= min ? C.borderStrong : C.petrol}
          />
        </Pressable>
        <T size={20} weight="700" style={st.stepValue}>
          {value}
        </T>
        <Pressable
          style={st.stepBtn}
          hitSlop={6}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Ionicons
            name="add"
            size={18}
            color={value >= max ? C.borderStrong : C.petrol}
          />
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  treinos: { flexDirection: "row", gap: S.lg },
  stepperCol: { flex: 1, alignItems: "center", gap: S.sm },
  stepper: { flexDirection: "row", alignItems: "center", gap: S.md },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  stepValue: { fontFamily: dataFont("700"), minWidth: 28, textAlign: "center" },
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
    overflow: "hidden",
  },
  fotoImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  fotoRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(2,33,40,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoTag: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 4,
    alignItems: "center",
    backgroundColor: "rgba(2,33,40,0.45)",
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
  btnFull: { alignSelf: "stretch" },
});
