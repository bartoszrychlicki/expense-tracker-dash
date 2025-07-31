/**
 * Application constants and configuration
 * 
 * This file contains all the configuration constants used throughout the app.
 * Environment variables are prefixed with EXPO_PUBLIC_ to be accessible in the client.
 */


/**
 * Airtable configuration
 */
export const AIRTABLE_CONFIG = {
  BASE_ID: process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || 'appFKp3PqUbg7tcxe',
  API_KEY: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || 'pateg4IGkbM6zAoZU.312eb8dfc60d6f1274fd43d9acc80b5a9d94d11bb2bb598f4d63bc6819a82171',
  TABLES: {
    DAYS: process.env.EXPO_PUBLIC_AIRTABLE_DAYS_TABLE || 'days',
    TRANSACTIONS: process.env.EXPO_PUBLIC_AIRTABLE_TRANSACTIONS_TABLE || 'transactions',
    PLANNED_TRANSACTIONS: process.env.EXPO_PUBLIC_AIRTABLE_PLANNED_TRANSACTIONS_TABLE || 'planned_transactions',
  },
  BASE_URL: 'https://api.airtable.com/v0',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  TRANSACTIONS_LIMIT: 10,
  TIMEOUT: 10000, // 10 seconds
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  CURRENCY: 'PLN',
  DEFAULT_PLACEHOLDER: '--',
} as const;

/**
 * Validation function to ensure required environment variables are set
 */
export const validateEnvironmentVariables = (): void => {
  const requiredVars = [
    'EXPO_PUBLIC_AIRTABLE_BASE_ID',
    'EXPO_PUBLIC_AIRTABLE_API_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};