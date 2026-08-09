// scripts/fetch-tse.mjs
//
// ETL do TSE (DivulgaCandContas) → JSON no formato do app.
//
// Por que um script e não um fetch no navegador:
//   - A API do TSE NÃO envia cabeçalhos CORS, então o navegador bloqueia a
//     chamada. Além disso o site é estático (GitHub Pages), sem backend.
//   - A solução é rodar este script no seu computador (Node), gerar um arquivo
//     JSON e commitá-lo. O build apenas empacota esse JSON.
//
// O que o TSE FORNECE: nome, número, cargo, UF, coligação/partido e situação.
// O que o TSE NÃO FORNECE (é editorial, você preenche depois): ideologia,
// propostas e as "posições" que alimentam o Quiz de Afinidade.
//
// Uso:
//   node scripts/fetch-tse.mjs                      # Presidente 2026 (padrão)
//   node scripts/fetch-tse.mjs --cargo=3 --uf=SP    # Governador de SP
//
// Códigos de cargo do TSE: 1 = Presidente, 3 = Governador, 5 = Senador,
// 6 = Deputado Federal, 7 = Deputado Estadual.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { editorialByCandidateId } from '../src/data/editorial.js';
import { states } from '../src/data/topics.js';

const API_BASE = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';
const ANO = 2026;
const ELEICAO_ID = 20322002026; // "Eleição Geral Federal 2026" (id do /eleicao/ordinarias)

// --- CLI args ---------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const CARGO = Number(args.cargo ?? 1); // 1 = Presidente
const UF = (args.uf ?? 'BR').toUpperCase(); // "BR" para federal; ex.: "SP" para Governador

// Mapeia o nome do cargo do TSE para o campo `position` usado no app.
function mapOffice(cargoNome) {
  const n = (cargoNome ?? '').toLowerCase();
  if (n.includes('presidente')) return 'Presidente da República';
  if (n.includes('governador')) return 'Governador';
  return cargoNome ?? '';
}

// URL da foto oficial do candidato no TSE. Padrão do DivulgaCandContas:
//   /divulga/rest/arquivo/img/{idEleicao}/{idCandidato}/{UE}
// (UE = "BR" para presidente, ou a sigla da UF para governador).
function tsePhotoUrl(id, uf) {
  return `https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/${ELEICAO_ID}/${id}/${uf}`;
}

/**
 * Converte um candidato do TSE para o schema `Candidate` do app.
 * Campos que o TSE não fornece ficam vazios/nulos e marcados como editoriais.
 */
function mapCandidate(c, { uf }) {
  const office = mapOffice(c?.cargo?.nome);
  const id = String(c.id);

  // Curadoria editorial (ideologia/posições/propostas) para este candidato, se
  // já tiver sido preenchida em src/data/editorial.js. Fatos do TSE sempre têm
  // prioridade; o editorial só preenche o que o TSE não fornece.
  const ed = editorialByCandidateId[id] ?? {};
  const positions = ed.positions ?? {};
  // O candidato só é "avaliado no quiz" quando tem os 5 temas preenchidos.
  const QUIZ_THEMES = ['economia', 'estado', 'seguranca', 'meioAmbiente', 'educacao'];
  const avaliadoNoQuiz = QUIZ_THEMES.every((t) => typeof positions[t] === 'number');

  return {
    id,
    name: c.nomeUrna ?? c.nomeCompleto ?? 'Sem nome',
    nomeCompleto: c.nomeCompleto ?? null, // extra (informativo)
    number: String(c.numero ?? ''),
    party: c.partido?.sigla ?? 'N/D', // sigla do PARTIDO (ex.: PT), não a coligação
    coligacao: c.nomeColigacao ?? null, // nome da coligação/federação, se houver
    position: office,
    state: uf === 'BR' ? null : uf,
    situacao: c.descricaoSituacao ?? null, // ex.: "Aguardando julgamento" / "Deferido"
    photo: c.fotoUrl ?? tsePhotoUrl(id, uf),

    // ------ Campos EDITORIAIS (mesclados de src/data/editorial.js) ------
    ideology: ed.ideology ?? null,
    bio: ed.bio ?? '',
    education: ed.education ?? [],
    proposals: ed.proposals ?? [], // plano de governo oficial sai 15/08
    finances: ed.finances ?? { total: 0, sources: [] }, // prestação de contas: outro endpoint
    history: ed.history ?? [],
    positions, // {economia, estado, seguranca, meioAmbiente, educacao} 1..5, para o quiz
    avaliadoNoQuiz, // true só quando as 5 posições foram curadas
    fontesEditoriais: ed.sources ?? [], // fontes que embasam a curadoria acima

    // Metadados da origem, para transparência.
    _fonte: 'TSE/DivulgaCandContas',
    _atualizadoEm: new Date().toISOString(),
  };
}

/** Pausa entre chamadas para não sobrecarregar o TSE (recomendação da doc). */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Busca a lista de candidatos de um cargo numa localidade (BR ou UF).
 * Retorna [] em caso de 404/erro/localidade sem candidatos, para não
 * interromper a coleta dos demais.
 * @returns {Promise<Object[]>} candidatos já mapeados para o schema do app
 */
async function fetchList({ uf, cargo }) {
  const url = `${API_BASE}/candidatura/listar/${ANO}/${uf}/${ELEICAO_ID}/${cargo}/candidatos`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'em-quem-votar/etl' },
    });
    if (!res.ok) {
      console.warn(`  ! ${uf} cargo ${cargo}: TSE respondeu ${res.status}`);
      return [];
    }
    const data = await res.json();
    const lista = Array.isArray(data?.candidatos) ? data.candidatos : [];
    console.log(`  ${uf} — ${data?.cargo?.nome ?? `cargo ${cargo}`}: ${lista.length} candidatos`);
    return lista.map((c) => mapCandidate(c, { uf }));
  } catch (err) {
    console.warn(`  ! ${uf} cargo ${cargo}: falha (${err.message})`);
    return [];
  }
}

async function main() {
  // Alvos a coletar. Se o usuário passar --cargo/--uf, coleta só aquele recorte;
  // caso contrário, coleta TUDO que já é real: Presidente (BR) + Governador de
  // todas as UFs do Data_Store.
  let targets;
  if (args.cargo || args.uf) {
    targets = [{ uf: UF, cargo: CARGO }];
  } else {
    targets = [
      { uf: 'BR', cargo: 1 }, // Presidente
      ...states.map((s) => ({ uf: s.uf, cargo: 3 })), // Governador por UF
    ];
  }

  console.log(`Coletando ${targets.length} recorte(s) da Eleição Geral 2026...`);

  const all = [];
  for (const t of targets) {
    const parte = await fetchList(t);
    all.push(...parte);
    await sleep(400); // intervalo educado entre chamadas
  }

  // Remove duplicatas por id (segurança).
  const porId = new Map(all.map((c) => [c.id, c]));
  const candidatos = [...porId.values()];

  const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
  const outFile = path.join(outDir, 'candidates.generated.json');
  await writeFile(outFile, JSON.stringify(candidatos, null, 2) + '\n', 'utf8');

  const avaliados = candidatos.filter((c) => c.avaliadoNoQuiz).length;
  console.log(`\nOK: ${candidatos.length} candidatos gravados em ${outFile}`);
  console.log(`  - avaliados no quiz (posições curadas): ${avaliados}`);
  console.log('Lembrete: ideologia, propostas e posições do quiz são editoriais (preencha em src/data/editorial.js).');
}

main().catch((err) => {
  console.error('Falha no ETL do TSE:', err.message);
  process.exit(1);
});
