# Implementation Plan: Em Quem Votar

## Overview

This plan converts the design into a series of incremental coding steps for the "Em Quem Votar" React + Vite + JavaScript MVP. Work proceeds strictly in dependency order — project setup, then the design-token layer, then the Data_Store, the Data_Provider and data hook, the pure domain logic (filtering + Affinity_Engine), the quiz state context, shared/layout components, listing components, profile components, quiz components, pages, and finally routing/app-shell wiring. Every step builds on prior steps and ends by being wired into the running application, so there is no orphaned code.

Property-based tests (fast-check, minimum 100 iterations, tagged `// Feature: em-quem-votar, Property {number}: {property_text}`) are placed next to the code they validate to catch errors early. Example/component tests, the security test (quiz answers never transmitted), and accessibility tests are included alongside. All data is fictional and labeled "Dados demonstrativos para o MVP".

## Tasks

- [x] 1. Project setup, tooling, and design tokens
  - [x] 1.1 Scaffold the Vite React (JavaScript) project and configure the test toolchain
    - Initialize a Vite `react` (JS) project with `index.html`, `package.json`, `vite.config.js`, `src/main.jsx`
    - Install runtime dep `react-router-dom` (v6) and dev deps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, and `axe`-based a11y matcher (`vitest-axe` or `jest-axe`)
    - Configure `vitest` in `vite.config.js` (jsdom environment, globals, setup file registering jest-dom matchers) and add `test` script; confirm `npm install` and `npm run dev` work
    - _Requirements: 17.1, 17.2_

  - [x] 1.2 Create the design-token layer and global styles
    - Create `src/styles/tokens.css` with CSS custom properties for dark-navy titles, medium-blue secondary, near-white bluish background, white cards, bluish-gray secondary text, card radius, soft shadow, and `--container-max` (1100–1200px)
    - Create `src/styles/global.css` with mobile-first base rules, a `.container` centered column, shared card class (rounded corners + soft shadow), and a global `:focus-visible` outline; use only brand-neutral navy/blue (no party colors)
    - Import global styles from `src/main.jsx`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 14.5, 16.5_

  - [x] 1.3 Create the fast-check generators module
    - Create `src/test/generators.js` with arbitraries for `Candidate`, `Positions` (integers 1..5), `Question`, `AnswerOption`, `Answers` maps, `FinanceSource`/`Finances`, `HistoryEntry`, and search queries (mixed case + unicode)
    - _Requirements: 13.2, 13.3_

- [x] 2. Build the Data_Store (fictional data only)
  - [x] 2.1 Create `src/data/topics.js` with themes and states
    - Export proposal themes (saude, educacao, economia, meioAmbiente, seguranca, habitacao, transporte) and quiz themes (economia, estado, seguranca, meioAmbiente, educacao) as `{id, label}` entries
    - Export the selectable states list as `{uf, name}` entries so states can be added without page changes
    - _Requirements: 6.1, 9.2, 2.2, 2.3_

  - [x] 2.2 Create `src/data/candidates.js` with 5+ fictional candidates
    - Define at least five fictional Candidate records, each with `id, name, number, party, position, state, ideology, photo, bio, education, proposals, finances, history, positions`
    - `positions` carries numeric 1..5 weights for economia, estado, seguranca, meioAmbiente, educacao; `finances` has numeric `total` and a `sources` list of `{category, percentage}`; include Presidente (state null) and Governador (state set) candidates across the ideology categories
    - Use only invented names/parties/numbers/biographies (no real politicians)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

  - [x] 2.3 Create `src/data/questions.js` with objective quiz questions
    - Define objective questions across the quiz themes, each with `id, theme, text`, and an `options` list of `{id, label, value}` on the 1..5 scale
    - _Requirements: 10.1, 9.2, 11.1_

  - [x] 2.4 Write property test for the Candidate schema
    - **Property 18: Every candidate conforms to the Candidate schema**
    - **Validates: Requirements 13.2, 13.3, 13.4**
    - Iterate over every candidate in the Data_Store asserting required fields/types, numeric `positions` keys, and `finances.total`/`sources` shape

  - [x] 2.5 Write data-content smoke test
    - Assert the Data_Store provides at least five candidates and contains only fictional data (no real-politician markers)
    - _Requirements: 13.1, 13.6_

