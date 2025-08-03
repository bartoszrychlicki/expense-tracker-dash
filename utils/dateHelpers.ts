/**
 * Date Helpers Utility
 * 
 * Provides consistent date formatting and manipulation functions
 * across the application.
 */

/**
 * Gets today's date in YYYY-MM-DD format
 */
export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Gets the current timestamp in full ISO format
 */
export const getNow = (): string => {
  return new Date().toISOString();
};

/**
 * Formats a date string to Polish locale format (DD.MM.YYYY)
 */
export const formatDatePL = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pl-PL');
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
};

/**
 * Formats a date for API submission (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date | string): string => {
  if (!date) return getToday();
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch {
    return getToday();
  }
};

/**
 * Gets a relative time string (e.g., "2 dni temu", "dzisiaj")
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'dzisiaj';
    if (diffInDays === 1) return 'wczoraj';
    if (diffInDays < 7) return `${diffInDays} dni temu`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tygodni temu`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} miesięcy temu`;
    
    return formatDatePL(dateString);
  } catch {
    return dateString;
  }
};

/**
 * Checks if a date is today
 */
export const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  } catch {
    return false;
  }
};

/**
 * Gets the start of the current month in YYYY-MM-DD format
 */
export const getMonthStart = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return formatDateForAPI(start);
};

/**
 * Gets the end of the current month in YYYY-MM-DD format
 */
export const getMonthEnd = (): string => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return formatDateForAPI(end);
};