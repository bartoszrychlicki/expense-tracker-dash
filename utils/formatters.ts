/**
 * Formatting utilities for consistent data display
 * 
 * Provides centralized formatting functions for currency, percentages,
 * and other display values throughout the application.
 */

import { UI_CONFIG } from '@/config/constants';

/**
 * Formats a numeric value as currency without the currency symbol
 */
export const formatCurrency = (value: string | number | undefined): string => {
  if (value === undefined || value === null || value === '') {
    return UI_CONFIG.DEFAULT_PLACEHOLDER;
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return UI_CONFIG.DEFAULT_PLACEHOLDER;
  }
  
  return Math.round(numericValue).toString();
};

/**
 * Formats a percentage value (0-1 scale) as a percentage string
 */
export const formatPercentage = (value: string | number | undefined): string => {
  if (value === undefined || value === null || value === '') {
    return '0%';
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0%';
  }
  
  return `${Math.round(numericValue * 100)}%`;
};

/**
 * Formats a value with the application's currency symbol
 */
export const formatWithCurrency = (value: string | number | undefined): string => {
  return `${formatCurrency(value)} ${UI_CONFIG.CURRENCY}`;
};

/**
 * Formats a transaction value for display with proper sign
 * Expenses (positive values) show as negative with minus sign
 * Income (negative values) show as positive with plus sign
 */
export const formatTransactionDisplay = (value: string | number): { 
  displayValue: string; 
  isExpense: boolean;
} => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return { displayValue: formatCurrency(value), isExpense: false };
  }
  
  const isExpense = numericValue > 0;
  const absoluteValue = Math.abs(numericValue);
  const formattedValue = Math.round(absoluteValue).toString();
  
  const displayValue = isExpense 
    ? `-${formattedValue}`
    : `+${formattedValue}`;
  
  return { displayValue, isExpense };
};

/**
 * Formats a date string for display in Polish locale
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  } catch {
    return dateString;
  }
};