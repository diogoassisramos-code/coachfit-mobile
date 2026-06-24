import { Tabs } from "expo-router/js-tabs";

import { BottomNavBar, type TabBarProps } from "@/components/BottomNavBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <BottomNavBar {...(props as unknown as TabBarProps)} />
      )}
    >
      <Tabs.Screen name="index" options={{ title: "Hoje" }} />
      <Tabs.Screen name="treino" options={{ title: "Treino" }} />
      <Tabs.Screen name="dieta" options={{ title: "Dieta" }} />
      <Tabs.Screen name="protocolo" options={{ title: "Protocolo" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
