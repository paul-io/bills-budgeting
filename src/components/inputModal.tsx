// src/components/inputModal.tsx
import { useState, useEffect } from 'react';
import { NumberInput, Button, Space, Input, FileButton, SegmentedControl, Group, Text, Paper } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { IconPaperclip, IconX, IconAlertCircle } from '@tabler/icons-react';
import { getUrl } from 'aws-amplify/storage';
import { notifications } from '@mantine/notifications';

import type { Schema } from "../../amplify/data/resource";

type Transaction = Schema["Transaction"]["type"];

interface TransactionModalProps {
  mode: "create" | "edit";
  transaction?: Transaction;
  onSave: (
    fields: {
      description: string;
      amount: number;
      date: string;
      type: "income" | "expense";
      file?: File | null;
      removeExistingAttachment?: boolean;
    },
    id?: string
  ) => Promise<void>;
  close: () => void;
}

export default function TransactionModal({ mode, transaction, onSave, close }: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string | null>(null);
  const [type, setType] = useState<"income" | "expense">('expense');
  
  const [existingAttachmentPath, setExistingAttachmentPath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState<boolean>(false);

  // Validation errors
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && transaction) {
      setDescription(transaction.description ?? "");
      setAmount(transaction.amount ?? 0);
      setDate(transaction.date ?? null);
      setType(transaction.type ?? "expense");
      setExistingAttachmentPath(transaction.attachmentPath ?? null);
      setFile(null);
      setRemoveExisting(false);
    } else {
      setDescription('');
      setAmount(0);
      setDate(null);
      setType('expense');
      setExistingAttachmentPath(null);
      setFile(null);
      setRemoveExisting(false);
    }
    // Clear errors when mode/transaction changes
    setDescriptionError(null);
    setAmountError(null);
    setDateError(null);
  }, [mode, transaction]);

  const handleRemoveExisting = () => {
    setRemoveExisting(true);
    setFile(null);
  };

  const handleKeepExisting = () => {
    setRemoveExisting(false);
  };

  const handleRemoveNewFile = () => {
    setFile(null);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (selectedFile.size > maxSize) {
      notifications.show({
        title: 'File Too Large',
        message: 'Please select a file smaller than 100MB',
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
        autoClose: 5000,
      });
      return;
    }

    setFile(selectedFile);
    if (selectedFile && existingAttachmentPath) {
      setRemoveExisting(true);
    }
  };

  const handleViewAttachment = async () => {
    if (!navigator.onLine) {
      notifications.show({
        title: 'No Internet Connection',
        message: 'Cannot open attachment while offline.',
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 5000,
      });
      return;
    }

    if (existingAttachmentPath) {
      try {
        const urlResult = await getUrl({ 
          path: existingAttachmentPath,
          options: {
            expiresIn: 3600
          }
        });
        window.open(urlResult.url.toString(), '_blank');
      } catch (error) {
        notifications.show({
          title: 'Cannot Open Attachment',
          message: 'Failed to load attachment. Please try again.',
          color: 'red',
          icon: <IconX size={18} />,
          autoClose: 5000,
        });
      }
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate description
    if (!description || description.trim().length === 0) {
      setDescriptionError('Description is required');
      isValid = false;
    } else if (description.trim().length < 2) {
      setDescriptionError('Description must be at least 2 characters');
      isValid = false;
    } else {
      setDescriptionError(null);
    }

    // Validate amount
    if (amount === null || amount === undefined) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (amount <= 0) {
      setAmountError('Amount must be greater than zero');
      isValid = false;
    } else if (amount > 1000000) {
      setAmountError('Amount cannot exceed $1,000,000');
      isValid = false;
    } else {
      setAmountError(null);
    }

    // Validate date
    if (!date) {
      setDateError('Date is required');
      isValid = false;
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        setDateError('Date cannot be in the future');
        isValid = false;
      } else {
        setDateError(null);
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors before submitting',
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
        autoClose: 4000,
      });
      return;
    }

    await onSave({ description, amount, date: date!, type, file, removeExistingAttachment: removeExisting }, transaction?.id);
    close();
  };

  const getFilenameFromPath = (path: string): string => {
    const parts = path.split('/');
    const filenameWithTimestamp = parts[parts.length - 1];
    const underscoreIndex = filenameWithTimestamp.indexOf('_');
    if (underscoreIndex > 0) {
      return filenameWithTimestamp.substring(underscoreIndex + 1);
    }
    return filenameWithTimestamp;
  };

  const truncateFilename = (filename: string, maxLength: number = 20): string => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
    return `${truncatedName}...${extension}`;
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <SegmentedControl
        onChange={(value: string) => setType(value as "income" | "expense")}
        value={type}
        fullWidth
        data={[
          { label: 'Income', value: 'income' },
          { label: 'Expense', value: 'expense' }
        ]}
        styles={{
          indicator: { backgroundColor: type === 'income' ? 'rgb(64, 192, 87)' : 'rgb(250, 83, 82)' }
        }}
      />

      <Space h="md" />

      <Input.Wrapper label="Description" required error={descriptionError}>
        <Input
          placeholder="Describe your transaction"
          maxLength={45}
          value={description}
          onChange={(e) => {
            setDescription(e.currentTarget.value);
            if (descriptionError) setDescriptionError(null); // Clear error on change
          }}
          error={!!descriptionError}
        />
        <Text size="xs" c="dimmed" mt={4}>
          {description.length}/45 characters
        </Text>
      </Input.Wrapper>

      <Space h="sm" />

      <NumberInput
        label="Amount"
        placeholder="Enter amount"
        value={amount}
        onChange={(value) => {
          if (typeof value === 'number') {
            setAmount(value);
            if (amountError) setAmountError(null); // Clear error on change
          }
        }}
        error={amountError}
        required
        prefix='$'
        min={0}
        max={1000000}
        decimalScale={2}
        step={0.01}
      />

      <Space h="sm" />

      <DatePickerInput
        valueFormat="YYYY MMM DD"
        required
        label="Pick a Date"
        placeholder="Select the date of this transaction"
        error={dateError}
        maxDate={new Date()} // Can't select future dates
        value={
          date
            ? (() => {
                const [year, month, day] = date.split("-").map(Number);
                return new Date(year, month - 1, day);
              })()
            : null
        }
        onChange={(value: Date | null) => {
          if (value) {
            const localDate = value.toLocaleDateString("en-CA");
            setDate(localDate);
            if (dateError) setDateError(null); // Clear error on change
          }
        }}
      />

      <Space h="md" />

      {/* FILE ATTACHMENT SECTION */}
      <div>
        <Text size="sm" fw={500} mb={8}>Attachment</Text>
        
        {mode === "edit" && existingAttachmentPath && !removeExisting && !file && (
          <Paper 
            p="sm" 
            withBorder
            style={{ 
              backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
              borderColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))'
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <IconPaperclip size={16} />
                <Text size="sm">{truncateFilename(getFilenameFromPath(existingAttachmentPath))}</Text>
              </Group>
              <Group gap="xs">
                <Button 
                  size="xs" 
                  variant="subtle"
                  onClick={handleViewAttachment}
                >
                  View
                </Button>
                <Button 
                  size="xs" 
                  variant="subtle" 
                  color="red"
                  onClick={handleRemoveExisting}
                  leftSection={<IconX size={14} />}
                >
                  Remove
                </Button>
              </Group>
            </Group>
          </Paper>
        )}

        {mode === "edit" && existingAttachmentPath && removeExisting && !file && (
          <Paper 
            p="sm" 
            withBorder
            style={{ 
              backgroundColor: 'light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-6))',
              borderColor: 'light-dark(var(--mantine-color-red-3), var(--mantine-color-red-9))'
            }}
          >
            <Group justify="space-between">
              <Text size="sm" c="red" fs="italic">Attachment will be removed</Text>
              <Button 
                size="xs" 
                variant="subtle" 
                onClick={handleKeepExisting}
              >
                Undo
              </Button>
            </Group>
          </Paper>
        )}

        {file && (
          <Paper 
            p="sm" 
            withBorder
            style={{ 
              backgroundColor: 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6))',
              borderColor: 'light-dark(var(--mantine-color-blue-3), var(--mantine-color-blue-9))'
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <IconPaperclip size={16} />
                <Text size="sm" fw={500}>{truncateFilename(file.name)}</Text>
                <Text size="xs" c="dimmed">(New)</Text>
              </Group>
              <Button 
                size="xs" 
                variant="subtle" 
                color="red"
                onClick={handleRemoveNewFile}
                leftSection={<IconX size={14} />}
              >
                Remove
              </Button>
            </Group>
          </Paper>
        )}

        {!file && (
          <FileButton onChange={handleFileSelect} accept=".pdf,.docx,.doc,.xls,.xlsx,image/png,image/jpeg,image/jpg">
            {(props) => (
              <Button 
                variant='light' 
                {...props} 
                mt={existingAttachmentPath && !removeExisting ? "xs" : 0}
                fullWidth
              >
                {mode === "edit" && existingAttachmentPath && removeExisting 
                  ? "Attach New File" 
                  : mode === "edit" && existingAttachmentPath 
                  ? "Replace Attachment"
                  : "Attach a File"}
              </Button>
            )}
          </FileButton>
        )}
        <Text size="xs" c="dimmed" mt={4}>
          Maximum file size: 100MB
        </Text>
      </div>

      <Space h="lg" />

      <Button type="submit" onClick={handleSubmit} fullWidth>
        {mode === "create" ? "Save" : "Update"}
      </Button>
    </form>
  );
}