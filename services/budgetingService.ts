import { BudgetSettings, DailyBudgetInfo } from '@/types';
import { supabase, SupabaseApiError } from './supabaseService';

/**
 * Budgeting service for handling daily budget calculations
 */
export class BudgetingService {
    /**
   * Calculate and get the current day's budget
   * This is the main method that implements the daily budget logic
   */
  static async getCurrentDayBudget(): Promise<DailyBudgetInfo> {
    console.log('🔍 getCurrentDayBudget called');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const today = new Date().toISOString().split('T')[0];
    console.log('🔍 Today is:', today);

    // Check if we already have a budget for today
    let todayBudget = await this.getBudgetForDate(today);
    console.log('🔍 Existing budget for today:', todayBudget);

    if (!todayBudget) {
      console.log('🔍 No existing budget, calculating new one...');
      // Calculate new budget for today
      todayBudget = await this.calculateDailyBudget(today);
      console.log('🔍 New budget calculated:', todayBudget);
    } else {
      console.log('🔍 Using existing budget:', todayBudget);
    }

    // Calculate how much is left for today
    const dailyBudgetLeft = await this.calculateDailyBudgetLeft(today);
    console.log('🔍 Daily budget left:', dailyBudgetLeft);

    // Get today's expenses separately
    const todaysExpenses = await this.getTodaysExpenses(today);
    console.log('🔍 Today\'s expenses:', todaysExpenses);

    const result = {
      dailyBudgetLimit: todayBudget.daily_budget_limit,
      dailyBudgetLeft,
      todaysExpenses,
      daysRemaining: this.calculateDaysRemaining(today),
      totalAvailableIncome: todayBudget.daily_budget_limit * this.calculateDaysRemaining(today),
      date: today
    };

    console.log('🔍 Final result:', result);
    return result;
  }

    /**
   * Calculate daily budget for a specific date
   * Implements the core logic from your requirements
   */
  private static async calculateDailyBudget(date: string): Promise<BudgetSettings> {
    console.log('🔍 calculateDailyBudget called for date:', date);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const targetDate = new Date(date);
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const dayOfMonth = targetDate.getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;

    console.log('🔍 Date calculations:');
    console.log('  - targetDate:', targetDate);
    console.log('  - monthStart:', monthStart);
    console.log('  - monthEnd:', monthEnd);
    console.log('  - daysInMonth:', daysInMonth);
    console.log('  - dayOfMonth:', dayOfMonth);
    console.log('  - daysRemaining:', daysRemaining);

    // Get average monthly fixed income from last 3 months
    console.log('🔍 Getting average monthly fixed income...');
    const avgMonthlyIncome = await this.getAverageMonthlyFixedIncome(3);
    console.log('🔍 Average monthly fixed income:', avgMonthlyIncome);

    // Get leftover budget from previous day (if any)
    console.log('🔍 Getting previous day leftover...');
    const previousDayLeftover = await this.getPreviousDayLeftover(date);
    console.log('🔍 Previous day leftover:', previousDayLeftover);

    // Get variable income added this month
    console.log('🔍 Getting variable income this month...');
    const variableIncomeThisMonth = await this.getVariableIncomeThisMonth(monthStart.toISOString().split('T')[0]);
    console.log('🔍 Variable income this month:', variableIncomeThisMonth);

    // Calculate total available income for the month
    const totalAvailableIncome = avgMonthlyIncome + previousDayLeftover + variableIncomeThisMonth;
    console.log('🔍 Total available income calculation:');
    console.log('  - avgMonthlyIncome:', avgMonthlyIncome);
    console.log('  - previousDayLeftover:', previousDayLeftover);
    console.log('  - variableIncomeThisMonth:', variableIncomeThisMonth);
    console.log('  - totalAvailableIncome:', totalAvailableIncome);

        // Calculate daily budget
    if (daysRemaining <= 0) {
      console.error('🔍 Error: daysRemaining is 0 or negative:', daysRemaining);
      throw new Error('Invalid days remaining calculation');
    }

    const dailyBudgetLimit = totalAvailableIncome / daysRemaining;
    console.log('🔍 Daily budget calculation:');
    console.log('  - totalAvailableIncome:', totalAvailableIncome);
    console.log('  - daysRemaining:', daysRemaining);
    console.log('  - dailyBudgetLimit:', dailyBudgetLimit);

    // Ensure we don't create a budget with zero or negative values
    if (dailyBudgetLimit <= 0) {
      console.warn('🔍 Warning: Calculated daily budget is <= 0, setting to minimum value');
      console.log('🔍 This might indicate no income data or calculation error');
    }

    // Create budget settings for this date
    const budgetSettings = await this.createBudgetSettings(date, dailyBudgetLimit);

    return budgetSettings;
  }

