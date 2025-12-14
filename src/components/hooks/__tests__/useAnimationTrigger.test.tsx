import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimationTrigger } from '../useAnimationTrigger';

describe('useAnimationTrigger', () => {
  it('should return initial animation state as false', () => {
    const { result } = renderHook(() => useAnimationTrigger(300));

    expect(result.current.isAnimating).toBe(false);
    expect(typeof result.current.triggerAnimation).toBe('function');
  });

  it('should set isAnimating to true when triggerAnimation is called', () => {
    const { result } = renderHook(() => useAnimationTrigger(300));

    act(() => {
      result.current.triggerAnimation(() => {});
    });

    expect(result.current.isAnimating).toBe(true);
  });

  it('should accept different animation durations', () => {
    const { result: result1 } = renderHook(() => useAnimationTrigger(100));
    const { result: result2 } = renderHook(() => useAnimationTrigger(500));

    expect(result1.current.isAnimating).toBe(false);
    expect(result2.current.isAnimating).toBe(false);
    expect(typeof result1.current.triggerAnimation).toBe('function');
    expect(typeof result2.current.triggerAnimation).toBe('function');
  });
});