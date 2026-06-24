# CoachFit — App do aluno (mobile)

App React Native (Expo) do **aluno/cliente final**, que recebe treino, dieta e protocolo enviados pelo consultor. Projeto **separado** do dashboard do consultor (web, em `../App Fitness`). Alvo: **App Store + Google Play**.

## Stack
- **Expo SDK 56 + Expo Router (file-based) + TypeScript + React Native 0.85.**
- Estilo: `StyleSheet` do RN + tokens da marca em `src/constants/coachfit.ts` (espelham os do dashboard: azul `#2347E6`, fundos, status). **Sem Tailwind/NativeWind.**
- Ícones: `@expo/vector-icons` (Ionicons).
- **Mock-first**: dados em `src/data/aluno.ts` (sem backend ainda). Estados de "carga/feito/tomado/check-in" são locais (efêmeros).

## Estrutura
- `src/app/_layout.tsx` — Stack raiz (tabs + `checkin` como modal).
- `src/app/(tabs)/_layout.tsx` — bottom tabs: **Hoje · Treino · Dieta · Protocolo · Perfil**.
- `src/app/(tabs)/index.tsx` (Hoje), `treino.tsx`, `dieta.tsx`, `protocolo.tsx`, `perfil.tsx`.
- `src/app/checkin.tsx` — modal de check-in semanal (peso, fotos, energia/sono/dieta, comentário → enviar).
- `src/components/ui.tsx` — primitivos (`Screen`, `Card`, `Badge`, `Avatar`, `ScreenHeader`, `T`).
- `src/constants/coachfit.ts` — tokens (`C` cores, `S` espaços, `R` raios, `Shadow`).
- `src/data/aluno.ts` — dados mock do aluno logado (perfil, treinos, refeições, protocolo, check-ins).

## Funcionalidades (MVP)
- **Hoje**: saudação, CTA de check-in, métricas (peso/aderência), atalhos pra treino/dieta/protocolo.
- **Treino**: exercícios (séries/reps/descanso, vídeo, observações do coach) + **registro de carga pelo aluno** + marcar feito.
- **Dieta**: meta kcal, refeições com alimentos, macros, substituições e observações.
- **Protocolo**: blocos de suplementos/vitaminas (dose, horário, observações) + marcar tomado.
- **Check-in**: peso, fotos (Frente/Lado/Costas), avaliações (estrelas), comentário → "Enviar".
- **Perfil**: plano, consultor, pagamento, histórico de check-ins com respostas do coach.

## Comandos
- `npm run web` — Expo no navegador (verificação rápida no Windows).
- `npm run ios` / `npm run android` — Expo Go ou emulador.
- `npx expo export --platform web` — valida o bundle (equivale a build).
- `npx tsc --noEmit` — checagem de tipos.

## Próximos passos para as lojas (EAS)
1. Criar conta Apple Developer (US$99/ano) e Google Play (US$25). **O dono faz isso.**
2. `npm i -g eas-cli && eas login && eas build:configure`.
3. `eas build --platform all` (compila iOS na nuvem — não precisa de Mac).
4. `eas submit --platform ios` / `--platform android` para enviar às lojas.
Bundle id já definido em `app.json`: `app.coachfit.aluno`.

## Próximos passos de produto
- **Backend** (login + dados reais sincronizados com o consultor): Supabase/Firebase.
- Player de vídeo dos exercícios; upload real de fotos no check-in; push notifications; onboarding/login.
