// src/utils/formatters.ts
import { MAX_DISPLAY_FILENAME_LENGTH } from './constants';

/**
 * Extracts filename from S3 path by removing timestamp prefix
 * @param path - Full S3 path (e.g., "attachments/1234567_file.pdf")
 * @returns Original filename without timestamp
 */
export const getFilenameFromPath = (path: string): string => {
  const parts = path.split('/');
  const filenameWithTimestamp = parts[parts.length - 1];
  const underscoreIndex = filenameWithTimestamp.indexOf('_');
  
  if (underscoreIndex > 0) {
    return filenameWithTimestamp.substring(underscoreIndex + 1);
  }
  
  return filenameWithTimestamp;
};

/**
 * Truncates long filenames for display in UI
 * Preserves file extension
 * @param filename - Original filename
 * @param maxLength - Maximum character length (default from constants)
 * @returns Truncated filename with ellipsis
 */
export const truncateFilename = (
  filename: string, 
  maxLength: number = MAX_DISPLAY_FILENAME_LENGTH
): string => {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
  
  return `${truncatedName}...${extension}`;
};

/**
 * Formats currency amount for display
 * @param amount - Numeric amount
 * @param includeSign - Whether to include +/- sign
 * @param type - Transaction type for sign determination
 */
export const formatCurrency = (
  amount: number, 
  includeSign: boolean = false,
  type?: 'income' | 'expense'
): string => {
  const formatted = `$${amount.toFixed(2)}`;
  
  if (!includeSign || !type) {
    return formatted;
  }
  
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

/**
 * Formats date for display
 * @param dateString - ISO date string
 * @returns Formatted date or fallback text
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "No date";
  return dateString;
};