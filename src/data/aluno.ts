/**
 * Dados mock do ALUNO logado (o usuário do app).
 * Representa o que o consultor enviou: treino, dieta, protocolo e o histórico
 * de check-ins. Espelha o modelo do dashboard do consultor.
 */

export type Macros = { kcal: number; p: number; c: number; g: number };

export type Exercicio = {
  id: string;
  nome: string;
  grupo: string;
  series: number;
  reps: string;
  descansoSeg: number;
  video: boolean;
  observacoes?: string;
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
};

export type ProtocoloBloco = { id: string; nome: string; itens: ProtocoloItem[] };

export type CheckIn = {
  id: string;
  semana: number;
  data: string;
  peso: number;
  status: "respondido" | "aguardando";
  respostaCoach?: string;
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

export const treinos: Treino[] = [
  {
    id: "tA",
    nome: "Treino A — Superiores",
    diaSemana: "Hoje",
    exercicios: [
      { id: "e1", nome: "Supino reto com barra", grupo: "Peito", series: 4, reps: "8-10", descansoSeg: 90, video: true, observacoes: "Desça controlado (2s na excêntrica) até tocar o peito. Cotovelos a ~45°.", ultimaCarga: "40 kg" },
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
      { id: "e6", nome: "Agachamento livre", grupo: "Pernas", series: 4, reps: "8-10", descansoSeg: 120, video: true, ultimaCarga: "50 kg" },
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
      { id: "pi1", nome: "Creatina monohidratada", dose: "5 g", horario: "Diário", observacoes: "Pode dissolver no shake ou na água. Todos os dias, inclusive sem treino." },
      { id: "pi2", nome: "Whey protein", dose: "30 g", horario: "Pós-treino", observacoes: "Bater com 250ml de água." },
      { id: "pi3", nome: "Cafeína", dose: "200 mg", horario: "30 min antes do treino", observacoes: "Evitar após as 17h." },
    ],
  },
  {
    id: "pb2",
    nome: "Vitaminas",
    itens: [
      { id: "pi4", nome: "Vitamina D3", dose: "2.000 UI", horario: "Café da manhã", observacoes: "Tomar junto de uma refeição com gordura." },
      { id: "pi5", nome: "Ômega 3", dose: "2 cápsulas", horario: "Almoço" },
    ],
  },
];

export const checkins: CheckIn[] = [
  { id: "c6", semana: 6, data: "20 jun", peso: 60.4, status: "aguardando" },
  { id: "c5", semana: 5, data: "13 jun", peso: 60.7, status: "respondido", respostaCoach: "Ótima semana! Atenção ao sono. Mantém a dieta." },
  { id: "c4", semana: 4, data: "06 jun", peso: 61.0, status: "respondido", respostaCoach: "Excelente evolução." },
  { id: "c3", semana: 3, data: "30 mai", peso: 61.3, status: "respondido", respostaCoach: "Sem problema, foco na semana." },
  { id: "c2", semana: 2, data: "23 mai", peso: 61.6, status: "respondido", respostaCoach: "Mandou bem, segue assim." },
  { id: "c1", semana: 1, data: "16 mai", peso: 62.0, status: "respondido", respostaCoach: "Bom começo! Vamos ajustar o volume." },
];

export function totalKcal(): number {
  return refeicoes.reduce(
    (s, r) => s + r.alimentos.reduce((x, a) => x + a.macros.kcal, 0),
    0
  );
}
