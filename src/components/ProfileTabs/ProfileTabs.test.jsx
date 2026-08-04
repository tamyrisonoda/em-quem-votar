import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileTabs, { TAB_LABELS } from './ProfileTabs.jsx';

// Example tests for the ProfileTabs component (Req 4.3, 4.4, 16.4).
describe('ProfileTabs', () => {
  const tabs = [
    { label: 'Bio', content: <p>Conteúdo da bio</p> },
    { label: 'Propostas', content: <p>Conteúdo das propostas</p> },
    { label: 'Finanças', content: <p>Conteúdo das finanças</p> },
    { label: 'Histórico', content: <p>Conteúdo do histórico</p> },
  ];

  it('renders a tab control for each label in order (Req 4.3)', () => {
    render(<ProfileTabs tabs={tabs} />);
    const rendered = screen.getAllByRole('tab').map((el) => el.textContent);
    expect(rendered).toEqual(TAB_LABELS);
  });

  it('shows only the first tab content by default (Req 4.4)', () => {
    render(<ProfileTabs tabs={tabs} />);
    expect(screen.getByText('Conteúdo da bio')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo das finanças')).not.toBeInTheDocument();
    const bioTab = screen.getByRole('tab', { name: 'Bio' });
    expect(bioTab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the activated tab panel and sets aria-selected on click (Req 4.4)', async () => {
    const user = userEvent.setup();
    render(<ProfileTabs tabs={tabs} />);

    await user.click(screen.getByRole('tab', { name: 'Finanças' }));

    expect(screen.getByText('Conteúdo das finanças')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo da bio')).not.toBeInTheDocument();

    const financasTab = screen.getByRole('tab', { name: 'Finanças' });
    expect(financasTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Bio' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('links each tab to its panel via ARIA attributes (Req 16.4)', () => {
    render(<ProfileTabs tabs={tabs} />);
    const tabpanel = screen.getByRole('tabpanel');
    const selectedTab = screen.getByRole('tab', { name: 'Bio' });
    expect(selectedTab).toHaveAttribute('aria-controls', tabpanel.id);
    expect(tabpanel).toHaveAttribute('aria-labelledby', selectedTab.id);
  });

  it('renders nothing when no tabs are provided', () => {
    const { container } = render(<ProfileTabs tabs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
