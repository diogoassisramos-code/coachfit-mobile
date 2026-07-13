import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { T } from "@/components/ui";
import { AuthField, AuthHero, authStyles as a } from "@/components/auth";
import { C, S } from "@/constants/coachfit";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setErro("");
    setCarregando(true);
    try {
      await signIn(email, senha);
      // navegação é feita pelo guard ao detectar a sessão
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
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
          <AuthHero
            titulo="Bora treinar?"
            sub="Entra pra ver seu treino, dieta e mandar o check-in da semana."
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
            <View style={a.field}>
              <T size={13} weight="600">
                Senha
              </T>
              <View style={a.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={C.textTer} />
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="••••••••"
                  placeholderTextColor={C.textTer}
                  secureTextEntry={!ver}
                  style={a.input}
                />
                <Pressable onPress={() => setVer((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={ver ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={C.textTer}
                  />
                </Pressable>
              </View>
              <Pressable
                style={a.forgot}
                hitSlop={6}
                onPress={() => router.push("/recuperar-senha")}
              >
                <T c="accentDeep" size={13} weight="600">
                  Esqueci minha senha
                </T>
              </Pressable>
            </View>

          </View>

          {/* Empurrado pro quadrante inferior da tela pelo marginTop:auto */}
          <View style={{ marginTop: "auto", paddingTop: S.xxl, gap: S.md }}>
            {erro ? (
              <T c="danger" size={13} weight="600">
                {erro}
              </T>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                a.cta,
                (pressed || carregando) && { opacity: 0.85 },
              ]}
              onPress={entrar}
              disabled={carregando}
            >
              <T c="brand" size={16} weight="700">
                {carregando ? "Entrando…" : "Entrar"}
              </T>
              <Ionicons name="arrow-forward" size={20} color={C.brand} />
            </Pressable>
          </View>

          <View style={a.footer}>
            <T c="textSec" size={14}>
              Ainda não tem conta?{" "}
            </T>
            <Pressable onPress={() => router.push("/cadastro")} hitSlop={6}>
              <T c="accentDeep" size={14} weight="700">
                Criar conta
              </T>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
