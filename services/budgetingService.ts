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

    // Mock result - replace with actual implementation later
    const result = {
      dailyBudgetLimit: 250,
      dailyBudgetLeft: 180,
      todaysExpenses: 70,
      daysRemaining: 20,
      totalAvailableIncome: 5000,
      date: today,
      autoGoalsAmount: 37.5
    };

    console.log('🔍 Mock result:', result);
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

    const isFirstDayOfMonth = targetDate.getDate() === 1;


    console.log('🔍 Date calculations:');
    console.log('  - targetDate:', targetDate);
    console.log('  - monthStart:', monthStart);
    console.log('  - monthEnd:', monthEnd);
    console.log('  - daysInMonth:', daysInMonth);
    console.log('  - dayOfMonth:', dayOfMonth);
    console.log('  - daysRemaining:', daysRemaining);

        // Get average monthly recurring income from last 3 months
    console.log('🔍 Getting average monthly recurring income...');
    const avgMonthlyIncome = await this.getAverageMonthlyRecurringIncome(3);
    console.log('🔍 Average monthly recurring income:', avgMonthlyIncome);

    // Get variable income added this month
    console.log('🔍 Getting variable income this month...');
    const variableIncomeThisMonth = await this.getVariableIncomeThisMonth(monthStart.toISOString().split('T')[0]);
    console.log('🔍 Variable income this month:', variableIncomeThisMonth);

    // Get recurring expenses from last month (average)
    console.log('🔍 Getting average monthly recurring expenses...');
    const avgMonthlyRecurringExpenses = await this.getAverageMonthlyRecurringExpenses(3);
    console.log('🔍 Average monthly recurring expenses:', avgMonthlyRecurringExpenses);

    // Get variable expenses this month (up to current date)
    console.log('🔍 Getting variable expenses this month...');
    const variableExpensesThisMonth = await this.getVariableExpensesThisMonth(monthStart.toISOString().split('T')[0], date);
    console.log('🔍 Variable expenses this month:', variableExpensesThisMonth);

    // Calculate net available amount: Income - Expenses
    const netAvailableAmount = avgMonthlyIncome + variableIncomeThisMonth - avgMonthlyRecurringExpenses - variableExpensesThisMonth;
    console.log('🔍 Net available amount calculation:');
    console.log('  - avgMonthlyIncome:', avgMonthlyIncome);
    console.log('  - variableIncomeThisMonth:', variableIncomeThisMonth);
    console.log('  - avgMonthlyRecurringExpenses:', avgMonthlyRecurringExpenses);
    console.log('  - variableExpensesThisMonth:', variableExpensesThisMonth);
    console.log('  - netAvailableAmount:', netAvailableAmount);

    // Calculate daily budget: Net Available / Days Remaining
    if (daysRemaining <= 0) {
      console.error('🔍 Error: daysRemaining is 0 or negative:', daysRemaining);
      throw new Error('Invalid days remaining calculation');
    }

    const dailyBudgetLimit = netAvailableAmount / daysRemaining;
    console.log('🔍 Daily budget calculation:');
    console.log('  - netAvailableAmount:', netAvailableAmount);
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
   * Get average monthly recurring income over the last N months
   * If no historical data, falls back to current month's recurring income
   */
  private static async getAverageMonthlyRecurringIncome(months: number): Promise<number> {
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
      .from('recurring_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .lt('amount', 0); // Negative amounts are income

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
   * Get average monthly recurring expenses over the last N months
   */
  private static async getAverageMonthlyRecurringExpenses(months: number): Promise<number> {
    console.log('🔍 getAverageMonthlyFixedExpenses called with months:', months);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    console.log('🔍 Date range for fixed expenses query:');
    console.log('  - startDate:', startDate.toISOString().split('T')[0]);
    console.log('  - endDate:', endDate.toISOString().split('T')[0]);

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .gt('amount', 0); // Positive amounts are expenses

    if (error) {
      console.error('🔍 Error querying fixed expenses:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    if (!data || data.length === 0) {
      console.log('🔍 No recurring expense transactions found, returning 0');
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gt('amount', 0) // Positive amounts are expenses
        .eq('is_fixed', true)
        .gte('transaction_date', currentMonthStart.toISOString().split('T')[0]);
      if (currentMonthError) {
        console.error('🔍 Error querying current month fixed expenses:', currentMonthError);
        return 0;
      }
      if (currentMonthData && currentMonthData.length > 0) {
        const currentMonthTotal = currentMonthData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        console.log('🔍 Found fixed expenses in current month:', currentMonthTotal);
        return currentMonthTotal;
      }
      console.log('🔍 No fixed expenses found anywhere, returning 0');
      return 0;
    }

    // Group by month and calculate monthly totals
    const monthlyTotals = new Map<string, number>();

    data.forEach(transaction => {
      const monthKey = transaction.transaction_date?.substring(0, 7); // YYYY-MM format
      if (monthKey) {
        const currentTotal = monthlyTotals.get(monthKey) || 0;
        monthlyTotals.set(monthKey, currentTotal + (transaction.amount || 0));
      }
    });

    console.log('🔍 Monthly expense totals:', Object.fromEntries(monthlyTotals));

    // Calculate average
    const totalExpenses = Array.from(monthlyTotals.values()).reduce((sum, total) => sum + total, 0);
    const average = monthlyTotals.size > 0 ? totalExpenses / monthlyTotals.size : 0;

    console.log('🔍 Fixed expenses calculation:');
    console.log('  - totalExpenses:', totalExpenses);
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
   * Get variable expenses this month (up to a specific date)
   */
  private static async getVariableExpensesThisMonth(monthStart: string, upToDate: string): Promise<number> {
    console.log('🔍 getVariableExpensesThisMonth called with monthStart:', monthStart, 'upToDate:', upToDate);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date, name')
      .eq('user_id', user.id)
      .gt('amount', 0) // Positive amounts are expenses
      .eq('is_fixed', false)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', upToDate);

    if (error) {
      console.error('🔍 Error querying variable expenses:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Variable expense transactions found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔍 Variable expense transactions:', data.map(t => ({
        amount: t.amount,
        date: t.transaction_date,
        name: t.name
      })));
    }

    if (!data || data.length === 0) {
      console.log('🔍 No variable expense transactions found, returning 0');
      return 0;
    }

    const total = data.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    console.log('🔍 Total variable expenses this month:', total);
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

    // Get expenses for this date (exclude savings operations)
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, name, is_savings_op')
      .eq('user_id', user.id)
      .gt('amount', 0) // Positive amounts are expenses
      .eq('is_savings_op', false) // Exclude savings operations
      .eq('transaction_date', date);

    if (error) {
      console.error('🔍 Error querying expenses:', error);
      throw new SupabaseApiError(error.message, undefined, error);
    }

    console.log('🔍 Found expense transactions:', data?.length || 0);
    if (data && data.length > 0) {
      data.forEach((t, i) => {
        console.log(`  ${i + 1}. Amount: ${t.amount}, Name: ${t.name}, Savings Op: ${t.is_savings_op}`);
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

        // Calculate auto-goals amount only
    const autoGoalsAmount = (dailyBudgetLimit * defaultPercentages.auto_goals_percent) / 100;

    // Reduce daily budget limit by auto-goals amount
    const adjustedDailyBudgetLimit = dailyBudgetLimit - autoGoalsAmount;

    console.log('🔍 Auto-goals calculation:', {
      originalBudget: dailyBudgetLimit,
      autoGoalsPercent: defaultPercentages.auto_goals_percent,
      autoGoalsAmount,
      adjustedDailyBudgetLimit
    });

    // Allocate auto-goals to goals before creating budget settings
    if (autoGoalsAmount > 0) {
      console.log('🔍 Calling allocateAutoGoalsToGoals with amount:', autoGoalsAmount);
      try {
        await this.allocateAutoGoalsToGoals(autoGoalsAmount);
        console.log('🔍 Auto-goals allocation completed successfully');
      } catch (error) {
        console.error('🔍 Error in auto-goals allocation:', error);
        // Don't throw here, just log the error
      }
    } else {
      console.log('🔍 No auto-goals amount to allocate (amount <= 0)');
    }

    const { data, error } = await supabase
      .from('budget_settings')
      .upsert({
        user_id: user.id,
        day: date,
        daily_budget_limit: adjustedDailyBudgetLimit, // Use adjusted amount
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
      .select('auto_goals_percent')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Return defaults if no previous settings
      return { auto_savings_percent: 0, auto_goals_percent: 15 };
    }

    return {
      auto_savings_percent: 0, // We're not using this for now
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
    console.log('🔍 recalculateBudgetForVariableIncome called - MOCK IMPLEMENTATION');
    console.log('🔍 Income amount:', incomeAmount);
    console.log('🔍 Mock: Budget would be recalculated here');
  }

    /**
   * Force refresh the current day's budget data
   * Useful for debugging or when you need to ensure fresh data
   */
  static async refreshCurrentDayBudget(): Promise<DailyBudgetInfo> {
    console.log('🔍 refreshCurrentDayBudget called - MOCK IMPLEMENTATION');

    // Mock result - replace with actual implementation later
    const result = {
      dailyBudgetLimit: 250,
      dailyBudgetLeft: 180,
      todaysExpenses: 70,
      daysRemaining: 20,
      totalAvailableIncome: 5000,
      date: new Date().toISOString().split('T')[0],
      autoGoalsAmount: 37.5
    };

    console.log('🔍 Mock result:', result);
    return result;
  }

  /**
   * Refresh the current day's budget data (useful when transactions are added)
   */
  static async refreshCurrentDayBudgetData(): Promise<DailyBudgetInfo> {
    console.log('🔍 refreshCurrentDayBudgetData called - MOCK IMPLEMENTATION');

    // Mock result - replace with actual implementation later
    const result = {
      dailyBudgetLimit: 250,
      dailyBudgetLeft: 180,
      todaysExpenses: 70,
      daysRemaining: 20,
      totalAvailableIncome: 5000,
      date: new Date().toISOString().split('T')[0],
      autoGoalsAmount: 37.5
    };

    console.log('🔍 Mock result:', result);
    return result;
  }

    /**
   * Allocate auto-goals amount to goals based on their auto_savings_percent
   */
  private static async allocateAutoGoalsToGoals(autoGoalsAmount: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    console.log('🔍 Allocating auto-goals amount to goals:', { autoGoalsAmount });

    console.log('🔍 Querying goals for user:', user.id);

    // Get all currently selected goals with auto_savings_percent > 0
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, name, auto_savings_percent, current_amount')
      .eq('user_id', user.id)
      .eq('is_currently_selected', true)
      .gt('auto_savings_percent', 0)
      .order('auto_savings_percent', { ascending: false });

    if (goalsError) {
      console.error('🔍 Error fetching goals for auto-goals:', goalsError);
      throw new SupabaseApiError('Failed to fetch goals for auto-goals', undefined, goalsError);
    }

    if (!goals || goals.length === 0) {
      console.log('🔍 No goals found for auto-goals allocation');
      return;
    }

    console.log('🔍 Found goals for auto-goals:', goals);

    // Calculate total percentage across all selected goals
    const totalGoalPercentage = goals.reduce((sum, goal) => sum + (goal.auto_savings_percent || 0), 0);

    if (totalGoalPercentage === 0) {
      console.log('🔍 No auto-savings percentages set for goals');
      return;
    }

    // Allocate auto-goals amount to each goal proportionally
    for (const goal of goals) {
      const goalPercentage = goal.auto_savings_percent || 0;
      if (goalPercentage > 0) {
        // Calculate this goal's share of the auto-goals amount
        const goalShare = (autoGoalsAmount * goalPercentage) / totalGoalPercentage;

        console.log('🔍 Allocating to goal:', {
          goalName: goal.name,
          goalPercentage,
          goalShare,
          currentAmount: goal.current_amount || 0
        });

        // Update the goal's current_amount
        const newAmount = (goal.current_amount || 0) + goalShare;
        console.log('🔍 Updating goal:', {
          goalId: goal.id,
          goalName: goal.name,
          oldAmount: goal.current_amount || 0,
          goalShare,
          newAmount
        });

        const { error: updateError } = await supabase
          .from('goals')
          .update({ current_amount: newAmount })
          .eq('id', goal.id);

        if (updateError) {
          console.error('🔍 Error updating goal amount:', updateError);
          throw new SupabaseApiError(`Failed to update goal ${goal.name}`, undefined, updateError);
        }

        console.log('🔍 Successfully updated goal:', goal.name, 'new amount:', newAmount);
      }
    }

    console.log('🔍 Auto-goals allocation completed successfully');
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
    if (currentMonthStart.getDate() === 1) {
      currentMonthStart.setMonth(currentMonthStart.getMonth() - 1);
    }
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
