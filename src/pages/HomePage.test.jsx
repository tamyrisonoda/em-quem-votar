import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage, { HOME_HEADLINE, QUIZ_CTA_TEXT } from './HomePage.jsx';

// HomePage uses react-router `Link`, so it must be rendered inside a Router.
function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('displays the logo text "EM QUEM VOTAR" (Req 1.1)', () => {
    renderHome();
    expect(screen.getByText('EM QUEM VOTAR')).toBeInTheDocument();
  });

  it('displays the exact headline and neutral subtext (Req 1.2)', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { name: HOME_HEADLINE })
    ).toBeInTheDocument();
    expect(screen.getByText(/ferramenta neutra/i)).toBeInTheDocument();
  });

  it('displays "Presidente" and "Governador" options linking to their routes (Req 1.3, 1.4, 1.5)', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /Presidente/ })).toHaveAttribute(
      'href',
      '/presidente'
    );
    expect(screen.getByRole('link', { name: /Governador/ })).toHaveAttribute(
      'href',
      '/governador'
    );
  });

  it('displays the quiz CTA text and a "Fazer o Quiz" button linking to /quiz (Req 1.6, 1.7)', () => {
    renderHome();
    expect(screen.getByText(QUIZ_CTA_TEXT)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Fazer o Quiz' })
    ).toHaveAttribute('href', '/quiz');
  });
});
