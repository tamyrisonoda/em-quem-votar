import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';

import HomePage from './pages/HomePage.jsx';
import GovernadorStatePage from './pages/GovernadorStatePage.jsx';
import CandidateListPage from './pages/CandidateListPage.jsx';
import CandidateProfilePage from './pages/CandidateProfilePage.jsx';
import QuizIntroPage from './pages/QuizIntroPage.jsx';
import QuizQuestionsPage from './pages/QuizQuestionsPage.jsx';
import QuizResultPage from './pages/QuizResultPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import { OFFICE_PRESIDENTE, OFFICE_GOVERNADOR } from './providers/dataProvider.js';

/**
 * Layout shared by every route. Renders the global Header and Footer so they
 * appear on every page (Req 17.5), with the active route's page rendered in
 * between via `<Outlet />`. Pages own their own semantic `<main>`, so the
 * layout does not add one to avoid nesting `<main>` elements.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

/**
 * Application routing table (Req 17.3, 17.4, 17.5). This component intentionally
 * renders only `<Routes>` (no Router), so `main.jsx` can provide `<BrowserRouter>`
 * in the app and tests can wrap `<App />` in a `<MemoryRouter>`.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="presidente" element={<CandidateListPage office={OFFICE_PRESIDENTE} />} />
        <Route path="governador" element={<GovernadorStatePage />} />
        <Route path="governador/:uf" element={<CandidateListPage office={OFFICE_GOVERNADOR} />} />
        <Route path="candidato/:id" element={<CandidateProfilePage />} />
        <Route path="quiz" element={<QuizIntroPage />} />
        <Route path="quiz/perguntas" element={<QuizQuestionsPage />} />
        <Route path="quiz/resultado" element={<QuizResultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
