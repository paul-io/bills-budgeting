// src/components/Reports.tsx
import { useState, useMemo } from 'react';
import { 
  Paper, 
  Title, 
  Group, 
  Button, 
  SegmentedControl, 
  Grid,
  Text,
  Stack,
  Skeleton, 
  Center,   
  Loader,   
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DonutChart, AreaChart, BarChart, LineChart } from '@mantine/charts';
import { IconDownload, IconCalendar } from '@tabler/icons-react';
import type { Schema } from "../../amplify/data/resource";

type TimeScale = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'line' | 'bar' | 'area';
type DatePreset = '7d' | '30d' | '90d' | 'ytd' | 'all';

interface ReportsProps {
  transactions: Array<Schema["Transaction"]["type"]>;
}

export default function Reports({ transactions }: ReportsProps) {
  // State management
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [timeScale, setTimeScale] = useState<TimeScale>('monthly');
  const [chartType, setChartType] = useState<ChartType>('area');

  const [isProcessing, setIsProcessing] = useState(false);

  
  // Date preset handler
  const applyDatePreset = (preset: DatePreset) => {
    setIsProcessing(true);
    
    const today = new Date();
    const start = new Date();
    
    switch (preset) {
      case '7d':
        start.setDate(today.getDate() - 7);
        break;
      case '30d':
        start.setDate(today.getDate() - 30);
        break;
      case '90d':
        start.setDate(today.getDate() - 90);
        break;
      case 'ytd':
        start.setMonth(0, 1);
        break;
      case 'all':
        setDateRange([null, null]);
        setTimeout(() => setIsProcessing(false), 300); // Small delay for visual feedback
        return;
    }
    
    setDateRange([start, today]);
    setTimeout(() => setIsProcessing(false), 300); // Small delay for visual feedback
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return transactions;
    
    return transactions.filter(trans => {
      if (!trans.date) return false;
      const transDate = new Date(trans.date);
      return transDate >= dateRange[0]! && transDate <= dateRange[1]!;
    });
  }, [transactions, dateRange]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const balance = income - expenses;
    const transactionCount = filteredTransactions.length;
    
    // Calculate average per day
    let daysInRange = 30; // default
    if (dateRange[0] && dateRange[1]) {
      daysInRange = Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24));
    }
    const avgPerDay = expenses / (daysInRange || 1);
    
    return { income, expenses, balance, transactionCount, avgPerDay };
  }, [filteredTransactions, dateRange]);

  // Aggregate data by time scale
  const aggregatedData = useMemo(() => {
    const dataMap: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(trans => {
      if (!trans.date) return;
      
      const date = new Date(trans.date);
      let key: string;
      
      switch (timeScale) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = String(date.getFullYear());
          break;
      }
      
      if (!dataMap[key]) {
        dataMap[key] = { income: 0, expense: 0 };
      }
      
      if (trans.type === 'income') {
        dataMap[key].income += trans.amount || 0;
      } else {
        dataMap[key].expense += trans.amount || 0;
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(dataMap)
      .map(([date, values]) => ({
        date,
        Income: Number(values.income.toFixed(2)),
        Expense: Number(values.expense.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions, timeScale]);

  // Export to CSV
  const exportToCSV = () => {
    const csv = [
      ['Date', 'Description', 'Type', 'Amount'].join(','),
      ...filteredTransactions.map(t => 
        [t.date, `"${t.description}"`, t.type, t.amount].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const dateStr = dateRange[0] && dateRange[1]
      ? `${dateRange[0].toISOString().split('T')[0]}_to_${dateRange[1].toISOString().split('T')[0]}`
      : 'all';
    a.download = `transactions_${dateStr}.csv`;
    a.click();
  };

  // Render the main trend chart based on selected type
  const renderMainChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          h={350}
          data={aggregatedData}
          dataKey="date"
          series={[
            { name: 'Income', color: 'green' },
            { name: 'Expense', color: 'red' },
          ]}
          curveType="linear"
          connectNulls
        />
      );
    }
    
    if (chartType === 'area') {
      return (
        <AreaChart
          h={350}
          data={aggregatedData}
          dataKey="date"
          series={[
            { name: 'Income', color: 'green' },
            { name: 'Expense', color: 'red' },
          ]}
          curveType="linear"
          connectNulls
        />
      );
    }
    
    // Default: bar chart
    return (
      <BarChart
        h={350}
        data={aggregatedData}
        dataKey="date"
        series={[
          { name: 'Income', color: 'green' },
          { name: 'Expense', color: 'red' },
        ]}
        tickLine="xy"
        gridAxis="y"
      />
    );
  };

  return (
    <Stack gap="lg">
      {/* Header with controls */}
      <Group justify="space-between" align="flex-start">
        <Title order={2}>Reports & Analytics</Title>
        <Button 
          leftSection={<IconDownload size={16} />}
          onClick={exportToCSV}
          variant="light"
        >
          Export CSV
        </Button>
      </Group>

      {/* Date range and preset controls */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group>
            <Button size="xs" variant="light" onClick={() => applyDatePreset('7d')}>
              Last 7 Days
            </Button>
            <Button size="xs" variant="light" onClick={() => applyDatePreset('30d')}>
              Last 30 Days
            </Button>
            <Button size="xs" variant="light" onClick={() => applyDatePreset('90d')}>
              Last 90 Days
            </Button>
            <Button size="xs" variant="light" onClick={() => applyDatePreset('ytd')}>
              Year to Date
            </Button>
            <Button size="xs" variant="light" onClick={() => applyDatePreset('all')}>
              All Time
            </Button>
          </Group>
          
          <Group>
            <DatePickerInput
              type="range"
              placeholder="Pick custom date range"
              value={dateRange}
              onChange={setDateRange}
              leftSection={<IconCalendar size={16} />}
              clearable
            />
            <Text size="sm" c="dimmed">
              {stats.transactionCount} transactions
            </Text>
          </Group>
        </Stack>
      </Paper>

      {/* Summary cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text c="dimmed" size="sm" fw={500}>Total Income</Text>
            <Text fw={700} size="xl" c="green">
              ${stats.income.toFixed(2)}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text c="dimmed" size="sm" fw={500}>Total Expenses</Text>
            <Text fw={700} size="xl" c="red">
              ${stats.expenses.toFixed(2)}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text c="dimmed" size="sm" fw={500}>Net Balance</Text>
            <Text fw={700} size="xl" c={stats.balance >= 0 ? 'green' : 'red'}>
              ${stats.balance.toFixed(2)}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text c="dimmed" size="sm" fw={500}>Avg Daily Spending</Text>
            <Text fw={700} size="xl">
              ${stats.avgPerDay.toFixed(2)}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Main trend chart */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Income vs Expenses Trend</Title>
            <Group>
              <SegmentedControl
                value={timeScale}
                onChange={(value) => setTimeScale(value as TimeScale)}
                data={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly', value: 'yearly' },
                ]}
                size="xs"
              />
              <SegmentedControl
                value={chartType}
                onChange={(value) => setChartType(value as ChartType)}
                data={[
                  { label: 'Line', value: 'line' },
                  { label: 'Bar', value: 'bar' },
                  { label: 'Area', value: 'area' },
                ]}
                size="xs"
              />
            </Group>
          </Group>
          
          {isProcessing ? (
            <Center py={80}>
                <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Processing data...</Text>
                </Stack>
            </Center>
            ) : aggregatedData.length > 0 ? (
            renderMainChart()
            ) : (
            <Text c="dimmed" ta="center" py={80}>
                No transaction data in selected date range
            </Text>
        )}
        </Stack>
      </Paper>

{/* Breakdown charts */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Income vs Expenses</Title>
            {stats.income > 0 || stats.expenses > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DonutChart
                  data={[
                    { name: 'Income', value: stats.income, color: 'green' },
                    { name: 'Expenses', value: stats.expenses, color: 'red' },
                  ]}
                  size={200}
                  thickness={40}
                  withLabels
                />
              </div>
            ) : (
              <Text c="dimmed" ta="center" py={40}>
                No data available
              </Text>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">Transaction Summary</Title>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Total Transactions:</Text>
                <Text size="sm" fw={600}>{stats.transactionCount}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Income Transactions:</Text>
                <Text size="sm" fw={600} c="green">
                  {filteredTransactions.filter(t => t.type === 'income').length}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Expense Transactions:</Text>
                <Text size="sm" fw={600} c="red">
                  {filteredTransactions.filter(t => t.type === 'expense').length}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Savings Rate:</Text>
                <Text size="sm" fw={600}>
                  {stats.income > 0 ? ((stats.balance / stats.income) * 100).toFixed(1) : 0}%
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}