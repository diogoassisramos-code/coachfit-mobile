// Pesos importados direto dos arquivos (os barris @expo-google-fonts referenciam
// .ttf italic ausentes e quebram o bundle). Hanken Grotesk = display/texto;
// Space Grotesk = dados/números.
import HankenGrotesk_400Regular from "@expo-google-fonts/hanken-grotesk/400Regular/HankenGrotesk_400Regular.ttf";
import HankenGrotesk_500Medium from "@expo-google-fonts/hanken-grotesk/500Medium/HankenGrotesk_500Medium.ttf";
import HankenGrotesk_600SemiBold from "@expo-google-fonts/hanken-grotesk/600SemiBold/HankenGrotesk_600SemiBold.ttf";
import HankenGrotesk_700Bold from "@expo-google-fonts/hanken-grotesk/700Bold/HankenGrotesk_700Bold.ttf";
import HankenGrotesk_800ExtraBold from "@expo-google-fonts/hanken-grotesk/800ExtraBold/HankenGrotesk_800ExtraBold.ttf";
import SpaceGrotesk_400Regular from "@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf";
import SpaceGrotesk_500Medium from "@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf";
import SpaceGrotesk_600SemiBold from "@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf";
import SpaceGrotesk_700Bold from "@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf";
// Fonte de marca para títulos (peso único). No web é carregada via @font-face no +html.tsx.
import BlandyGrotesque from "../../assets/fonts/BlandyGrotesque.ttf";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { C } from "@/constants/coachfit";
import { AuthProvider, useAuth, useProtectedRoute } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

/** Pilha de navegação + guard de sessão (precisa estar dentro do AuthProvider). */
function RootNav() {
  const { signedIn, loading } = useAuth();
  useProtectedRoute(signedIn, loading);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen
        name="checkin"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="anamnese"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    BlandyGrotesque,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // WEB: no export SPA (output "single") o +html.tsx não é aplicado, então o
  // topo (faixa do status bar via theme-color) e o overscroll (html/body/#root)
  // ficariam brancos. Pinta tudo com C.bg em runtime para casar com o app.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const doc = (globalThis as { document?: Document }).document;
    if (!doc) return;
    const bg = C.bg;
    doc.documentElement.style.backgroundColor = bg;
    if (doc.body) doc.body.style.backgroundColor = bg;
    const root = doc.getElementById("root");
    if (root) root.style.backgroundColor = bg;
    let meta = doc.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = doc.createElement("meta");
      meta.setAttribute("name", "theme-color");
      doc.head.appendChild(meta);
    }
    meta.setAttribute("content", bg);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootNav />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
