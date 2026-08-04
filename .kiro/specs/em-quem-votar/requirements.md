# Requirements Document

## Introduction

**Em Quem Votar** is a Brazilian electoral information web application for the 2026 elections. The purpose of the Application is to present candidate information neutrally, clearly, and comparably so that users form their own opinions. The Application MUST NOT recommend, endorse, or persuade users toward any candidate or party.

The MVP covers two offices: Presidente da República and Governador. All candidate data in the MVP is fictional and clearly labeled as demonstrative. The architecture is designed so that mock data can later be replaced with official data sources without restructuring the presentation layer.

**Technology constraints:** React + Vite + JavaScript, CSS or CSS Modules, React Router. Data initially stored in local JSON/JS files. No backend, no database, and no authentication in the MVP. The interface is responsive and mobile-first, and also renders well on desktop with a centered content column of maximum width approximately 1100–1200px.

## Glossary

- **Application**: The "Em Quem Votar" web application, including all its pages, components, and client-side logic.
- **User**: A person using the Application through a web browser to explore candidate information.
- **Candidate**: A fictional candidate record for the MVP, containing identity, biography, proposals, finances, history, and affinity positions.
- **Office**: An elected position covered by the MVP; either "Presidente da República" (Presidente) or "Governador".
- **UF**: A two-letter Brazilian state code (Unidade Federativa) used to scope Governador candidates.
- **Ideology_Category**: One of the ordered ideology labels: Esquerda, Centro-esquerda, Centro, Centro-direita, Direita.
- **Data_Store**: The local JavaScript/JSON data modules (for example `src/data/candidates.js`, `src/data/questions.js`, `src/data/topics.js`) that supply candidate, question, and theme data to the Application.
- **Data_Provider**: The abstraction layer through which components request data, isolating components from the underlying Data_Store so it can later be replaced by an API or database.
- **Demonstrative_Label**: The exact text "Dados demonstrativos para o MVP" used to mark fictional content.
- **Quiz**: The affinity feature that presents themed objective questions and computes proximity between User answers and Candidate positions.
- **Affinity_Engine**: The client-side algorithm that computes affinity percentages between User answers and Candidate positions.
- **Affinity_Percentage**: A value from 0 to 100 representing proximity between a User's answers and a Candidate's positions; it is a comparison measure, not a vote recommendation.
- **Theme**: A subject area used to organize proposals and quiz questions (for example Economia, Educação, Saúde, Meio Ambiente, Segurança, Habitação, Transporte).
- **Router**: The React Router configuration that maps URL paths to page views.

## Requirements

### Requirement 1: Home Page

**User Story:** As a User, I want a clear entry page, so that I can understand the Application's purpose and choose how to explore candidates.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/", THE Application SHALL display the logo text "EM QUEM VOTAR".
2. WHEN the User navigates to the path "/", THE Application SHALL display the headline "Conheça seus candidatos. Compare propostas. Vote consciente." and explanatory subtext describing the Application's neutral purpose.
3. WHEN the User navigates to the path "/", THE Application SHALL display a navigation option labeled "Presidente" and a navigation option labeled "Governador".
4. WHEN the User activates the "Presidente" option, THE Router SHALL navigate to the path "/presidente".
5. WHEN the User activates the "Governador" option, THE Router SHALL navigate to the path "/governador".
6. WHEN the User navigates to the path "/", THE Application SHALL display a quiz call-to-action with the text "Descubra quais candidatos têm mais afinidade com suas opiniões." and a button labeled "Fazer o Quiz".
7. WHEN the User activates the "Fazer o Quiz" button, THE Router SHALL navigate to the path "/quiz".

### Requirement 2: State Selection for Governador

**User Story:** As a User, I want to select my state, so that I can view Governador candidates relevant to where I vote.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/governador", THE Application SHALL display the prompt "Em qual estado você vota?".
2. WHEN the User navigates to the path "/governador", THE Application SHALL display a state selection control populated with the states available in the Data_Store and a button labeled "Continuar".
3. THE Data_Provider SHALL expose the list of selectable states so that additional Brazilian states can be added without modifying the state selection page component.
4. WHILE no state is selected, THE Application SHALL keep the "Continuar" button in a disabled state.
5. WHEN the User selects a state and activates the "Continuar" button, THE Router SHALL navigate to the path "/governador/{uf}" using the selected UF.

