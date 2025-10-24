import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW browser worker - Development için mock API
 * Production'da çalışmaz
 */
export const worker = setupWorker(...handlers);
