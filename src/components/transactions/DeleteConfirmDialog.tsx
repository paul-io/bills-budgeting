// src/components/transactions/DeleteConfirmDialog.tsx
import { Modal, Stack, Text, Paper, Group, Button } from '@mantine/core';
import { IconPaperclip, IconTrash } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import type { Transaction } from '../../utils/types';

interface DeleteConfirmDialogProps {
  opened: boolean;
  transaction: Transaction | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Delete confirmation dialog component
 * Shows transaction details before deletion
 * Warns if attachment will also be deleted
 */
export const DeleteConfirmDialog = ({
  opened,
  transaction,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title="Delete Transaction"
      centered
      size="sm"
      closeOnClickOutside={false}
      closeOnEscape={true}
    >
      <Stack gap="md">
        <Text>
          Are you sure you want to delete this transaction?
        </Text>
        
        {transaction && (
          <Paper 
            p="sm" 
            withBorder 
            style={{ 
              backgroundColor: colorScheme === 'dark' ? '#3d1f1f' : 'var(--mantine-color-red-0)',
              borderColor: colorScheme === 'dark' ? '#8b1a1a' : 'var(--mantine-color-red-3)'
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Description:</Text>
                <Text size="sm">{transaction.description}</Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" fw={500}>Amount:</Text>
                <Text size="sm" c="red" fw={600}>
                  ${transaction.amount?.toFixed(2)}
                </Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" fw={500}>Date:</Text>
                <Text size="sm">{transaction.date}</Text>
              </Group>
              
              {transaction.attachmentPath && (
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Attachment:</Text>
                  <Group gap={4}>
                    <IconPaperclip size={14} />
                    <Text size="sm">File will be deleted</Text>
                  </Group>
                </Group>
              )}
            </Stack>
          </Paper>
        )}

        <Text size="sm" c="dimmed">
          This action cannot be undone.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button 
            variant="subtle" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={onConfirm}
            loading={isDeleting}
            leftSection={!isDeleting ? <IconTrash size={16} /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};