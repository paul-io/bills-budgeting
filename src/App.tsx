// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import './App.css';

import { useState } from 'react';
import { Modal, Center, Stack, Loader, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import AppLayout from './components/layout/AppLayout';
import {Dashboard} from './components/dashboard/Dashboard';
import {TransactionsPage} from './components/transactions/TransactionsPage';
import Reports from './components/Reports';
import TransactionModal from './components/inputModal';
import { useTransactions } from './hooks/useTransactions';
import type { Schema } from '../amplify/data/resource';
import type { NavigationSection } from './utils/types';

function App() {

  const {
    transactions,
    isLoadingTransactions,
    isSaving,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    exportToCSV,
  } = useTransactions();

  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<Schema['Transaction']['type'] | null>(null);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const openEditModal = (transaction: Schema['Transaction']['type']) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleModalSave = async (
    fields: {
      description: string;
      amount: number;
      date: string;
      type: 'income' | 'expense';
      file?: File | null;
      removeExistingAttachment?: boolean;
    },
    id?: string
  ) => {
    if (modalMode === 'create') {
      await handleCreateTransaction(fields);
    } else if (modalMode === 'edit' && id) {
      await handleUpdateTransaction(id, fields, editingTransaction);
    }
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteWithTransaction = (transaction: Schema['Transaction']['type']) => {
    handleDeleteTransaction(transaction.id);
  };

  const handleViewAttachment = async (path: string) => {
    const { getUrl } = await import('aws-amplify/storage');
    try {
      const urlResult = await getUrl({ 
        path: path,
        options: {
          expiresIn: 3600
        }
      });
      window.open(urlResult.url.toString(), '_blank');
    } catch (error) {
      console.error("Error generating URL:", error);
    }
  };

  const renderContent = (user: any) => {
    const isDemoUser = user?.signInDetails?.loginId === 'DemoUser@example.com';
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            isLoading={isLoadingTransactions}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            isLoading={isLoadingTransactions}
            isDemoUser={isDemoUser}
            onCreateTransaction={openCreateModal}
            onEditTransaction={openEditModal}
            onDeleteTransaction={handleDeleteWithTransaction}
            onViewAttachment={handleViewAttachment}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} />;
      default:
        return (
          <Dashboard
            transactions={transactions}
            isLoading={isLoadingTransactions}
          />
        );
    }
  };

  return (
          <Authenticator
        components={{
          SignIn: {
            Header() {
              return (
                <>
                  <Alert 
                    icon={<IconInfoCircle size={16} />} 
                    title="Try the demo account to see the dashboard in action!" 
                    color="blue.9"
                    mb="lg"
                  >
                    <strong style={{ color: '#000' }}>Email:</strong> <span style={{ color: '#000' }}>DemoUser@example.com</span> 
                    <br />
                    <strong style={{ color: '#000' }}>Password:</strong> <span style={{ color: '#000' }}>Password123!</span> 
                  </Alert>
                </>
              );
            },
          },
        }}
      >
        {({ signOut, user }) => (
          <>
            <AppLayout
              user={user}
              signOut={() => {
                setActiveSection('dashboard');
                signOut?.();
              }}
              activeSection={activeSection}
              onNavigate={setActiveSection}
              onExport={exportToCSV}
            >
              {renderContent(user)}
            </AppLayout>

            <Modal
              opened={modalOpen}
              onClose={() => !isSaving && setModalOpen(false)}
              title={modalMode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
              centered
              closeOnClickOutside={false}
              closeOnEscape={!isSaving}
            >
              {isSaving ? (
                <Center py={60}>
                  <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text c="dimmed">
                      {modalMode === 'create' ? 'Creating transaction...' : 'Updating transaction...'}
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <TransactionModal
                  mode={modalMode}
                  isDemoUser={user?.signInDetails?.loginId === 'DemoUser@example.com' ? true : false}
                  transaction={editingTransaction ?? undefined}
                  onSave={handleModalSave}
                  close={() => setModalOpen(false)}
                />
              )}
            </Modal>
          </>
        )}
      </Authenticator>
  );
}

export default App;