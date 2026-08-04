// src/pages/CandidateListPage.jsx
//
// CandidateListPage — the single page that serves BOTH candidate-listing routes:
//   - "/presidente"       -> office = "Presidente da República"  (Req 3.1)
//   - "/governador/:uf"   -> office = "Governador", scoped by :uf (Req 3.2)
//
// The App routing (task 13.1) renders this page with an explicit `office` prop
// for each route:
//   <CandidateListPage office="Presidente da República" />   for /presidente
//   <CandidateListPage office="Governador" />                for /governador/:uf
// For the Governador route the `:uf` path param is read here via useParams().
//
// Candidates are fetched through `useProviderData(() => getCandidatesByOffice(
// office, uf), [office, uf])`, so office/state scoping stays centralized in the
// Data_Provider and the sync→async transition is isolated to the hook. The page
// holds only view state — the search `query` and the selected `ideology` — and
// delegates rendering to SearchBar, FilterChips, and CandidateList. CandidateList
// itself applies filtering and renders the title/subtitle/no-results, so this
// page stays a thin composition layer.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.13.

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
} from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import { IDEOLOGY_ALL } from '../domain/candidateFilter.js';
import SearchBar from '../components/SearchBar/SearchBar.jsx';
import FilterChips from '../components/FilterChips/FilterChips.jsx';
import CandidateList from '../components/CandidateList/CandidateList.jsx';
import styles from './CandidateListPage.module.css';

/**
 * Candidate-listing page shared by the Presidente and Governador routes.
 *
 * Determines its scope from the `office` prop; for the Governador office it also
 * reads the `:uf` route param (undefined for the Presidente route, which is not
 * state-scoped). It pulls candidates via `useProviderData` and holds two pieces
 * of view state — `query` (search text) and `ideology` (filter selection) —
 * wiring them to SearchBar and FilterChips respectively. The resolved candidate
 * array (or an empty array before data is available) is passed to CandidateList
 * along with `query`/`ideology`; CandidateList applies `filterCandidates` and
 * renders the title, the "{count} candidatos disponíveis" subtitle, the cards,
 * or the no-results message.
 *
 * @param {Object} props
 * @param {"Presidente da República"|"Governador"} [props.office=OFFICE_PRESIDENTE]
 *   - the Office to list; defaults to Presidente so the page is safe to render
 *     without an explicit prop.
 * @returns {JSX.Element}
 */
export default function CandidateListPage({ office = OFFICE_PRESIDENTE }) {
  // `:uf` is only present on the /governador/:uf route; it is undefined for
  // /presidente, in which case the provider does not scope by state.
  const { uf } = useParams();

  const { data } = useProviderData(
    () => getCandidatesByOffice(office, uf),
    [office, uf],
  );

  const [query, setQuery] = useState('');
  const [ideology, setIdeology] = useState(IDEOLOGY_ALL);

  const candidates = data ?? [];

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.controls}>
        <SearchBar value={query} onChange={setQuery} />
        <FilterChips value={ideology} onChange={setIdeology} />
      </div>

      <CandidateList candidates={candidates} query={query} ideology={ideology} />
    </section>
  );
}
