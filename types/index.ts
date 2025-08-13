/**
 * TypeScript type definitions for the Expense Tracker application
 */

/**
 * Base transaction data structure
 */
interface BaseTransactionData {
  /** Transaction name/description */
  name: string;
  /** Transaction value */
  value: number | string;
  /** Transaction date */
  date?: string;
  /** AI-generated category for the transaction */
  category?: string;
}

/**
 * Represents a financial transaction from Airtable (with Airtable field naming)
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Transaction name/description (Airtable field) */
  Name: string;
  /** AI-generated category for the transaction (Airtable field) */
  Ai_Category: string;
  /** Transaction value as string (Airtable field) */
  Value: string;
  /** Transaction date (Airtable field) */
  Date: string;
}

/**
 * Represents a goal from Supabase
 */
export interface Goal {
  /** Unique identifier for the goal */
  id: string;
  /** User ID who owns this goal */
  user_id: string;
  /** Goal name/description */
  name: string;
  /** Target amount for the goal */
  target_amount: number;
  /** Current amount saved for the goal */
  current_amount: number;
  /** URL to the product (optional) */
  url?: string;
  /** Decision date for the goal */
  decision_date?: string;
  /** Decision status */
  decision?: string;
  /** Whether this is the currently selected goal */
  is_currently_selected: boolean;
  /** When the goal was created */
  created_at: string;
  /** When the goal was last updated */
  updated_at: string;
}

/**
 * Represents daily budget information from Airtable (legacy)
 */
export interface DailyBudget {
  /** Amount left in daily budget */
  dailyBudgetLeft?: string;
  /** Total amount spent today */
  dailySpentSum?: string;
  /** Today's variable daily limit */
  todaysVariableDailyLimit?: string;
  /** Automatic savings made today */
  automaticSavingsToday?: string;
  /** Percentage of daily budget for automatic savings */
  automaticSavingsPercentage?: string;
  /** Automatic goal deposits made today */
  automaticGoalDepositsToday?: string;
  /** Percentage of daily budget for automatic goal deposits */
  automaticGoalDepositsPercentage?: string;
  /** Sum of automatic savings this month */
  automaticSavingsMonthSum?: string;
  /** Sum of automatic goal deposits this month */
  automaticGoalDepositsMonthSum?: string;
}

/**
 * Represents daily budget information from BudgetingService
 */
export interface DailyBudgetInfo {
  /** Daily budget limit amount (after auto-goals deduction) */
  dailyBudgetLimit: number;
  /** Amount of daily budget left for today */
  dailyBudgetLeft: number;
  /** Today's expenses (sum of variable expenses) */
  todaysExpenses: number;
  /** Number of days remaining in the month */
  daysRemaining: number;
  /** Total available income for the month */
  totalAvailableIncome: number;
  /** Date for this budget calculation */
  date: string;
  /** Auto-goals amount deducted from daily budget */
  autoGoalsAmount?: number;
}

/**
 * Represents budget settings from the database
 */
export interface BudgetSettings {
  /** User ID who owns this budget setting */
  user_id: string;
  /** Date for this budget setting (YYYY-MM-DD) */
  day: string;
  /** Daily budget limit amount */
  daily_budget_limit: number;
  /** Percentage of daily budget for automatic savings */
  auto_savings_percent: number;
  /** Percentage of daily budget for automatic goal deposits */
  auto_goals_percent: number;
  /** When this budget setting was last updated */
  updated_at: string;
}

/**
 * Represents a planned transaction from Airtable
 */
export interface PlannedTransaction {
  /** Unique identifier for the planned transaction */
  id: string;
  /** Transaction name/description */
  Name: string;
  /** Transaction value as string */
  Value: string;
  /** URL to the product (optional) */
  URL?: string;
  /** Creation date */
  Created: string;
  /** Number of hundreds (automatically calculated) */
  NumberOfHundreds: number;
  /** Decision date */
  Decision_date: string;
  /** Decision status */
  Decision: string;
  /** Whether this is the currently selected goal */
  Currently_selected_goal?: boolean;
}

