import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header.jsx';

// Header uses react-router `Link`, so it must be rendered inside a Router.
function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders a semantic banner (header) and navigation landmark', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' })
    ).toBeInTheDocument();
  });

  it('renders the app logo as a link to "/"', () => {
    renderHeader();
    const logo = screen.getByRole('link', { name: 'EM QUEM VOTAR' });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders navigation links to the office and quiz routes', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Presidente' })).toHaveAttribute(
      'href',
      '/presidente'
    );
    expect(screen.getByRole('link', { name: 'Governador' })).toHaveAttribute(
      'href',
      '/governador'
    );
    expect(screen.getByRole('link', { name: 'Quiz' })).toHaveAttribute(
      'href',
      '/quiz'
    );
  });
});
