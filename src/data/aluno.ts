/**
 * Dados mock do ALUNO logado (o usuário do app).
 * Representa o que o consultor enviou: treino, dieta, protocolo e o histórico
 * de check-ins. Espelha o modelo do dashboard do consultor.
 */

export type Macros = { kcal: number; p: number; c: number; g: number };

/** Detalhe de uma série específica (aquecimento, válida, top-set, drop…). */
export type SerieSpec = {
  rotulo: string; // "Aquecimento", "Válida", "Top set", "Back-off"…
  reps: string;
  descansoSeg: number;
  obs?: string; // orientação específica daquela série
};

export type Exercicio = {
  id: string;
  nome: string;
  grupo: string;
  series: number;
  reps: string;
  descansoSeg: number;
  video: boolean;
  observacoes?: string;
  /**
   * Detalhamento série-a-série (opcional). Quando presente, descreve cada série
   * com reps/descanso/orientação próprios; senão usa series/reps/descansoSeg.
   */
  seriesDetalhe?: SerieSpec[];
  /** Carga registrada pelo aluno na última vez (kg). */
  ultimaCarga?: string;
};

export type Treino = {
  id: string;
  nome: string;
  diaSemana: string;
  exercicios: Exercicio[];
};

export type Alimento = {
  id: string;
  nome: string;
  quantidade: string;
  macros: Macros;
  substituicoes: string[];
  observacoes?: string;
};

export type Refeicao = {
  id: string;
  nome: string;
  horario: string;
  alimentos: Alimento[];
  observacoes?: string;
};

export type ProtocoloItem = {
  id: string;
  nome: string;
  dose: string;
  horario: string;
  observacoes?: string;
  /** Detalhamento de uso — como o coach orientou a usar o item. */
  comoUsar?: string; // instrução completa de uso
  comOQue?: string; // "250 ml de água", "refeição com gordura"…
  beneficio?: string; // pra que serve
  duracao?: string; // "Contínuo", "Só em dias de treino", "8 semanas"…
};

export type ProtocoloBloco = { id: string; nome: string; itens: ProtocoloItem[] };

export type FotoCheckin = { angulo: string; url?: string };

export type CheckIn = {
  id: string;
  semana: number;
  data: string;
  peso: number;
  status: "respondido" | "aguardando";
  respostaCoach?: string;
  /** O que o aluno registrou no check-in (presente nos já enviados). */
  fotos?: FotoCheckin[];
  energia?: number; // 1–5
  sono?: number; // 1–5
  dietaNota?: number; // 1–5 (adesão à dieta na semana)
  comentario?: string;
};

export const aluno = {
  nome: "Ana Paula Souza",
  objetivo: "Hipertrofia",
  consultor: "Rafael Mendes",
  consultoria: "CoachFit",
  plano: "Consultoria Online Mensal",
  pesoAtual: 60.4,
  pesoInicial: 62.0,
  aderencia: 92,
  proximoCheckin: "Segunda, 23 jun",
  proximoVencimento: "28 jun 2026",
  statusPagamento: "em_dia" as "em_dia" | "pendente" | "atrasado",
};

/** Forma de pagamento da assinatura: cartão de crédito recorrente ou Pix. */
export type MetodoPagamento = "cartao" | "pix";

export type Cartao = {
  bandeira: string; // "Visa", "Mastercard"…
  final: string; // últimos 4 dígitos
  validade: string; // "MM/AA"
  nome: string; // nome impresso
};

/**
 * Dados da cobrança/assinatura do aluno. `metodo` é o estado inicial — a tela
 * de pagamento permite trocar entre cartão e Pix (estado efêmero, sem backend).
 */
export const pagamento = {
  valor: "R$ 199,00",
  recorrencia: "Mensal",
  metodo: "cartao" as MetodoPagamento,
  cartao: {
    bandeira: "Visa",
    final: "4242",
    validade: "12/27",
    nome: "ANA P SOUZA",
  } as Cartao,
};

