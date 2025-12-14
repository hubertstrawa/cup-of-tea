import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useYearChange } from '../useYearChange';

describe('useYearChange', () => {
  const mockProps = {
    currentDate: new Date(2024, 0, 1), // January 2024
    setCurrentDate: vi.fn(),
    triggerAnimation: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useYearChange(mockProps));

    expect(typeof result.current).toBe('function');
  });

  it('should call triggerAnimation when returned function is invoked', () => {
    const { result } = renderHook(() => useYearChange(mockProps));

    result.current('next');

    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(1);
    expect(mockProps.triggerAnimation).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle different action types', () => {
    const { result } = renderHook(() => useYearChange(mockProps));

    // Test prev action
    result.current('prev');
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(1);

    // Test next action
    result.current('next');
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(2);

    // Test specific year action
    result.current(2025);
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(3);
  });

  it('should work with different dates', () => {
    const customProps = {
      currentDate: new Date(2025, 5, 15), // June 2025
      setCurrentDate: vi.fn(),
      triggerAnimation: vi.fn()
    };

    const { result } = renderHook(() => useYearChange(customProps));

    expect(typeof result.current).toBe('function');
  });
});