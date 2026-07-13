import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, interFont, R, S } from "@/constants/coachfit";
import { responderAnamnese, useMe, type PerguntaAnamnese } from "@/lib/db";
import { escolherFotoDataUrl } from "@/lib/foto";

/** Traduz a falha do envio numa mensagem útil. */
function mensagemErro(e: unknown): string {
  const raw = (e as { message?: string })?.message ?? "";
  if (/responda:/i.test(raw)) return raw; // erro de obrigatória vindo do servidor
  if (/network|fetch/i.test(raw)) return "Sem conexão. Confira sua internet e tente de novo.";
  return raw ? `Não foi possível enviar: ${raw}` : "Não foi possível enviar. Tente de novo.";
}

export default function AnamneseScreen() {
  const router = useRouter();
  const { me, loading } = useMe();
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  // Quem não tem anamnese pendente não deveria estar aqui.
  useEffect(() => {
    if (loading || enviado) return;
    if (!me?.anamnesePendente) router.replace("/");
  }, [loading, enviado, me, router]);

  const perguntas: PerguntaAnamnese[] = me?.anamnesePerguntas ?? [];

  function setResposta(id: string, valor: string) {
    setRespostas((prev) => ({ ...prev, [id]: valor }));
  }

  async function enviar() {
    if (enviando) return;
    setErro("");
    const faltando = perguntas.find(
      (p) => p.obrigatoria && !(respostas[p.id] ?? "").trim()
    );
    if (faltando) {
      setErro(`Responda: "${faltando.texto || "pergunta obrigatória"}".`);
      return;
    }
    setEnviando(true);
    try {
      await responderAnamnese(respostas);
      setEnviado(true);
    } catch (e) {
      setErro(mensagemErro(e));
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
            Anamnese enviada!
          </T>
          <T c="textSec" size={15} style={{ textAlign: "center", lineHeight: 22 }}>
            Prontinho — seu treinador já tem o que precisa. Agora é só mandar seu
            primeiro check-in.
          </T>
          <Pressable style={[st.btn, st.btnFull]} onPress={() => router.replace("/")}>
            <T c="brand" size={15} weight="700">
              Ir pro início
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
            PRIMEIRO ACESSO
          </T>
          <T size={20} weight="700">
            Sua anamnese
          </T>
        </View>
        <Pressable onPress={() => router.replace("/")} hitSlop={8} style={st.close}>
          <Ionicons name="close" size={22} color={C.textSec} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <T c="textSec" size={14}>
            Carregando…
          </T>
        ) : (
          perguntas.map((p, i) => (
            <Card key={p.id}>
              <T size={15} weight="600" style={{ marginBottom: S.sm }}>
                {i + 1}. {p.texto || "Pergunta"}
                {p.obrigatoria ? <T c="danger" size={15}> *</T> : null}
              </T>
              <CampoResposta
                pergunta={p}
                valor={respostas[p.id] ?? ""}
                onChange={(v) => setResposta(p.id, v)}
              />
            </Card>
          ))
        )}
      </ScrollView>

      <View style={st.footer}>
        {erro ? (
          <T c="danger" size={13} style={{ textAlign: "center", marginBottom: S.sm }}>
            {erro}
          </T>
        ) : null}
        <Pressable
          style={[st.btn, enviando && { opacity: 0.5 }]}
          disabled={enviando}
          onPress={enviar}
        >
          <Ionicons name="send" size={18} color={C.brand} />
          <T c="brand" size={15} weight="700">
            {enviando ? "Enviando…" : "Enviar anamnese"}
          </T>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** Campo de resposta conforme o tipo da pergunta. */
function CampoResposta({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: PerguntaAnamnese;
  valor: string;
  onChange: (v: string) => void;
}) {
  if (pergunta.tipo === "numero") {
    return (
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Ex.: 72"
        placeholderTextColor={C.textTer}
        keyboardType="decimal-pad"
        style={st.input}
      />
    );
  }
  if (pergunta.tipo === "escolha") {
    const opcoes = (pergunta.opcoes ?? []).map((o) => o.trim()).filter(Boolean);
    if (opcoes.length > 0) {
      return (
        <View style={st.opcoes}>
          {opcoes.map((op) => {
            const sel = valor === op;
            return (
              <Pressable
                key={op}
                onPress={() => onChange(op)}
                style={[st.opcao, sel && st.opcaoSel]}
              >
                <T size={14} weight={sel ? "700" : "500"} c={sel ? "brand" : "text"}>
                  {op}
                </T>
              </Pressable>
            );
          })}
        </View>
      );
    }
    // escolha sem opções → cai pra texto livre
    return (
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Sua resposta"
        placeholderTextColor={C.textTer}
        style={st.input}
      />
    );
  }
  if (pergunta.tipo === "foto") {
    return <FotoCampo valor={valor} onChange={onChange} />;
  }
  // texto (e fallback pra outros tipos)
  return (
    <TextInput
      value={valor}
      onChangeText={onChange}
      placeholder="Sua resposta"
      placeholderTextColor={C.textTer}
      multiline
      style={[st.input, st.textarea]}
    />
  );
}

/** Upload de foto → data URL (mesmo padrão do check-in). */
function FotoCampo({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (v: string) => void;
}) {
  const [carregando, setCarregando] = useState(false);
  const temFoto = valor.startsWith("data:image");

  async function escolher() {
    setCarregando(true);
    try {
      const url = await escolherFotoDataUrl();
      if (url) onChange(url);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={{ gap: S.sm }}>
      {temFoto ? (
        <Image source={{ uri: valor }} style={st.fotoPreview} />
      ) : null}
      <Pressable
        onPress={escolher}
        disabled={carregando}
        style={[st.fotoBtn, carregando && { opacity: 0.6 }]}
      >
        <Ionicons name="camera-outline" size={18} color={C.accentDeep} />
        <T c="accentDeep" size={14} weight="700">
          {carregando ? "Processando…" : temFoto ? "Trocar foto" : "Enviar foto"}
        </T>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
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
  input: {
    fontSize: 15,
    fontFamily: interFont("400"),
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    backgroundColor: C.surface,
  },
  textarea: { minHeight: 84, textAlignVertical: "top", lineHeight: 21 },
  fotoPreview: {
    width: 160,
    height: 160,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceMuted,
  },
  fotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    alignSelf: "flex-start",
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.lg,
  },
  opcoes: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  opcao: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  opcaoSel: { borderColor: C.accent, backgroundColor: C.accentSoft },
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
  },
  btnFull: { alignSelf: "stretch" },
});
