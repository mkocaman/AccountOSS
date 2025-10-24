import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 */
export const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false
        })
      ],
      
      // Performance monitoring
      tracesSampleRate: 1.0,
      
      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Environment
      environment: import.meta.env.MODE,
      release: `accountos@${import.meta.env.VITE_APP_VERSION}`,
      
      // Ignore specific errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured'
      ],
      
      // Before send hook
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
        }
        
        return event;
      }
    });

    console.log('✅ Sentry initialized');
  }
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error('Error:', error, context);
  }
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; email: string; name: string }) => {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name
    });
  }
};

/**
 * Clear user context
 */
export const clearUser = () => {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
};
