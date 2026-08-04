// src/components/QuizQuestion/QuizQuestion.jsx
//
// Renders a single quiz question and its answer options as NATIVE radio inputs
// (Req 16.4) each paired with an associated <label> (Req 16.2). The question is
// wrapped in a <fieldset> + <legend> so assistive technology announces the
// options as a labeled group. Selection is reported upward via `onSelect`
// (Req 10.3); the component holds no answer state of its own.
//
// Validates: Requirements 10.1, 10.3, 16.2, 16.4.

import styles from './QuizQuestion.module.css';

/**
 * A single objective quiz question with selectable answer options.
 *
 * All radios in one question share the same `name` (the question id) so exactly
 * one option can be selected at a time. Each option renders a native
 * `<input type="radio">` with an associated `<label>` linked via `htmlFor`/`id`
 * (built from the option id), so the control is labeled for assistive
 * technology and resolvable via `getByLabelText` (Req 16.2). An option's
 * `checked` state derives from `value === option.value`, making the component
 * fully controlled: it renders selection from the `value` prop and reports each
 * change upward by calling `onSelect(option.value)` (Req 10.3). Styling is
 * limited to the neutral design tokens with a visible focus indicator.
 *
 * @param {Object} props
 * @param {{id: string, theme: string, text: string, options: {id: string, label: string, value: number}[]}} props.question
 *   the question to render, including its selectable options
 * @param {number} [props.value] - the currently selected option value (may be undefined)
 * @param {(value: number) => void} props.onSelect - called with the selected option value on change
 * @returns {JSX.Element}
 */
export default function QuizQuestion({ question, value, onSelect }) {
  return (
    <fieldset className={styles.question}>
      <legend className={styles.legend}>{question.text}</legend>
      <div className={styles.options}>
        {question.options.map((option) => {
          const inputId = `${question.id}-${option.id}`;
          const isChecked = value === option.value;
          return (
            <div key={option.id} className={styles.option}>
              <input
                id={inputId}
                className={styles.radio}
                type="radio"
                name={question.id}
                value={option.value}
                checked={isChecked}
                onChange={() => onSelect(option.value)}
              />
              <label className={styles.label} htmlFor={inputId}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
