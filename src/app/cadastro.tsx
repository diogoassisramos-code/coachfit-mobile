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
import { C } from "@/constants/coachfit";
import { useAuth } from "@/lib/auth";

export default function CadastroScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);

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
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ marginBottom: 4 }}
          >
            <Ionicons name="chevron-back" size={24} color={C.text} />
          </Pressable>

          <AuthHero
            titulo="Criar conta"
            sub="Recebeu um convite do seu coach? Cria sua conta em segundos."
          />

          <View style={a.form}>
            <AuthField
              label="Nome completo"
              icon="person-outline"
              value={nome}
              onChangeText={setNome}
              placeholder="Como o coach te chama"
              autoCapitalize="words"
            />
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
                Criar senha
              </T>
              <View style={a.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={C.textTer} />
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Mínimo 8 caracteres"
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
            </View>

            <Pressable
              style={({ pressed }) => [a.cta, pressed && { opacity: 0.85 }]}
              onPress={() => {
                signUp(email, senha).catch(() => {});
              }}
            >
              <T c="brand" size={16} weight="700">
                Criar conta
              </T>
              <Ionicons name="arrow-forward" size={20} color={C.brand} />
            </Pressable>

            <T c="textTer" size={12} style={{ textAlign: "center", lineHeight: 17 }}>
              Ao criar a conta você concorda com os termos de uso e a política de
              privacidade.
            </T>
          </View>

          <View style={a.footer}>
            <T c="textSec" size={14}>
              Já tem conta?{" "}
            </T>
            <Pressable onPress={() => router.replace("/login")} hitSlop={6}>
              <T c="accentDeep" size={14} weight="700">
                Entrar
              </T>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
