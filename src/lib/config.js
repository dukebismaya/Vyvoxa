// Environment configuration for deployment
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || '',
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
};

// Production optimizations
export const isDevelopment = config.isDevelopment;
export const isProduction = config.isProduction;

// Error reporting helpers
export const logError = (error, context = '') => {
  if (isDevelopment) {
    console.error(`[${context}]`, error);
  }
  // In production, you might want to send errors to a service like Sentry
  // sentry.captureException(error, { context });
};

// Performance monitoring
export const logPerformance = (name, duration) => {
  if (isDevelopment) {
    console.log(`⚡ ${name}: ${duration}ms`);
  }
};
