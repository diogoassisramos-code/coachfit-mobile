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
export function useTreinos(): {
  treinos: Treino[];
  loading: boolean;
  refetch: () => void;
} {
  const [treinos, setTreinos] = useState<Treino[]>(
    supabaseEnabled ? [] : mockTreinos
  );
  const [loading, setLoading] = useState(supabaseEnabled);

  // refetch pra reler ao focar a tela: quando o coach publica/edita treinos, o
  // app pega a versão nova sem precisar de reload manual.
  const refetch = useCallback(() => {
    if (!supabaseEnabled) return;
    fetchTreinos()
      .then((t) => setTreinos(t))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { treinos, loading, refetch };
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

export function useDieta(): {
  refeicoes: Refeicao[];
  loading: boolean;
  refetch: () => void;
} {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>(
    supabaseEnabled ? [] : mockRefeicoes
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) return;
    fetchRefeicoes()
      .then((r) => setRefeicoes(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { refeicoes, loading, refetch };
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
  refetch: () => void;
} {
  const [protocolo, setProtocolo] = useState<ProtocoloBloco[]>(
    supabaseEnabled ? [] : mockProtocolo
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) return;
    fetchProtocolo()
      .then((p) => setProtocolo(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { protocolo, loading, refetch };
}

// ── Check-in (envio do aluno) ───────────────────────────────────────────────

// O aluno_id não muda na sessão — cacheia pra não repetir a query do profile a
// cada leitura/envio (uma query a menos importa quando o banco está frio).
let cachedAlunoId: string | null = null;

/**
 * Limpa o aluno_id em cache. DEVE ser chamado no logout/troca de conta: sem
 * isso, o cache de módulo (que não é resetado num app nativo entre sessões)
 * faz o próximo usuário puxar os dados do anterior.
 */
export function clearAlunoCache(): void {
  cachedAlunoId = null;
}

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
    // Modo real: mostra só os check-ins DO aluno logado. Sem check-ins → lista
    // vazia (nunca cai no mock da Ana, que vazava pra quem ainda não tem envio).
    fetchMyCheckinsFull()
      .then((c) => setCheckins(c))
      .catch(() => setCheckins([]))
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

// ── Perfil + anamnese do aluno logado (dados REAIS, não o mock) ──────────────
export type PerguntaAnamnese = {
  id: string;
  ordem?: number;
  texto: string;
  tipo: "texto" | "numero" | "escolha" | "foto";
  obrigatoria: boolean;
  opcoes?: string[];
};

export type MeuPerfil = {
  nome: string;
  objetivo?: string;
  pesoAtual?: number;
  pesoInicial?: number;
  statusPagamento?: string;
  proximoVencimento?: string;
  consultoria?: string;
  consultor?: string;
  plano?: string;
  planoValor?: number;
  planoRecorrencia?: string;
  /** Dados parciais do cartão cadastrado na compra (só quando pagou no cartão). */
  cartao?: { final: string; bandeira?: string; titular?: string; validade?: string };
  /** "cartao" quando há cartão salvo; "pix" caso contrário. undefined se desconhecido. */
  metodo?: "cartao" | "pix";
  anamneseAtiva: boolean | null;
  anamneseRespondida: boolean;
  anamnesePerguntas: PerguntaAnamnese[];
  /** consultoria tem anamnese ativa e o aluno ainda não respondeu. */
  anamnesePendente: boolean;
};

/**
 * Contexto completo do aluno logado em 1 chamada (RPC meu_perfil, SECURITY
 * DEFINER — a RLS não deixaria o aluno ler consultoria/consultor/plano direto).
 */
export async function fetchMe(): Promise<MeuPerfil | null> {
  if (!supabase) return null;
  await supabase.auth.getSession();
  const { data, error } = await supabase.rpc("meu_perfil");
  if (!error && data) {
    const d = data as any;
    const ativa =
      d.anamnese_ativa === null || d.anamnese_ativa === undefined
        ? null
        : !!d.anamnese_ativa;
    const respondida = !!d.anamnese_respondida;
    return {
      nome: d.nome ?? "",
      objetivo: d.objetivo ?? undefined,
      pesoAtual: d.peso_atual != null ? Number(d.peso_atual) : undefined,
      pesoInicial: d.peso_inicial != null ? Number(d.peso_inicial) : undefined,
      statusPagamento: d.status_pagamento ?? undefined,
      proximoVencimento: d.proximo_vencimento ?? undefined,
      consultoria: d.consultoria ?? undefined,
      consultor: d.consultor ?? undefined,
      plano: d.plano ?? undefined,
      planoValor: d.plano_valor != null ? Number(d.plano_valor) : undefined,
      planoRecorrencia: d.plano_recorrencia ?? undefined,
      cartao: d.cartao_final
        ? {
            final: String(d.cartao_final),
            bandeira: d.cartao_bandeira ?? undefined,
            titular: d.cartao_titular ?? undefined,
            validade: d.cartao_validade ?? undefined,
          }
        : undefined,
      metodo: d.cartao_final ? "cartao" : "pix",
      anamneseAtiva: ativa,
      anamneseRespondida: respondida,
      anamnesePerguntas: Array.isArray(d.anamnese_perguntas)
        ? d.anamnese_perguntas
        : [],
      anamnesePendente: ativa === true && !respondida,
    };
  }

  // Fallback: se a RPC ainda não existe (migration schema_anamnese_rpc.sql não
  // rodou), lê ao menos a própria linha de alunos (RLS deixa) pra o nome/peso
  // não regredirem pro mock. Sem consultoria/consultor/anamnese até rodar a RPC.
  const alunoId = await getMyAlunoId();
  if (!alunoId) return null;
  const { data: a } = await supabase
    .from("alunos")
    .select(
      "nome, objetivo, peso_atual, peso_inicial, status_pagamento, proximo_vencimento, anamnese_respondida"
    )
    .eq("id", alunoId)
    .maybeSingle();
  if (!a) return null;
  const al = a as any;
  return {
    nome: al.nome ?? "",
    objetivo: al.objetivo ?? undefined,
    pesoAtual: al.peso_atual != null ? Number(al.peso_atual) : undefined,
    pesoInicial: al.peso_inicial != null ? Number(al.peso_inicial) : undefined,
    statusPagamento: al.status_pagamento ?? undefined,
    proximoVencimento: al.proximo_vencimento ?? undefined,
    consultoria: undefined,
    consultor: undefined,
    plano: undefined,
    anamneseAtiva: null,
    anamneseRespondida: !!al.anamnese_respondida,
    anamnesePerguntas: [],
    anamnesePendente: false,
  };
}

/**
 * Perfil do aluno logado (Supabase). null enquanto carrega / em modo mock.
 * `refetch` pra reler ao focar a tela (ex.: depois de responder a anamnese, pra
 * a home trocar o card de anamnese pelo de check-in).
 */
export function useMe(): {
  me: MeuPerfil | null;
  loading: boolean;
  refetch: () => void;
} {
  const [me, setMe] = useState<MeuPerfil | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) return;
    fetchMe()
      .then((m) => setMe(m))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { me, loading, refetch };
}

/** Envia as respostas da anamnese do aluno logado (RPC valida no servidor). */
export async function responderAnamnese(
  respostas: Record<string, string>
): Promise<void> {
  if (!supabase) throw new Error("sem supabase");
  await supabase.auth.getSession();
  const { error } = await supabase.rpc("responder_anamnese", {
    p_respostas: respostas,
  });
  if (error) throw error;
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

// ── Notificações ────────────────────────────────────────────────────────────
// Feed derivado de sinais reais (sem tabela dedicada): resposta do coach a
// check-ins, atualização de protocolo e pedido de check-in do consultor.
export type Notificacao = {
  id: string;
  tipo: "checkin" | "protocolo" | "pedido";
  titulo: string;
  descricao?: string;
  data: string; // "DD mmm"
  iso: string; // usado só pra ordenar
  href?: string; // rota ao tocar
};

const NOTIFS_MOCK: Notificacao[] = [
  {
    id: "m1",
    tipo: "checkin",
    titulo: "Seu coach respondeu seu check-in",
    descricao: "Semana 5: “Ótima semana! Atenção ao sono. Mantém a dieta.”",
    data: "13 jun",
    iso: "2026-06-13",
    href: "/perfil",
  },
  {
    id: "m2",
    tipo: "protocolo",
    titulo: "Você recebeu uma atualização de protocolo",
    descricao: "Confira os suplementos e extras atualizados.",
    data: "10 jun",
    iso: "2026-06-10",
    href: "/protocolo",
  },
];

export async function fetchNotificacoes(): Promise<Notificacao[]> {
  if (!supabase) return [];
  const alunoId = await getMyAlunoId();
  if (!alunoId) return [];
  const notifs: Notificacao[] = [];

  // Coach respondeu check-ins
  const { data: cks } = await supabase
    .from("checkins")
    .select("id,semana,status,resposta_coach,updated_at,enviado_em")
    .eq("aluno_id", alunoId)
    .eq("status", "respondido");
  (cks ?? []).forEach((c: any) => {
    if (!c.resposta_coach) return;
    notifs.push({
      id: "ck-" + c.id,
      tipo: "checkin",
      titulo: "Seu coach respondeu seu check-in",
      descricao: `Semana ${c.semana}: “${c.resposta_coach}”`,
      data: dataCurtaMobile(c.updated_at ?? c.enviado_em),
      iso: c.updated_at ?? c.enviado_em ?? "",
      href: `/checkins/${c.id}`,
    });
  });

  // Consultor pediu um check-in
  const { data: al } = await supabase
    .from("alunos")
    .select("checkin_solicitado,checkin_solicitado_em")
    .eq("id", alunoId)
    .maybeSingle();
  if (al?.checkin_solicitado) {
    notifs.push({
      id: "pedido",
      tipo: "pedido",
      titulo: "Seu coach pediu um novo check-in",
      descricao: "Toque para registrar o check-in da semana.",
      data: dataCurtaMobile(al.checkin_solicitado_em ?? ""),
      iso: al.checkin_solicitado_em ?? "",
      href: "/checkin",
    });
  }

  // Atualização de protocolo
  const { data: proto } = await supabase
    .from("protocolos")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (proto) {
    notifs.push({
      id: "proto",
      tipo: "protocolo",
      titulo: "Você recebeu uma atualização de protocolo",
      descricao: "Confira os suplementos e extras atualizados.",
      data: dataCurtaMobile(proto.updated_at ?? ""),
      iso: proto.updated_at ?? "",
      href: "/protocolo",
    });
  }

  return notifs.sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0));
}

/** Feed de notificações do aluno. Dados reais quando há; senão, mock. */
export function useNotificacoes(): {
  notificacoes: Notificacao[];
  loading: boolean;
  refetch: () => void;
} {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(
    supabaseEnabled ? [] : NOTIFS_MOCK
  );
  const [loading, setLoading] = useState(supabaseEnabled);
  const refetch = useCallback(() => {
    if (!supabaseEnabled) {
      setNotificacoes(NOTIFS_MOCK);
      setLoading(false);
      return;
    }
    // Modo real: notificações derivam de sinais reais do aluno. Sem sinais →
    // vazio (não mostra as notificações mock da Ana).
    fetchNotificacoes()
      .then((n) => setNotificacoes(n))
      .catch(() => setNotificacoes([]))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { notificacoes, loading, refetch };
}
