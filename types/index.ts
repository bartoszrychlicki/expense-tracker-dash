/**
 * TypeScript type definitions for the Expense Tracker application
 */

/**
 * Represents a financial transaction from Airtable
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Transaction name/description */
  Name: string;
  /** AI-generated category for the transaction */
  Ai_Category: string;
  /** Transaction value as string (can be positive or negative) */
  Value: string;
  /** Transaction date */
  Date: string;
}

/**
 * Represents daily budget information from Airtable
 */
export interface DailyBudget {
  /** Amount left in daily budget */
  dailyBudgetLeft?: string;
  /** Total amount spent today */
  dailySpentSum?: string;
  /** Today's variable daily limit */
  todaysVariableDailyLimit?: string;
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
}

/**
 * Raw daily budget fields from Airtable
 */
export interface AirtableDailyBudgetFields {
  'Daily budget left'?: number | string;
  'Daily spent sum'?: number | string;
  'Todays variable daily limit'?: number | string;
  'Created at'?: string;
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