- [x] 3. Build the Data_Provider and data hook
  - [x] 3.1 Implement `src/providers/dataProvider.js`
    - Implement `getStates`, `getCandidatesByOffice(office, uf)`, `getCandidateById(id)` (returns `null` when unknown), `getQuestions`, and `getThemes(kind)`
    - Return deep-cloned/frozen structures so the Data_Store cannot be mutated; centralize office/state scoping so pages never encode data shape
    - _Requirements: 13.5, 2.3, 3.1, 3.2, 4.5, 10.1, 9.2_

  - [x] 3.2 Write property test for provider office/state scoping
    - **Property 2: Provider scopes candidates by office and state**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 3.3 Implement `src/hooks/useProviderData.js`
    - Consume provider functions tolerating synchronous values or Promises, exposing a data/pending/error shape so a future API swap needs no page changes
    - _Requirements: 13.5_

- [x] 4. Implement pure domain logic
  - [x] 4.1 Implement `src/domain/candidateFilter.js`
    - Pure filter combining case-insensitive name/party substring search with ideology selection ("Todos" = no ideology constraint); empty query + "Todos" returns the input set
    - _Requirements: 3.5, 3.7, 3.8, 3.9_

  - [x] 4.2 Write property test for candidate filtering
    - **Property 1: Filtering satisfies the active predicate conjunction**
    - **Validates: Requirements 3.5, 3.7, 3.8, 3.9**

  - [x] 4.3 Implement `src/domain/affinityEngine.js`
    - Implement `buildUserVector(answers, questions)`, `computeAffinity(userVector, candidate)`, and `computeResults(answers, questions, candidates)` using the 1..5 scale, `MAX_DELTA = 4`, per-theme similarity `round((1 - delta/4)*100)`, overall = mean of per-theme affinities, sort by overall desc then id asc; missing candidate theme position contributes 0% for that theme
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 4.4 Write property test for bounded affinity outputs
    - **Property 4: Affinity outputs are bounded 0–100**
    - **Validates: Requirements 11.2, 11.3**

  - [x] 4.5 Write property test for deterministic ranking and tie-breaking
    - **Property 5: Ranking is deterministic, permutation-invariant, and breaks ties by id**
    - **Validates: Requirements 11.4**

  - [x] 4.6 Write property test for one result per candidate
    - **Property 6: One affinity result per candidate**
    - **Validates: Requirements 11.1**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement quiz state context
  - [x] 6.1 Implement `src/context/QuizContext.jsx`
    - Provide `QuizProvider` + reducer with `SET_ANSWER`/`RESET`, holding `answers` (questionId -> value) in memory only; expose a derived "all answered" helper; perform zero I/O and never serialize answers
    - _Requirements: 10.3, 10.4, 10.5_

  - [x] 6.2 Write property test for answer recording
    - **Property 14: Answer selection is recorded in client state**
    - **Validates: Requirements 10.3**

- [x] 7. Implement shared/layout components
  - [x] 7.1 Implement `DemonstrativeLabel` component
    - Render the exact text "Dados demonstrativos para o MVP"
    - _Requirements: 14.1_

  - [x] 7.2 Implement `Header` component
    - Semantic `<header>` + `<nav>` with app logo/nav using `Link` controls
    - _Requirements: 17.5, 16.1, 16.4_

  - [x] 7.3 Implement `Footer` component
    - Semantic `<footer>` carrying the global demonstrative note
    - _Requirements: 17.5, 14.1_

- [x] 8. Implement candidate-listing components
  - [x] 8.1 Implement `SearchBar` component
    - Labeled text input with placeholder "Buscar candidato ou partido..." emitting query changes upward
    - _Requirements: 3.4, 16.2_

  - [x] 8.2 Implement `FilterChips` component
    - Native buttons for Todos, Esquerda, Centro-esquerda, Centro, Centro-direita, Direita with pressed/active state
    - _Requirements: 3.6, 16.4_

  - [x] 8.3 Implement `CandidateCard` component
    - Render photo (descriptive alt), name, electoral number, office, party, ideology tag; show state when office is Governador; whole card is a `Link` to `/candidato/{id}`; uniform styling for all candidates
    - _Requirements: 3.10, 3.11, 3.12, 16.3, 16.4, 14.2_

  - [x] 8.4 Write property test for CandidateCard rendered fields
    - **Property 8: Candidate card renders all required fields**
    - **Validates: Requirements 3.10, 3.11, 3.12, 16.3**

  - [x] 8.5 Implement `CandidateList` component
    - Render title "Candidatos", subtitle "{count} candidatos disponíveis", and CandidateCards; delegate search/ideology filtering to `candidateFilter`; render a no-results message when the filtered list is empty
    - _Requirements: 3.3, 3.9, 3.13, 14.2_

  - [x] 8.6 Write property test for displayed count
    - **Property 3: Displayed count equals the number of displayed candidates**
    - **Validates: Requirements 3.3**

  - [x] 8.7 Write example + accessibility test for the listing UI
    - Assert the no-results message appears for a non-matching query and that the search input has an associated label
    - _Requirements: 3.13, 16.2_

