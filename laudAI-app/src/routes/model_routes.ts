const API_URL = import.meta.env.VITE_API_URL;
 
export interface AnalyzeTextRequest {
  role: string;
  report: string;
}
 
// Chaves de critério fixas (c1 a c5), seguindo o exemplo de resposta do modelo.
// Ajuste a união abaixo caso a quantidade de critérios seja variável/dinâmica.
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
 
export async function analyzeText(
  data: AnalyzeTextRequest
): Promise<AnalyzeTextResponse> {
  const response = await fetch(`${API_URL}/agent/full/analyze/text`, {
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
 
      const status = atendido ? "✅ Atendido" : "❌ Não atendido";
 
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
    sum: sum,
    feedback: feedbackText,
  };
}