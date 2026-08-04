/**
 * Data_Store — themes and states (fictional/demonstrative data for the MVP).
 *
 * Named exports:
 *  - proposalThemes: Theme[] used to organize candidate proposals (Req 6.1)
 *  - quizThemes:     Theme[] covered by the affinity quiz (Req 9.2, 11.3)
 *  - states:         StateOption[] selectable states for Governador (Req 2.2, 2.3)
 *
 * Consumed by the Data_Provider (dataProvider.js). Adding a state here requires
 * no page changes, satisfying Req 2.3.
 *
 * @typedef {Object} Theme
 * @property {string} id     - stable key, e.g. "economia"
 * @property {string} label  - display name, e.g. "Economia"
 *
 * @typedef {Object} StateOption
 * @property {string} uf    - two-letter code, e.g. "SP"
 * @property {string} name  - full name, e.g. "São Paulo"
 */

/**
 * Themes used to group candidate proposals (Req 6.1).
 * @type {Theme[]}
 */
export const proposalThemes = [
  { id: 'saude', label: 'Saúde' },
  { id: 'educacao', label: 'Educação' },
  { id: 'economia', label: 'Economia' },
  { id: 'meioAmbiente', label: 'Meio Ambiente' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'habitacao', label: 'Habitação' },
  { id: 'transporte', label: 'Transporte' },
];

/**
 * Themes covered by the affinity quiz (Req 9.2, 11.3).
 * These ids match the keys of each Candidate's `positions` field.
 * @type {Theme[]}
 */
export const quizThemes = [
  { id: 'economia', label: 'Economia' },
  { id: 'estado', label: 'Papel do Estado' },
  { id: 'seguranca', label: 'Segurança Pública' },
  { id: 'meioAmbiente', label: 'Meio Ambiente' },
  { id: 'educacao', label: 'Educação' },
];

/**
 * Selectable Brazilian states for Governador scoping (Req 2.2, 2.3).
 * Additional states can be appended here without changing any page component.
 * @type {StateOption[]}
 */
export const states = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];
