/**
 * Formatting Utilities
 * 
 * This file contains utility functions for formatting
 * data throughout the application.
 */

/**
 * Formats a number as currency with proper locale formatting
 * @param value - The number to format
 * @param currency - The currency code (defaults to PLN)
 * @param locale - The locale for formatting (defaults to pl-PL)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'PLN',
  locale: string = 'pl-PL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @param locale - The locale for formatting (defaults to pl-PL)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  locale: string = 'pl-PL'
): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Formats a number with proper thousand separators
 * @param value - The number to format
 * @param locale - The locale for formatting (defaults to pl-PL)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'pl-PL'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text string
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalizes the first letter of a string
 * @param text - The text to capitalize
 * @returns Capitalized text string
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formats a transaction value with proper sign and currency
 * @param value - The transaction value
 * @param isPositive - Whether the transaction is positive (income)
 * @param currency - The currency code (defaults to PLN)
 * @returns Formatted transaction value string
 */
export function formatTransactionValue(
  value: number,
  isPositive: boolean,
  currency: string = 'PLN'
): string {
  const sign = isPositive ? '+' : '-';
  const formattedValue = formatCurrency(Math.abs(value), currency);
  
  return `${sign}${formattedValue}`;
}