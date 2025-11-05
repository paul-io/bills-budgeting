// src/components/dashboard/RecentTransactions.tsx
import { Paper, Title, Table, Text, Stack, Skeleton } from '@mantine/core';
import type { Transaction } from '../../utils/types';
import { DASHBOARD_RECENT_TRANSACTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

/**
 * Recent transactions table component
 * Displays the 5 most recent transactions on dashboard
 */
export const RecentTransactions = ({ 
  transactions, 
  isLoading = false 
}: RecentTransactionsProps) => {
  if (isLoading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Skeleton height={20} width={200} mb="md" />
        <Stack gap="sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={40} />
          ))}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={4} mb="md">Recent Transactions</Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.slice(0, DASHBOARD_RECENT_TRANSACTIONS).map((transaction) => (
            <Table.Tr key={transaction.id}>
              <Table.Td>{transaction.description}</Table.Td>
              <Table.Td>
                <Text c={transaction.type === 'income' ? 'green' : 'red'} fw={500}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                </Text>
              </Table.Td>
              <Table.Td>{formatDate(transaction.date)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};