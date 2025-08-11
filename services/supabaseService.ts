import { API_CONFIG } from '@/config/constants';
import { DailyBudget, Goal, NewTransaction, PlannedTransaction, Transaction } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
//export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);


export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// auto-refresh tylko gdy appka na wierzchu
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}
/**
 * Custom error class for Supabase API errors
 */
export class SupabaseApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any,
  ) {
    super(message);
    this.name = 'SupabaseApiError';
  }
}

/**
 * Fetches the latest daily budget from the daily_budget_summary view
 */
export async function fetchLatestDailyBudget(): Promise<DailyBudget> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  // TODO: Implement when views are created
  // For now, return empty data
  return {
    dailyBudgetLeft: '0',
    dailySpentSum: '0',
    todaysVariableDailyLimit: '0',
    automaticSavingsToday: '0',
    automaticSavingsPercentage: '0',
    automaticGoalDepositsToday: '0',
    automaticGoalDepositsPercentage: '0',
    automaticSavingsMonthSum: '0',
    automaticGoalDepositsMonthSum: '0',
  };
}

/**
 * Fetches recent transactions from Supabase
 * Filters out planned transactions and returns data compatible with Airtable format
 */
export async function fetchRecentTransactions(): Promise<Transaction[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .limit(API_CONFIG.TRANSACTIONS_LIMIT);

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }

  if (!data) {
    return [];
  }

  return data.map((record): Transaction => {
    // Return the actual signed value from the database
    // Negative amounts = income, Positive amounts = expense
    const amount = record.amount || 0;

    return {
      id: record.id,
      Name: record.name || '',
      Ai_Category: record.category || '',
      Value: amount.toString(), // Return the actual signed value
      Date: record.transaction_date || '',
    };
  });
}

/**
 * Fetches planned transactions (goals) from Supabase
 */
export async function fetchPlannedTransactions(): Promise<PlannedTransaction[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }

  if (!data) {
    return [];
  }

  return data.map((record): PlannedTransaction => ({
    id: record.id,
    Name: record.name || '',
    Value: record.target_amount?.toString() || '',
    URL: record.url || '',
    Created: record.created_at || '',
    NumberOfHundreds: Math.floor((record.current_amount || 0) / 100),
    Decision_date: record.decision_date || '',
    Decision: record.decision || '',
    Currently_selected_goal: record.is_currently_selected || false,
  }));
}

/**
 * Fetches the current goal from Supabase
 */
export async function fetchCurrentGoal(): Promise<Goal|null> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_currently_selected', true)
    .limit(1);

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }

  // Return the first goal if any exist, otherwise null
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Adds a new transaction to Supabase
 */
export async function addTransaction(transaction: NewTransaction): Promise<Transaction> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  console.log('Current user:', user.id);

  const now = new Date().toISOString();

  const insertData: any = {
    user_id: user.id,
    name: transaction.name,
    amount: transaction.value, // Store the actual signed value (negative = income, positive = expense)
    transaction_date: transaction.date || now.split('T')[0],
  };

  if (transaction.category) {
    insertData.category = transaction.category;
  }
  if (transaction.fromAccountId) {
    insertData.from_account_id = transaction.fromAccountId;
  }
  if (transaction.toAccountId) {
    insertData.to_account_id = transaction.toAccountId;
  }
  if (transaction.is_fixed !== undefined) {
    insertData.is_fixed = transaction.is_fixed;
  }

  console.log('Inserting transaction data:', insertData);

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new SupabaseApiError(error.message, undefined, error);
  }

  console.log('Transaction inserted successfully:', data);

  return {
    id: data.id,
    Name: data.name || '',
    Ai_Category: data.category || '',
    Value: data.amount?.toString() || '0', // Return the actual signed value
    Date: data.transaction_date || now.split('T')[0],
  };
}

/**
 * Creates a goal transaction (savings to goals account)
 */
export async function createGoalTransaction(goalName: string, amount: number): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const today = new Date().toISOString().split('T')[0];

  // Get the goals account
  const { data: goalsAccount, error: goalsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Goals')
    .single();

  if (goalsError) {
    throw new SupabaseApiError(goalsError.message, undefined, goalsError);
  }
  if (!goalsAccount) {
    throw new SupabaseApiError('Goals account not found');
  }

  // Get the checking account
  const { data: checkingAccount, error: checkingError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Checking')
    .single();

  if (checkingError) {
    throw new SupabaseApiError(checkingError.message, undefined, checkingError);
  }
  if (!checkingAccount) {
    throw new SupabaseApiError('Checking account not found');
  }

  // Create the goal transaction
  const { error } = await supabase.from('transactions').insert({
    name: 'cel długoterminowy: ' + goalName,
    amount: amount,
    transaction_date: today,
    category_type: 'goal',
    from_account_id: checkingAccount.id,
    to_account_id: goalsAccount.id,
  });

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }
}

/**
 * Sets a specific goal as the currently selected goal
 */
export async function setCurrentGoal(goalId: string): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  // First, unselect all goals for this user
  const { error: unselectError } = await supabase
    .from('goals')
    .update({ is_currently_selected: false })
    .eq('user_id', user.id)
    .eq('is_currently_selected', true);

  if (unselectError) {
    throw new SupabaseApiError(unselectError.message, undefined, unselectError);
  }

  // Then select the target goal
  const { error: selectError } = await supabase
    .from('goals')
    .update({ is_currently_selected: true })
    .eq('id', goalId);

  if (selectError) {
    throw new SupabaseApiError(selectError.message, undefined, selectError);
  }
}

/**
 * Realizes a goal by creating expense transaction
 */
export async function realizeGoal(goalName: string, finalPrice: number): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data: goalsAccount, error: goalsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Goals')
    .single();

  if (goalsError) {
    throw new SupabaseApiError(goalsError.message, undefined, goalsError);
  }
  if (!goalsAccount) {
    throw new SupabaseApiError('Goals account not found');
  }

  const { data: checkingAccount, error: checkingError } = await supabase
    .from('accounts')
    .select('id')
    .eq('name', 'Checking')
    .single();

  if (checkingError) {
    throw new SupabaseApiError(checkingError.message, undefined, checkingError);
  }
  if (!checkingAccount) {
    throw new SupabaseApiError('Checking account not found');
  }

  // Create two transactions: transfer from goals to checking, then expense
  await Promise.all([
    addTransaction({
      name: `Realizacja celu: ${goalName}`,
      value: finalPrice,
      fromAccountId: goalsAccount.id,
      toAccountId: checkingAccount.id,
    }),
    addTransaction({
      name: goalName,
      value: -finalPrice, // Negative for expense
    }),
  ]);
}

/**
 * Gets monthly savings summary
 */
export async function getMonthlySavingsSummary() {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data, error } = await supabase
    .from('monthly_savings_summary')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }

  return data;
}

/**
 * Gets goals with progress
 */
export async function getGoalsWithProgress() {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new SupabaseApiError('User not authenticated');
  }

  const { data, error } = await supabase
    .from('goals_with_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('created_date', { ascending: false });

  if (error) {
    throw new SupabaseApiError(error.message, undefined, error);
  }

  return data || [];
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
 * Utility function to check if a transaction value is positive (income)
 */
export function isPositiveTransaction(value: string): boolean {
  const numericValue = parseFloat(value);
  return !isNaN(numericValue) && numericValue > 0;
}