      /**
   * Get average monthly fixed income over the last N months
   * If no historical data, falls back to current month's fixed income
   */
  private static async getAverageMonthlyFixedIncome(months: number): Promise<number> {
    console.log('🔍 getAverageMonthlyFixedIncome called with months:', months);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    console.log('🔍 Date range for fixed income query:');
    console.log('  - startDate:', startDate.toISOString().split('T')[0]);
    console.log('  - endDate:', endDate.toISOString().split('T')[0]);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date')
      .eq('user_id', user.id)
      .lt('amount', 0) // Negative amounts are income
      .eq('is_fixed', true)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lt('transaction_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('🔍 Error querying fixed income:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Fixed income transactions found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔍 Sample transactions:', data.slice(0, 3));
    }

    if (!data || data.length === 0) {
      console.log('🔍 No fixed income transactions found in historical data, checking current month...');

      // Fallback: check if there's fixed income in the current month
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1); // First day of current month

      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .lt('amount', 0) // Negative amounts are income
        .eq('is_fixed', true)
        .gte('transaction_date', currentMonthStart.toISOString().split('T')[0]);

      if (currentMonthError) {
        console.error('🔍 Error querying current month fixed income:', currentMonthError);
        return 0;
      }

      if (currentMonthData && currentMonthData.length > 0) {
        const currentMonthTotal = currentMonthData.reduce((sum, transaction) => sum + Math.abs(transaction.amount || 0), 0);
        console.log('🔍 Found fixed income in current month:', currentMonthTotal);
        return currentMonthTotal;
      }

      console.log('🔍 No fixed income found anywhere, returning 0');
      return 0;
    }

    // Group by month and calculate monthly totals
    const monthlyTotals = new Map<string, number>();

    data.forEach(transaction => {
      const monthKey = transaction.transaction_date?.substring(0, 7); // YYYY-MM format
      if (monthKey) {
        const currentTotal = monthlyTotals.get(monthKey) || 0;
        monthlyTotals.set(monthKey, currentTotal + Math.abs(transaction.amount || 0));
      }
    });

    console.log('🔍 Monthly totals:', Object.fromEntries(monthlyTotals));

    // Calculate average
    const totalIncome = Array.from(monthlyTotals.values()).reduce((sum, total) => sum + total, 0);
    const average = monthlyTotals.size > 0 ? totalIncome / monthlyTotals.size : 0;

    console.log('🔍 Fixed income calculation:');
    console.log('  - totalIncome:', totalIncome);
    console.log('  - monthsCount:', monthlyTotals.size);
    console.log('  - average:', average);

