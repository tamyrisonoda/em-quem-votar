// src/pages/quizPrivacy.security.test.jsx
//
// Cross-cutting security/privacy test for quiz answers (Req 10.4).
//
// Requirement 10.4: "THE Application SHALL store Quiz answers only in
// client-side application state and SHALL NOT transmit Quiz answers to any
// server." The design reinforces this: QuizContext performs ZERO I/O, answers
// live only in React state (memory), and nothing serializes them to network or
// storage sinks.
//
// This test enforces that contract at the integration level. It installs spies
// on every plausible exfiltration/persistence sink BEFORE rendering, then drives
// the FULL quiz answer flow (answer every question and advance to the result)
// and asserts that none of the sinks were ever invoked:
//   - fetch
//   - navigator.sendBeacon
//   - XMLHttpRequest.prototype.open / .send
//   - Storage.prototype.setItem  (covers localStorage AND sessionStorage)
//   - localStorage.setItem / sessionStorage.setItem (belt-and-suspenders)
//
// If a future change wires answers to any of these, this test fails.
//
// Validates: Requirements 10.4

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import { QUIZ_NEXT_LABEL, QUIZ_FINISH_LABEL } from './QuizQuestionsPage.jsx';
import { RESULT_HEADING } from './QuizResultPage.jsx';
import { questions } from '../data/questions.js';

/**
 * Render the routed App at "/quiz/perguntas" wrapped in the QuizProvider so the
 * quiz pages share answer state, exactly like production (main.jsx).
 */
function renderQuizAt(path = '/quiz/perguntas') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QuizProvider>
        <App />
      </QuizProvider>
    </MemoryRouter>,
  );
}

describe('Quiz answer privacy (Req 10.4): answers never leave client memory', () => {
  /** @type {import('vitest').MockInstance[]} handles we assert against */
  let fetchSpy;
  let sendBeaconSpy;
  let xhrOpenSpy;
  let xhrSendSpy;
  let storageSetItemSpy;
  let localSetItemSpy;
  let sessionSetItemSpy;

  beforeEach(() => {
    // --- fetch --------------------------------------------------------------
    // jsdom may not define fetch. Ensure a stub exists so spying is possible,
    // then spy on it. If a real fetch exists, spy on it directly.
    if (typeof globalThis.fetch !== 'function') {
      globalThis.fetch = () => Promise.resolve();
    }
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve());

    // --- navigator.sendBeacon ----------------------------------------------
    // sendBeacon is typically undefined in jsdom. Define it as a mock so we can
    // assert it is never invoked with answer data.
    if (typeof navigator.sendBeacon !== 'function') {
      // Define a configurable property backed by a mock.
      Object.defineProperty(navigator, 'sendBeacon', {
        configurable: true,
        writable: true,
        value: vi.fn(() => true),
      });
      sendBeaconSpy = navigator.sendBeacon;
    } else {
      sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon').mockReturnValue(true);
    }

    // --- XMLHttpRequest -----------------------------------------------------
    xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
    xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => {});

    // --- Web Storage --------------------------------------------------------
    // Storage.prototype.setItem covers BOTH localStorage and sessionStorage,
    // since both are Storage instances. Also spy on the concrete instances as a
    // second layer of defense.
    storageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    localSetItemSpy = vi.spyOn(window.localStorage, 'setItem');
    sessionSetItemSpy = vi.spyOn(window.sessionStorage, 'setItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Remove the sendBeacon stub we may have defined so tests stay isolated.
    if (sendBeaconSpy && !sendBeaconSpy.mock?.restore) {
      try {
        delete navigator.sendBeacon;
      } catch {
        // ignore: property may be non-configurable in some environments
      }
    }
  });

  it('records answers to every question and reaches the result without touching any network or storage sink', async () => {
    const user = userEvent.setup();
    renderQuizAt('/quiz/perguntas');

    // Sanity: the quiz questions view has rendered.
    expect(
      screen.getByRole('heading', { name: 'Quiz de Afinidade' }),
    ).toBeInTheDocument();

    const total = questions.length;
    expect(total).toBeGreaterThan(0);

    // Drive the FULL flow: answer each question, then advance. On the last
    // question the finish control replaces "Próxima" and navigates to the
    // result once all questions are answered.
    for (let i = 0; i < total; i += 1) {
      // Each question shows a 5-point Likert set; "Concordo" (value 4) exists on
      // every question and is unique on the currently displayed question.
      const option = await screen.findByLabelText('Concordo');
      await user.click(option);

      if (i < total - 1) {
        const nextButton = screen.getByRole('button', { name: QUIZ_NEXT_LABEL });
        expect(nextButton).toBeEnabled();
        await user.click(nextButton);
      } else {
        const finishButton = screen.getByRole('button', {
          name: QUIZ_FINISH_LABEL,
        });
        expect(finishButton).toBeEnabled();
        await user.click(finishButton);
      }
    }

    // The full flow reached the result page (proves answers flowed end-to-end).
    expect(
      await screen.findByRole('heading', { name: RESULT_HEADING }),
    ).toBeInTheDocument();

    // --- The core privacy assertions: no sink was ever invoked -------------
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
    expect(storageSetItemSpy).not.toHaveBeenCalled();
    expect(localSetItemSpy).not.toHaveBeenCalled();
    expect(sessionSetItemSpy).not.toHaveBeenCalled();
  });
});