- [x] 9. Implement candidate-profile components
  - [x] 9.1 Implement `CandidateProfileHeader` component
    - Large circular photo (descriptive alt), name, number, office, state (when applicable), party, ideology tag, plus a back control
    - _Requirements: 4.1, 4.2, 16.3_

  - [x] 9.2 Write property test for profile header fields
    - **Property 9: Profile header renders all required fields**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 9.3 Implement `ProfileTabs` component
    - Tab controls "Bio", "Propostas", "Finanças", "Histórico" on native buttons using role="tablist"/"tab"/"tabpanel" with `aria-selected`; show the active tab's content
    - _Requirements: 4.3, 4.4, 16.4_

  - [x] 9.4 Implement `ProposalCard` component
    - Render one proposal under its theme showing source text "Dados demonstrativos"
    - _Requirements: 6.2, 6.3_

  - [x] 9.5 Write property test for proposal grouping by theme
    - **Property 10: Proposals are grouped correctly by theme**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [x] 9.6 Implement `FinanceCard` component
    - Render "TOTAL ARRECADADO" as "R$ {value} mi"; "Origem dos recursos" with one horizontal bar per source (category name + percentage), bar width proportional to percentage; include DemonstrativeLabel
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.7 Write property tests for finance bars and total formatting
    - **Property 11: Finance bars are complete and proportional**
    - **Property 12: Total raised is formatted consistently**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [x] 9.8 Implement `HistoryTimeline` component
    - Render year/event entries in reverse chronological order (most recent first) and a "Votações" future-feature placeholder; include DemonstrativeLabel
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 9.9 Write property test for reverse-chronological timeline
    - **Property 13: History timeline is reverse-chronological**
    - **Validates: Requirements 8.1, 8.2**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement quiz components
  - [x] 11.1 Implement `QuizQuestion` component
    - Render a question and its options as native radio inputs with associated labels; report the selected value upward
    - _Requirements: 10.1, 10.3, 16.2, 16.4_

  - [x] 11.2 Implement `QuizProgress` component
    - Show current question position relative to the total
    - _Requirements: 10.2_

  - [x] 11.3 Write property test for advancement gating
    - **Property 15: Advancement is gated by completeness**
    - **Validates: Requirements 10.5**

  - [x] 11.4 Implement `AffinityChart` component
    - Render per-theme affinity breakdown as labeled bars
    - _Requirements: 12.3_

  - [x] 11.5 Write property test for per-theme breakdown coverage
    - **Property 7: Per-theme breakdown covers every quiz theme present**
    - **Validates: Requirements 11.3, 12.3**

  - [x] 11.6 Implement `ResultCard` component
    - Render a candidate result row: name/photo + overall Affinity_Percentage + embedded AffinityChart
    - _Requirements: 12.2, 12.3_

  - [x] 11.7 Write property test for descending result ordering
    - **Property 17: Results are rendered in descending affinity order**
    - **Validates: Requirements 12.2**

