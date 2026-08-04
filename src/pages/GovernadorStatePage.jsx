// src/pages/GovernadorStatePage.jsx
//
// GovernadorStatePage — the state picker served at "/governador". It asks the
// User in which state they vote, lists the selectable states supplied by the
// Data_Provider, and (once a state is chosen) navigates to the scoped
// Governador candidate list at "/governador/{uf}".
//
// The state list is fully data-driven: options come from `getStates()` via the
// `useProviderData` hook, so adding a state to the Data_Store needs no change
// here (Req 2.3). The control is a native <select> paired with a <label> for
// accessibility (Req 16.2), and the "Continuar" button stays disabled until a
// UF is selected (Req 2.4).
//
// Validates: Requirements 2.1, 2.2, 2.4, 2.5, 16.2.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStates } from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import styles from './GovernadorStatePage.module.css';

/**
 * The exact prompt mandated by the spec (Req 2.1).
 * @type {string}
 */
export const STATE_PROMPT = 'Em qual estado você vota?';

/**
 * State-selection page for the Governador flow.
 *
 * Renders the exact prompt "Em qual estado você vota?" (Req 2.1), a labeled
 * <select> populated from `getStates()` where each option shows the state name
 * and carries its `uf` as the value (Req 2.2), and a "Continuar" button that is
 * disabled while no state is selected (Req 2.4). Activating "Continuar" with a
 * chosen state navigates to "/governador/{uf}" (Req 2.5).
 *
 * Data flows through `useProviderData` so the sync→async provider transition is
 * isolated to that hook; the list is data-driven and requires no page edit when
 * states are added (Req 2.3).
 *
 * @returns {JSX.Element}
 */
export default function GovernadorStatePage() {
  const navigate = useNavigate();
  const { data: states } = useProviderData(() => getStates(), []);
  const [selectedUf, setSelectedUf] = useState('');

  const options = states ?? [];
  const canContinue = selectedUf !== '';

  /**
   * Navigate to the scoped Governador candidate list for the selected UF.
   * @param {import('react').FormEvent} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    if (!canContinue) return;
    navigate(`/governador/${selectedUf}`);
  }

  return (
    <section className={`container ${styles.page}`}>
      <h1 className={styles.prompt}>{STATE_PROMPT}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="governador-state">
            Estado
          </label>
          <select
            id="governador-state"
            className={styles.select}
            value={selectedUf}
            onChange={(event) => setSelectedUf(event.target.value)}
          >
            <option value="">Selecione seu estado</option>
            {options.map((state) => (
              <option key={state.uf} value={state.uf}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.continue} disabled={!canContinue}>
          Continuar
        </button>
      </form>
    </section>
  );
}
