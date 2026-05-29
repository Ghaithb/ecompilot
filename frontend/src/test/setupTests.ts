import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import 'whatwg-fetch';

// Global mocks
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));

  // @ts-ignore
  window.IntersectionObserver = mockIntersectionObserver;
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.fetch = vi.fn();

beforeEach(() => vi.clearAllMocks());
