/**
 * Account Helpers Utility
 * 
 * Provides helper functions for managing Airtable account records,
 * including caching to reduce API calls.
 */

import { AIRTABLE_CONFIG } from '@/config/constants';
import { AirtableAccountFields, AirtableResponse } from '@/types';
import { AirtableApiError, makeAirtableRequest } from './airtableClient';

interface AccountIds {
  goalsId: string;
  checkingId: string;
}

interface AccountInfo {
  id: string;
  name: string;
  balance: string;
}

// Cache for account IDs to avoid repeated API calls
let accountIdsCache: AccountIds | null = null;
let accountsCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches a single account by name
 */
async function fetchAccount(accountName: string): Promise<AccountInfo> {
  const endpoint = `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='${accountName}'&maxRecords=1`;
  const response = await makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(endpoint);
  
  if (!response.records?.length) {
    throw new AirtableApiError(`Account "${accountName}" not found`);
  }
  
  const record = response.records[0];
  return {
    id: record.id,
    name: record.fields.Name || accountName,
    balance: record.fields.Balance?.toString() || '0',
  };
}

/**
 * Gets cached account IDs or fetches them if cache is expired
 */
export async function getAccountIds(forceRefresh = false): Promise<AccountIds> {
  const now = Date.now();
  
  // Return cached data if valid and not forcing refresh
  if (
    !forceRefresh && 
    accountIdsCache && 
    accountsCacheTimestamp && 
    now - accountsCacheTimestamp < CACHE_DURATION
  ) {
    return accountIdsCache;
  }
  
  // Fetch fresh data
  try {
    const [goalsAccount, checkingAccount] = await Promise.all([
      fetchAccount('Goals'),
      fetchAccount('Checking'),
    ]);
    
    accountIdsCache = {
      goalsId: goalsAccount.id,
      checkingId: checkingAccount.id,
    };
    accountsCacheTimestamp = now;
    
    return accountIdsCache;
  } catch (error) {
    // If we have cached data and fetch fails, return cached data
    if (accountIdsCache) {
      console.warn('Failed to refresh account IDs, using cached data:', error);
      return accountIdsCache;
    }
    throw error;
  }
}

/**
 * Gets a specific account ID by name
 */
export async function getAccountId(accountName: 'Goals' | 'Checking'): Promise<string> {
  const ids = await getAccountIds();
  return accountName === 'Goals' ? ids.goalsId : ids.checkingId;
}

/**
 * Clears the account cache
 */
export function clearAccountCache(): void {
  accountIdsCache = null;
  accountsCacheTimestamp = null;
}

/**
 * Prefetches account IDs to warm up the cache
 */
export async function prefetchAccountIds(): Promise<void> {
  try {
    await getAccountIds(true);
  } catch (error) {
    console.error('Failed to prefetch account IDs:', error);
  }
}

/**
 * Helper to validate if an account ID exists
 */
export function isValidAccountId(id: string | undefined): boolean {
  return typeof id === 'string' && id.startsWith('rec') && id.length > 3;
}