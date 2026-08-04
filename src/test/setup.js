// Vitest global setup: registers jest-dom matchers and the axe a11y matcher.
import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as axeMatchers from 'vitest-axe/matchers';

// Register axe accessibility matchers (e.g. toHaveNoViolations).
expect.extend(axeMatchers);

// Ensure React Testing Library unmounts components between tests.
afterEach(() => {
  cleanup();
});
