import { BudgetSettings, DailyBudgetInfo } from '@/types';
import { User } from '@supabase/supabase-js';
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }

    const today = BudgetingService.formatLocalDate(new Date());

    // Ensure today's budget is calculated and persisted; returns today's settings
    await BudgetingService.calculateDailyBudget(user, today);

    // Build and return the public info for UI
    return await BudgetingService.buildDailyBudgetInfo(user, today);
  }

  /**
   * Calculate daily budget for a specific date
   * Implements the core logic from your requirements
   */
  private static async calculateDailyBudget(user: User, date: string): Promise<BudgetSettings> {
    // Dates and month metrics in user's local timezone
    const targetDate = new Date(date + 'T00:00:00');
    if (isNaN(targetDate.getTime())) {
      throw new SupabaseApiError('Invalid date for budget calculation');
    }

    const year = targetDate.getFullYear();
    const monthIndex = targetDate.getMonth(); // 0-based
    const dayOfMonth = targetDate.getDate();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    // const firstDayOfMonth = BudgetingService.formatLocalDate(new Date(year, monthIndex, 1));
    const yesterday = dayOfMonth > 1 ? BudgetingService.formatLocalDate(new Date(year, monthIndex, dayOfMonth - 1)) : null;

    // Fetch today's budget_settings (if exists)
    const { data: todaySetting } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', date)
      .maybeSingle();

    // Determine if we're creating a new daily budget for today
    const isNewDailyBudget = !todaySetting;

    // Determine auto percents for today (copy from previous day when missing)
    let autoSavingsPercent: number;
    let autoGoalsPercent: number;

    // Fetch recurring transactions to compute monthly net
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('amount')
      .eq('user_id', user.id);
    if (recurringError) {
      throw new SupabaseApiError('Failed to fetch recurring transactions', undefined, recurringError);
    }
    const sumRecurring = (recurring || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    const monthlyNetAvailable = -sumRecurring; // incomes are negative, expenses positive

    // Base daily from fixed only
    const baseFromFixed = monthlyNetAvailable / daysInMonth;

    // Get yesterday's settings if available (for base and percents)
    let yesterdayBase: number | null = null;
    let yesterdayAutoSavingsPercent: number | null = null;
    let yesterdayAutoGoalsPercent: number | null = null;
    let ySetting: any = null;
    if (yesterday) {
      const { data: ySet } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('day', yesterday)
        .maybeSingle();
      ySetting = ySet;
      if (ySetting) {
        if (typeof ySetting.daily_budget_limit === 'number') {
          yesterdayBase = ySetting.daily_budget_limit;
        }
        if (typeof ySetting.auto_savings_percent === 'number') {
          yesterdayAutoSavingsPercent = ySetting.auto_savings_percent;
        }
        if (typeof ySetting.auto_goals_percent === 'number') {
          yesterdayAutoGoalsPercent = ySetting.auto_goals_percent;
        }
      }
    }

    // Calculate leftover from yesterday if needed
    let leftoverContributionToday = 0;
    if (dayOfMonth === 1 || yesterdayBase == null) {
      leftoverContributionToday = 0;
    } else {
      // Sum yesterday's variable expenses only (amount > 0), including savings ops
      const { data: yTx, error: yTxError } = await supabase
        .from('transactions')
        .select('amount, is_savings_op')
        .eq('user_id', user.id)
        .eq('transaction_date', yesterday);
      if (yTxError) {
        throw new SupabaseApiError('Failed to fetch yesterday transactions', undefined, yTxError);
      }
      const spentYesterday = (yTx || []).reduce((sum: number, t: any) => {
        const amount = t.amount || 0;
        return amount > 0 ? sum + amount : sum;
      }, 0);
      const leftover = yesterdayBase - spentYesterday; // incomes are excluded by only summing positives
      const remainingDaysInclToday = daysInMonth - dayOfMonth + 1;
      leftoverContributionToday = leftover / remainingDaysInclToday;
    }

    // New base before autos for today
    const newBaseBeforeAutos = (dayOfMonth === 1 || yesterdayBase == null)
      ? baseFromFixed
      : (yesterdayBase + leftoverContributionToday);

    // If today's percents undefined, copy from yesterday (fallback to 0)
    if (!isNewDailyBudget && todaySetting && typeof todaySetting.auto_savings_percent === 'number' && typeof todaySetting.auto_goals_percent === 'number') {
      autoSavingsPercent = todaySetting.auto_savings_percent;
      autoGoalsPercent = todaySetting.auto_goals_percent;
    } else {
      autoSavingsPercent = yesterdayAutoSavingsPercent ?? 0;
      autoGoalsPercent = yesterdayAutoGoalsPercent ?? 0;
    }

    // Normalize auto goals over selected goals if needed handled later; here just compute percents
    // Compute auto amounts (round up to cents)
    const autoSavingsAmount = BudgetingService.roundUpToCents(newBaseBeforeAutos * (autoSavingsPercent / 100));
    const autoGoalsAmount = BudgetingService.roundUpToCents(newBaseBeforeAutos * (autoGoalsPercent / 100));

    // Today's variable income distribution contribution (only non-savings incomes)
    const { data: todayTx, error: todayTxError } = await supabase
      .from('transactions')
      .select('amount, is_savings_op')
      .eq('user_id', user.id)
      .eq('transaction_date', date);
    if (todayTxError) {
      throw new SupabaseApiError('Failed to fetch today transactions', undefined, todayTxError);
    }
    const remainingDaysInclToday = daysInMonth - dayOfMonth + 1;
    const sumIncomesToday = (todayTx || []).reduce((sum: number, t: any) => {
      const amount = t.amount || 0;
      if (amount < 0 && !t.is_savings_op) {
        return sum + amount; // negative numbers accumulate
      }
      return sum;
    }, 0);
    const incomeDistributionToday = (-sumIncomesToday) / remainingDaysInclToday; // positive contribution

    // Final base after incomes distribution
    const baseAfterIncomes = newBaseBeforeAutos + incomeDistributionToday;

    const nowIso = new Date().toISOString();
    let createdNewBudget = false;
    let finalSetting: any = null;

    if (isNewDailyBudget) {
      // Try to INSERT first (so only one caller wins). If duplicate, we will UPDATE and skip autos.
      const insertPayload: any = {
        user_id: user.id,
        day: date,
        daily_budget_limit: baseAfterIncomes,
        auto_savings_percent: autoSavingsPercent,
        auto_goals_percent: autoGoalsPercent,
        updated_at: nowIso,
      };
      const { data: inserted, error: insertError } = await supabase
        .from('budget_settings')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertError) {
        // If duplicate (concurrent insert), fallback to update and mark as not-new
        const isDuplicate = (insertError as any).code === '23505' || (insertError.message || '').toLowerCase().includes('duplicate');
        if (!isDuplicate) {
          throw new SupabaseApiError('Failed to insert budget settings', undefined, insertError);
        }
        // Update existing row to latest base/percents
        const { data: updated, error: updateError } = await supabase
          .from('budget_settings')
          .update({
            daily_budget_limit: baseAfterIncomes,
            auto_savings_percent: autoSavingsPercent,
            auto_goals_percent: autoGoalsPercent,
            updated_at: nowIso,
          })
          .eq('user_id', user.id)
          .eq('day', date)
          .select('*')
          .single();
        if (updateError) {
          throw new SupabaseApiError('Failed to update budget settings after duplicate insert', undefined, updateError);
        }
        finalSetting = updated;
        createdNewBudget = false;
      } else {
        finalSetting = inserted;
        createdNewBudget = true;
      }
    } else {
      // Not a new budget: update base/percents, do not create autos
      const { data: updated, error: updateError } = await supabase
        .from('budget_settings')
        .update({
          daily_budget_limit: baseAfterIncomes,
          auto_savings_percent: autoSavingsPercent,
          auto_goals_percent: autoGoalsPercent,
          updated_at: nowIso,
        })
        .eq('user_id', user.id)
        .eq('day', date)
        .select('*')
        .single();
      if (updateError) {
        throw new SupabaseApiError('Failed to update budget settings', undefined, updateError);
      }
      finalSetting = updated;
    }

    // Create auto transactions only if we truly created a new budget row (single-winner semantics)
    if (createdNewBudget) {
      await BudgetingService.ensureAutoTransactionsForDay(user, date, autoSavingsAmount, autoGoalsAmount);
      // Fetch the actual auto-goals amount for today, then allocate (robust vs rounding/conflicts)
      const { data: autoGoalsTx } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_date', date)
        .eq('is_savings_op', true)
        .eq('name', 'Automatyczne cele')
        .maybeSingle();
      const todaysAutoGoalsAmount = autoGoalsTx?.amount || 0;
      if (todaysAutoGoalsAmount > 0) {
        await BudgetingService.allocateAutoGoalsToGoals(todaysAutoGoalsAmount);
      }
    }

    return finalSetting as BudgetSettings;
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
    const today = BudgetingService.formatLocalDate(new Date());
    // Recalculate today's budget after a new variable income
    await BudgetingService.calculateDailyBudget(user, today);
  }

    /**
   * Force refresh the current day's budget data
   * Useful for debugging or when you need to ensure fresh data
   */
  static async refreshCurrentDayBudget(): Promise<DailyBudgetInfo> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }
    const today = BudgetingService.formatLocalDate(new Date());
    await BudgetingService.calculateDailyBudget(user, today);
    return await BudgetingService.buildDailyBudgetInfo(user, today);
  }

  /**
   * Refresh the current day's budget data (useful when transactions are added)
   */
  static async refreshCurrentDayBudgetData(): Promise<DailyBudgetInfo> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new SupabaseApiError('User not authenticated');
    }
    const today = BudgetingService.formatLocalDate(new Date());
    await BudgetingService.calculateDailyBudget(user, today);
    return await BudgetingService.buildDailyBudgetInfo(user, today);
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
      .select('id, name, auto_savings_percent, current_amount, user_id')
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
    // Use rounding-up to cents and ensure the last goal receives the remaining cents
    let remainingToAllocate = BudgetingService.roundUpToCents(autoGoalsAmount);
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      const goalPercentage = goal.auto_savings_percent || 0;
      if (goalPercentage <= 0) continue;

      // Proportional share
      let goalShareRaw = (autoGoalsAmount * goalPercentage) / totalGoalPercentage;
      let goalShare = i < goals.length - 1
        ? BudgetingService.roundUpToCents(goalShareRaw)
        : BudgetingService.roundUpToCents(remainingToAllocate); // assign the rest to last goal

      // Track remaining
      remainingToAllocate = BudgetingService.roundUpToCents(remainingToAllocate - goalShare);

      const currentAmount = goal.current_amount || 0;
      const newAmount = BudgetingService.roundUpToCents(currentAmount + goalShare);

      // Skip update if no actual change to avoid 0-row updates
      if (Math.abs(newAmount - currentAmount) < 0.005) {
        console.log('🔍 Skipping update for goal (no change):', goal.name);
        continue;
      }

        console.log('🔍 Updating goal:', {
          goalId: goal.id,
          goalName: goal.name,
        oldAmount: currentAmount,
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
      // Verify via separate select (avoids 406 on update)
      const { data: verifyRow, error: verifyError } = await supabase
        .from('goals')
        .select('id, current_amount')
        .eq('id', goal.id)
        .maybeSingle();
      if (verifyError) {
        console.error('🔍 Error verifying goal after update:', verifyError);
        throw new SupabaseApiError(`Failed to verify goal ${goal.name} after update`, undefined, verifyError);
      }
      console.log('🔍 Verified goal amount:', goal.name, 'current_amount:', verifyRow?.current_amount);
    }

    console.log('🔍 Auto-goals allocation completed successfully');
  }

  // =====================
  // Helpers
  // =====================

  private static formatLocalDate(d: Date): string {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static roundUpToCents(value: number): number {
    return Math.ceil(value * 100) / 100;
  }

  private static async ensureAutoTransactionsForDay(
    user: User,
    date: string,
    autoSavingsAmount: number,
    autoGoalsAmount: number,
  ): Promise<{ createdSavings: boolean; createdGoals: boolean; }> {
    let createdSavings = false;
    let createdGoals = false;
    // Auto savings
    if (autoSavingsAmount > 0) {
      const { error: insertSavingsError } = await supabase.from('transactions').insert({
        user_id: user.id,
        name: 'Automatyczne oszczędzanie',
        amount: autoSavingsAmount,
        transaction_date: date,
        is_savings_op: true,
      });
      if (insertSavingsError) {
        // If duplicate due to rare race/constraint, ignore; otherwise throw
        const isDuplicate = (insertSavingsError as any).code === '23505' || (insertSavingsError.message || '').toLowerCase().includes('duplicate');
        if (!isDuplicate) {
          throw new SupabaseApiError('Failed to create auto savings transaction', undefined, insertSavingsError);
        }
      } else {
        createdSavings = true;
      }
    }

    // Auto goals
    if (autoGoalsAmount > 0) {
      const { error: insertGoalsError } = await supabase.from('transactions').insert({
        user_id: user.id,
        name: 'Automatyczne cele',
        amount: autoGoalsAmount,
        transaction_date: date,
        is_savings_op: true,
      });
      if (insertGoalsError) {
        const isDuplicate = (insertGoalsError as any).code === '23505' || (insertGoalsError.message || '').toLowerCase().includes('duplicate');
        if (!isDuplicate) {
          throw new SupabaseApiError('Failed to create auto goals transaction', undefined, insertGoalsError);
        }
      } else {
        createdGoals = true;
      }
    }
    return { createdSavings, createdGoals };
  }

  // Removed predicate helpers; allocation depends on actual creation result

  private static async buildDailyBudgetInfo(user: User, date: string): Promise<DailyBudgetInfo> {
    const targetDate = new Date(date + 'T00:00:00');
    const year = targetDate.getFullYear();
    const monthIndex = targetDate.getMonth();
    const dayOfMonth = targetDate.getDate();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = BudgetingService.formatLocalDate(new Date(year, monthIndex, 1));

    // Today's budget setting
    const { data: todaySetting, error: todaySettingError } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', date)
      .single();
    if (todaySettingError) {
      throw new SupabaseApiError('Failed to load today budget settings', undefined, todaySettingError);
    }

    const baseDailyLimit = todaySetting.daily_budget_limit || 0;
    // Read today's auto transactions to reflect the actual deducted amounts
    const { data: autoTx, error: autoTxError } = await supabase
      .from('transactions')
      .select('amount, name, is_savings_op')
      .eq('user_id', user.id)
      .eq('transaction_date', date)
      .eq('is_savings_op', true);
    if (autoTxError) {
      throw new SupabaseApiError('Failed to load auto transactions', undefined, autoTxError);
    }
    const autoSavingsAmount = (autoTx || []).reduce((sum: number, t: any) => t.name === 'Automatyczne oszczędzanie' ? sum + (t.amount || 0) : sum, 0);
    const autoGoalsAmount = (autoTx || []).reduce((sum: number, t: any) => t.name === 'Automatyczne cele' ? sum + (t.amount || 0) : sum, 0);
    const dailyBudgetLimit = baseDailyLimit - autoSavingsAmount - autoGoalsAmount;

    // Today's variable expenses (exclude savings ops, exclude incomes)
    const { data: txToday, error: txTodayError } = await supabase
      .from('transactions')
      .select('amount, is_savings_op')
      .eq('user_id', user.id)
      .eq('transaction_date', date);
    if (txTodayError) {
      throw new SupabaseApiError('Failed to load today transactions', undefined, txTodayError);
    }

    const todaysExpenses = (txToday || []).reduce((sum: number, t: any) => {
      const amount = t.amount || 0;
      if (!t.is_savings_op && amount > 0) {
        return sum + amount;
      }
      return sum;
    }, 0);

    // We already computed autoGoalsAmount from settings-derived base and percents

    // Total available income = monthly fixed net + variable incomes MTD
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('amount')
      .eq('user_id', user.id);
    if (recurringError) {
      throw new SupabaseApiError('Failed to fetch recurring transactions', undefined, recurringError);
    }
    const sumRecurring = (recurring || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    const monthlyNetAvailable = -sumRecurring;

    const { data: monthTx, error: monthTxError } = await supabase
      .from('transactions')
      .select('amount, is_savings_op, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', firstDayOfMonth)
      .lte('transaction_date', date);
    if (monthTxError) {
      throw new SupabaseApiError('Failed to fetch monthly transactions', undefined, monthTxError);
    }
    const variableIncomesMTD = (monthTx || []).reduce((sum: number, t: any) => {
      const amount = t.amount || 0;
      if (!t.is_savings_op && amount < 0) {
        return sum + (-amount);
      }
      return sum;
    }, 0);
    const totalAvailableIncome = monthlyNetAvailable + variableIncomesMTD;

    const daysRemaining = daysInMonth - dayOfMonth + 1;
    const dailyBudgetLeft = dailyBudgetLimit - todaysExpenses;

    // Percentages from today's settings
    const autoSavingsPercent = todaySetting.auto_savings_percent || 0;
    const autoGoalsPercent = todaySetting.auto_goals_percent || 0;

    // Month sums for auto transactions
    const { data: monthAutoTx, error: monthAutoTxError } = await supabase
      .from('transactions')
      .select('amount, name, is_savings_op, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', firstDayOfMonth)
      .lte('transaction_date', date)
      .eq('is_savings_op', true);
    if (monthAutoTxError) {
      throw new SupabaseApiError('Failed to fetch monthly auto transactions', undefined, monthAutoTxError);
    }
    const autoSavingsMonthSum = (monthAutoTx || []).reduce((sum: number, t: any) => t.name === 'Automatyczne oszczędzanie' ? sum + (t.amount || 0) : sum, 0);
    const autoGoalsMonthSum = (monthAutoTx || []).reduce((sum: number, t: any) => t.name === 'Automatyczne cele' ? sum + (t.amount || 0) : sum, 0);

    return {
      dailyBudgetLimit,
      dailyBudgetLeft,
      todaysExpenses,
      daysRemaining,
      totalAvailableIncome,
      date,
      autoGoalsAmount,
      autoSavingsAmount,
      autoSavingsPercent,
      autoGoalsPercent,
      autoSavingsMonthSum,
      autoGoalsMonthSum,
    };
  }
}
