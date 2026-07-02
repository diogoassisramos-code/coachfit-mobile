/**
 * Leitura de dados do aluno via Supabase (usado quando `supabaseEnabled`).
 * Mapeia as colunas do banco para os tipos do app (`data/aluno.ts`), pra as
 * telas não mudarem de forma. Sem Supabase, as telas seguem com o mock.
 *
 * NOTA: as telas de treino ainda leem o mock — o wire dessas telas a estas
 * funções é o próximo passo (com verificação ao vivo contra dados reais).
 */
import { useCallback, useEffect, useState } from "react";

import {
  treinos as mockTreinos,
  refeicoes as mockRefeicoes,
  protocolo as mockProtocolo,
  checkins as mockCheckins,
  type CheckIn,
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
  await supabase.auth.getSession(); // garante a sessão antes de consultar
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
  await supabase.auth.getSession();
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
  await supabase.auth.getSession();
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

// ── Check-in (envio do aluno) ───────────────────────────────────────────────

// O aluno_id não muda na sessão — cacheia pra não repetir a query do profile a
// cada leitura/envio (uma query a menos importa quando o banco está frio).
let cachedAlunoId: string | null = null;

/** aluno_id do usuário logado (lido do profile, com cache). null se não for aluno. */
export async function getMyAlunoId(): Promise<string | null> {
  if (cachedAlunoId) return cachedAlunoId;
  if (!supabase) return null;
  // getSession() AGUARDA a restauração da sessão do AsyncStorage (evita
  // requisições anônimas/401 quando a tela monta antes da sessão carregar).
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("aluno_id")
    .eq("id", user.id)
    .maybeSingle();
  cachedAlunoId = data?.aluno_id ?? null;
  return cachedAlunoId;
}

export type EnvioCheckin = {
  peso?: number;
  fotos: { angulo: string; url: string }[];
  energia: number; // 1–5
  sono: number; // 1–5
  dieta: number; // 1–5
  treinosFeitos: number;
  treinosTotais: number;
  comentario?: string;
};

/**
 * Envia o check-in da semana para o mesmo `checkins` que o dashboard do
 * consultor lê (RLS: aluno insere o próprio). A semana é a próxima após a
 * última registrada. Requer a tabela `checkins` (supabase/schema_checkin.sql).
 */
export async function saveCheckin(input: EnvioCheckin): Promise<void> {
  if (!supabase) throw new Error("sem supabase");
  await supabase.auth.getSession(); // garante a sessão antes de chamar
  const fotos = input.fotos.map((f) => ({
    id: f.angulo,
    angulo: f.angulo,
    url: f.url,
  }));

  // Caminho rápido: UMA chamada RPC (resolve aluno_id + semana + insere no
  // servidor). 1 round-trip — cabe no timeout mesmo com o banco frio.
  const { error } = await supabase.rpc("enviar_checkin", {
    p_peso: input.peso ?? null,
    p_fotos: fotos,
    p_energia: input.energia,
    p_sono: input.sono,
    p_dieta: input.dieta,
    p_treinos_feitos: input.treinosFeitos,
    p_treinos_totais: input.treinosTotais,
    p_comentario: input.comentario || null,
  });
  if (!error) return;

  // Fallback: se a RPC ainda não existe (PGRST202), usa o caminho antigo.
  const semRpc =
    (error as { code?: string }).code === "PGRST202" ||
    /enviar_checkin/i.test(error.message ?? "");
  if (!semRpc) throw error;

  const alunoId = await getMyAlunoId();
  if (!alunoId) throw new Error("sem aluno na sessão");
  const { data: existentes } = await supabase
    .from("checkins")
    .select("semana,status")
    .eq("aluno_id", alunoId);
  // Idempotente: se já existe um check-in pendente (não respondido), não cria
  // outro — torna o auto-retry seguro (não duplica em caso de timeout).
  if (existentes?.some((c: any) => c.status === "pendente")) return;
  const semana = existentes?.length
    ? Math.max(...existentes.map((c: any) => c.semana)) + 1
    : 1;
  const { error: insErr } = await supabase.from("checkins").insert({
    aluno_id: alunoId,
    semana,
    peso: input.peso ?? null,
    fotos,
    energia: input.energia,
    sono: input.sono,
    dieta: input.dieta,
    treinos_feitos: input.treinosFeitos,
    treinos_totais: input.treinosTotais,
    comentario: input.comentario || null,
    status: "pendente",
  });
  // 23505 = unique(aluno_id, semana): já enviou essa semana → ok.
  if (insErr && (insErr as { code?: string }).code !== "23505") throw insErr;
}

// ── Check-ins do aluno (leitura — pra refletir na home) ─────────────────────
export type CheckinResumo = {
  id: string;
  semana: number;
  status: "pendente" | "respondido";
  peso: number;
  treinosFeitos: number;
  treinosTotais: number;
  enviadoEm: string;
  comentario?: string;
  respostaCoach?: string;
};

export async function fetchMyCheckins(): Promise<CheckinResumo[]> {
  if (!supabase) return [];
  const alunoId = await getMyAlunoId();
  if (!alunoId) return [];
  const { data, error } = await supabase
    .from("checkins")
    .select(
      "id,semana,status,peso,treinos_feitos,treinos_totais,enviado_em,comentario,resposta_coach"
    )
    .eq("aluno_id", alunoId)
    .order("semana");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    semana: r.semana ?? 0,
    status: r.status === "respondido" ? "respondido" : "pendente",
    peso: Number(r.peso ?? 0),
    treinosFeitos: r.treinos_feitos ?? 0,
    treinosTotais: r.treinos_totais ?? 0,
    enviadoEm: r.enviado_em ?? "",
    comentario: r.comentario ?? undefined,
    respostaCoach: r.resposta_coach ?? undefined,
  }));
}

