import { apiFetch } from '../services/api'

const API_URL = import.meta.env.VITE_API_URL;

export interface AnalyzeTextRequest {
  role: string;
  report: string;
}

export type CriterionKey = "c1" | "c2" | "c3" | "c4" | "c5";

export interface Feedback {
  extracao: Record<CriterionKey, string>;
  avaliacao: Record<CriterionKey, string>;
  notas: Record<CriterionKey, number>;
}

export interface AnalyzeTextResponse {  
  role: string;
  thinking: string;
  feedback: Feedback;
}

export interface ChatRequest {
  role: string;
  prompt: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  laudo_text: string;
}

export interface ChatResponse {
  role: string;
  response: string;
  thinking: string | null;
}

export async function sendChatMessage(
  data: ChatRequest,
  token: string,
): Promise<ChatResponse> {
  const response = await apiFetch(`${API_URL}/agent/message`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(
      `Erro ao enviar mensagem: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export async function analyzeText(
  data: AnalyzeTextRequest,
  token: string,
): Promise<AnalyzeTextResponse> {
  const response = await apiFetch(`${API_URL}/agent/full/analyze/text`, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao analisar texto: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Pós-processamento da resposta do modelo para exibição ao usuário
// ---------------------------------------------------------------------------

export interface ModelAnalyzeResult {
  sum: number;
  feedback: string;
}

/**
 * Mapa de rótulos amigáveis para cada critério. Ajuste os textos conforme
 * o significado real de cada c1..c5 no seu domínio.
 */
const CRITERION_LABELS: Record<CriterionKey, string> = {
  c1: "Avaliação global da estrutura óssea",
  c2: "Avaliação global dos pulmões",
  c3: "Avaliação dos seios costofrênicos",
  c4: "Índice cardiotorácico (ICT)",
  c5: "Avaliação do mediastino",
};

/**
 * Recebe a resposta completa do modelo (analyzeText) e gera:
 * - sum: soma das notas dos critérios (quantos foram atendidos)
 * - feedback: texto corrido, legível, combinando extração + avaliação
 *   de cada critério, pronto para ser exibido ao usuário.
 */
export function handleModelAnalyze(
  response: AnalyzeTextResponse
): ModelAnalyzeResult {
  const { feedback } = response;
  const { extracao, avaliacao, notas } = feedback;

  const criterionKeys = Object.keys(notas) as CriterionKey[];

  const sum = criterionKeys.reduce((total, key) => total + (notas[key] ?? 0), 0);

  const total = criterionKeys.length;

  const introducao =
    `A análise do laudo identificou ${sum} de ${total} critério(s) atendido(s).`;

  const detalhes = criterionKeys
    .map((key) => {
      const label = CRITERION_LABELS[key] ?? key;
      const trecho = extracao[key];
      const analise = avaliacao[key];
      const atendido = notas[key] === 1;

      const status = atendido ? "✅ Atendido" : "🟠 Parcialmente atendido";

      return (
        `• ${label} (${status})\n` +
        `   Trecho identificado: "${trecho}"\n` +
        `   Avaliação: ${analise}`
      );
    })
    .join("\n\n");

  const conclusao =
    sum === total
      ? "O laudo atendeu a todos os critérios avaliados, indicando um relatório completo segundo os parâmetros analisados."
      : sum === 0
      ? "O laudo não atendeu a nenhum dos critérios avaliados. Recomenda-se revisão do relatório."
      : "O laudo atendeu parcialmente aos critérios avaliados. Confira abaixo os pontos que podem ser revisados.";

  const feedbackText = `${introducao}\n\n${detalhes}\n\n${conclusao}`;

  return {
    sum,
    feedback: feedbackText,
  };
}

/**
 * Monta a mensagem final exibida ao usuário no chat:
 * "Nota: N⭐⭐⭐" seguido do texto de feedback.
 *
 * @param result   Retorno de handleModelAnalyze (sum + feedback)
 * @param total    Total de critérios avaliados (default: 5, equivalente a c1..c5)
 */
export function formatAnalyzeMessage(
  result: ModelAnalyzeResult,
  total: number = 5
): string {
  const { sum, feedback } = result;

  const filled = "⭐".repeat(Math.max(0, Math.min(sum, total)));
  const empty = "☆".repeat(Math.max(0, total - sum));

  const notaLine = `**Nota: ${sum}/${total}** ${filled}${empty}`;

  return `${notaLine}\n\n${feedback}`;
}