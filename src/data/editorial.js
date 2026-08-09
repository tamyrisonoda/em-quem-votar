// src/data/editorial.js
//
// CAMADA EDITORIAL — dados que o TSE NÃO fornece e que exigem curadoria humana
// com fonte. Isto é separado dos fatos oficiais (que vêm do TSE em
// candidates.generated.json) justamente para manter a neutralidade e a
// rastreabilidade: aqui é opinião/análise, e deve ser sempre acompanhada de
// fonte.
//
// Como preencher:
//   - A chave de cada entrada é o `id` do candidato no TSE (veja o campo "id"
//     em src/data/candidates.generated.json), ou o número do candidato — use o
//     formato que preferir e ajuste o merge em scripts/fetch-tse.mjs.
//   - `ideology`: um de "Esquerda" | "Centro-esquerda" | "Centro" |
//     "Centro-direita" | "Direita". NÃO é classificação oficial do TSE; baseie
//     em fonte citável (literatura de ciência política, etc.) e registre em
//     `sources`.
//   - `positions`: posição do candidato de 1 (totalmente contra) a 5
//     (totalmente a favor) em cada tema do quiz — economia, estado, seguranca,
//     meioAmbiente, educacao. Derive do plano de governo (disponível no TSE a
//     partir de 15/08) e de fontes jornalísticas, e cite em `sources`.
//   - `proposals`: lista de { theme, text } (temas: saude, educacao, economia,
//     meioAmbiente, seguranca, habitacao, transporte). O plano de governo
//     oficial sai dia 15/08.
//   - `sources`: lista de URLs/descrições que embasam a curadoria acima.
//
// Enquanto uma entrada não existir (ou não tiver `positions`), o candidato
// aparece normalmente na lista/perfil com os dados oficiais, mas fica marcado
// como "ainda não avaliado" no quiz — nunca com uma posição inventada.
//
// @typedef {Object} EditorialEntry
// @property {"Esquerda"|"Centro-esquerda"|"Centro"|"Centro-direita"|"Direita"} [ideology]
// @property {{economia?:number, estado?:number, seguranca?:number, meioAmbiente?:number, educacao?:number}} [positions]
// @property {{theme:string, text:string}[]} [proposals]
// @property {string[]} [sources]

/**
 * Curadoria editorial por id de candidato do TSE.
 * Comece vazio e vá preenchendo conforme apura, sempre com fonte.
 *
 * Exemplo (comentado — troque o id por um real de candidates.generated.json):
 *
 * '280002542548': {
 *   ideology: 'Centro-esquerda',
 *   positions: { economia: 2, estado: 4, seguranca: 3, meioAmbiente: 4, educacao: 5 },
 *   proposals: [
 *     { theme: 'saude', text: 'Fortalecer o SUS com ...' },
 *   ],
 *   sources: [
 *     'https://.../plano-de-governo.pdf',
 *     'https://.../reportagem-sobre-posicoes',
 *   ],
 * },
 *
 * @type {Object.<string, EditorialEntry>}
 */
export const editorialByCandidateId = {
  // (vazio por enquanto — preencha aqui)
};

export default editorialByCandidateId;
