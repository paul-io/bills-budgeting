// src/components/transactions/TransactionsPage.tsx
import { Stack, Group, Title, Button, Skeleton, Paper, Alert } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { EmptyState } from '../shared/EmptyState';
import { IconExchange } from '@tabler/icons-react';
import type { Transaction } from '../../utils/types';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { useState } from 'react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface TransactionsPageProps {
  transactions: Transaction[];
  isLoading: boolean;
  isDemoUser: boolean;
  onCreateTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onViewAttachment: (path: string) => void;
}

export const TransactionsPage = ({
  transactions,
  isLoading,
  isDemoUser,
  onCreateTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onViewAttachment,
}: TransactionsPageProps) => {

  // Use the filter hook
  const {
    filterType,
    sortBy,
    sortOrder,
    searchQuery,
    setFilterType,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    processedTransactions,
  } = useTransactionFilters(transactions);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      setIsDeletingId(transactionToDelete.id);
      await onDeleteTransaction(transactionToDelete);
      setIsDeletingId(null);
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Stack>
        {isDemoUser && (
        <Alert icon={<IconAlertCircle size={16} />} title="Demo Account - Read Only" color="yellow" mb="lg">
          This is a read-only demo account. Create your own account to add, edit, or delete transactions.
        </Alert>
        )}
        <Group justify="space-between">
          <Skeleton height={32} width={200} />
          <Skeleton height={36} width={160} />
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Stack gap="sm">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={60} />
            ))}
          </Stack>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Stack gap="sm">
            <Skeleton height={40} />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={60} />
            ))}
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack>
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>Transactions</Title>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={onCreateTransaction}
        >
          Add Transaction
        </Button>
      </Group>

      {/* Filters */}
      <TransactionFilters
        filterType={filterType}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchQuery={searchQuery}
        setFilterType={setFilterType}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        setSearchQuery={setSearchQuery}
        filteredCount={processedTransactions.length}
        totalCount={transactions.length}
      />

      {/* Table or Empty State */}
      {processedTransactions.length > 0 ? (
        <TransactionTable
          transactions={processedTransactions}
          onEdit={onEditTransaction}
          onDelete={handleDeleteClick}
          onViewAttachment={onViewAttachment}
        />
      ) : (
        <EmptyState
          icon={<IconExchange size={48} />}
          title={
            transactions.length === 0 
              ? "No transactions yet" 
              : "No transactions match your filters"
          }
          description={
            transactions.length === 0 
              ? "Create your first transaction to get started!" 
              : "Try adjusting your filters or search"
          }
          action={
            transactions.length === 0 
              ? {
                  label: "Add Your First Transaction",
                  icon: <IconPlus size={16} />,
                  onClick: onCreateTransaction
                }
              : undefined
          }
        />
      )}
      <DeleteConfirmDialog
        opened={deleteModalOpen}
        transaction={transactionToDelete}
        isDeleting={isDeletingId === transactionToDelete?.id}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Stack>
  );
};