### Requirement 3: Candidate List

**User Story:** As a User, I want to browse candidates for an office, so that I can find and compare candidates of interest.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/presidente", THE Application SHALL display candidates whose Office is "Presidente da República".
2. WHEN the User navigates to the path "/governador/{uf}", THE Application SHALL display candidates whose Office is "Governador" and whose state matches the UF in the path.
3. WHEN a candidate list is displayed, THE Application SHALL display the title "Candidatos" and a subtitle in the form "{count} candidatos disponíveis" where {count} is the number of candidates currently displayed.
4. WHEN a candidate list is displayed, THE Application SHALL display a search field with placeholder text "Buscar candidato ou partido...".
5. WHEN the User enters text in the search field, THE Application SHALL display only candidates whose name or party contains the entered text using case-insensitive matching.
6. WHEN a candidate list is displayed, THE Application SHALL display ideology filter controls labeled "Todos", "Esquerda", "Centro-esquerda", "Centro", "Centro-direita", and "Direita".
7. WHILE the "Todos" filter is selected, THE Application SHALL display candidates regardless of Ideology_Category.
8. WHEN the User selects an Ideology_Category filter other than "Todos", THE Application SHALL display only candidates whose Ideology_Category matches the selected filter.
9. WHILE both a search text and an Ideology_Category filter are active, THE Application SHALL display only candidates that satisfy both the search text and the selected Ideology_Category.
10. WHEN a candidate is displayed in the list, THE Application SHALL display the candidate's photo, name, electoral number, Office, party, and Ideology_Category tag.
11. WHERE the displayed Office is "Governador", THE Application SHALL display the candidate's state in the candidate card.
12. WHEN the User activates a candidate card, THE Router SHALL navigate to the path "/candidato/{id}" using the candidate's identifier.
13. IF the applied search text and filter combination matches no candidates, THEN THE Application SHALL display a message indicating that no candidates were found.

### Requirement 4: Candidate Profile

**User Story:** As a User, I want a detailed candidate profile, so that I can review a candidate's biography, proposals, finances, and history.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/candidato/{id}", THE Application SHALL display the candidate's large circular photo, name, electoral number, Office, state, party, and Ideology_Category tag.
2. WHEN a candidate profile is displayed, THE Application SHALL display a back control that returns the User to the previous view.
3. WHEN a candidate profile is displayed, THE Application SHALL display tab controls labeled "Bio", "Propostas", "Finanças", and "Histórico".
4. WHEN the User activates a profile tab, THE Application SHALL display the content associated with the activated tab.
5. IF the identifier in the path does not match any candidate in the Data_Store, THEN THE Application SHALL display a message indicating that the candidate was not found.

### Requirement 5: Candidate Profile — Bio Tab

**User Story:** As a User, I want to read a candidate's biography and background, so that I can understand the candidate's education and career.

#### Acceptance Criteria

1. WHEN the "Bio" tab is active, THE Application SHALL display a biography summary for the candidate.
2. WHEN the "Bio" tab is active, THE Application SHALL display a Formação card containing graduação, universidade, and ano for each education entry.
3. WHEN the "Bio" tab is active, THE Application SHALL display a Trajetória card containing prior experiences and previous positions.
4. WHEN the "Bio" tab is active, THE Application SHALL display the Demonstrative_Label indicating the content is fictional.

### Requirement 6: Candidate Profile — Propostas Tab

**User Story:** As a User, I want to read a candidate's proposals organized by theme, so that I can compare positions across topics.

#### Acceptance Criteria

1. WHEN the "Propostas" tab is active, THE Application SHALL display proposals grouped by Theme, using the themes Saúde, Educação, Economia, Meio Ambiente, Segurança, Habitação, and Transporte.
2. WHEN a Theme group is displayed, THE Application SHALL display each proposal within that Theme as a separate card.
3. WHEN a proposal card is displayed, THE Application SHALL display the source text "Dados demonstrativos".
4. WHERE a candidate has no proposal for a given Theme, THE Application SHALL omit that Theme group for that candidate.

### Requirement 7: Candidate Profile — Finanças Tab

