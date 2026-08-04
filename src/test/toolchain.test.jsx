import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuizProvider } from '../context/QuizContext.jsx';
import App from '../App.jsx';

// Placeholder test confirming the toolchain (Vitest + jsdom + RTL + jest-dom)
// is wired correctly. App renders the routed shell (Header + Outlet + Footer),
// so it is mounted inside a MemoryRouter and QuizProvider. Feature behavior is
// covered by dedicated page/component tests.
describe('toolchain', () => {
  it('renders the app shell', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuizProvider>
          <App />
        </QuizProvider>
      </MemoryRouter>
    );
    // The global Header (banner landmark) renders on every route.
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