- [x] 12. Implement page components
  - [x] 12.1 Implement `HomePage`
    - Logo text "EM QUEM VOTAR", headline + neutral subtext, "Presidente" and "Governador" nav options, quiz CTA text and "Fazer o Quiz" button linking to `/quiz`; office options link to `/presidente` and `/governador`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 12.2 Implement `GovernadorStatePage`
    - Prompt "Em qual estado você vota?", labeled state-selection control populated from `getStates`, and a "Continuar" button disabled until a state is selected; on continue navigate to `/governador/{uf}`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 16.2_

  - [x] 12.3 Write property test for data-driven state options
    - **Property 21: State options are data-driven**
    - **Validates: Requirements 2.3, 2.5**

  - [x] 12.4 Implement `CandidateListPage`
    - Serve both `/presidente` (office = "Presidente da República") and `/governador/:uf` (office = "Governador", scoped by `:uf`); pull data via `useProviderData`, hold search/filter view state, and render `SearchBar`, `FilterChips`, and `CandidateList`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.13_

  - [x] 12.5 Implement `CandidateProfilePage`
    - Load candidate via `getCandidateById`; render `CandidateProfileHeader` and `ProfileTabs`; Bio tab shows biography summary, a Formação card (graduação/universidade/ano) and a Trajetória card plus DemonstrativeLabel; Propostas groups `ProposalCard`s by theme omitting empty themes; Finanças renders `FinanceCard`; Histórico renders `HistoryTimeline`; show a not-found view when the id is unknown
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.4, 7.1, 8.1_

  - [x] 12.6 Implement `QuizIntroPage`
    - Title "Quiz de Afinidade", intro text stating it measures proximity and does not recommend a vote, the covered-themes list (Economia, Papel do Estado, Segurança Pública, Meio Ambiente, Educação), and a "Começar o Quiz" button navigating to `/quiz/perguntas`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 12.7 Implement `QuizQuestionsPage`
    - Render questions from the provider via `QuizQuestion`, show `QuizProgress`, record answers in `QuizContext`, prevent advancing while the current question is unanswered, and navigate to `/quiz/resultado` when all answered
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [x] 12.8 Implement `QuizResultPage`
    - Guard: redirect to `/quiz` (`<Navigate replace />`) when the quiz is incomplete; otherwise compute results with `computeResults`, render title "Seu resultado" + heading, ranked `ResultCard`s with per-theme breakdown, and the proximity/not-a-recommendation explanation; never include forbidden recommendation phrases
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 12.9 Write property test for absence of recommendation phrases
    - **Property 16: Result view never contains recommendation phrases**
    - **Validates: Requirements 12.5**

  - [x] 12.10 Implement `NotFoundPage`
    - Render a not-found view with a control that navigates back to "/"
    - _Requirements: 17.4_

  - [x] 12.11 Write example tests for page content and navigation
    - Assert HomePage content/nav (Req 1.x), Continuar disabled→enabled transition (Req 2.4), tab switching shows the correct panel (Req 4.4), unknown-id not-found (Req 4.5), quiz completion navigation (Req 10.6), and result-page redirect when incomplete (Req 12.6)
    - _Requirements: 1.1, 1.3, 2.4, 4.4, 4.5, 10.6, 12.6_

- [x] 13. Wire routing and the application shell
  - [x] 13.1 Implement `App.jsx` routing + layout and finalize `main.jsx`
    - Define a layout route rendering Header + `<Outlet />` + Footer; map `/`, `/presidente`, `/governador`, `/governador/:uf`, `/candidato/:id`, `/quiz`, `/quiz/perguntas`, `/quiz/resultado`, and `*` (NotFoundPage); wrap the routed app with `QuizProvider` and the Router in `main.jsx`
    - _Requirements: 17.3, 17.4, 17.5_

  - [x] 13.2 Write property test for unknown-path handling
    - **Property 19: Unknown paths render the not-found view**
    - **Validates: Requirements 17.4**

  - [x] 13.3 Write property test for Header/Footer on every route
    - **Property 20: Header and Footer render on every route**
    - **Validates: Requirements 17.5**

  - [x] 13.4 Write example test for router path mapping
    - Assert each required path renders its corresponding page view
    - _Requirements: 17.3_

- [x] 14. Cross-cutting security and accessibility tests
  - [x] 14.1 Write the security/privacy test for quiz answers
    - Spy on `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `localStorage`, and `sessionStorage`; drive the full quiz answer flow and assert none are invoked with answer data
    - _Requirements: 10.4_

  - [x] 14.2 Write accessibility tests on key pages
    - Run an automated a11y (axe) pass on Home, listing, profile, and quiz pages, and assert labeled inputs, image alt text, native interactive controls, and focus-visible styles
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references the specific requirements it implements, and each property test task references its property number from the design for traceability.
- Property-based tests use fast-check at a minimum of 100 iterations and carry the tag `// Feature: em-quem-votar, Property {number}: {property_text}`.
- Checkpoints (tasks 5, 10, 15) ensure incremental validation before moving to the next layer.
- All data is fictional and labeled "Dados demonstrativos para o MVP"; neutrality safeguards (no forbidden recommendation phrases, no party colors) are enforced structurally and verified by tests (Properties 16, tokens review).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1", "4.1", "4.3", "6.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.2", "4.4", "4.5", "4.6", "6.2", "7.1", "7.2", "7.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "3.1", "8.1", "8.2", "9.4", "9.8", "11.1", "11.2", "11.4"] },
    { "id": 4, "tasks": ["3.2", "3.3", "8.3", "9.1", "9.3", "9.6", "11.6"] },
    { "id": 5, "tasks": ["8.4", "8.5", "9.2", "9.5", "9.7", "9.9", "11.3", "11.5", "11.7"] },
    { "id": 6, "tasks": ["8.6", "8.7", "12.1", "12.2", "12.4", "12.5", "12.6", "12.7", "12.8", "12.10"] },
    { "id": 7, "tasks": ["12.3", "12.9", "12.11", "13.1"] },
    { "id": 8, "tasks": ["13.2", "13.3", "13.4", "14.1", "14.2"] }
  ]
}
```
