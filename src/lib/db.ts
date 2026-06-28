/**
 * Leitura de dados do aluno via Supabase (usado quando `supabaseEnabled`).
 * Mapeia as colunas do banco para os tipos do app (`data/aluno.ts`), pra as
 * telas não mudarem de forma. Sem Supabase, as telas seguem com o mock.
 *
 * NOTA: as telas de treino ainda leem o mock — o wire dessas telas a estas
 * funções é o próximo passo (com verificação ao vivo contra dados reais).
 */
import { useEffect, useState } from "react";

import {
  treinos as mockTreinos,
  refeicoes as mockRefeicoes,
  protocolo as mockProtocolo,
  type Exercicio,
  type SerieSpec,
  type Treino,
  type Alimento,
  type Refeicao,
  type ProtocoloItem,
  type ProtocoloBloco,
} from "@/data/aluno";
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

// ── Dieta ──────────────────────────────────────────────────────────────────
// quantidade: dashboard tem {valor,unidade}; mobile é string livre ("3 unid").
function mapAlimentoDieta(r: any): Alimento {
  const valor = r.qtd_valor ?? "";
  const unid = r.qtd_unidade ?? "";
  return {
    id: r.id,
    nome: r.nome,
    quantidade: [valor, unid].filter(Boolean).join(" ").trim(),
    macros: {
      kcal: Number(r.kcal ?? 0),
      p: Number(r.p ?? 0),
      c: Number(r.c ?? 0),
      g: Number(r.g ?? 0),
    },
    substituicoes: Array.isArray(r.substituicoes) ? r.substituicoes : [],
    observacoes: r.observacoes ?? undefined,
  };
}

/** Refeições da dieta publicada do aluno (RLS entrega só não-rascunho dele). */
export async function fetchRefeicoes(): Promise<Refeicao[]> {
  if (!supabase) return [];
  const { data: dieta, error } = await supabase
    .from("dietas")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!dieta) return [];

  const { data: refs, error: rErr } = await supabase
    .from("refeicoes")
    .select("*")
    .eq("dieta_id", dieta.id)
    .order("ordem");
  if (rErr) throw rErr;
  if (!refs?.length) return [];

  const refIds = refs.map((r) => r.id);
  const { data: al, error: aErr } = await supabase
    .from("alimentos")
    .select("*")
    .in("refeicao_id", refIds)
    .order("ordem");
  if (aErr) throw aErr;

  return refs.map((r) => ({
    id: r.id,
    nome: r.nome,
    horario: r.horario ?? "",
    observacoes: r.observacoes ?? undefined,
    alimentos: (al ?? []).filter((a) => a.refeicao_id === r.id).map(mapAlimentoDieta),
  }));
}

export function useDieta(): { refeicoes: Refeicao[]; loading: boolean } {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>(
    supabaseEnabled ? [] : mockRefeicoes
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  useEffect(() => {
    if (!supabaseEnabled) return;
    let active = true;
    fetchRefeicoes()
      .then((r) => active && setRefeicoes(r))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return { refeicoes, loading };
}

// ── Protocolo ──────────────────────────────────────────────────────────────
function mapItemProto(r: any): ProtocoloItem {
  return {
    id: r.id,
    nome: r.nome,
    dose: r.dose ?? "",
    horario: r.horario ?? "",
    observacoes: r.observacoes ?? undefined,
    comoUsar: r.como_usar ?? undefined,
    comOQue: r.com_o_que ?? undefined,
    beneficio: r.beneficio ?? undefined,
    duracao: r.duracao ?? undefined,
  };
}

/** Blocos do protocolo publicado do aluno. */
export async function fetchProtocolo(): Promise<ProtocoloBloco[]> {
  if (!supabase) return [];
  const { data: proto, error } = await supabase
    .from("protocolos")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!proto) return [];

  const { data: blocos, error: bErr } = await supabase
    .from("protocolo_blocos")
    .select("*")
    .eq("protocolo_id", proto.id)
    .order("ordem");
  if (bErr) throw bErr;
  if (!blocos?.length) return [];

  const blocoIds = blocos.map((b) => b.id);
  const { data: it, error: iErr } = await supabase
    .from("protocolo_itens")
    .select("*")
    .in("bloco_id", blocoIds)
    .order("ordem");
  if (iErr) throw iErr;

  return blocos.map((b) => ({
    id: b.id,
    nome: b.nome,
    itens: (it ?? []).filter((x) => x.bloco_id === b.id).map(mapItemProto),
  }));
}

export function useProtocolo(): {
  protocolo: ProtocoloBloco[];
  loading: boolean;
} {
  const [protocolo, setProtocolo] = useState<ProtocoloBloco[]>(
    supabaseEnabled ? [] : mockProtocolo
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  useEffect(() => {
    if (!supabaseEnabled) return;
    let active = true;
    fetchProtocolo()
      .then((p) => active && setProtocolo(p))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return { protocolo, loading };
}
