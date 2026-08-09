// src/data/dataSource.js
//
// Seletor da fonte de candidatos usada pelo app.
//
// - Fonte DEMONSTRATIVA (padrão): dados fictícios de `candidates.js`, usados
//   enquanto o quiz depende de posições curadas que ainda não existem.
// - Fonte TSE (real): dados oficiais de `candidates.generated.json` (gerados
//   por `npm run fetch:tse`), já mesclados com a curadoria de `editorial.js`.
//
// Como VIRAR para os dados reais (após 15/08, com ideologia/posições curadas):
//   1. rode `npm run fetch:tse` para atualizar candidates.generated.json;
//   2. mude USE_TSE_DATA para `true` aqui;
//   3. ajuste o selo de neutralidade (DemonstrativeLabel) para a atribuição do
//      TSE e revise os textos — ver o guia no README.
//
// Manter o interruptor isolado aqui garante que a virada seja uma mudança de
// uma linha, sem tocar nas páginas.

import { candidates as demoCandidates } from './candidates.js';
import generatedCandidates from './candidates.generated.json';

/**
 * Vire para `true` quando os dados reais estiverem prontos para publicação
 * (candidatos deferidos + curadoria editorial de ideologia/posições).
 * @type {boolean}
 */
export const USE_TSE_DATA = true;

/** Indica se há dados reais disponíveis no arquivo gerado. */
export const hasGeneratedData =
  Array.isArray(generatedCandidates) && generatedCandidates.length > 0;

/**
 * A lista de candidatos efetivamente usada pelo Data_Provider.
 * @type {import('./candidates.js').Candidate[]}
 */
export const candidates =
  USE_TSE_DATA && hasGeneratedData ? generatedCandidates : demoCandidates;

export default candidates;
