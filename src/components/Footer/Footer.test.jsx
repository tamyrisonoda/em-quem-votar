import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Footer from './Footer.jsx';
import { SOURCE_TEXT } from '../DemonstrativeLabel/DemonstrativeLabel.jsx';

describe('Footer', () => {
  it('renders a semantic contentinfo (footer) landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('carries the global demonstrative note inside the footer landmark', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(SOURCE_TEXT)).toBeInTheDocument();
  });
});
