/**
 * Data_Store — objective quiz questions (fictional/demonstrative data for the MVP).
 *
 * Named export:
 *  - questions: Question[] answered during the affinity quiz (Req 10.1, 9.2, 11.1)
 *
 * Consumed by the Data_Provider (dataProvider.js) and the quiz pages. Each
 * question's `theme` matches a quiz theme id in topics.js (`quizThemes`) so the
 * Affinity_Engine can align user answers with each candidate's `positions` keys:
 * economia, estado, seguranca, meioAmbiente, educacao.
 *
 * Questions are objective and neutral: no persuasive language, no party
 * references, and only demonstrative topics. Each question offers a 5-point
 * Likert option set whose `value` spans the shared 1..5 scale
 * (1 = strongly against, 5 = strongly in favor).
 *
 * @typedef {Object} AnswerOption
 * @property {string} id      - option key, e.g. "opt-1"
 * @property {string} label   - display text
 * @property {number} value   - position on the 1..5 scale
 *
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} theme        - quiz Theme id (see quizThemes in topics.js)
 * @property {string} text         - question prompt
 * @property {AnswerOption[]} options
 */

/**
 * A standard 5-point Likert option set covering the full 1..5 scale.
 * A fresh array is built per question so options are never shared by reference.
 * @param {string} questionId - used to namespace option ids
 * @returns {AnswerOption[]}
 */
function likertOptions(questionId) {
  return [
    { id: `${questionId}-opt-1`, label: 'Discordo totalmente', value: 1 },
    { id: `${questionId}-opt-2`, label: 'Discordo', value: 2 },
    { id: `${questionId}-opt-3`, label: 'Neutro', value: 3 },
    { id: `${questionId}-opt-4`, label: 'Concordo', value: 4 },
    { id: `${questionId}-opt-5`, label: 'Concordo totalmente', value: 5 },
  ];
}

/**
 * Objective quiz questions covering all five quiz themes (two per theme).
 * @type {Question[]}
 */
export const questions = [
  // Economia
  {
    id: 'q-economia-1',
    theme: 'economia',
    text: 'O Estado deve reduzir sua participação na economia e ampliar o espaço da iniciativa privada.',
    options: likertOptions('q-economia-1'),
  },
  {
    id: 'q-economia-2',
    theme: 'economia',
    text: 'A carga tributária sobre empresas deve ser reduzida para estimular o investimento privado.',
    options: likertOptions('q-economia-2'),
  },

  // Papel do Estado
  {
    id: 'q-estado-1',
    theme: 'estado',
    text: 'Serviços públicos essenciais devem ser prestados diretamente pelo Estado, e não delegados a empresas privadas.',
    options: likertOptions('q-estado-1'),
  },
  {
    id: 'q-estado-2',
    theme: 'estado',
    text: 'Programas sociais financiados pelo Estado devem ser ampliados para reduzir desigualdades.',
    options: likertOptions('q-estado-2'),
  },

  // Segurança Pública
  {
    id: 'q-seguranca-1',
    theme: 'seguranca',
    text: 'O endurecimento das penas é um caminho eficaz para reduzir a criminalidade.',
    options: likertOptions('q-seguranca-1'),
  },
  {
    id: 'q-seguranca-2',
    theme: 'seguranca',
    text: 'O investimento em políticas de prevenção deve ter prioridade sobre o aumento do efetivo policial.',
    options: likertOptions('q-seguranca-2'),
  },

  // Meio Ambiente
  {
    id: 'q-meioAmbiente-1',
    theme: 'meioAmbiente',
    text: 'A proteção ambiental deve prevalecer mesmo quando implica limites à atividade econômica.',
    options: likertOptions('q-meioAmbiente-1'),
  },
  {
    id: 'q-meioAmbiente-2',
    theme: 'meioAmbiente',
    text: 'O poder público deve incentivar fontes de energia renovável com recursos próprios.',
    options: likertOptions('q-meioAmbiente-2'),
  },

  // Educação
  {
    id: 'q-educacao-1',
    theme: 'educacao',
    text: 'O financiamento da educação pública deve ser ampliado, ainda que exija aumento de gastos do Estado.',
    options: likertOptions('q-educacao-1'),
  },
  {
    id: 'q-educacao-2',
    theme: 'educacao',
    text: 'A gestão de escolas pode ser compartilhada com organizações privadas para melhorar resultados.',
    options: likertOptions('q-educacao-2'),
  },
];
