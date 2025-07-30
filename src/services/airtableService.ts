/**
 * Airtable API Service
 * 
 * This service handles all communication with the Airtable API,
 * including data fetching, error handling, and response transformation.
 */

import { 
  AIRTABLE_CONFIG, 
  getAirtableHeaders, 
  getAirtableUrl 
} from '../constants/api';
import { 
  AirtableResponse, 
  DayRecordFields, 
  TransactionRecordFields,
  Transaction,
  DailyBudget,
  ApiError 
} from '../types/api';

/**
 * Fetches data from Airtable API with error handling
 * @param url - The API endpoint URL
 * @returns Promise with the API response data
 */
async function fetchFromAirtable<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: getAirtableHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Airtable API Error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch data from Airtable'
    );
  }
}

/**
 * Fetches the latest daily budget record from Airtable
 * @returns Promise with the daily budget data
 */
export async function fetchLatestDailyBudget(): Promise<DailyBudget> {
  const url = getAirtableUrl(AIRTABLE_CONFIG.TABLES.DAYS, {
    'sort[0][field]': 'Created at',
    'sort[0][direction]': 'desc',
    'maxRecords': 1,
  });

  const data: AirtableResponse<DayRecordFields> = await fetchFromAirtable(url);
  
  if (!data.records?.length) {
    throw new Error('No daily budget records found');
  }

  const fields = data.records[0].fields;
  
  return {
    budgetLeft: fields["Daily budget left"] || 0,
    spentSum: fields["Daily spent sum"] || 0,
    totalLimit: fields["Todays variable daily limit"] || 0,
  };
}

/**
 * Fetches recent transactions from Airtable
 * @param maxRecords - Maximum number of records to fetch (default: 10)
 * @returns Promise with the transactions data
 */
export async function fetchRecentTransactions(maxRecords: number = 10): Promise<Transaction[]> {
  const url = getAirtableUrl(AIRTABLE_CONFIG.TABLES.TRANSACTIONS, {
    'sort[0][field]': 'transaction date',
    'sort[0][direction]': 'desc',
    'maxRecords': maxRecords,
  });

  const data: AirtableResponse<TransactionRecordFields> = await fetchFromAirtable(url);
  
  if (!data.records?.length) {
    return [];
  }

  return data.records.map((record) => {
    const fields = record.fields;
    const value = fields.Value || 0;
    
    return {
      id: record.id,
      name: fields.Name || '',
      category: fields.Ai_Category || '',
      value: Math.abs(value),
      date: fields["transaction date"] || '',
      isPositive: value > 0,
    };
  });
}

/**
 * Fetches both daily budget and recent transactions
 * @returns Promise with combined data
 */
export async function fetchDashboardData() {
  try {
    const [dailyBudget, transactions] = await Promise.all([
      fetchLatestDailyBudget(),
      fetchRecentTransactions(),
    ]);

    return {
      dailyBudget,
      transactions,
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
}