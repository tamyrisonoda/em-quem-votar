/**
 * Data_Store — fictional candidate records (demonstrative data for the MVP).
 *
 * ALL DATA IS FICTIONAL. Names, parties, electoral numbers, biographies,
 * finances, and history are entirely invented for demonstration purposes and
 * do not represent any real person, party, or organization
 * ("Dados demonstrativos para o MVP", Req 13.6).
 *
 * Named export:
 *  - candidates: Candidate[] — at least five fictional records (Req 13.1)
 *
 * Consumed by the Data_Provider (dataProvider.js, Req 13.5). Each record follows
 * the Candidate schema (Req 13.2, 13.3, 13.4):
 *
 * @typedef {Object} EducationEntry
 * @property {string} graduacao
 * @property {string} universidade
 * @property {number} ano
 *
 * @typedef {Object} Proposal
 * @property {string} theme   - proposal Theme id (see topics.js proposalThemes)
 * @property {string} text
 *
 * @typedef {Object} FinanceSource
 * @property {string} category
 * @property {number} percentage - 0..100
 *
 * @typedef {Object} Finances
 * @property {number} total          - total raised, in millions (R$ mi)
 * @property {FinanceSource[]} sources
 *
 * @typedef {Object} HistoryEntry
 * @property {number} year
 * @property {string} event
 *
 * @typedef {Object} Positions
 * @property {number} economia      - 1..5 position weight
 * @property {number} estado        - 1..5
 * @property {number} seguranca     - 1..5
 * @property {number} meioAmbiente  - 1..5
 * @property {number} educacao      - 1..5
 *
 * @typedef {Object} Candidate
 * @property {string} id
 * @property {string} name
 * @property {string} number        - electoral number (string)
 * @property {string} party
 * @property {"Presidente da República"|"Governador"} position
 * @property {string|null} state    - UF for Governador, null for Presidente
 * @property {"Esquerda"|"Centro-esquerda"|"Centro"|"Centro-direita"|"Direita"} ideology
 * @property {string} photo
 * @property {string} bio
 * @property {EducationEntry[]} education
 * @property {Proposal[]} proposals
 * @property {Finances} finances
 * @property {HistoryEntry[]} history
 * @property {Positions} positions
 */

/**
 * Fictional candidate records for the MVP.
 * Includes 5 Presidente (state null) candidates spanning the ideology spectrum
 * and 4 Governador candidates (2 in SP, 2 in RJ) so state-scoped lists show
 * multiple options.
 * @type {Candidate[]}
 */
