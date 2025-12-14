import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUser } from '../useUser';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should return initial state correctly', () => {
    // Mock a pending fetch that never resolves for this test
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refreshUser).toBe('function');
  });

  it('should have all required properties', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useUser());

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refreshUser');
  });

  it('should provide refreshUser function that can be called', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useUser());

    expect(typeof result.current.refreshUser).toBe('function');
    
    // Should not throw when calling refreshUser
    expect(() => {
      result.current.refreshUser();
    }).not.toThrow();
  });

  it('should maintain consistent hook structure', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useUser());

    // Test that the hook returns object with expected structure
    const hookResult = result.current;
    const expectedKeys = ['user', 'stats', 'loading', 'error', 'refreshUser'];
    
    expectedKeys.forEach(key => {
      expect(hookResult).toHaveProperty(key);
    });
  });
});