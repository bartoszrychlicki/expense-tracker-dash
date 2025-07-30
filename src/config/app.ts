/**
 * Application Configuration
 * 
 * This file contains application-wide configuration settings
 * and constants that are used throughout the app.
 */

export const APP_CONFIG = {
  // Application metadata
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Expense Tracker Dashboard',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  
  // API configuration
  api: {
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES || '3'),
  },
  
  // UI configuration
  ui: {
    defaultCurrency: 'PLN',
    defaultLocale: 'pl-PL',
    transactionLimit: 10,
    refreshInterval: 30000, // 30 seconds
  },
  
  // Feature flags
  features: {
    enablePullToRefresh: true,
    enableErrorRetry: true,
    enableLoadingStates: true,
  },
} as const;

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#0f172a',
    },
    success: {
      100: '#dcfce7',
      800: '#166534',
    },
    error: {
      100: '#fee2e2',
      800: '#991b1b',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
} as const;