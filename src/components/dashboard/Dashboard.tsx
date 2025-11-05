// src/components/dashboard/Dashboard.tsx
import { Stack } from '@mantine/core';
import { SummaryCards } from './SummaryCards';
import { MonthlyChart } from './MonthlyChart';
import { RecentTransactions } from './RecentTransactions';
import type { Transaction } from '../../utils/types';

interface DashboardProps {
  transactions: Transaction[];
  isLoading: boolean;
}

/**
 * Main dashboard page component
 * Combines summary cards, monthly chart, and recent transactions
 * Calculates monthly statistics for current month
 */
export const Dashboard = ({ transactions, isLoading }: DashboardProps) => {
  // Calculate current month data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(trans => {
    if (!trans.date) return false;
    const transDate = new Date(trans.date);
    return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(trans => trans.type === "income")
    .reduce((sum, trans) => sum + (trans.amount || 0), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(trans => trans.type === "expense")
    .reduce((sum, trans) => sum + (trans.amount || 0), 0);

  const totalBalance = monthlyIncome - monthlyExpenses;
  
  const savingsRate = monthlyIncome > 0 
    ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) 
    : 0;

  return (
    <Stack>
      <SummaryCards
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        savingsRate={savingsRate}
        isLoading={isLoading}
      />
      
      <MonthlyChart 
        transactions={transactions} 
        isLoading={isLoading}
      />
      
      <RecentTransactions 
        transactions={transactions} 
        isLoading={isLoading}
      />
    </Stack>
  );
};