// Check-ins reais no formato do mock (CheckIn) — pro histórico e detalhe, que
// mostram fotos, avaliações, comentário e a RESPOSTA DO COACH. Datas do banco
// (timestamp) viram "DD mmm" pra bater com o estilo das telas.
const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
function dataCurtaMobile(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MESES_ABREV[d.getMonth()]}`;
}

export async function fetchMyCheckinsFull(): Promise<CheckIn[]> {
  if (!supabase) return [];
  const alunoId = await getMyAlunoId();
  if (!alunoId) return [];
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("semana", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(
    (r: any): CheckIn => ({
      id: r.id,
      semana: r.semana ?? 0,
      data: dataCurtaMobile(r.enviado_em),
      peso: Number(r.peso ?? 0),
      status: r.status === "respondido" ? "respondido" : "pendente",
      respostaCoach: r.resposta_coach ?? undefined,
      fotos: Array.isArray(r.fotos)
        ? r.fotos.map((f: any) => ({ angulo: f.angulo, url: f.url }))
        : [],
      energia: r.energia ?? undefined,
      sono: r.sono ?? undefined,
      dietaNota: r.dieta ?? undefined,
      comentario: r.comentario ?? undefined,
    })
  );
}

/**
 * Histórico completo do aluno logado (com resposta do coach). Usa dados reais
 * quando há; senão cai no mock (mantém a demo populada). `refetch` pra reler ao
 * focar a tela (ex.: depois que o coach responde).
 */
export function useMyCheckinsFull(): {
  checkins: CheckIn[];
  loading: boolean;
  refetch: () => void;
} {
  const [checkins, setCheckins] = useState<CheckIn[]>(
    supabaseEnabled ? [] : mockCheckins
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) {
      setCheckins(mockCheckins);
      setLoading(false);
      return;
    }
    fetchMyCheckinsFull()
      .then((c) => setCheckins(c.length ? c : mockCheckins))
      .catch(() => setCheckins(mockCheckins))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { checkins, loading, refetch };
}

/**
 * Check-ins do aluno logado. Expõe `refetch` para a home re-ler ao voltar do
 * envio (via useFocusEffect). Sem Supabase, lista vazia (usa o mock na tela).
 */
export function useMyCheckins(): {
  checkins: CheckinResumo[];
  loading: boolean;
  refetch: () => void;
} {
  const [checkins, setCheckins] = useState<CheckinResumo[]>([]);
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }
    fetchMyCheckins()
      .then((c) => setCheckins(c))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { checkins, loading, refetch };
}

// ── Solicitação de check-in (o consultor pediu) ─────────────────────────────
export async function fetchCheckinSolicitacao(): Promise<{
  solicitado: boolean;
  msg?: string;
}> {
  if (!supabase) return { solicitado: false };
  const alunoId = await getMyAlunoId(); // já aguarda a sessão
  if (!alunoId) return { solicitado: false };
  const { data } = await supabase
    .from("alunos")
    .select("checkin_solicitado,checkin_solicitacao_msg")
    .eq("id", alunoId)
    .maybeSingle();
  return {
    solicitado: !!data?.checkin_solicitado,
    msg: data?.checkin_solicitacao_msg ?? undefined,
  };
}

/** O treinador pediu um check-in? (com refetch pra atualizar ao focar a home). */
export function useCheckinSolicitado(): {
  solicitado: boolean;
  msg?: string;
  refetch: () => void;
} {
  const [state, setState] = useState<{ solicitado: boolean; msg?: string }>({
    solicitado: false,
  });
  const refetch = useCallback(() => {
    if (!supabaseEnabled) return;
    fetchCheckinSolicitacao()
      .then(setState)
      .catch(() => {});
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { ...state, refetch };
}
