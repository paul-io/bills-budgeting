// src/utils/types.ts
import type { Schema } from "../../amplify/data/resource";

/**
 * Transaction type from Amplify schema
 */
export type Transaction = Schema["Transaction"]["type"];

/**
 * Transaction type enum
 */
export type TransactionType = "income" | "expense";

/**
 * Navigation section types
 */
export type NavigationSection = 'dashboard' | 'transactions' | 'reports';

/**
 * Sort field options
 */
export type SortField = 'date' | 'amount' | 'description';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Filter type options
 */
export type FilterType = 'all' | 'income' | 'expense';

/**
 * Modal mode for create/edit
 */
export type ModalMode = "create" | "edit";

/**
 * Transaction form fields
 */
export interface TransactionFormFields {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  file?: File | null;
  removeExistingAttachment?: boolean;
}