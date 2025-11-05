// src/components/transactions/TransactionTable.tsx
import { Paper, Table, Text, Badge, Group, Menu, ActionIcon } from '@mantine/core';
import { IconPaperclip, IconEdit, IconTrash, IconDots } from '@tabler/icons-react';
import type { Transaction } from '../../utils/types';
import { getFilenameFromPath, truncateFilename, formatDate } from '../../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onViewAttachment: (path: string) => void;
}

/**
 * Transaction table component
 * Displays all transactions with edit/delete actions
 */
export const TransactionTable = ({
  transactions,
  onEdit,
  onDelete,
  onViewAttachment,
}: TransactionTableProps) => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Attachment</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((transaction) => {
            const filename = transaction.attachmentPath 
              ? getFilenameFromPath(transaction.attachmentPath)
              : null;
            const displayName = filename ? truncateFilename(filename) : null;

            return (
              <Table.Tr key={transaction.id}>
                {/* Date */}
                <Table.Td>{formatDate(transaction.date)}</Table.Td>
                
                {/* Description */}
                <Table.Td>{transaction.description}</Table.Td>
                
                {/* Type Badge */}
                <Table.Td>
                  <Badge color={transaction.type === 'income' ? 'green' : 'red'}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                </Table.Td>
                
                {/* Amount */}
                <Table.Td>
                  <Text c={transaction.type === 'income' ? 'green' : 'red'} fw={500}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                  </Text>
                </Table.Td>
                
                {/* Attachment */}
                <Table.Td>
                  {transaction.attachmentPath ? (
                    <Group 
                      gap="xs" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => onViewAttachment(transaction.attachmentPath!)}
                    >
                      <IconPaperclip size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                      <Text 
                        size="sm" 
                        c="blue" 
                        style={{ textDecoration: 'underline' }}
                        title={filename || undefined}
                      >
                        {displayName}
                      </Text>
                    </Group>
                  ) : (
                    <Text c="dimmed" size="sm">—</Text>
                  )}
                </Table.Td>
                
                {/* Actions Menu */}
                <Table.Td>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item 
                        leftSection={<IconEdit size={14} />}
                        onClick={() => onEdit(transaction)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item 
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => onDelete(transaction)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};