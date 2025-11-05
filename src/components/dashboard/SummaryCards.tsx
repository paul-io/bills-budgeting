// src/components/dashboard/SummaryCards.tsx
import { Grid, Paper, Group, Text, Skeleton } from '@mantine/core';

interface SummaryCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number | string;
  isLoading?: boolean;
}

/**
 * Dashboard summary cards component
 * Displays 4 key financial metrics: balance, income, expenses, savings rate
 */
export const SummaryCards = ({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  isLoading = false
}: SummaryCardsProps) => {
  if (isLoading) {
    return (
      <Grid>
        {[1, 2, 3, 4].map((i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Skeleton height={20} width="60%" mb="sm" />
              <Skeleton height={32} width="80%" mb="xs" />
              <Skeleton height={16} width="50%" />
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Grid>
      {/* Total Balance Card */}
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" fw={500}>Total Balance</Text>
              <Text fw={700} size="xl" c={totalBalance >= 0 ? 'green' : 'red'}>
                ${totalBalance.toFixed(2)}
              </Text>
              <Text c="dimmed" size="xs">
                {totalBalance >= 0 ? '↗' : '↘'} {Math.abs(totalBalance / 100).toFixed(1)}% from last month
              </Text>
            </div>
          </Group>
        </Paper>
      </Grid.Col>

      {/* Monthly Income Card */}
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" fw={500}>Monthly Income</Text>
              <Text fw={700} size="xl" c="blue">
                ${monthlyIncome.toFixed(2)}
              </Text>
              <Text c="dimmed" size="xs">📅 This month</Text>
            </div>
          </Group>
        </Paper>
      </Grid.Col>

      {/* Monthly Expenses Card */}
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" fw={500}>Monthly Expenses</Text>
              <Text fw={700} size="xl" c="red">
                ${monthlyExpenses.toFixed(2)}
              </Text>
              <Text c="dimmed" size="xs">📅 This month</Text>
            </div>
          </Group>
        </Paper>
      </Grid.Col>

      {/* Savings Rate Card */}
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" fw={500}>Savings Rate</Text>
              <Text fw={700} size="xl">{savingsRate}%</Text>
              <Text c="dimmed" size="xs">% of income</Text>
            </div>
          </Group>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};