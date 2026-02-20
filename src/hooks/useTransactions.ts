// src/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import { generateClient } from "aws-amplify/data";
import { uploadData, remove } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { notifications } from '@mantine/notifications';
import type { Schema } from "../../amplify/data/resource";
import type { Transaction } from '../utils/types';
import { TOAST_SUCCESS_DURATION, TOAST_ERROR_DURATION } from '../utils/constants';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
    let subscription: any;

    const initializeData = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          setTransactions([]);
          setIsLoadingTransactions(true);
          
          const client = generateClient<Schema>();
          
          subscription = client.models.Transaction.observeQuery().subscribe({
            next: (data: { items: any; }) => {
              setTransactions([...data.items]);
              setIsLoadingTransactions(false);
            },
            error: (err: any) => {
              console.error("Error:", err);
              setIsLoadingTransactions(false);
            }
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoadingTransactions(false);
      }
    };

    initializeData();

    // Listen for auth changes
    const unsubscribeHub = Hub.listen('auth', (data) => {
      if (data.payload.event === 'signedIn' || data.payload.event === 'signedOut') {
        // Re-run initialization when auth changes
        initializeData();
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      unsubscribeHub();
    };
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const path = `attachments/${filename}`;
      
      await uploadData({
        path: path,
        data: file,
      }).result;
      
      notifications.show({
        title: 'File Uploaded',
        message: `${file.name} uploaded successfully`,
        color: 'blue',
        autoClose: TOAST_SUCCESS_DURATION,
      });
      
      return path;
    } catch (uploadError) {
      notifications.show({
        title: 'Upload Failed',
        message: 'Could not upload file. Saving transaction without attachment.',
        color: 'orange',
        autoClose: TOAST_ERROR_DURATION,
      });
      
      return null;
    }
  };

  const handleCreateTransaction = async (fields: {
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    file?: File | null;
  }): Promise<void> => {
    setIsSaving(true);
    
    try {
      let attachmentPath: string | null = null;
      
      if (fields.file) {
        attachmentPath = await uploadFile(fields.file);
      }
      
      const result = await client.models.Transaction.create({
        description: fields.description,
        amount: fields.amount,
        date: fields.date,
        type: fields.type,
        attachmentPath: attachmentPath,
      });
      
      if (!result.data) {
        throw new Error('Failed to create transaction');
      }
      
      notifications.show({
        title: 'Transaction Created',
        message: `${fields.type === 'income' ? 'Income' : 'Expense'} of $${fields.amount.toFixed(2)} added successfully`,
        color: 'green',
        autoClose: TOAST_SUCCESS_DURATION,
      });
    } catch (error) {      
      notifications.show({
        title: 'Create Failed',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: TOAST_ERROR_DURATION,
      });
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTransaction = async (
    id: string,
    fields: {
      description: string;
      amount: number;
      date: string;
      type: 'income' | 'expense';
      file?: File | null;
      removeExistingAttachment?: boolean;
    },
    currentTransaction: Transaction | null
  ): Promise<void> => {
    setIsSaving(true);
    
    try {
      const updateData: Partial<Transaction> = {
        description: fields.description,
        amount: fields.amount,
        date: fields.date,
        type: fields.type,
      };
      
      if (fields.file) {
        const attachmentPath = await uploadFile(fields.file);
        updateData.attachmentPath = attachmentPath;
        
        if (currentTransaction?.attachmentPath) {
          try {
            await remove({ path: currentTransaction.attachmentPath });
          } catch (error) {
            // Old attachment cleanup failed - not critical
          }
        }
      } else if (fields.removeExistingAttachment) {
        updateData.attachmentPath = null as any;
        
        if (currentTransaction?.attachmentPath) {
          try {
            await remove({ path: currentTransaction.attachmentPath });
            
            notifications.show({
              title: 'Attachment Removed',
              message: 'File removed from transaction',
              color: 'blue',
              autoClose: TOAST_SUCCESS_DURATION,
            });
          } catch (error) {            
            notifications.show({
              title: 'Removal Failed',
              message: 'Could not remove attachment, but transaction was updated',
              color: 'orange',
              autoClose: TOAST_ERROR_DURATION,
            });
          }
        }
      }
      
      const result = await client.models.Transaction.update({ id, ...updateData });
      
      if (!result.data) {
        throw new Error('Failed to update transaction');
      }
      
      notifications.show({
        title: 'Transaction Updated',
        message: 'Changes saved successfully',
        color: 'green',
        autoClose: TOAST_SUCCESS_DURATION,
      });
    } catch (error) {      
      notifications.show({
        title: 'Update Failed',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: TOAST_ERROR_DURATION,
      });
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string): Promise<void> => {
  setIsDeleting(id);
  
  try {
    // Find the transaction to get its attachment path
    const transactionToDelete = transactions.find(t => t.id === id);
    
    // Delete the S3 file first if it exists
    if (transactionToDelete?.attachmentPath) {
      try {
        await remove({ path: transactionToDelete.attachmentPath });
        console.info(`Deleted attachment: ${transactionToDelete.attachmentPath}`);
      } catch (error) {
        console.error(`Error deleting attachment: ${error}`);
        // Continue with transaction deletion even if file deletion fails
      }
    }
    
    // Then delete the transaction from DynamoDB
    const result = await client.models.Transaction.delete({ id });
    
    if (!result.data) {
      throw new Error('Failed to delete transaction');
    }
    
    notifications.show({
      title: 'Transaction Deleted',
      message: 'Transaction removed successfully',
      color: 'green',
      autoClose: TOAST_SUCCESS_DURATION,
    });
  } catch (err) {      
    notifications.show({
      title: 'Delete Failed',
      message: 'Could not delete transaction. Please try again.',
      color: 'red',
      autoClose: TOAST_ERROR_DURATION,
    });
  } finally {
    setIsDeleting(null);
  }
};

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Description', 'Type', 'Amount'].join(','),
      ...transactions.map(t => 
        [t.date, `"${t.description}"`, t.type, t.amount].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    notifications.show({
      title: 'Export Successful',
      message: `${transactions.length} transactions exported to CSV`,
      color: 'green',
      autoClose: TOAST_SUCCESS_DURATION,
    });
  };

  return {
    transactions,
    isLoadingTransactions,
    isDeleting,
    isSaving,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    exportToCSV,
  };
};