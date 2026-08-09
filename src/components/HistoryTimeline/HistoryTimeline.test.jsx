import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryTimeline, {
  VOTACOES_HEADING,
  VOTACOES_PLACEHOLDER,
} from './HistoryTimeline.jsx';
import { SOURCE_TEXT } from '../DemonstrativeLabel/DemonstrativeLabel.jsx';

// Example tests for the HistoryTimeline component (Req 8.1, 8.2, 8.3, 8.4).
describe('HistoryTimeline', () => {
  const history = [
    { year: 2010, event: 'Eleito vereador' },
    { year: 2022, event: 'Candidato a governador' },
    { year: 2016, event: 'Eleito prefeito' },
  ];

  it('renders each entry with its year and event (Req 8.1)', () => {
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('Eleito vereador')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('Candidato a governador')).toBeInTheDocument();
    expect(screen.getByText('2016')).toBeInTheDocument();
    expect(screen.getByText('Eleito prefeito')).toBeInTheDocument();
  });

  it('renders entries in reverse chronological order, most recent first (Req 8.2)', () => {
    render(<HistoryTimeline history={history} />);
    const years = screen
      .getAllByTestId('history-year')
      .map((el) => Number(el.textContent));
    expect(years).toEqual([2022, 2016, 2010]);
  });

  it('does not mutate the history prop while ordering (Req 8.2)', () => {
    const input = [
      { year: 2010, event: 'a' },
      { year: 2022, event: 'b' },
    ];
    const snapshot = input.map((e) => e.year);
    render(<HistoryTimeline history={input} />);
    expect(input.map((e) => e.year)).toEqual(snapshot);
  });

  it('renders the "Votações" future-feature placeholder (Req 8.3)', () => {
    render(<HistoryTimeline history={history} />);
    expect(
      screen.getByRole('heading', { name: VOTACOES_HEADING })
    ).toBeInTheDocument();
    expect(screen.getByText(VOTACOES_PLACEHOLDER)).toBeInTheDocument();
  });

  it('includes the data-source label (Req 8.4)', () => {
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText(SOURCE_TEXT)).toBeInTheDocument();
  });

  it('renders a friendly message when history is empty', () => {
    render(<HistoryTimeline history={[]} />);
    expect(screen.getByText('Nenhum histórico disponível.')).toBeInTheDocument();
    // Placeholder and label still render.
    expect(
      screen.getByRole('heading', { name: VOTACOES_HEADING })
    ).toBeInTheDocument();
  });
});
