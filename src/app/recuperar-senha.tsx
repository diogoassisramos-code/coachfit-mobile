import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthField, AuthHero, authStyles as a } from "@/components/auth";
import { T } from "@/components/ui";
import { C, R, S } from "@/constants/coachfit";
import { useAuth } from "@/lib/auth";

export default function RecuperarSenhaScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const podeEnviar = /\S+@\S+\.\S+/.test(email.trim());

  async function enviar() {
    if (!podeEnviar || enviando) return;
    setErro("");
    setEnviando(true);
    try {
      await resetPassword(email.trim());
      setEnviado(true);
    } catch {
      // Não revela se o e-mail existe (boa prática) — mostra sucesso mesmo assim.
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={a.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={a.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {enviado ? (
            <View style={{ alignItems: "center", gap: S.md, paddingTop: S.xxxl }}>
              <View style={styles.successIcon}>
                <Ionicons name="mail-open-outline" size={36} color={C.accentDeep} />
              </View>
              <T size={22} weight="800" style={{ textAlign: "center" }}>
                Confira seu e-mail
              </T>
              <T c="textSec" size={15} style={{ textAlign: "center", lineHeight: 22 }}>
                Se houver uma conta para{" "}
                <T size={15} weight="700">
                  {email.trim()}
                </T>
                , enviamos um link pra você criar uma nova senha.
              </T>
              <Pressable
                style={[a.cta, { alignSelf: "stretch", marginTop: S.lg }]}
                onPress={() => router.replace("/login")}
              >
                <T c="brand" size={16} weight="700">
                  Voltar pro login
                </T>
              </Pressable>
            </View>
          ) : (
            <>
              <AuthHero
                titulo="Recuperar senha"
                sub="Digite o e-mail da sua conta e enviamos um link pra você criar uma nova senha."
              />

              <View style={a.form}>
                <AuthField
                  label="E-mail"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@email.com"
                  keyboardType="email-address"
                />

                {erro ? (
                  <T c="danger" size={13} weight="600">
                    {erro}
                  </T>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    a.cta,
                    (pressed || enviando || !podeEnviar) && { opacity: 0.6 },
                  ]}
                  onPress={enviar}
                  disabled={enviando || !podeEnviar}
                >
                  <T c="brand" size={16} weight="700">
                    {enviando ? "Enviando…" : "Enviar link"}
                  </T>
                  <Ionicons name="arrow-forward" size={20} color={C.brand} />
                </Pressable>
              </View>

              <View style={a.footer}>
                <Pressable onPress={() => router.back()} hitSlop={6}>
                  <T c="accentDeep" size={14} weight="700">
                    Voltar pro login
                  </T>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: R.pill,
    backgroundColor: C.accentSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
