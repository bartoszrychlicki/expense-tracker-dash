import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_CONFIG } from '@/config/constants';
import { DailyBudget, PlannedTransaction, Transaction, NewTransaction } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

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
 * Fetches the latest daily budget record from Supabase
 */
export async function fetchLatestDailyBudget(): Promise<DailyBudget> {
  const { data, error } = await supabase
    .from('days')
    .select(
      `daily_budget_left,
       daily_spent_sum,
       todays_variable_daily_limit,
       auto_savigs_value,
       auto_savings_percent,
       auto_goals_value,
       auto_goals_percent,
       auto_savings_sum,
       auto_goals_sum`
    )
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }

  const record = data?.[0];
  if (!record) {
    return {};
  }

  return {
    dailyBudgetLeft: record.daily_budget_left?.toString(),
    dailySpentSum: record.daily_spent_sum?.toString(),
    todaysVariableDailyLimit: record.todays_variable_daily_limit?.toString(),
    automaticSavingsToday: record.auto_savigs_value?.toString(),
    automaticSavingsPercentage: record.auto_savings_percent?.toString(),
    automaticGoalDepositsToday: record.auto_goals_value?.toString(),
    automaticGoalDepositsPercentage: record.auto_goals_percent?.toString(),
    automaticSavingsMonthSum: record.auto_savings_sum?.toString(),
    automaticGoalDepositsMonthSum: record.auto_goals_sum?.toString(),
  };
}

/**
 * Fetches recent transactions from Supabase
 */
export async function fetchRecentTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, Name, Ai_Category, Value, transaction_date, category_type')
    .neq('category_type', 'Planned')
    .order('transaction_date', { ascending: false })
    .limit(API_CONFIG.TRANSACTIONS_LIMIT);

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }

  if (!data) {
    return [];
  }

  return data.map((record): Transaction => ({
    id: record.id,
    Name: record.Name || '',
    Ai_Category: record.Ai_Category || '',
    Value: record.Value?.toString() || '',
    Date: record.transaction_date || '',
  }));
}

/**
 * Fetches planned transactions from Supabase
 */
export async function fetchPlannedTransactions(): Promise<PlannedTransaction[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, Name, Value, URL, Created, _NumberOfHundreds, Decision_date, Decision, Currently_selected_goal')
    .order('Created', { ascending: false });

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }

  if (!data) {
    return [];
  }

  return data.map((record): PlannedTransaction => ({
    id: record.id,
    Name: record.Name || '',
    Value: record.Value?.toString() || '',
    URL: record.URL || '',
    Created: record.Created || '',
    NumberOfHundreds: record._NumberOfHundreds || 0,
    Decision_date: record.Decision_date || '',
    Decision: record.Decision || '',
    Currently_selected_goal: record.Currently_selected_goal || false,
  }));
}

/**
 * Adds a new transaction to Supabase
 */
export async function addTransaction(transaction: NewTransaction): Promise<Transaction> {
  const now = new Date().toISOString();

  const insertData: any = {
    Name: transaction.name,
    Value: transaction.value,
    transaction_date: transaction.date || now,
  };

  if (transaction.category) {
    insertData.Ai_Category = transaction.category;
  }
  if (transaction.fromAccountId) {
    insertData.from_account_id = transaction.fromAccountId;
  }
  if (transaction.toAccountId) {
    insertData.to_account_id = transaction.toAccountId;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }

  return {
    id: data.id,
    Name: data.Name || '',
    Ai_Category: data.Ai_Category || '',
    Value: data.Value?.toString() || '0',
    Date: data.transaction_date || now,
  };
}

/**
 * Creates two transactions for goal savings: income on Goals account and expense on Checking account
 */
export async function createGoalTransaction(goalName: string, amount: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: goalsAccount, error: goalsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('Name', 'Goals')
    .single();
  if (goalsError) {
    throw new SupabaseApiError(goalsError.message, goalsError.status, goalsError);
  }
  if (!goalsAccount) {
    throw new SupabaseApiError('Goals account not found');
  }

  const { data: checkingAccount, error: checkingError } = await supabase
    .from('accounts')
    .select('id')
    .eq('Name', 'Checking')
    .single();
  if (checkingError) {
    throw new SupabaseApiError(checkingError.message, checkingError.status, checkingError);
  }
  if (!checkingAccount) {
    throw new SupabaseApiError('Checking account not found');
  }

  const { error } = await supabase.from('transactions').insert({
    Name: 'cel długoterminowy: ' + goalName,
    Value: amount,
    transaction_date: today,
    to_account_id: goalsAccount.id,
    from_account_id: checkingAccount.id,
  });

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }
}

/**
 * Sets a specific goal as the currently selected goal
 */
export async function setCurrentGoal(goalId: string): Promise<void> {
  const { data: allGoals, error } = await supabase
    .from('goals')
    .select('id, Currently_selected_goal');

  if (error) {
    throw new SupabaseApiError(error.message, error.status, error);
  }
  if (!allGoals) {
    throw new SupabaseApiError('No goals found');
  }

  const currentlySelected = allGoals.find(g => g.Currently_selected_goal);
  const targetGoal = allGoals.find(g => g.id === goalId);

  if (!targetGoal) {
    throw new SupabaseApiError('Target goal not found');
  }

  const updates: Promise<any>[] = [];

  if (currentlySelected && currentlySelected.id !== goalId) {
    updates.push(
      supabase.from('goals').update({ Currently_selected_goal: false }).eq('id', currentlySelected.id)
    );
  }

  if (!targetGoal.Currently_selected_goal) {
    updates.push(
      supabase.from('goals').update({ Currently_selected_goal: true }).eq('id', goalId)
    );
  }

  for (const p of updates) {
    const { error: updateError } = await p;
    if (updateError) {
      throw new SupabaseApiError(updateError.message, updateError.status, updateError);
    }
  }
}

/**
 * Realizes a goal by creating two transactions: transfer and expense
 */
export async function realizeGoal(goalName: string, finalPrice: number): Promise<void> {
  const { data: goalsAccount, error: goalsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('Name', 'Goals')
    .single();
  if (goalsError) {
    throw new SupabaseApiError(goalsError.message, goalsError.status, goalsError);
  }
  if (!goalsAccount) {
    throw new SupabaseApiError('Goals account not found');
  }

  const { data: checkingAccount, error: checkingError } = await supabase
    .from('accounts')
    .select('id')
    .eq('Name', 'Checking')
    .single();
  if (checkingError) {
    throw new SupabaseApiError(checkingError.message, checkingError.status, checkingError);
  }
  if (!checkingAccount) {
    throw new SupabaseApiError('Checking account not found');
  }

  await Promise.all([
    addTransaction({
      name: `Realizacja celu: ${goalName}`,
      value: finalPrice,
      fromAccountId: goalsAccount.id,
      toAccountId: checkingAccount.id,
    }),
    addTransaction({
      name: goalName,
      value: finalPrice,
    }),
  ]);
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
