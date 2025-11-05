// src/components/transactions/TransactionFilters.tsx
import { Paper, Grid, Select, Input, Text, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { SortField, SortOrder, FilterType } from '../../utils/types';

interface TransactionFiltersProps {
  // Filter values
  filterType: FilterType;
  sortBy: SortField;
  sortOrder: SortOrder;
  searchQuery: string;
  
  // Setters
  setFilterType: (value: FilterType) => void;
  setSortBy: (value: SortField) => void;
  setSortOrder: (value: SortOrder) => void;
  setSearchQuery: (value: string) => void;
  
  // Counts for display
  filteredCount: number;
  totalCount: number;
}

/**
 * Transaction filters and search component
 * Provides controls for filtering, sorting, and searching transactions
 */
export const TransactionFilters = ({
  filterType,
  sortBy,
  sortOrder,
  searchQuery,
  setFilterType,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  filteredCount,
  totalCount,
}: TransactionFiltersProps) => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Grid>
        {/* Filter by Type */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            label="Filter by Type"
            value={filterType}
            onChange={(value) => setFilterType(value as FilterType)}
            data={[
              { value: 'all', label: 'All Transactions' },
              { value: 'income', label: 'Income Only' },
              { value: 'expense', label: 'Expense Only' },
            ]}
          />
        </Grid.Col>

        {/* Sort by Field */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(value) => setSortBy(value as SortField)}
            data={[
              { value: 'date', label: 'Date' },
              { value: 'amount', label: 'Amount' },
              { value: 'description', label: 'Description' },
            ]}
          />
        </Grid.Col>

        {/* Sort Order */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            label="Order"
            value={sortOrder}
            onChange={(value) => setSortOrder(value as SortOrder)}
            data={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
          />
        </Grid.Col>

        {/* Search */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Input.Wrapper label="Search">
            <Input
              placeholder="Search descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              rightSection={
                searchQuery && (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setSearchQuery('')}
                    size="sm"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )
              }
            />
          </Input.Wrapper>
        </Grid.Col>
      </Grid>

      <Text size="sm" c="dimmed" mt="sm">
        Showing {filteredCount} of {totalCount} transactions
      </Text>
    </Paper>
  );
};