export const candidates = [
  // ---------------------------------------------------------------------------
  // Presidente da República
  // ---------------------------------------------------------------------------
  {
    id: 'pres-aurora-vidal',
    name: 'Aurora Vidal',
    number: '10',
    party: 'PMS',
    position: 'Presidente da República',
    state: null,
    ideology: 'Esquerda',
    photo: 'https://placehold.co/400x400?text=Aurora+Vidal',
    bio: 'Educadora e ex-secretária municipal de assistência social, Aurora Vidal construiu sua trajetória em movimentos comunitários do interior. Defende políticas públicas voltadas à redução da desigualdade e à ampliação do acesso a serviços essenciais.',
    education: [
      { graduacao: 'Pedagogia', universidade: 'Universidade Central do Vale', ano: 1998 },
      { graduacao: 'Mestrado em Políticas Públicas', universidade: 'Instituto Norte de Ensino', ano: 2005 },
    ],
    proposals: [
      { theme: 'saude', text: 'Ampliar a rede de atenção básica com novas unidades em regiões desassistidas.' },
      { theme: 'educacao', text: 'Instituir programa nacional de bolsas integrais para o ensino técnico.' },
      { theme: 'habitacao', text: 'Criar linha de moradia popular com subsídio proporcional à renda familiar.' },
      { theme: 'meioAmbiente', text: 'Fortalecer a fiscalização ambiental e recuperar áreas degradadas.' },
    ],
    finances: {
      total: 12.4,
      sources: [
        { category: 'Fundo partidário', percentage: 45 },
        { category: 'Doações de pessoas físicas', percentage: 40 },
        { category: 'Recursos próprios', percentage: 15 },
      ],
    },
    history: [
      { year: 2012, event: 'Eleita vereadora pela primeira vez.' },
      { year: 2016, event: 'Nomeada secretária municipal de assistência social.' },
      { year: 2020, event: 'Coordenou programa regional de combate à fome.' },
      { year: 2024, event: 'Lançou pré-candidatura à presidência.' },
    ],
    positions: { economia: 2, estado: 5, seguranca: 2, meioAmbiente: 5, educacao: 5 },
  },
  {
    id: 'pres-caio-bentes',
    name: 'Caio Bentes',
    number: '23',
    party: 'PDR',
    position: 'Presidente da República',
    state: null,
    ideology: 'Centro-esquerda',
    photo: 'https://placehold.co/400x400?text=Caio+Bentes',
    bio: 'Economista e ex-gestor de banco de desenvolvimento regional, Caio Bentes defende um Estado indutor do crescimento aliado à responsabilidade fiscal. Sua atuação prioriza investimento em infraestrutura e programas sociais focalizados.',
    education: [
      { graduacao: 'Ciências Econômicas', universidade: 'Faculdade Metropolitana do Sul', ano: 1994 },
      { graduacao: 'Doutorado em Economia', universidade: 'Universidade Central do Vale', ano: 2003 },
    ],
    proposals: [
      { theme: 'economia', text: 'Ampliar o crédito produtivo para pequenas e médias empresas.' },
      { theme: 'educacao', text: 'Expandir a jornada escolar integral na rede pública.' },
      { theme: 'transporte', text: 'Investir em corredores de transporte público de média capacidade.' },
      { theme: 'saude', text: 'Modernizar a gestão hospitalar com prontuário eletrônico unificado.' },
    ],
    finances: {
      total: 18.7,
      sources: [
        { category: 'Fundo partidário', percentage: 50 },
        { category: 'Doações de pessoas físicas', percentage: 35 },
        { category: 'Financiamento coletivo', percentage: 15 },
      ],
    },
    history: [
      { year: 2010, event: 'Assumiu diretoria em banco de desenvolvimento regional.' },
      { year: 2015, event: 'Coordenou plano estadual de infraestrutura.' },
      { year: 2019, event: 'Eleito deputado federal.' },
      { year: 2023, event: 'Relatou proposta de reforma do crédito produtivo.' },
    ],
    positions: { economia: 3, estado: 4, seguranca: 3, meioAmbiente: 4, educacao: 4 },
  },
  {
    id: 'pres-helena-marques',
    name: 'Helena Marques',
    number: '45',
    party: 'MDN',
    position: 'Presidente da República',
    state: null,
    ideology: 'Centro',
    photo: 'https://placehold.co/400x400?text=Helena+Marques',
    bio: 'Advogada e ex-prefeita de uma capital regional, Helena Marques é conhecida pela busca de consensos e pela gestão pragmática. Propõe modernização administrativa e diálogo entre setores produtivos e sociais.',
    education: [
      { graduacao: 'Direito', universidade: 'Universidade do Litoral', ano: 1996 },
      { graduacao: 'Especialização em Gestão Pública', universidade: 'Escola Nacional de Administração', ano: 2004 },
    ],
    proposals: [
      { theme: 'economia', text: 'Simplificar o ambiente de negócios com desburocratização de licenças.' },
      { theme: 'seguranca', text: 'Integrar bases de dados entre polícias para investigação mais eficiente.' },
      { theme: 'educacao', text: 'Implantar avaliação diagnóstica anual com apoio pedagógico direcionado.' },
    ],
    finances: {
      total: 15.2,
      sources: [
        { category: 'Fundo partidário', percentage: 48 },
        { category: 'Doações de pessoas físicas', percentage: 42 },
        { category: 'Recursos próprios', percentage: 10 },
      ],
    },
    history: [
      { year: 2008, event: 'Eleita vereadora da capital.' },
      { year: 2013, event: 'Assumiu a Procuradoria do município.' },
      { year: 2017, event: 'Eleita prefeita.' },
      { year: 2022, event: 'Presidiu consórcio intermunicipal de saúde.' },
    ],
    positions: { economia: 3, estado: 3, seguranca: 3, meioAmbiente: 3, educacao: 3 },
  },
  {
    id: 'pres-rafael-toledo',
    name: 'Rafael Toledo',
    number: '55',
    party: 'PLN',
    position: 'Presidente da República',
    state: null,
    ideology: 'Centro-direita',
    photo: 'https://placehold.co/400x400?text=Rafael+Toledo',
    bio: 'Empresário do setor de tecnologia e ex-secretário estadual de fazenda, Rafael Toledo defende disciplina fiscal, redução de tributos e incentivo ao empreendedorismo como motores do desenvolvimento.',
    education: [
      { graduacao: 'Administração', universidade: 'Faculdade Metropolitana do Sul', ano: 1999 },
      { graduacao: 'MBA em Finanças', universidade: 'Instituto Superior de Negócios', ano: 2006 },
    ],
    proposals: [
      { theme: 'economia', text: 'Reduzir a carga tributária sobre a folha de pagamento das empresas.' },
      { theme: 'transporte', text: 'Conceder rodovias federais à iniciativa privada com metas de qualidade.' },
      { theme: 'seguranca', text: 'Ampliar o efetivo policial e investir em tecnologia de monitoramento.' },
    ],
    finances: {
      total: 22.1,
      sources: [
        { category: 'Doações de pessoas físicas', percentage: 55 },
        { category: 'Fundo partidário', percentage: 30 },
        { category: 'Recursos próprios', percentage: 15 },
      ],
    },
    history: [
      { year: 2011, event: 'Fundou empresa de soluções tecnológicas.' },
      { year: 2016, event: 'Nomeado secretário estadual de fazenda.' },
      { year: 2020, event: 'Eleito deputado estadual.' },
      { year: 2024, event: 'Anunciou plataforma econômica de campanha.' },
    ],
    positions: { economia: 4, estado: 2, seguranca: 4, meioAmbiente: 2, educacao: 3 },
  },
  {
    id: 'pres-beatriz-nunes',
    name: 'Beatriz Nunes',
    number: '77',
    party: 'UNP',
    position: 'Presidente da República',
    state: null,
    ideology: 'Direita',
    photo: 'https://placehold.co/400x400?text=Beatriz+Nunes',
    bio: 'Ex-delegada e parlamentar, Beatriz Nunes prioriza segurança pública, valorização das forças policiais e um Estado enxuto. Defende a livre iniciativa e a simplificação do papel do setor público na economia.',
    education: [
      { graduacao: 'Direito', universidade: 'Universidade do Litoral', ano: 1997 },
      { graduacao: 'Especialização em Segurança Pública', universidade: 'Academia Nacional de Polícia', ano: 2002 },
    ],
    proposals: [
      { theme: 'seguranca', text: 'Endurecer o combate ao crime organizado com forças-tarefa integradas.' },
      { theme: 'economia', text: 'Privatizar estatais deficitárias e reduzir o gasto público.' },
    ],
    finances: {
      total: 19.6,
      sources: [
        { category: 'Doações de pessoas físicas', percentage: 60 },
        { category: 'Fundo partidário', percentage: 28 },
        { category: 'Financiamento coletivo', percentage: 12 },
      ],
    },
    history: [
      { year: 2009, event: 'Assumiu delegacia especializada.' },
      { year: 2014, event: 'Coordenou operação de combate ao contrabando.' },
      { year: 2018, event: 'Eleita deputada federal.' },
      { year: 2022, event: 'Reeleita com mandato voltado à segurança.' },
    ],
    positions: { economia: 5, estado: 1, seguranca: 5, meioAmbiente: 2, educacao: 2 },
  },

  // ---------------------------------------------------------------------------
  // Governador — São Paulo (SP)
  // ---------------------------------------------------------------------------
  {
    id: 'gov-sp-marina-castro',
    name: 'Marina Castro',
    number: '13',
    party: 'PMS',
    position: 'Governador',
    state: 'SP',
    ideology: 'Centro-esquerda',
    photo: 'https://placehold.co/400x400?text=Marina+Castro',
    bio: 'Professora universitária e ex-secretária estadual de educação, Marina Castro defende investimento em ensino público e programas de mobilidade urbana sustentável para o estado de São Paulo.',
    education: [
      { graduacao: 'Letras', universidade: 'Universidade Central do Vale', ano: 2000 },
      { graduacao: 'Mestrado em Educação', universidade: 'Instituto Norte de Ensino', ano: 2007 },
    ],
    proposals: [
      { theme: 'educacao', text: 'Universalizar creches em tempo integral na rede estadual.' },
      { theme: 'transporte', text: 'Expandir a malha metroferroviária da região metropolitana.' },
      { theme: 'saude', text: 'Ampliar leitos de atenção especializada no interior.' },
      { theme: 'meioAmbiente', text: 'Criar programa estadual de energia solar em prédios públicos.' },
    ],
    finances: {
      total: 9.8,
      sources: [
        { category: 'Fundo partidário', percentage: 47 },
        { category: 'Doações de pessoas físicas', percentage: 43 },
        { category: 'Recursos próprios', percentage: 10 },
      ],
    },
    history: [
      { year: 2013, event: 'Nomeada diretora de rede estadual de ensino.' },
      { year: 2017, event: 'Assumiu a Secretaria Estadual de Educação.' },
      { year: 2021, event: 'Coordenou plano estadual de conectividade escolar.' },
      { year: 2024, event: 'Lançou pré-candidatura ao governo estadual.' },
    ],
    positions: { economia: 3, estado: 4, seguranca: 3, meioAmbiente: 4, educacao: 5 },
  },
  {
    id: 'gov-sp-otavio-lemos',
    name: 'Otávio Lemos',
    number: '28',
    party: 'PLN',
    position: 'Governador',
    state: 'SP',
    ideology: 'Centro-direita',
    photo: 'https://placehold.co/400x400?text=Otavio+Lemos',
    bio: 'Engenheiro e ex-prefeito de cidade industrial, Otávio Lemos propõe atrair investimentos privados, modernizar a infraestrutura logística e reforçar a segurança no estado de São Paulo.',
    education: [
      { graduacao: 'Engenharia Civil', universidade: 'Faculdade Metropolitana do Sul', ano: 1995 },
      { graduacao: 'Especialização em Gestão de Projetos', universidade: 'Instituto Superior de Negócios', ano: 2003 },
    ],
    proposals: [
      { theme: 'economia', text: 'Criar polos de incentivo fiscal para indústria e logística.' },
      { theme: 'seguranca', text: 'Instalar centros integrados de videomonitoramento nas rodovias estaduais.' },
      { theme: 'transporte', text: 'Concluir contornos rodoviários em regiões de gargalo logístico.' },
    ],
    finances: {
      total: 11.5,
      sources: [
        { category: 'Doações de pessoas físicas', percentage: 52 },
        { category: 'Fundo partidário', percentage: 33 },
        { category: 'Recursos próprios', percentage: 15 },
      ],
    },
    history: [
      { year: 2012, event: 'Eleito prefeito de cidade industrial.' },
      { year: 2016, event: 'Reeleito com foco em infraestrutura.' },
      { year: 2020, event: 'Presidiu associação de municípios da região.' },
      { year: 2023, event: 'Assumiu secretaria estadual de desenvolvimento.' },
    ],
    positions: { economia: 4, estado: 2, seguranca: 4, meioAmbiente: 3, educacao: 3 },
  },

  // ---------------------------------------------------------------------------
  // Governador — Rio de Janeiro (RJ)
  // ---------------------------------------------------------------------------
  {
    id: 'gov-rj-tereza-albuquerque',
    name: 'Tereza Albuquerque',
    number: '19',
    party: 'PDR',
    position: 'Governador',
    state: 'RJ',
    ideology: 'Esquerda',
    photo: 'https://placehold.co/400x400?text=Tereza+Albuquerque',
    bio: 'Assistente social e liderança comunitária, Tereza Albuquerque defende políticas de moradia, saneamento e cultura para as periferias fluminenses, com forte participação popular na gestão.',
    education: [
      { graduacao: 'Serviço Social', universidade: 'Universidade do Litoral', ano: 2001 },
      { graduacao: 'Especialização em Gestão Social', universidade: 'Instituto Norte de Ensino', ano: 2009 },
    ],
    proposals: [
      { theme: 'habitacao', text: 'Regularizar e urbanizar comunidades com infraestrutura básica.' },
      { theme: 'saude', text: 'Reabrir e reequipar unidades de pronto atendimento na baixada.' },
      { theme: 'meioAmbiente', text: 'Despoluir rios e baías com programa estadual de saneamento.' },
      { theme: 'educacao', text: 'Ampliar bolsas de permanência para estudantes de baixa renda.' },
    ],
    finances: {
      total: 8.3,
      sources: [
        { category: 'Fundo partidário', percentage: 46 },
        { category: 'Doações de pessoas físicas', percentage: 39 },
        { category: 'Financiamento coletivo', percentage: 15 },
      ],
    },
    history: [
      { year: 2010, event: 'Coordenou associação de moradores.' },
      { year: 2014, event: 'Eleita deputada estadual.' },
      { year: 2018, event: 'Relatora de política estadual de habitação.' },
      { year: 2022, event: 'Reeleita com mandato voltado ao saneamento.' },
    ],
    positions: { economia: 2, estado: 5, seguranca: 2, meioAmbiente: 5, educacao: 4 },
  },
  {
    id: 'gov-rj-daniel-fontes',
    name: 'Daniel Fontes',
    number: '31',
    party: 'UNP',
    position: 'Governador',
    state: 'RJ',
    ideology: 'Direita',
    photo: 'https://placehold.co/400x400?text=Daniel+Fontes',
    bio: 'Ex-oficial e gestor de segurança, Daniel Fontes prioriza o combate ao crime organizado, a valorização das forças de segurança e a atração de investimentos privados para o Rio de Janeiro.',
    education: [
      { graduacao: 'Ciências Militares', universidade: 'Academia Nacional de Defesa', ano: 1998 },
      { graduacao: 'MBA em Gestão de Segurança', universidade: 'Instituto Superior de Negócios', ano: 2008 },
    ],
    proposals: [
      { theme: 'seguranca', text: 'Implantar batalhões especializados em áreas de maior incidência criminal.' },
      { theme: 'economia', text: 'Reduzir tributos estaduais para atrair novas empresas ao estado.' },
      { theme: 'transporte', text: 'Concessão de terminais e vias expressas para melhorar a mobilidade.' },
    ],
    finances: {
      total: 13.9,
      sources: [
        { category: 'Doações de pessoas físicas', percentage: 58 },
        { category: 'Fundo partidário', percentage: 30 },
        { category: 'Recursos próprios', percentage: 12 },
      ],
    },
    history: [
      { year: 2009, event: 'Assumiu comando de unidade de segurança.' },
      { year: 2015, event: 'Coordenou programa estadual de policiamento.' },
      { year: 2019, event: 'Eleito deputado estadual.' },
      { year: 2023, event: 'Presidiu comissão de segurança pública.' },
    ],
    positions: { economia: 5, estado: 1, seguranca: 5, meioAmbiente: 2, educacao: 2 },
  },
];