/**
 * Represents an account from Airtable
 */
export interface Account {
  /** Unique identifier for the account */
  id: string;
  /** Account name (e.g., "Goals", "Checking") */
  Name: string;
  /** Current balance of the account */
  Balance: string;
}

/**
 * Raw account fields from Airtable
 */
export interface AirtableAccountFields {
  Name?: string;
  Balance?: number | string;
}

/**
 * Airtable API response structure for records
 */
export interface AirtableRecord<T = any> {
  /** Record ID from Airtable */
  id: string;
  /** Record fields containing the actual data */
  fields: T;
  /** Record creation time */
  createdTime?: string;
}

/**
 * Airtable API response structure
 */
export interface AirtableResponse<T = any> {
  /** Array of records */
  records: AirtableRecord<T>[];
  /** Offset for pagination (if applicable) */
  offset?: string;
}

/**
 * Raw transaction fields from Airtable
 */
export interface AirtableTransactionFields {
  Name?: string;
  Ai_Category?: string;
  Value?: number | string;
  'transaction date'?: string;
  category_type?: string;
}

/**
 * Raw daily budget fields from Airtable
 */
export interface AirtableDailyBudgetFields {
  'Daily budget left'?: number | string;
  'Daily spent sum'?: number | string;
  'Todays variable daily limit'?: number | string;
  'Created at'?: string;
  'auto_savigs_value'?: number | string;
  'auto_savings_percent (from Month)'?: number[];
  'auto_goals_value'?: number | string;
  'auto_goals_percent (from Month)'?: number[];
  'auto_savings_sum (from Month)'?: number[];
  'auto_goals_sum'?: number[];
}

/**
 * Raw planned transaction fields from Airtable
 */
export interface AirtablePlannedTransactionFields {
  id?: number;
  Name?: string;
  Value?: number | string;
  URL?: string;
  Created?: string;
  _NumberOfHundreds?: number;
  Decision_date?: string;
  Decision?: string;
  Currently_selected_goal?: boolean;
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: any;
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  /** Whether the operation is currently loading */
  isLoading: boolean;
  /** Error message if the operation failed */
  error?: string;
}

/**
 * Interface for creating a new transaction
 * Extends base transaction data with transfer capabilities
 */
export interface NewTransaction extends BaseTransactionData {
  /** Transaction value as number (for calculations) */
  value: number;
  /** Optional from account ID (for transfers) */
  fromAccountId?: string;
  /** Optional to account ID (for transfers) */
  toAccountId?: string;
  /** Whether this is a fixed/recurring transaction */
  is_fixed?: boolean;
}

/**
 * Represents a transaction from the Supabase database
 */
export interface SupabaseTransaction {
  /** Unique identifier for the transaction */
  id: string;
  /** User ID who owns this transaction */
  user_id: string;
  /** Name/description of the transaction */
  name: string;
  /** Amount of the transaction (positive for expenses, negative for income) */
  value: number;
  /** Date of the transaction */
  transaction_date: string;
  /** Whether this is a savings operation (excluded from expense calculations) */
  is_savings_op: boolean;
  /** When this transaction was created */
  created_at: string;
  /** When this transaction was last updated */
  updated_at: string;
}

/**
 * Represents a recurring transaction from the Supabase database
 */
export interface RecurringTransaction {
  /** Unique identifier for the recurring transaction */
  id: string;
  /** User ID who owns this recurring transaction */
  user_id: string;
  /** Name/description of the recurring transaction */
  name: string;
  /** Amount of the recurring transaction (negative for income, positive for expenses) */
  amount: number;
  /** When this recurring transaction was last updated */
  updated_at: string;
}

/**
 * Utility type for transaction creation with flexible value type
 */
export type TransactionInput = Omit<BaseTransactionData, 'value'> & {
  /** Transaction value - can be number or string */
  value: number | string;
  /** Optional account transfer fields */
  fromAccountId?: string;
  toAccountId?: string;
}