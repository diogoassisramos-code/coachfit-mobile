/**
 * Leitura de dados do aluno via Supabase (usado quando `supabaseEnabled`).
 * Mapeia as colunas do banco para os tipos do app (`data/aluno.ts`), pra as
 * telas não mudarem de forma. Sem Supabase, as telas seguem com o mock.
 *
 * NOTA: as telas de treino ainda leem o mock — o wire dessas telas a estas
 * funções é o próximo passo (com verificação ao vivo contra dados reais).
 */
import { useEffect, useState } from "react";

import { treinos as mockTreinos, type Exercicio, type SerieSpec, type Treino } from "@/data/aluno";
import { supabase, supabaseEnabled } from "@/lib/supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapExercicio(r: any): Exercicio {
  const detalhe: SerieSpec[] | undefined =
    Array.isArray(r.series_detalhe) && r.series_detalhe.length
      ? r.series_detalhe
      : undefined;
  return {
    id: r.id,
    nome: r.nome,
    grupo: r.grupo ?? "",
    series: r.series ?? 0,
    reps: r.reps ?? "",
    descansoSeg: r.descanso_seg ?? 0,
    video: (r.video_origem ?? "vazio") !== "vazio",
    observacoes: r.observacoes ?? undefined,
    seriesDetalhe: detalhe,
  };
}

/** Treinos publicados do aluno logado (RLS entrega só os dele e não-rascunho). */
export async function fetchTreinos(): Promise<Treino[]> {
  if (!supabase) return [];
  const { data: treinos, error } = await supabase
    .from("treinos")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  if (!treinos?.length) return [];

  const ids = treinos.map((t) => t.id);
  const { data: exs, error: exErr } = await supabase
    .from("exercicios")
    .select("*")
    .in("treino_id", ids)
    .order("ordem");
  if (exErr) throw exErr;

  return treinos.map((t) => ({
    id: t.id,
    nome: t.nome,
    diaSemana: "", // o banco ainda não guarda o dia da semana do treino
    exercicios: (exs ?? [])
      .filter((e) => e.treino_id === t.id)
      .map(mapExercicio),
  }));
}

/**
 * Hook único de treinos do aluno: lê do Supabase quando configurado, senão
 * usa o mock. Todas as telas de treino consomem isto pra ficarem coerentes.
 */
export function useTreinos(): { treinos: Treino[]; loading: boolean } {
  const [treinos, setTreinos] = useState<Treino[]>(
    supabaseEnabled ? [] : mockTreinos
  );
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let active = true;
    fetchTreinos()
      .then((t) => active && setTreinos(t))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { treinos, loading };
}
