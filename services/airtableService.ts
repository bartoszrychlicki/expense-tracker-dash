/**
 * Airtable API Service
 * 
 * This service handles all interactions with the Airtable API,
 * including fetching daily budget data and transactions.
 */

import { AIRTABLE_CONFIG, API_CONFIG } from '@/config/constants';
import {
  AirtableAccountFields,
  AirtableDailyBudgetFields,
  AirtablePlannedTransactionFields,
  AirtableResponse,
  AirtableTransactionFields,
  DailyBudget,
  NewTransaction,
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
      automaticSavingsToday: fields['auto_savigs_value']?.toString(),
      automaticSavingsPercentage: fields['auto_savings_percent (from Month)']?.[0]?.toString(),
      automaticGoalDepositsToday: fields['auto_goals_value']?.toString(),
      automaticGoalDepositsPercentage: fields['auto_goals_percent (from Month)']?.[0]?.toString(),
      automaticSavingsMonthSum: fields['auto_savings_sum (from Month)']?.[0]?.toString(),
      automaticGoalDepositsMonthSum: fields['auto_goals_sum']?.[0]?.toString(),
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
    const filterFormula = "OR(category_type!='Planned')";
    const endpoint = `${AIRTABLE_CONFIG.TABLES.TRANSACTIONS}?sort[0][field]=transaction date&sort[0][direction]=desc&maxRecords=${API_CONFIG.TRANSACTIONS_LIMIT}&filterByFormula=${encodeURIComponent(filterFormula)}`;
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
      Currently_selected_goal: record.fields.Currently_selected_goal || false,
    }));
  } catch (error) {
    console.error('Error fetching planned transactions:', error);
    throw error;
  }
}

/**
 * Fetches the balance for the Goals account from Airtable
 */
export async function fetchGoalsBalance(): Promise<string> {
  try {
    const endpoint = `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='Goals'&maxRecords=1`;
    const data = await makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(endpoint);

    if (!data.records?.length) {
      return '0';
    }

    const fields = data.records[0].fields;
    return fields.Balance?.toString() || '0';
  } catch (error) {
    console.error('Error fetching goals balance:', error);
    throw error;
  }
}

/**
 * Creates two transactions for goal savings: income on Goals account and expense on Checking account
 * Both transactions are created in a single API call for data consistency
 */
export async function createGoalTransaction(
  goalName: string,
  amount: number
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // First, fetch the record IDs for Goals and Checking accounts
    const [goalsAccountResponse, checkingAccountResponse] = await Promise.all([
      makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(
        `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='Goals'&maxRecords=1`
      ),
      makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(
        `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='Checking'&maxRecords=1`
      )
    ]);

    if (!goalsAccountResponse.records?.length) {
      throw new AirtableApiError('Goals account not found');
    }
    
    if (!checkingAccountResponse.records?.length) {
      throw new AirtableApiError('Checking account not found');
    }

    const goalsAccountId = goalsAccountResponse.records[0].id;
    const checkingAccountId = checkingAccountResponse.records[0].id;
    
    
    const transactionsData = {
      records: [
        {
          fields: {
            Name: 'cel długoterminowy: ' + goalName,
            Value: amount,
            //'transaction date': today,
            'To Account': [goalsAccountId],
            'From Account': [checkingAccountId],
          }
        }
      ]
    };
    
    console.log('Transaction data being sent:', JSON.stringify(transactionsData, null, 2));

    const endpoint = AIRTABLE_CONFIG.TABLES.TRANSACTIONS;
    const response = await makeAirtableRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(transactionsData),
    });
    
    console.log('Airtable response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error creating goal transaction:', error);
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
 * Sets a specific goal as the currently selected goal
 * Deactivates all other goals and activates the selected one
 */
