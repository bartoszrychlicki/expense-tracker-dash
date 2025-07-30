/**
 * UI Constants
 * 
 * This file contains all user-facing text and UI constants
 * for the expense tracker application.
 */

export const UI_TEXT = {
  // Dashboard Section Headers
  DASHBOARD: {
    TITLE: 'Budget na dziś',
    REMAINING_BUDGET: 'Zostało na dzisiaj',
    TOTAL_BUDGET: 'Całkowity budzet na dziś',
    SPENT_TODAY: 'Wydałem dzisiaj',
    RECENT_TRANSACTIONS: '10 ostatnich transakcji',
  },

  // Loading States
  LOADING: {
    DEFAULT: 'Loading...',
    FETCHING_DATA: 'Fetching data...',
    UPDATING: 'Updating...',
  },

  // Error Messages
  ERRORS: {
    FETCH_FAILED: 'Failed to fetch data',
    NETWORK_ERROR: 'Network connection error',
    UNKNOWN_ERROR: 'An unknown error occurred',
    RETRY: 'Try Again',
    SOMETHING_WENT_WRONG: 'Something went wrong',
  },

  // Currency
  CURRENCY: {
    PLN: 'PLN',
    DEFAULT: 'PLN',
  },

  // Placeholder Values
  PLACEHOLDERS: {
    NO_DATA: '--',
    NO_TRANSACTIONS: 'No transactions found',
  },
} as const;

export const UI_CONFIG = {
  // Default values
  DEFAULT_TRANSACTION_LIMIT: 10,
  DEFAULT_CURRENCY: 'PLN',
  
  // Styling constants
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    FULL: 9999,
  },
  
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
} as const;