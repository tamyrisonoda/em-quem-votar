// src/App.routing.test.jsx
//
// Task 13.4 — EXAMPLE (regular vitest) test for the App router path mapping.
//
// Renders <App /> inside a <MemoryRouter> for each required path and asserts a
// distinctive, stable piece of the corresponding page view renders. This proves
// every route in App.jsx is wired to its intended page (Req 17.3).
//
// App renders ONLY <Routes> (no Router), so each case wraps it in a
// <MemoryRouter initialEntries={[path]}> and a <QuizProvider> (the quiz routes
// require the quiz context).
//
// Distinctive markers used per path (exact copy read from each page):
//   "/"                    -> HomePage HOME_HEADLINE
//   "/presidente"          -> CandidateList title "Candidatos"
//   "/governador"          -> GovernadorStatePage STATE_PROMPT
//   "/governador/SP"       -> CandidateList title "Candidatos" (scoped to SP)
//   "/candidato/{realId}"  -> the candidate's name (CandidateProfileHeader)
//   "/quiz"                -> QuizIntroPage title "Quiz de Afinidade"
//   "/quiz/perguntas"      -> QuizProgress role="progressbar" (unique to this page;
//                             the h1 title equals the intro title, so the progress
//                             bar is the reliable distinguishing marker)
//   "/quiz/resultado"      -> with an EMPTY quiz the completion guard (Req 12.6)
//                             redirects to "/quiz", so the QuizIntro title renders.
//                             This still exercises that the route is wired.
//   "/nope" (unknown)      -> NotFoundPage "Página não encontrada"

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App.jsx';
import { QuizProvider } from './context/QuizContext.jsx';

import { HOME_HEADLINE } from './pages/HomePage.jsx';
import { STATE_PROMPT } from './pages/GovernadorStatePage.jsx';
import { QUIZ_INTRO_TITLE } from './pages/QuizIntroPage.jsx';
import {
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
} from './providers/dataProvider.js';

/**
 * Render <App /> at a given path inside a MemoryRouter + QuizProvider.
 * @param {string} path
 */
function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QuizProvider>
        <App />
      </QuizProvider>
    </MemoryRouter>,
  );
}

describe('App router path mapping (Req 17.3)', () => {
  it('"/" renders the HomePage', () => {
    renderAppAt('/');
    expect(screen.getByText(HOME_HEADLINE)).toBeInTheDocument();
  });

  it('"/presidente" renders the candidate list page', () => {
    renderAppAt('/presidente');
    expect(screen.getByText('Candidatos')).toBeInTheDocument();
  });

  it('"/governador" renders the state picker page', () => {
    renderAppAt('/governador');
    expect(screen.getByText(STATE_PROMPT)).toBeInTheDocument();
  });

  it('"/governador/:uf" renders the candidate list page scoped to the state', () => {
    renderAppAt('/governador/SP');
    expect(screen.getByText('Candidatos')).toBeInTheDocument();
  });

  it('"/candidato/:id" renders the candidate profile page', () => {
    const candidate = getCandidatesByOffice(OFFICE_PRESIDENTE)[0];
    renderAppAt(`/candidato/${candidate.id}`);
    // The candidate's name appears in the CandidateProfileHeader.
    expect(screen.getAllByText(candidate.name).length).toBeGreaterThan(0);
  });

  it('"/quiz" renders the quiz intro page', () => {
    renderAppAt('/quiz');
    expect(screen.getByText(QUIZ_INTRO_TITLE)).toBeInTheDocument();
  });

  it('"/quiz/perguntas" renders the quiz questions page', () => {
    renderAppAt('/quiz/perguntas');
    // The progress bar is unique to the questions page (the h1 title matches
    // the intro title, so it is not a reliable distinguishing marker).
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('"/quiz/resultado" is wired; with an empty quiz the guard redirects to the quiz intro (Req 12.6)', () => {
    renderAppAt('/quiz/resultado');
    // The completion guard redirects an incomplete quiz back to "/quiz", so the
    // QuizIntro title renders. This still confirms the route is wired.
    expect(screen.getByText(QUIZ_INTRO_TITLE)).toBeInTheDocument();
  });

  it('an unknown path renders the not-found page', () => {
    renderAppAt('/nope');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