**User Story:** As a User, I want to see a candidate's campaign finances, so that I can understand the sources of campaign funding.

#### Acceptance Criteria

1. WHEN the "Finanças" tab is active, THE Application SHALL display a total raised value labeled "TOTAL ARRECADADO" formatted as "R$ {value} mi".
2. WHEN the "Finanças" tab is active, THE Application SHALL display a section labeled "Origem dos recursos" containing one horizontal bar per funding category.
3. WHEN a funding category bar is displayed, THE Application SHALL display the category name and its percentage, and SHALL size the bar proportionally to the percentage.
4. WHEN the "Finanças" tab is active, THE Application SHALL display the Demonstrative_Label indicating the content is fictional.

### Requirement 8: Candidate Profile — Histórico Tab

**User Story:** As a User, I want to see a candidate's history as a timeline, so that I can understand the candidate's political trajectory.

#### Acceptance Criteria

1. WHEN the "Histórico" tab is active, THE Application SHALL display a timeline in which each entry shows a year and an associated event.
2. WHEN the "Histórico" tab is active, THE Application SHALL display timeline entries in reverse chronological order with the most recent year first.
3. WHEN the "Histórico" tab is active, THE Application SHALL display a "Votações" section marked as a future feature placeholder.
4. WHEN the "Histórico" tab is active, THE Application SHALL display the Demonstrative_Label indicating the content is fictional.

### Requirement 9: Quiz Introduction

**User Story:** As a User, I want an introduction to the affinity quiz, so that I understand what the quiz measures before starting.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/quiz", THE Application SHALL display the title "Quiz de Afinidade" and introductory text explaining that the Quiz measures proximity of opinions and does not recommend a vote.
2. WHEN the User navigates to the path "/quiz", THE Application SHALL display the list of Themes covered: Economia, Papel do Estado, Segurança Pública, Meio Ambiente, and Educação.
3. WHEN the User navigates to the path "/quiz", THE Application SHALL display a button labeled "Começar o Quiz".
4. WHEN the User activates the "Começar o Quiz" button, THE Router SHALL navigate to the path "/quiz/perguntas".

### Requirement 10: Quiz Questions

**User Story:** As a User, I want to answer objective questions, so that the Application can compute my affinity with candidates.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/quiz/perguntas", THE Application SHALL display objective questions from the Data_Store, each with selectable answer options.
2. WHEN a question is displayed, THE Application SHALL display progress information indicating the current question position relative to the total number of questions.
3. WHEN the User selects an answer option, THE Application SHALL record the selected option in client-side state.
4. THE Application SHALL store Quiz answers only in client-side application state and SHALL NOT transmit Quiz answers to any server.
5. WHILE the current question has no selected option, THE Application SHALL prevent advancement to the result.
6. WHEN the User has answered all questions and requests the result, THE Router SHALL navigate to the path "/quiz/resultado".

### Requirement 11: Affinity Computation

**User Story:** As a User, I want my answers compared to candidate positions, so that I can see which candidates are closest to my opinions.

#### Acceptance Criteria

1. WHEN the User completes all Quiz questions, THE Affinity_Engine SHALL compute an Affinity_Percentage between the User's answers and each Candidate's positions using the numeric position weights in the Data_Store.
2. THE Affinity_Engine SHALL produce each Affinity_Percentage as a value between 0 and 100 inclusive.
3. THE Affinity_Engine SHALL compute a per-Theme affinity value between 0 and 100 inclusive for each Theme covered by the Quiz.
4. WHEN two Candidates have the same overall Affinity_Percentage, THE Affinity_Engine SHALL order those Candidates deterministically using the candidate identifier.

### Requirement 12: Quiz Result

**User Story:** As a User, I want to see my affinity results, so that I can compare candidates against my own opinions while forming my own conclusion.

#### Acceptance Criteria

1. WHEN the User navigates to the path "/quiz/resultado" after completing the Quiz, THE Application SHALL display the title "Seu resultado" and the heading "Candidatos com maior afinidade com suas respostas".
2. WHEN the result is displayed, THE Application SHALL display candidates ranked in descending order of Affinity_Percentage, showing each candidate's Affinity_Percentage.
3. WHEN a result entry is displayed, THE Application SHALL display a per-Theme affinity breakdown for that candidate.
4. WHEN the result is displayed, THE Application SHALL display an explanation stating that the Affinity_Percentage represents proximity and comparison and is not a vote recommendation.
5. THE Application SHALL NOT display the phrases "Seu candidato é", "Você deveria votar em", or "Vote em" anywhere in the result.
6. IF the User navigates to the path "/quiz/resultado" without having completed the Quiz, THEN THE Application SHALL redirect the User to the path "/quiz".