export async function setCurrentGoal(goalId: string): Promise<void> {
  try {
    // First, get all goals to find which ones need to be updated
    const allGoalsResponse = await makeAirtableRequest<AirtableResponse<AirtablePlannedTransactionFields>>(
      AIRTABLE_CONFIG.TABLES.PLANNED_TRANSACTIONS
    );

    if (!allGoalsResponse.records?.length) {
      throw new AirtableApiError('No goals found');
    }

    // Find currently selected goal and the target goal
    const currentlySelected = allGoalsResponse.records.find(
      record => record.fields.Currently_selected_goal === true
    );
    const targetGoal = allGoalsResponse.records.find(
      record => record.id === goalId
    );

    if (!targetGoal) {
      throw new AirtableApiError('Target goal not found');
    }

    // Prepare minimal updates - only change what needs to be changed
    const recordsToUpdate: Array<{id: string, fields: {Currently_selected_goal: boolean}}> = [];
    
    // If there's a currently selected goal that's different from target, deactivate it
    if (currentlySelected && currentlySelected.id !== goalId) {
      recordsToUpdate.push({
        id: currentlySelected.id,
        fields: { Currently_selected_goal: false }
      });
    }
    
    // Activate the target goal (only if it's not already selected)
    if (!targetGoal.fields.Currently_selected_goal) {
      recordsToUpdate.push({
        id: goalId,
        fields: { Currently_selected_goal: true }
      });
    }

    // If no updates needed, return early
    if (recordsToUpdate.length === 0) {
      return;
    }

    // Update only the necessary records
    const updateData = {
      records: recordsToUpdate
    };

    const endpoint = AIRTABLE_CONFIG.TABLES.PLANNED_TRANSACTIONS;
    await makeAirtableRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error('Error setting current goal:', error);
    throw error;
  }
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

/**
 * Adds a new transaction to Airtable
 * Creates a single transaction record with the provided details
 */
export async function addTransaction(transaction: NewTransaction): Promise<Transaction> {
  try {
    const now = new Date().toISOString(); // Full ISO timestamp
    
    const transactionData = {
      records: [
        {
          fields: {
            Name: transaction.name,
            Value: transaction.value,
            'transaction date': transaction.date || now,
            ...(transaction.category && { Ai_Category: transaction.category }),
            ...(transaction.fromAccountId && { 'From Account': [transaction.fromAccountId] }),
            ...(transaction.toAccountId && { 'To Account': [transaction.toAccountId] }),
          }
        }
      ]
    };
    
    console.log('Transaction data being sent:', JSON.stringify(transactionData, null, 2));

    const endpoint = AIRTABLE_CONFIG.TABLES.TRANSACTIONS;
    const response = await makeAirtableRequest<AirtableResponse<AirtableTransactionFields>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    
    console.log('Airtable response:', JSON.stringify(response, null, 2));
    
    if (!response.records?.length) {
      throw new AirtableApiError('No record returned after creating transaction');
    }
    
    const record = response.records[0];
    return {
      id: record.id,
      Name: record.fields.Name || '',
      Ai_Category: record.fields.Ai_Category || '',
      Value: record.fields.Value?.toString() || '0',
      Date: record.fields['transaction date'] || now,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Realizes a goal by creating two transactions:
 * 1. Transfer from Goals account to Checking account
 * 2. Expense transaction for the goal purchase
 */
export async function realizeGoal(goalName: string, finalPrice: number): Promise<void> {
  try {
    const now = new Date().toISOString(); // Full ISO timestamp
    
    // First, fetch the record IDs for Goals and Checking accounts
    const [goalsAccountResponse, checkingAccountResponse] = await Promise.all([
      makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(
        `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='Goals'&maxRecords=1`
      ),
      makeAirtableRequest<AirtableResponse<AirtableAccountFields>>(
        `${AIRTABLE_CONFIG.TABLES.ACCOUNTS}?filterByFormula=Name='Checking'&maxRecords=1`
      )
    ]);

    if (!goalsAccountResponse.records?.length) {
      throw new AirtableApiError('Goals account not found');
    }
    
    if (!checkingAccountResponse.records?.length) {
      throw new AirtableApiError('Checking account not found');
    }

    const goalsAccountId = goalsAccountResponse.records[0].id;
    const checkingAccountId = checkingAccountResponse.records[0].id;
    
    // Create both transactions
    await Promise.all([
      // 1. Transfer from Goals to Checking
      addTransaction({
        name: `Realizacja celu: ${goalName}`,
        value: finalPrice,
        fromAccountId: goalsAccountId,
        toAccountId: checkingAccountId,
      }),
      
      // 2. Expense transaction for the purchase
      addTransaction({
        name: goalName,
        value: finalPrice,
      }),
    ]);
    
    console.log(`Goal "${goalName}" realized successfully with final price: ${finalPrice} PLN`);
  } catch (error) {
    console.error('Error realizing goal:', error);
    throw error;
  }
}