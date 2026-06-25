/**
 * Auth do app — usa Supabase quando configurado (`.env`), senão cai no modo
 * protótipo em memória. Garante "a primeira tela ao abrir é o login": sem
 * sessão, o guard redireciona qualquer rota protegida para `/login`.
 */
import { useRouter, useSegments } from "expo-router";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase, supabaseEnabled } from "@/lib/supabase";

type AuthState = {
  signedIn: boolean;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  signedIn: false,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

/** Rotas acessíveis sem sessão (grupo de auth). */
const AUTH_ROUTES = ["login", "cadastro"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(supabaseEnabled);

  // Modo Supabase: sessão real + escuta login/logout/refresh.
  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = supabaseEnabled
    ? {
        signedIn,
        loading,
        signIn: async (email, password) => {
          const { error } = await supabase!.auth.signInWithPassword({
            email: email ?? "",
            password: password ?? "",
          });
          if (error) throw error;
        },
        signUp: async (email, password) => {
          const { error } = await supabase!.auth.signUp({
            email: email ?? "",
            password: password ?? "",
          });
          if (error) throw error;
        },
        signOut: async () => {
          await supabase!.auth.signOut();
        },
      }
    : {
        // Protótipo (sem Supabase): estado em memória.
        signedIn,
        loading: false,
        signIn: async () => setSignedIn(true),
        signUp: async () => setSignedIn(true),
        signOut: async () => setSignedIn(false),
      };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/**
 * Redireciona conforme a sessão: sem login manda pro `/login`; logado e numa
 * tela de auth, manda pro app. Espera o carregamento da sessão (Supabase).
 */
export function useProtectedRoute(signedIn: boolean, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const emAuth = AUTH_ROUTES.includes(segments[0] ?? "");
    if (!signedIn && !emAuth) {
      router.replace("/login");
    } else if (signedIn && emAuth) {
      router.replace("/");
    }
  }, [signedIn, loading, segments, router]);
}