    return average;
  }

  /**
   * Get leftover budget from previous day
   */
  private static async getPreviousDayLeftover(date: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const targetDate = new Date(date);
    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];

    const previousBudget = await this.getBudgetForDate(previousDayStr);
    if (!previousBudget) {
      return 0;
    }

    // Calculate how much was left from previous day
    const previousDayLeft = await this.calculateDailyBudgetLeft(previousDayStr);
    return Math.max(0, previousDayLeft);
  }

  /**
   * Get variable income added this month
   */
  private static async getVariableIncomeThisMonth(monthStart: string): Promise<number> {
    console.log('🔍 getVariableIncomeThisMonth called with monthStart:', monthStart);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date, name')
      .eq('user_id', user.id)
      .lt('amount', 0) // Negative amounts are income
      .eq('is_fixed', false)
      .gte('transaction_date', monthStart);

    if (error) {
      console.error('🔍 Error querying variable income:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Variable income transactions found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔍 Variable income transactions:', data.map(t => ({
        amount: t.amount,
        date: t.transaction_date,
        name: t.name
      })));
    }

    if (!data || data.length === 0) {
      console.log('🔍 No variable income transactions found, returning 0');
      return 0;
    }

    const total = data.reduce((sum, transaction) => sum + Math.abs(transaction.amount || 0), 0);
    console.log('🔍 Total variable income this month:', total);
    return total;
  }

  /**
   * Get today's expenses for a specific date
   */
  private static async getTodaysExpenses(date: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    console.log('🔍 getTodaysExpenses called for date:', date);

    // Get expenses for this date (only variable expenses, is_fixed = false)
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, name, is_fixed')
      .eq('user_id', user.id)
      .gt('amount', 0) // Positive amounts are expenses
      .eq('is_fixed', false) // Only variable expenses
      .eq('transaction_date', date);

    if (error) {
      console.error('🔍 Error querying expenses:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Found expense transactions:', data?.length || 0);
    if (data && data.length > 0) {
      data.forEach((t, i) => {
        console.log(`  ${i + 1}. Amount: ${t.amount}, Name: ${t.name}, Fixed: ${t.is_fixed}`);
      });
    }

    const totalExpenses = data?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;
    console.log('🔍 Today\'s expenses for', date, ':', totalExpenses);
    return totalExpenses;
  }

    /**
   * Calculate how much budget is left for a specific date
   */
  private static async calculateDailyBudgetLeft(date: string): Promise<number> {
    console.log('🔍 calculateDailyBudgetLeft called for date:', date);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const budget = await this.getBudgetForDate(date);
    if (!budget) {
      console.log('🔍 No budget found for date:', date);
      return 0;
    }

    console.log('🔍 Found budget with limit:', budget.daily_budget_limit);

    // Get today's expenses
    const todaysExpenses = await this.getTodaysExpenses(date);

    // Calculate remaining budget
    const remainingBudget = Math.max(0, budget.daily_budget_limit - todaysExpenses);
    console.log('🔍 Remaining budget for', date, ':', remainingBudget, '(limit:', budget.daily_budget_limit, '- expenses:', todaysExpenses, ')');

    return remainingBudget;
  }

    /**
   * Get budget settings for a specific date
   */
  private static async getBudgetForDate(date: string): Promise<BudgetSettings | null> {
    console.log('🔍 getBudgetForDate called for date:', date);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log('🔍 No budget found for date:', date);
        return null;
      }
      console.error('🔍 Error getting budget for date:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Found existing budget:', data);
    return data;
  }

  /**
   * Create budget settings for a specific date
   */
  private static async createBudgetSettings(date: string, dailyBudgetLimit: number): Promise<BudgetSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    // Get default percentages from user's previous settings or use defaults
    const defaultPercentages = await this.getDefaultPercentages();

    const { data, error } = await supabase
      .from('budget_settings')
      .upsert({
        user_id: user.id,
        day: date,
        daily_budget_limit: dailyBudgetLimit,
        auto_savings_percent: defaultPercentages.auto_savings_percent,
        auto_goals_percent: defaultPercentages.auto_goals_percent
      }, {
        onConflict: 'user_id,day'
      })
      .select('*')
      .single();

    if (error) {
      throw new SupabaseApiError(error.message, undefined, error);
    }

    return data;
  }

  /**
   * Get default percentages for savings and goals
   */
  private static async getDefaultPercentages(): Promise<{ auto_savings_percent: number; auto_goals_percent: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    // Try to get the most recent budget settings
    const { data, error } = await supabase
      .from('budget_settings')
      .select('auto_savings_percent, auto_goals_percent')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Return defaults if no previous settings
      return { auto_savings_percent: 10, auto_goals_percent: 15 };
    }

    return {
      auto_savings_percent: data.auto_savings_percent || 10,
      auto_goals_percent: data.auto_goals_percent || 15
    };
  }

  /**
   * Calculate days remaining in the month
   */
  private static calculateDaysRemaining(date: string): number {
    const targetDate = new Date(date);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const dayOfMonth = targetDate.getDate();
    return monthEnd.getDate() - dayOfMonth + 1;
  }

  /**
   * Recalculate daily budget when variable income is added
   * This method should be called whenever a new variable income transaction is added
   */
  static async recalculateBudgetForVariableIncome(incomeAmount: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const today = new Date().toISOString().split('T')[0];
    const currentBudget = await this.getBudgetForDate(today);

    if (!currentBudget) {
      // If no budget for today, create one
      await this.getCurrentDayBudget();
      return;
    }

    const daysRemaining = this.calculateDaysRemaining(today);
    const additionalDailyBudget = incomeAmount / daysRemaining;
    const newDailyBudget = currentBudget.daily_budget_limit + additionalDailyBudget;

    console.log(`Recalculating budget: ${incomeAmount} income / ${daysRemaining} days = +${additionalDailyBudget.toFixed(2)} daily budget`);
    console.log(`New daily budget: ${currentBudget.daily_budget_limit} + ${additionalDailyBudget.toFixed(2)} = ${newDailyBudget.toFixed(2)}`);

    // Update the budget for today
    const { error } = await supabase
      .from('budget_settings')
      .update({ daily_budget_limit: newDailyBudget })
      .eq('user_id', currentBudget.user_id)
      .eq('day', currentBudget.day);

    if (error) {
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('Budget updated successfully in database');
  }

    /**
   * Force refresh the current day's budget data
   * Useful for debugging or when you need to ensure fresh data
   */
  static async refreshCurrentDayBudget(): Promise<DailyBudgetInfo> {
    console.log('🔍 refreshCurrentDayBudget called');
    const today = new Date().toISOString().split('T')[0];
    console.log('🔍 Today is:', today);

    // Delete any existing budget for today and recalculate
    const existingBudget = await this.getBudgetForDate(today);
    console.log('🔍 Existing budget:', existingBudget);

    if (existingBudget) {
      console.log('🔍 Deleting existing budget...');
      const { error } = await supabase
        .from('budget_settings')
        .delete()
        .eq('user_id', existingBudget.user_id)
        .eq('day', existingBudget.day);

      if (error) {
        console.error('Error deleting existing budget:', error);
      } else {
        console.log('🔍 Existing budget deleted successfully');
      }
    }

    // Calculate fresh budget DIRECTLY instead of calling getCurrentDayBudget
    console.log('🔍 Calculating fresh budget directly...');

    // Debug: show all income transactions for current month
    await this.debugCurrentMonthIncome();

    // Force calculation by calling calculateDailyBudget directly
    const newBudget = await this.calculateDailyBudget(today);
    console.log('🔍 New budget calculated directly:', newBudget);

    // Calculate the result manually
    const dailyBudgetLeft = await this.calculateDailyBudgetLeft(today);
    const daysRemaining = this.calculateDaysRemaining(today);

    // Get today's expenses separately
    const todaysExpenses = await this.getTodaysExpenses(today);

    const result = {
      dailyBudgetLimit: newBudget.daily_budget_limit,
      dailyBudgetLeft,
      todaysExpenses,
      daysRemaining,
      totalAvailableIncome: newBudget.daily_budget_limit * daysRemaining,
      date: today
    };

    console.log('🔍 Final result calculated directly:', result);
    return result;
  }

  /**
   * Refresh the current day's budget data (useful when transactions are added)
   */
  static async refreshCurrentDayBudgetData(): Promise<DailyBudgetInfo> {
    const today = new Date().toISOString().split('T')[0];

    // Get the current budget for today
    const currentBudget = await this.getBudgetForDate(today);
    if (!currentBudget) {
      // If no budget exists, create one
      return await this.getCurrentDayBudget();
    }

    // Recalculate the remaining budget and expenses
    const dailyBudgetLeft = await this.calculateDailyBudgetLeft(today);
    const todaysExpenses = await this.getTodaysExpenses(today);
    const daysRemaining = this.calculateDaysRemaining(today);

    const result = {
      dailyBudgetLimit: currentBudget.daily_budget_limit,
      dailyBudgetLeft,
      todaysExpenses,
      daysRemaining,
      totalAvailableIncome: currentBudget.daily_budget_limit * daysRemaining,
      date: today
    };

    console.log('🔍 Refreshed budget data:', result);
    return result;
  }

  /**
   * Debug method to show all income transactions for the current month
   */
  static async debugCurrentMonthIncome(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);

    console.log('🔍 DEBUG: All income transactions for current month:');

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date, name, is_fixed')
      .eq('user_id', user.id)
      .lt('amount', 0) // Negative amounts are income
      .gte('transaction_date', currentMonthStart.toISOString().split('T')[0]);

    if (error) {
      console.error('🔍 Error querying income:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('🔍 No income transactions found this month');
      return;
    }

    console.log('🔍 Income transactions found:', data.length);
    data.forEach((t, i) => {
      console.log(`  ${i + 1}. Amount: ${t.amount}, Date: ${t.transaction_date}, Name: ${t.name}, Fixed: ${t.is_fixed}`);
    });

    // Also show some expense transactions to verify data structure
    const { data: expenses, error: expenseError } = await supabase
      .from('transactions')
      .select('amount, transaction_date, name, is_fixed')
      .eq('user_id', user.id)
      .gt('amount', 0) // Positive amounts are expenses
      .gte('transaction_date', currentMonthStart.toISOString().split('T')[0])
      .limit(3);

    if (!expenseError && expenses && expenses.length > 0) {
      console.log('🔍 Sample expense transactions:');
      expenses.forEach((t, i) => {
        console.log(`  ${i + 1}. Amount: ${t.amount}, Date: ${t.transaction_date}, Name: ${t.name}, Fixed: ${t.is_fixed}`);
      });
    }
  }
}