### Requirement 13: Data Architecture and Extensibility

**User Story:** As a developer, I want candidate data separated behind a data layer, so that mock data can be replaced with official data without changing the presentation layer.

#### Acceptance Criteria

1. THE Data_Store SHALL provide at least five fictional Candidate records.
2. THE Data_Store SHALL define each Candidate with the fields id, name, number, party, position, state, ideology, photo, bio, education, proposals, finances, history, and positions.
3. THE Data_Store SHALL define each Candidate's positions field with numeric weights for the keys economia, estado, seguranca, meioAmbiente, and educacao.
4. THE Data_Store SHALL define each Candidate's finances field with a total value and a sources list, where each source entry has a category name and a percentage.
5. THE Data_Provider SHALL expose candidate, question, and Theme data through functions so that the underlying source can be replaced with an API or database without modifying page components.
6. THE Data_Store SHALL contain only fictional data and SHALL NOT contain real politicians' names, photos, parties, electoral numbers, or biographies presented as real.

### Requirement 14: Neutrality and Demonstrative Data Labeling

**User Story:** As a User, I want the Application to be neutral and clearly demonstrative, so that I trust it does not promote any party or candidate and understand the data is fictional.

#### Acceptance Criteria

1. WHERE content originates from the mock Data_Store, THE Application SHALL display the Demonstrative_Label "Dados demonstrativos para o MVP".
2. THE Application SHALL present all Candidates using consistent visual treatment that does not visually favor any Candidate or party.
3. THE Application SHALL NOT display persuasive language, campaign slogans, or calls to vote for any Candidate.
4. THE Application SHALL visually distinguish factual information, candidate proposals, and comparison or analysis content from one another.
5. THE Application SHALL NOT use any party's colors as the primary visual identity of the Application.

### Requirement 15: Responsive Layout and Visual Style

**User Story:** As a User, I want a clean and responsive interface, so that the Application is legible and trustworthy on any device.

#### Acceptance Criteria

1. THE Application SHALL render its layouts using a mobile-first approach that adapts to viewport width.
2. WHILE the viewport width exceeds 1200px, THE Application SHALL constrain primary content to a centered column with a maximum width between 1100px and 1200px.
3. THE Application SHALL apply the defined color palette using dark navy for titles and primary elements, medium blue for secondary elements, a near-white bluish background, white cards, and bluish-gray for secondary text.
4. THE Application SHALL render content cards with rounded corners and soft shadows.

### Requirement 16: Accessibility

**User Story:** As a User who relies on assistive technology or keyboard navigation, I want an accessible interface, so that I can use all features of the Application.

#### Acceptance Criteria

1. THE Application SHALL use semantic HTML elements for page structure and interactive controls.
2. THE Application SHALL associate a text label with every form input control.
3. THE Application SHALL provide descriptive alternative text for every image.
4. THE Application SHALL implement interactive controls as native button or link elements so that they are operable by keyboard.
5. WHEN an interactive control receives keyboard focus, THE Application SHALL display a visible focus indicator.
6. WHEN the User points at or focuses an interactive control, THE Application SHALL display a hover or focus visual state.

### Requirement 17: Application Setup and Routing

**User Story:** As a developer, I want a runnable Vite project with configured routes, so that I can install and run the MVP locally.

#### Acceptance Criteria

1. THE Application SHALL install its dependencies through the command "npm install".
2. THE Application SHALL start a development server through the command "npm run dev".
3. THE Router SHALL map the paths "/", "/governador", "/governador/:uf", "/presidente", "/candidato/:id", "/quiz", "/quiz/perguntas", and "/quiz/resultado" to their corresponding page views.
4. IF the User navigates to a path that no route matches, THEN THE Application SHALL display a not-found view with a control that returns the User to the path "/".
5. THE Application SHALL display a Header on every page and a Footer on every page.
