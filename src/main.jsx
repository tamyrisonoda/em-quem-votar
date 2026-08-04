import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { QuizProvider } from './context/QuizContext.jsx';
import './styles/tokens.css';
import './styles/global.css';

// HashRouter is used so the app works on GitHub Pages without server-side SPA
// fallback: every route lives in the URL hash (e.g. /em-quem-votar/#/quiz), so
// deep links and page refreshes never hit a 404. (Tests wrap <App/> in their
// own routers, so this choice does not affect them.)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <QuizProvider>
        <App />
      </QuizProvider>
    </HashRouter>
  </React.StrictMode>
);
