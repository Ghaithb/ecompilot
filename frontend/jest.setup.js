import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';
import { configure } from '@testing-library/react';

// Configuration globale pour React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = jest.fn();

// Setup pour les tests qui utilisent fetch
beforeAll(() => {
  // Mock de l'API fetch
  global.fetch = jest.fn();
});

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppression des avertissements de React Testing Library liés aux actes
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});