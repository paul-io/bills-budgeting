// src/utils/constants.ts

/**
 * File upload configuration
 */
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Accepted file types for attachments
 */
export const ACCEPTED_FILE_TYPES = ".pdf,.docx,.doc,.xls,.xlsx,image/png,image/jpeg,image/jpg";

/**
 * Pagination configuration
 */
export const TRANSACTIONS_PER_PAGE = 5;
export const DASHBOARD_RECENT_TRANSACTIONS = 5;
export const DASHBOARD_MONTHS_TO_SHOW = 6;

/**
 * Toast notification durations (milliseconds)
 */
export const TOAST_SUCCESS_DURATION = 3000;
export const TOAST_ERROR_DURATION = 5000;
export const TOAST_WARNING_DURATION = 4000;

/**
 * Validation limits
 */
export const MAX_TRANSACTION_AMOUNT = 1000000;
export const MIN_DESCRIPTION_LENGTH = 2;
export const MAX_DESCRIPTION_LENGTH = 45;

/**
 * Filename truncation length for display
 */
export const MAX_DISPLAY_FILENAME_LENGTH = 20;