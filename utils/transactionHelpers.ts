/**
 * Transaction Helpers Utility
 * 
 * Provides helper functions for converting between different transaction formats
 * and working with transaction data consistently.
 */

import { NewTransaction, Transaction, TransactionInput } from '@/types';
import { getNow } from './dateHelpers';

/**
 * Converts a Transaction (from Airtable) to NewTransaction format
 */
export function transactionToNewTransaction(transaction: Transaction): NewTransaction {
  return {
    name: transaction.Name,
    value: parseFloat(transaction.Value) || 0,
    date: transaction.Date,
    category: transaction.Ai_Category,
  };
}

/**
 * Converts NewTransaction to Airtable field format for API calls
 */
export function newTransactionToAirtableFields(transaction: NewTransaction) {
  return {
    Name: transaction.name,
    Value: transaction.value,
    'transaction date': transaction.date || getNow(),
    ...(transaction.category && { Ai_Category: transaction.category }),
    ...(transaction.fromAccountId && { 'From Account': [transaction.fromAccountId] }),
    ...(transaction.toAccountId && { 'To Account': [transaction.toAccountId] }),
  };
}

/**
 * Normalizes TransactionInput to NewTransaction format
 */
export function normalizeTransactionInput(input: TransactionInput): NewTransaction {
  return {
    name: input.name,
    value: typeof input.value === 'string' ? parseFloat(input.value) || 0 : input.value,
    date: input.date,
    category: input.category,
    fromAccountId: input.fromAccountId,
    toAccountId: input.toAccountId,
  };
}

/**
 * Creates a transfer transaction between accounts
 */
export function createTransferTransaction(
  name: string,
  amount: number,
  fromAccountId: string,
  toAccountId: string,
  date?: string
): NewTransaction {
  return {
    name,
    value: amount,
    date: date || getNow(),
    fromAccountId,
    toAccountId,
  };
}

/**
 * Creates a simple expense/income transaction
 */
export function createSimpleTransaction(
  name: string,
  amount: number,
  category?: string,
  date?: string
): NewTransaction {
  return {
    name,
    value: amount,
    date: date || getNow(),
    category,
  };
}

/**
 * Validates that a transaction has required fields
 */
export function validateTransaction(transaction: Partial<NewTransaction>): boolean {
  return !!(
    transaction.name &&
    transaction.name.trim().length > 0 &&
    typeof transaction.value === 'number' &&
    !isNaN(transaction.value)
  );
}

/**
 * Checks if a transaction is a transfer (has both from and to accounts)
 */
export function isTransferTransaction(transaction: NewTransaction): boolean {
  return !!(transaction.fromAccountId && transaction.toAccountId);
}

/**
 * Checks if a transaction represents an expense (positive value)
 */
export function isExpenseTransaction(transaction: NewTransaction): boolean {
  return transaction.value > 0;
}

/**
 * Checks if a transaction represents income (negative value)
 */
export function isIncomeTransaction(transaction: NewTransaction): boolean {
  return transaction.value < 0;
}