// src/components/dashboard/MonthlyChart.tsx
import { Grid, Paper, Title, Text, Skeleton } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import type { Transaction } from '../../utils/types';
import { DASHBOARD_MONTHS_TO_SHOW } from '../../utils/constants';

interface MonthlyChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

/**
 * Monthly overview bar chart component
 * Shows last 6 months of income vs expenses
 */
export const MonthlyChart = ({ transactions, isLoading = false }: MonthlyChartProps) => {
  if (isLoading) {
    return (
      <Grid>
        <Grid.Col span={{ base: 12 }}>
          <Paper p="md" radius="md" withBorder>
            <Skeleton height={20} width={200} mb="md" />
            <Skeleton height={300} />
          </Paper>
        </Grid.Col>
      </Grid>
    );
  }

  // Aggregate transactions by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    if (transaction.date) {
      const month = new Date(transaction.date).toISOString().slice(0, 7);
      const type = transaction.type === "income" ? "Income" : "Expense";
      
      if (!acc[month]) {
        acc[month] = { month, Income: 0, Expense: 0 };
      }
      
      acc[month][type] += transaction.amount || 0;
    }
    return acc;
  }, {} as Record<string, { month: string; Income: number; Expense: number }>);

  // Convert to array, sort, and take last 6 months
  const chartData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-DASHBOARD_MONTHS_TO_SHOW);

  return (
    <Grid>
      <Grid.Col span={{ base: 12 }}>
        <Paper p="md" radius="md" withBorder>
          <Title order={4} mb="md">Monthly Overview</Title>
          <BarChart
            h={300}
            data={chartData}
            dataKey="month"
            series={[
              { name: 'Income', color: 'green' },
              { name: 'Expense', color: 'red' },
            ]}
            tickLine="xy"
            gridAxis="y"
          />
          <Text size="sm" c="dimmed" ta="center" mt="md">
            View detailed analytics in the Reports section
          </Text>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};