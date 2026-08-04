import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CandidateProfileHeader, {
  BACK_LABEL,
  buildPhotoAlt,
} from './CandidateProfileHeader.jsx';

// Example tests for CandidateProfileHeader (Req 4.1, 4.2, 16.3).
// useNavigate requires a Router, so renders are wrapped in MemoryRouter.

const governador = {
  id: 'gov-1',
  name: 'Marina Costa',
  number: '45',
  party: 'PDX',
  position: 'Governador',
  state: 'SP',
  ideology: 'Centro',
  photo: 'https://placehold.co/400x400?text=Marina',
};

const presidente = {
  id: 'pres-1',
  name: 'Aurora Vidal',
  number: '10',
  party: 'PMS',
  position: 'Presidente da República',
  state: null,
  ideology: 'Esquerda',
  photo: 'https://placehold.co/400x400?text=Aurora',
};

function renderHeader(candidate, props = {}) {
  return render(
    <MemoryRouter>
      <CandidateProfileHeader candidate={candidate} {...props} />
    </MemoryRouter>
  );
}

describe('CandidateProfileHeader', () => {
  it('renders name, number, office, party, and ideology tag (Req 4.1)', () => {
    renderHeader(governador);
    expect(screen.getByText('Marina Costa')).toBeInTheDocument();
    expect(screen.getByTestId('candidate-number')).toHaveTextContent('45');
    expect(screen.getByTestId('candidate-office')).toHaveTextContent('Governador');
    expect(screen.getByTestId('candidate-party')).toHaveTextContent('PDX');
    expect(screen.getByTestId('candidate-ideology')).toHaveTextContent('Centro');
  });

  it('renders the photo with descriptive alt text (Req 16.3)', () => {
    renderHeader(governador);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', governador.photo);
    expect(img).toHaveAttribute('alt', 'Foto de Marina Costa, candidato a Governador');
  });

  it('shows the state when applicable (Governador)', () => {
    renderHeader(governador);
    expect(screen.getByTestId('candidate-state')).toHaveTextContent('SP');
  });

  it('omits the state when it is null (Presidente)', () => {
    renderHeader(presidente);
    expect(screen.queryByTestId('candidate-state')).not.toBeInTheDocument();
  });

  it('renders a back control labeled "Voltar" (Req 4.2)', () => {
    renderHeader(governador);
    expect(
      screen.getByRole('button', { name: new RegExp(BACK_LABEL) })
    ).toBeInTheDocument();
  });

  it('calls onBack when the back control is activated', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderHeader(governador, { onBack });
    await user.click(screen.getByRole('button', { name: new RegExp(BACK_LABEL) }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('returns null when no candidate is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <CandidateProfileHeader />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('buildPhotoAlt produces the descriptive alt string', () => {
    expect(buildPhotoAlt(presidente)).toBe(
      'Foto de Aurora Vidal, candidato a Presidente da República'
    );
  });
});