export const treinos: Treino[] = [
  {
    id: "tA",
    nome: "Treino A — Superiores",
    diaSemana: "Hoje",
    exercicios: [
      { id: "e1", nome: "Supino reto com barra", grupo: "Peito", series: 4, reps: "8-10", descansoSeg: 90, video: true, observacoes: "Desça controlado (2s na excêntrica) até tocar o peito. Cotovelos a ~45°.", ultimaCarga: "40 kg", seriesDetalhe: [
        { rotulo: "Aquecimento", reps: "12", descansoSeg: 30, obs: "Carga leve, só pra ativar o peito." },
        { rotulo: "Válida", reps: "8-10", descansoSeg: 90 },
        { rotulo: "Válida", reps: "8-10", descansoSeg: 90 },
        { rotulo: "Top set", reps: "6-8", descansoSeg: 120, obs: "Pode subir a carga. Leve até a falha técnica." },
      ] },
      { id: "e2", nome: "Crucifixo com halteres", grupo: "Peito", series: 3, reps: "10-12", descansoSeg: 60, video: true, ultimaCarga: "12 kg" },
      { id: "e3", nome: "Puxada frontal", grupo: "Costas", series: 4, reps: "10-12", descansoSeg: 75, video: true, ultimaCarga: "45 kg" },
      { id: "e4", nome: "Remada curvada", grupo: "Costas", series: 3, reps: "8-10", descansoSeg: 90, video: false, ultimaCarga: "30 kg" },
      { id: "e5", nome: "Desenvolvimento militar", grupo: "Ombros", series: 3, reps: "10-12", descansoSeg: 60, video: true, ultimaCarga: "20 kg" },
    ],
  },
  {
    id: "tB",
    nome: "Treino B — Inferiores",
    diaSemana: "Quarta",
    exercicios: [
      { id: "e6", nome: "Agachamento livre", grupo: "Pernas", series: 4, reps: "8-10", descansoSeg: 120, video: true, ultimaCarga: "50 kg", seriesDetalhe: [
        { rotulo: "Aquecimento", reps: "10-12", descansoSeg: 30 },
        { rotulo: "Aquecimento", reps: "8-10", descansoSeg: 45 },
        { rotulo: "Válida", reps: "6-8", descansoSeg: 120, obs: "Profundidade total, controle de 2s na descida." },
        { rotulo: "Válida", reps: "6-8", descansoSeg: 120 },
      ] },
      { id: "e7", nome: "Leg press 45°", grupo: "Pernas", series: 4, reps: "12-15", descansoSeg: 90, video: true, ultimaCarga: "120 kg" },
      { id: "e8", nome: "Cadeira flexora", grupo: "Posterior", series: 3, reps: "12-15", descansoSeg: 60, video: true, ultimaCarga: "35 kg" },
    ],
  },
];

export const metaKcal = 2200;

export const refeicoes: Refeicao[] = [
  {
    id: "r1",
    nome: "Café da manhã",
    horario: "07:30",
    observacoes: "Faça em até 1h após acordar. Beba 1 copo de água antes.",
    alimentos: [
      { id: "a1", nome: "Ovos mexidos", quantidade: "3 unid", macros: { kcal: 234, p: 18, c: 2, g: 16 }, substituicoes: ["Omelete", "Ovos cozidos"], observacoes: "Em frigideira antiaderente, sem óleo." },
      { id: "a2", nome: "Pão integral", quantidade: "2 fatias", macros: { kcal: 160, p: 8, c: 28, g: 2 }, substituicoes: ["Tapioca", "Aveia"] },
      { id: "a3", nome: "Banana", quantidade: "1 unid", macros: { kcal: 105, p: 1, c: 27, g: 0 }, substituicoes: ["Maçã", "Mamão"] },
    ],
  },
  {
    id: "r2",
    nome: "Almoço",
    horario: "12:30",
    alimentos: [
      { id: "a4", nome: "Peito de frango grelhado", quantidade: "150 g", macros: { kcal: 248, p: 46, c: 0, g: 5 }, substituicoes: ["Patinho moído", "Tilápia"] },
      { id: "a5", nome: "Arroz branco", quantidade: "120 g", macros: { kcal: 156, p: 3, c: 34, g: 0 }, substituicoes: ["Arroz integral", "Batata doce"] },
      { id: "a6", nome: "Feijão preto", quantidade: "80 g", macros: { kcal: 62, p: 5, c: 11, g: 0 }, substituicoes: ["Lentilha", "Grão de bico"] },
    ],
  },
  {
    id: "r3",
    nome: "Pós-treino",
    horario: "18:00",
    alimentos: [
      { id: "a7", nome: "Whey protein", quantidade: "30 g", macros: { kcal: 120, p: 24, c: 3, g: 1 }, substituicoes: ["Albumina"] },
    ],
  },
];

