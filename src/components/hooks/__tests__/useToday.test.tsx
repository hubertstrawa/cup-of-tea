import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToday } from '../useToday';

describe('useToday', () => {
  it('should return a function', () => {
    const mockProps = {
      setCurrentDate: vi.fn(),
      setValue: vi.fn(),
      triggerAnimation: vi.fn()
    };

    const { result } = renderHook(() => useToday(mockProps));

    expect(typeof result.current).toBe('function');
  });

  it('should call triggerAnimation when returned function is invoked', () => {
    const mockSetCurrentDate = vi.fn();
    const mockSetValue = vi.fn();
    const mockTriggerAnimation = vi.fn();

    const mockProps = {
      setCurrentDate: mockSetCurrentDate,
      setValue: mockSetValue,
      triggerAnimation: mockTriggerAnimation
    };

    const { result } = renderHook(() => useToday(mockProps));

    result.current();

    expect(mockTriggerAnimation).toHaveBeenCalledTimes(1);
    expect(mockTriggerAnimation).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should work with different prop combinations', () => {
    const mockProps1 = {
      setCurrentDate: vi.fn(),
      setValue: vi.fn(),
      triggerAnimation: vi.fn()
    };

    const mockProps2 = {
      setCurrentDate: vi.fn(),
      setValue: vi.fn(),
      triggerAnimation: vi.fn()
    };

    const { result: result1 } = renderHook(() => useToday(mockProps1));
    const { result: result2 } = renderHook(() => useToday(mockProps2));

    expect(typeof result1.current).toBe('function');
    expect(typeof result2.current).toBe('function');
  });
});