// src/hooks/useProviderData.test.jsx
//
// Unit tests for the sync/async-tolerant provider data hook (task 3.3).
// Covers: synchronous value (no loading flash), resolved Promise, rejected
// Promise, synchronous throw, and re-fetch when deps change.

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProviderData } from './useProviderData.js';

describe('useProviderData', () => {
  it('exposes a synchronous value immediately without a loading flash', () => {
    const { result } = renderHook(() => useProviderData(() => ['a', 'b'], []));

    // Synchronous providers must resolve on the first render (no pending flash).
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(['a', 'b']);
  });

  it('surfaces a pending state then resolves a Promise value', async () => {
    const { result } = renderHook(() =>
      useProviderData(() => Promise.resolve(42), []),
    );

    // Async path starts pending with no data yet.
    expect(result.current.pending).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('captures a rejected Promise into error', async () => {
    const boom = new Error('provider failed');
    const { result } = renderHook(() =>
      useProviderData(() => Promise.reject(boom), []),
    );

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.error).toBe(boom);
    expect(result.current.data).toBeNull();
  });

  it('captures a synchronous throw into error', () => {
    const { result } = renderHook(() =>
      useProviderData(() => {
        throw new Error('sync boom');
      }, []),
    );

    expect(result.current.pending).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('sync boom');
  });

  it('re-invokes the factory when deps change', () => {
    const factory = vi.fn((n) => n * 2);
    const { result, rerender } = renderHook(
      ({ n }) => useProviderData(() => factory(n), [n]),
      { initialProps: { n: 1 } },
    );

    expect(result.current.data).toBe(2);

    rerender({ n: 5 });
    expect(result.current.data).toBe(10);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale async result after deps change', async () => {
    // First render returns a slow promise; a deps change supersedes it with a
    // faster one. The stale (slow) result must not overwrite the newer value.
    let resolveSlow;
    const slow = new Promise((res) => {
      resolveSlow = res;
    });

    const { result, rerender } = renderHook(
      ({ key }) =>
        useProviderData(() => (key === 'slow' ? slow : Promise.resolve('fast')), [key]),
      { initialProps: { key: 'slow' } },
    );

    rerender({ key: 'fast' });
    await waitFor(() => expect(result.current.data).toBe('fast'));

    // Now resolve the stale promise; it should be ignored.
    resolveSlow('slow');
    await Promise.resolve();
    expect(result.current.data).toBe('fast');
  });
});
