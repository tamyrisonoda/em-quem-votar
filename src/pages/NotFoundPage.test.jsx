import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage.jsx';

// NotFoundPage uses react-router `Link`, so it must be rendered inside a Router.
function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );
}

describe('NotFoundPage', () => {
  it('renders a not-found heading and a brief message (Req 17.4)', () => {
    renderNotFound();
    expect(
      screen.getByRole('heading', { name: 'Página não encontrada' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('A página que você procura não existe ou foi movida.')
    ).toBeInTheDocument();
  });

  it('renders a control that navigates back to "/" (Req 17.4)', () => {
    renderNotFound();
    const homeLink = screen.getByRole('link', { name: 'Voltar ao início' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
