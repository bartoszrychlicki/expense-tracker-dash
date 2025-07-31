/**
 * Airtable API Service
 * 
 * This service handles all interactions with the Airtable API,
 * including fetching daily budget data and transactions.
 */

import { AIRTABLE_CONFIG, API_CONFIG } from '@/config/constants';
import {
    AirtableDailyBudgetFields,
    AirtablePlannedTransactionFields,
    AirtableResponse,
    AirtableTransactionFields,
    DailyBudget,
    PlannedTransaction,
    Transaction
} from '@/types';

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
async function makeAirtableRequest<T>(
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

/**
 * Fetches the latest daily budget record from Airtable
 */
export async function fetchLatestDailyBudget(): Promise<DailyBudget> {
  try {
    const endpoint = `${AIRTABLE_CONFIG.TABLES.DAYS}?sort[0][field]=Created at&sort[0][direction]=desc&maxRecords=1`;
    const data = await makeAirtableRequest<AirtableResponse<AirtableDailyBudgetFields>>(endpoint);

    if (!data.records?.length) {
      return {};
    }

    const fields = data.records[0].fields;
    return {
      dailyBudgetLeft: fields['Daily budget left']?.toString(),
      dailySpentSum: fields['Daily spent sum']?.toString(),
      todaysVariableDailyLimit: fields['Todays variable daily limit']?.toString(),
    };
  } catch (error) {
    console.error('Error fetching daily budget:', error);
    throw error;
  }
}

/**
 * Fetches recent transactions from Airtable
 */
export async function fetchRecentTransactions(): Promise<Transaction[]> {
  try {
    const endpoint = `${AIRTABLE_CONFIG.TABLES.TRANSACTIONS}?sort[0][field]=transaction date&sort[0][direction]=desc&maxRecords=${API_CONFIG.TRANSACTIONS_LIMIT}`;
    const data = await makeAirtableRequest<AirtableResponse<AirtableTransactionFields>>(endpoint);

    if (!data.records?.length) {
      return [];
    }

    return data.records.map((record): Transaction => ({
      id: record.id,
      Name: record.fields.Name || '',
      Ai_Category: record.fields.Ai_Category || '',
      Value: record.fields.Value?.toString() || '',
      Date: record.fields['transaction date'] || '',
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Fetches planned transactions from Airtable
 */
export async function fetchPlannedTransactions(): Promise<PlannedTransaction[]> {
  try {
    const endpoint = `${AIRTABLE_CONFIG.TABLES.PLANNED_TRANSACTIONS}?sort[0][field]=Created&sort[0][direction]=desc`;
    const data = await makeAirtableRequest<AirtableResponse<AirtablePlannedTransactionFields>>(endpoint);

    if (!data.records?.length) {
      return [];
    }

    return data.records.map((record): PlannedTransaction => ({
      id: record.id,
      Name: record.fields.Name || '',
      Value: record.fields.Value?.toString() || '',
      URL: record.fields.URL || '',
      Created: record.fields.Created || '',
      NumberOfHundreds: record.fields._NumberOfHundreds || 0,
      Decision_date: record.fields.Decision_date || '',
      Decision: record.fields.Decision || '',
    }));
  } catch (error) {
    console.error('Error fetching planned transactions:', error);
    throw error;
  }
}

/**
 * Utility function to check if a transaction value is positive (income)
 */
export function isPositiveTransaction(value: string): boolean {
  const numericValue = parseFloat(value);
  return !isNaN(numericValue) && numericValue > 0;
}

/**
 * Formats a transaction value for display
 */
export function formatTransactionValue(value: string): string {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return value;
  }
  return Math.round(numericValue).toString();
}