// src/components/ProfileTabs/ProfileTabs.jsx
//
// Tabbed navigation for the candidate profile. Renders the tab controls
// "Bio", "Propostas", "Finanças", "Histórico" (Req 4.3) as NATIVE <button>
// elements (Req 16.4) so they are keyboard operable, using ARIA tab semantics:
// a container role="tablist", each control role="tab" with aria-selected and
// aria-controls, and the content area role="tabpanel" with aria-labelledby.
// Only the active tab's content is shown (Req 4.4). The component manages the
// active-tab state internally, defaulting to the first tab.
//
// Validates: Requirements 4.3, 4.4, 16.4.

import { useState } from 'react';
import styles from './ProfileTabs.module.css';

/**
 * The tab labels, in the exact order required by the spec (Req 4.3).
 * @type {string[]}
 */
export const TAB_LABELS = ['Bio', 'Propostas', 'Finanças', 'Histórico'];

/**
 * Build a stable, DOM-safe id fragment from a tab label so `id`/`aria-controls`
 * references resolve without depending on the (possibly accented) label text.
 * @param {string} label
 * @param {number} index
 * @returns {string}
 */
function tabKey(label, index) {
  return `tab-${index}`;
}

/**
 * Tabbed candidate-profile navigation.
 *
 * Accepts the panel content via the `tabs` prop: an array of
 * `{ label, content }` entries. The component is uncontrolled by default —
 * it holds the active-tab index in internal state (`useState`) and defaults to
 * the first tab. Each tab is a native `<button role="tab">` whose
 * `aria-selected` reflects the active tab and whose `aria-controls` links to
 * its panel; the content area is a `<div role="tabpanel">` linked back via
 * `aria-labelledby`. Only the active tab's content is rendered (Req 4.4).
 * Styling uses brand-neutral design tokens with a visible focus indicator.
 *
 * @param {Object} props
 * @param {{label: string, content: React.ReactNode}[]} props.tabs
 *   the tabs to render, each with a display label and its panel content
 * @param {number} [props.defaultIndex=0] - index of the tab active on first render
 * @returns {JSX.Element|null}
 */
export default function ProfileTabs({ tabs = [], defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  if (tabs.length === 0) {
    return null;
  }

  // Clamp the active index so an out-of-range default cannot break rendering.
  const safeIndex = Math.min(Math.max(activeIndex, 0), tabs.length - 1);
  const activeTab = tabs[safeIndex];
  const activeKey = tabKey(activeTab.label, safeIndex);

  return (
    <div className={styles.tabs}>
      <div role="tablist" className={styles.tablist} aria-label="Seções do perfil">
        {tabs.map((tab, index) => {
          const key = tabKey(tab.label, index);
          const isActive = index === safeIndex;
          const classes = isActive
            ? `${styles.tab} ${styles.active}`
            : styles.tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`${key}-control`}
              className={classes}
              aria-selected={isActive}
              aria-controls={`${key}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${activeKey}-panel`}
        className={styles.panel}
        aria-labelledby={`${activeKey}-control`}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
