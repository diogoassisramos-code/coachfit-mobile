import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, T } from "@/components/ui";
import { C, interFont, R, S } from "@/constants/coachfit";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ContaScreen() {
  const router = useRouter();
  const { updatePassword, signOut } = useAuth();
  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace("/perfil");

  const [email, setEmail] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [ver, setVer] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    supabase?.auth.getUser().then(({ data }) => {
      if (ativo) setEmail(data.user?.email ?? "");
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function salvar() {
    setErro("");
    setOk(false);
    if (nova.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (nova !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    setSalvando(true);
    try {
      await updatePassword(nova);
      setOk(true);
      setNova("");
      setConfirma("");
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "";
      setErro(
        /session|logged|auth/i.test(msg)
          ? "Sessão expirada. Saia e entre de novo para trocar a senha."
          : "Não foi possível salvar a senha. Tente de novo."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={st.screen} edges={["top"]}>
      <View style={st.topbar}>
        <Pressable onPress={voltar} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <T size={15} weight="700">
          Conta e senha
        </T>
        <View style={st.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={st.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Dados da conta */}
          <Card>
            <T c="textTer" size={11} weight="700" style={st.label}>
              SUA CONTA
            </T>
            <View style={st.infoRow}>
              <View style={st.infoLeft}>
                <Ionicons name="mail-outline" size={18} color={C.textTer} />
                <T c="textSec" size={14}>
                  E-mail
                </T>
              </View>
              <T size={14} weight="600" numberOfLines={1}>
                {email || "—"}
              </T>
            </View>
          </Card>

          {/* Alterar senha */}
          <Card>
            <T c="textTer" size={11} weight="700" style={st.label}>
              ALTERAR SENHA
            </T>

            <T size={13} weight="600" style={{ marginBottom: 6 }}>
              Nova senha
            </T>
            <View style={st.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.textTer} />
              <TextInput
                value={nova}
                onChangeText={setNova}
                placeholder="mín. 6 caracteres"
                placeholderTextColor={C.textTer}
                secureTextEntry={!ver}
                style={st.input}
              />
              <Pressable onPress={() => setVer((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={ver ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={C.textTer}
                />
              </Pressable>
            </View>

            <T size={13} weight="600" style={{ marginTop: S.md, marginBottom: 6 }}>
              Confirmar nova senha
            </T>
            <View style={st.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.textTer} />
              <TextInput
                value={confirma}
                onChangeText={setConfirma}
                placeholder="repita a senha"
                placeholderTextColor={C.textTer}
                secureTextEntry={!ver}
                style={st.input}
              />
            </View>

            {erro ? (
              <T c="danger" size={13} weight="600" style={{ marginTop: S.md }}>
                {erro}
              </T>
            ) : null}
            {ok ? (
              <View style={st.okRow}>
                <Ionicons name="checkmark-circle" size={16} color={C.success} />
                <T c="success" size={13} weight="600">
                  Senha atualizada!
                </T>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                st.btn,
                (pressed || salvando) && { opacity: 0.7 },
              ]}
              onPress={salvar}
              disabled={salvando}
            >
              <T c="brand" size={15} weight="700">
                {salvando ? "Salvando…" : "Salvar nova senha"}
              </T>
            </Pressable>
          </Card>

          {/* Sair */}
          <Pressable
            style={({ pressed }) => [st.sair, pressed && { opacity: 0.7 }]}
            onPress={async () => {
              await signOut();
              router.replace("/login");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={C.danger} />
            <T c="danger" size={15} weight="600">
              Sair da conta
            </T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  iconBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  content: { padding: S.lg, paddingBottom: S.xxxl * 2, gap: S.lg },
  label: { letterSpacing: 0.6, marginBottom: S.md },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: S.md,
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: S.sm },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    height: 50,
    paddingHorizontal: S.md,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
  },
  input: { flex: 1, fontSize: 15, color: C.text, fontFamily: interFont("400") },
  okRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S.md },
  btn: {
    marginTop: S.lg,
    height: 50,
    borderRadius: R.pill,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    height: 50,
  },
});
