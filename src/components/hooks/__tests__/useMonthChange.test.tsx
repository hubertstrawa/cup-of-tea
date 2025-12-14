import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMonthChange } from '../useMonthChange';

describe('useMonthChange', () => {
  const mockProps = {
    currentDate: new Date(2024, 0, 1), // January 2024
    setCurrentDate: vi.fn(),
    setValue: vi.fn(),
    triggerAnimation: vi.fn(),
    months: [
      { value: 'january' },
      { value: 'february' },
      { value: 'march' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useMonthChange(mockProps));

    expect(typeof result.current).toBe('function');
  });

  it('should call triggerAnimation when returned function is invoked', () => {
    const { result } = renderHook(() => useMonthChange(mockProps));

    result.current('next');

    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(1);
    expect(mockProps.triggerAnimation).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle different action types', () => {
    const { result } = renderHook(() => useMonthChange(mockProps));

    // Test prev action
    result.current('prev');
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(1);

    // Test next action
    result.current('next');
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(2);

    // Test specific month action
    result.current('february');
    expect(mockProps.triggerAnimation).toHaveBeenCalledTimes(3);
  });

  it('should work with different month arrays', () => {
    const customMonths = [
      { value: 'jan' },
      { value: 'feb' }
    ];

    const customProps = {
      ...mockProps,
      months: customMonths
    };

    const { result } = renderHook(() => useMonthChange(customProps));

    expect(typeof result.current).toBe('function');
  });
});