export const protocolo: ProtocoloBloco[] = [
  {
    id: "pb1",
    nome: "Suplementos",
    itens: [
      { id: "pi1", nome: "Creatina monohidratada", dose: "5 g", horario: "Diário", comoUsar: "Tome todos os dias, inclusive nos dias sem treino — o efeito é por saturação (acumula no músculo), não imediato. Horário não importa.", comOQue: "Água ou shake", beneficio: "Aumenta força e volume; melhora a recuperação entre as séries.", duracao: "Contínuo" },
      { id: "pi2", nome: "Whey protein", dose: "30 g", horario: "Pós-treino", comoUsar: "Logo após o treino. Se for sua maior dificuldade, pode usar também pra bater a meta de proteína em outro horário do dia.", comOQue: "250 ml de água", beneficio: "Completa a proteína do dia e acelera a recuperação muscular.", duracao: "Contínuo" },
      { id: "pi3", nome: "Cafeína", dose: "200 mg", horario: "30 min antes do treino", comoUsar: "Tome 30 min antes de treinar. Se for sensível, comece com metade da dose pra avaliar tolerância.", comOQue: "Água", beneficio: "Mais foco e energia; reduz a percepção de esforço no treino.", duracao: "Só nos dias de treino", observacoes: "Evite após as 17h pra não atrapalhar o sono." },
    ],
  },
  {
    id: "pb2",
    nome: "Vitaminas",
    itens: [
      { id: "pi4", nome: "Vitamina D3", dose: "2.000 UI", horario: "Café da manhã", comoUsar: "Tome no café da manhã, junto de uma refeição que tenha gordura — melhora bastante a absorção.", comOQue: "Refeição com gordura", beneficio: "Saúde óssea, imunidade e regulação do humor.", duracao: "Contínuo" },
      { id: "pi5", nome: "Ômega 3", dose: "2 cápsulas", horario: "Almoço", comoUsar: "2 cápsulas no almoço, junto da refeição.", comOQue: "Refeição", beneficio: "Anti-inflamatório; saúde cardiovascular e das articulações.", duracao: "Contínuo" },
    ],
  },
];

const ANGULOS = ["Frente", "Lado", "Costas"];
const fotos = (n = 3): FotoCheckin[] =>
  ANGULOS.slice(0, n).map((angulo) => ({ angulo }));

export const checkins: CheckIn[] = [
  { id: "c6", semana: 6, data: "20 jun", peso: 60.4, status: "aguardando" },
  {
    id: "c5",
    semana: 5,
    data: "13 jun",
    peso: 60.7,
    status: "respondido",
    respostaCoach: "Ótima semana! Atenção ao sono. Mantém a dieta.",
    fotos: fotos(),
    energia: 4,
    sono: 2,
    dietaNota: 5,
    comentario:
      "Semana boa de treino, energia ok. Dormi mal na quarta e quinta por causa do trabalho, mas a dieta consegui seguir 100%.",
  },
  {
    id: "c4",
    semana: 4,
    data: "06 jun",
    peso: 61.0,
    status: "respondido",
    respostaCoach: "Excelente evolução.",
    fotos: fotos(),
    energia: 5,
    sono: 4,
    dietaNota: 4,
    comentario: "Me senti muito bem essa semana, treinos pesados e disposição alta.",
  },
  {
    id: "c3",
    semana: 3,
    data: "30 mai",
    peso: 61.3,
    status: "respondido",
    respostaCoach: "Sem problema, foco na semana.",
    fotos: fotos(2),
    energia: 3,
    sono: 3,
    dietaNota: 3,
    comentario: "Semana corrida, escapei da dieta no fim de semana.",
  },
  {
    id: "c2",
    semana: 2,
    data: "23 mai",
    peso: 61.6,
    status: "respondido",
    respostaCoach: "Mandou bem, segue assim.",
    fotos: fotos(),
    energia: 4,
    sono: 4,
    dietaNota: 4,
    comentario: "Adaptando à rotina, mas curtindo os treinos.",
  },
  {
    id: "c1",
    semana: 1,
    data: "16 mai",
    peso: 62.0,
    status: "respondido",
    respostaCoach: "Bom começo! Vamos ajustar o volume.",
    fotos: fotos(),
    energia: 3,
    sono: 3,
    dietaNota: 4,
    comentario: "Primeira semana, ainda pegando o jeito dos exercícios.",
  },
];

export const getCheckin = (id: string) => checkins.find((c) => c.id === id);

export function totalKcal(): number {
  return refeicoes.reduce(
    (s, r) => s + r.alimentos.reduce((x, a) => x + a.macros.kcal, 0),
    0
  );
}
