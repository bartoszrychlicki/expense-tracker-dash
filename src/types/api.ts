/**
 * API Response Types
 * 
 * This file contains TypeScript interfaces for all API responses
 * and data models used in the expense tracker application.
 */

// Base Airtable Record Interface
export interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

// Airtable API Response Interface
export interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// Day Record Fields Interface
export interface DayRecordFields {
  "Daily budget left"?: number;
  "Daily spent sum"?: number;
  "Todays variable daily limit"?: number;
  "Created at"?: string;
}

// Transaction Record Fields Interface
export interface TransactionRecordFields {
  Name?: string;
  Ai_Category?: string;
  Value?: number;
  "transaction date"?: string;
}

// Application Data Models
export interface Transaction {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
  isPositive: boolean;
}

export interface DailyBudget {
  budgetLeft: number;
  spentSum: number;
  totalLimit: number;
}

// API Error Interface
export interface ApiError {
  error: {
    type: string;
    message: string;
  };
}

// Loading State Interface
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}