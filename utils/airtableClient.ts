/**
 * Airtable Client Utility
 * 
 * Low-level client for making authenticated requests to Airtable API.
 * Separated from airtableService to avoid circular imports.
 */

import { AIRTABLE_CONFIG, API_CONFIG } from '@/config/constants';

/**
 * Custom error class for Airtable API errors
 */
export class AirtableApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AirtableApiError';
  }
}

/**
 * Makes an authenticated request to the Airtable API
 */
export async function makeAirtableRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AirtableApiError(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof AirtableApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AirtableApiError('Request timeout');
    }
    
    throw new AirtableApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}