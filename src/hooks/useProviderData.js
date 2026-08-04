// src/hooks/useProviderData.js
//
// useProviderData — the single seam that isolates the eventual synchronous ->
// asynchronous transition of the Data_Provider to one hook rather than every
// page (see design.md § Data-Access Async Readiness).
//
// Page components request data through a `factory` thunk (e.g.
// `() => getCandidatesByOffice(office, uf)`) instead of calling providers
// directly in render. The factory may return EITHER a plain synchronous value
// (the MVP behaviour) OR a Promise (the future `fetch(...)` behaviour). This
// hook tolerates both:
//   - Synchronous value  -> `data` is set immediately, no loading flash.
//   - Thenable (Promise) -> `pending` is set true, then resolved into `data`.
// Errors from either path are captured into `error`.
//
// The factory is invoked exactly once per `deps` change: the first-render probe
// (used to seed synchronous data without a loading flash) is reused by the
// effect rather than calling the factory a second time, so an async provider
// never fires a duplicate request and its promise is always handled.
//
// Validates / supports: Requirement 13.5 (swappable data source without page
// changes).

import { useEffect, useRef, useState } from 'react';

/**
 * @template T
 * @typedef {Object} ProviderDataState
 * @property {T|null} data     - the resolved value, or null before it is available
 * @property {boolean} pending - true while an async factory result is resolving
 * @property {Error|null} error - the captured error, or null when there is none
 */

/**
 * Detect a thenable (Promise-like) without assuming a native Promise, so any
 * async provider implementation (native Promise, custom thenable) is tolerated.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isThenable(value) {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  );
}

/**
 * Normalise a thrown/rejected value into an Error instance so `error` always
 * has a consistent shape for consumers.
 *
 * @param {unknown} err
 * @returns {Error}
 */
function toError(err) {
  return err instanceof Error ? err : new Error(String(err));
}

/**
 * Call a provider factory and expose its result as a `{ data, pending, error }`
 * shape, tolerating both synchronous return values and Promises.
 *
 * The factory is re-invoked whenever a value in `deps` changes, mirroring the
 * semantics of `useEffect` dependencies. Stale async results are ignored using
 * a cancellation flag so state is never set after unmount or after a newer
 * request has superseded an in-flight one.
 *
 * @template T
 * @param {() => (T | Promise<T>)} factory - thunk returning a value or a Promise
 * @param {ReadonlyArray<unknown>} [deps=[]] - re-fetch triggers, like useEffect deps
 * @returns {ProviderDataState<T>} the current data/pending/error state
 *
 * @example
 * const { data, pending, error } = useProviderData(
 *   () => getCandidatesByOffice(office, uf),
 *   [office, uf],
 * );
 */
export function useProviderData(factory, deps = []) {
  // Holds the first-render probe so the effect can reuse it instead of calling
  // the factory a second time. Consumed (cleared) on the effect's first run.
  const firstProbe = useRef(null);
  const isFirstRun = useRef(true);

  const [state, setState] = useState(() => {
    try {
      const result = factory();
      firstProbe.current = { ok: true, value: result };
      if (isThenable(result)) {
        // Async on first render: start pending; the effect resolves it.
        return { data: null, pending: true, error: null };
      }
      // Sync on first render: seed data now to avoid a loading flash.
      return { data: result, pending: false, error: null };
    } catch (err) {
      const error = toError(err);
      firstProbe.current = { ok: false, error };
      return { data: null, pending: false, error };
    }
  });

  useEffect(() => {
    let cancelled = false;
    let result;

    if (isFirstRun.current) {
      // Reuse the probe from the state initializer — do not call factory again.
      isFirstRun.current = false;
      const probe = firstProbe.current;
      firstProbe.current = null;

      // A first-render throw or synchronous value is already reflected in state.
      if (!probe.ok || !isThenable(probe.value)) {
        return undefined;
      }
      // First-render async: state is already pending; fall through to resolve.
      result = probe.value;
    } else {
      // A deps change: re-invoke the factory and reset state accordingly.
      try {
        result = factory();
      } catch (err) {
        setState({ data: null, pending: false, error: toError(err) });
        return undefined;
      }

      if (isThenable(result)) {
        setState((prev) => ({ data: prev.data, pending: true, error: null }));
      } else {
        setState({ data: result, pending: false, error: null });
        return undefined;
      }
    }

    // Async path (first-render or deps-change): resolve/reject into state,
    // ignoring the result if a newer request or unmount has superseded it.
    Promise.resolve(result).then(
      (value) => {
        if (!cancelled) setState({ data: value, pending: false, error: null });
      },
      (err) => {
        if (!cancelled) setState({ data: null, pending: false, error: toError(err) });
      },
    );

    return () => {
      cancelled = true;
    };
    // The factory identity is intentionally excluded; `deps` controls re-fetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export default useProviderData;
