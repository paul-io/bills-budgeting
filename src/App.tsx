// // src/App.tsx
// import { Authenticator } from '@aws-amplify/ui-react'
// import '@aws-amplify/ui-react/styles.css'
// import '@mantine/core/styles.css';
// import '@mantine/dates/styles.css';
// import '@mantine/charts/styles.css';

// import { useEffect, useState, useMemo } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
// import { uploadData, getUrl, remove } from 'aws-amplify/storage';
// import { 
//   AppShell, 
//   Title, 
//   Button, 
//   Modal, 
//   Group,
//   Avatar,
//   Text,
//   NavLink,
//   ActionIcon,
//   useMantineColorScheme,
//   Grid,
//   Paper,
//   Stack,
//   Table,
//   Badge,
//   Menu,
//   Select,
//   Input,
//   Skeleton, 
//   Loader,   
//   Center,  
// } from '@mantine/core';
// import { notifications } from '@mantine/notifications';
// import { 
//   IconHome, 
//   IconExchange, 
//   IconChartPie, 
//   IconChartLine, 
//   IconTarget,
//   IconPlus,
//   IconSun,
//   IconMoon,
//   IconWallet,
//   IconEdit,
//   IconTrash,
//   IconDots,
//   IconPaperclip, 
//   IconX,
//   IconCheck,      
//   IconAlertCircle
// } from '@tabler/icons-react';
// import TransactionModal from './components/inputModal';
// import Reports from './components/Reports';
// import Charts from './components/Charts';
// import { BarChart } from '@mantine/charts';

// const client = generateClient<Schema>();

// type NavigationSection = 'dashboard' | 'transactions' | 'reports';

// function App() {
//   const [transactions, setTransactions] = useState<Array<Schema["Transaction"]["type"]>>([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState<"create" | "edit">("create");
//   const [editingTransaction, setEditingTransaction] = useState<Schema["Transaction"]["type"] | null>(null);
//   const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
//   const { colorScheme, toggleColorScheme } = useMantineColorScheme();

//   const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);

//   const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
//   const [searchQuery, setSearchQuery] = useState('');

//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [transactionToDelete, setTransactionToDelete] = useState<Schema["Transaction"]["type"] | null>(null);

//   useEffect(() => {
//     const subscription = client.models.Transaction.observeQuery().subscribe({
//       next: (data) => {
//         setTransactions([...data.items]);
//         setIsLoadingTransactions(false); // Add this line
//       },
//     });
    
//     return () => subscription.unsubscribe();
//   }, []);


//   const processedTransactions = useMemo(() => {
//     let filtered = [...transactions];

//     // Apply type filter
//     if (filterType !== 'all') {
//       filtered = filtered.filter(t => t.type === filterType);
//     }

//     // Apply search filter
//     if (searchQuery) {
//       filtered = filtered.filter(t => 
//         t.description?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       let comparison = 0;

//       switch (sortBy) {
//         case 'date':
//           const dateA = a.date ? new Date(a.date).getTime() : 0;
//           const dateB = b.date ? new Date(b.date).getTime() : 0;
//           comparison = dateA - dateB;
//           break;
//         case 'amount':
//           comparison = (a.amount || 0) - (b.amount || 0);
//           break;
//         case 'description':
//           comparison = (a.description || '').localeCompare(b.description || '');
//           break;
//       }

//       return sortOrder === 'asc' ? comparison : -comparison;
//     });

//     return filtered;
//   }, [transactions, filterType, searchQuery, sortBy, sortOrder]);

//   async function deleteTransaction(id: string) {
//     setIsDeleting(id); // Start loading
//     try {
//       const result = await client.models.Transaction.delete({ id });
//       if (!result.data) {
//         throw new Error('Failed to delete transaction');
//       }
//       console.log(`Transaction ${id} deleted successfully`);
//       notifications.show({
//         title: 'Transaction Deleted',
//         message: 'Transaction removed successfully',
//         color: 'green',
//         icon: <IconCheck size={18} />,
//         autoClose: 3000,
//       });
//     } catch (err) {
//       console.error(`Failed to delete transaction ${id}:`, err);
//       notifications.show({
//         title: 'Delete Failed',
//         message: 'Could not delete transaction. Please try again.',
//         color: 'red',
//         icon: <IconX size={18} />,
//         autoClose: 5000,
//       });
//     } finally {
//       setIsDeleting(null); // Stop loading
//     }
//   }

//   const openDeleteConfirmation = (transaction: Schema["Transaction"]["type"]) => {
//     setTransactionToDelete(transaction);
//     setDeleteConfirmOpen(true);
//   };
  
//   const handleConfirmDelete = async () => {
//     if (transactionToDelete) {
//       await deleteTransaction(transactionToDelete.id);
//       setDeleteConfirmOpen(false);
//       setTransactionToDelete(null);
//     }
//   };
  
//   const handleCancelDelete = () => {
//     setDeleteConfirmOpen(false);
//     setTransactionToDelete(null);
//   };

//   async function updateTransaction(id: string, updates: Partial<Schema["Transaction"]["type"]>) {
//     try {
//       const result = await client.models.Transaction.update({ id, ...updates });
//       if (!result.data) {
//         throw new Error('Failed to update transaction');
//       }
//       console.log("Updated transaction:", result.data);
//     } catch (err) {
//       console.error("Failed to update transaction:", err);
//       // Toast is already shown in handleSave, so this is just for logging
//       throw err; // Re-throw so handleSave can catch it
//     }
//   }
  

// const handleSave = async (
//   fields: {
//     description: string;
//     amount: number;
//     date: string;
//     type: "income" | "expense";
//     file?: File | null;
//     removeExistingAttachment?: boolean;
//   },
//   id?: string
// ) => {
//   console.log("handleSave STARTED - timestamp:", Date.now());
//   console.log("Mode:", modalMode);
//   console.log("Fields:", fields);

//   setIsSaving(true); // Start loading

//   try {
//     let attachmentPath: string | null = null;

//     if (fields.file) {
//       console.log("File detected, uploading:", fields.file.name);
//       const filename = `${Date.now()}_${fields.file.name}`;
//       const path = `attachments/${filename}`;
      
//       try {
//         await uploadData({
//           path: path,
//           data: fields.file,
//         }).result;
        
//         attachmentPath = path;
//         console.log("New file uploaded to path:", attachmentPath);
//         notifications.show({
//           title: 'File Uploaded',
//           message: `${fields.file.name} uploaded successfully`,
//           color: 'blue',
//           icon: <IconCheck size={18} />,
//           autoClose: 3000,
//         });
//       }  catch (uploadError) {
//         console.error("File upload failed:", uploadError);
        
//         // FILE UPLOAD ERROR TOAST
//         notifications.show({
//           title: 'Upload Failed',
//           message: 'Could not upload file. Saving transaction without attachment.',
//           color: 'orange',
//           icon: <IconAlertCircle size={18} />,
//           autoClose: 5000,
//         });
//       }
//     }

//     if (modalMode === "create") {
//       const result = await client.models.Transaction.create({
//         description: fields.description,
//         amount: fields.amount,
//         date: fields.date,
//         type: fields.type,
//         attachmentPath: attachmentPath,
//       });
//       if (!result.data) {
//         throw new Error('Failed to create transaction');
//       }
//       console.log("Transaction created:", result.data);
//       notifications.show({
//         title: 'Transaction Created',
//         message: `${fields.type === 'income' ? 'Income' : 'Expense'} of $${fields.amount.toFixed(2)} added successfully`,
//         color: 'green',
//         icon: <IconCheck size={18} />,
//         autoClose: 4000,
//       });
//     } 
//     else if (modalMode === "edit" && id) {
//       const currentTransaction = editingTransaction;
      
//       const updateData: Partial<Schema["Transaction"]["type"]> = {
//         description: fields.description,
//         amount: fields.amount,
//         date: fields.date,
//         type: fields.type,
//       };
      
//       if (fields.file) {
//         updateData.attachmentPath = attachmentPath;
        
//         if (currentTransaction?.attachmentPath) {
//           console.log("Deleting old attachment:", currentTransaction.attachmentPath);
//           try {
//             await remove({ path: currentTransaction.attachmentPath });
//             console.log("Old attachment deleted successfully");
//           } catch (error) {
//             console.error("Error deleting old attachment:", error);
//           }
//         }
//       } else if (fields.removeExistingAttachment) {
//         updateData.attachmentPath = null as any;
        
//         if (currentTransaction?.attachmentPath) {
//           console.log("Removing attachment:", currentTransaction.attachmentPath);
//           try {
//             await remove({ path: currentTransaction.attachmentPath });
//             console.log("Attachment removed successfully");
//             notifications.show({
//               title: 'Attachment Removed',
//               message: 'File removed from transaction',
//               color: 'blue',
//               icon: <IconCheck size={18} />,
//               autoClose: 3000,
//             });
//           } catch (error) {
//             console.error("Error removing attachment:", error);
//             notifications.show({
//               title: 'Removal Failed',
//               message: 'Could not remove attachment, but transaction was updated',
//               color: 'orange',
//               icon: <IconAlertCircle size={18} />,
//               autoClose: 5000,
//             });
//           }
//         }
//       }
      
//       await updateTransaction(id, updateData);
//       console.log("Transaction updated");
//       notifications.show({
//         title: 'Transaction Updated',
//         message: 'Changes saved successfully',
//         color: 'green',
//         icon: <IconCheck size={18} />,
//         autoClose: 3000,
//       });
//     }
    
//     setModalOpen(false);
//     setEditingTransaction(null);
//   } catch (error) {
//     console.error("Error saving transaction:", error);
//     notifications.show({
//       title: modalMode === "create" ? 'Create Failed' : 'Update Failed',
//       message: 'Something went wrong. Please try again.',
//       color: 'red',
//       icon: <IconX size={18} />,
//       autoClose: 5000,
//     });
//   } finally {
//     setIsSaving(false); // Stop loading
//   }
// };

//   // It's literally this simple:
//   const exportToCSV = () => {
//     try {
//       const csv = [
//         ['Date', 'Description', 'Type', 'Amount'].join(','),
//         ...transactions.map(t => 
//           [t.date, `"${t.description}"`, t.type, t.amount].join(',')
//         )
//       ].join('\n');
      
//       const blob = new Blob([csv], { type: 'text/csv' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
//       a.click();
      
//       // SUCCESS TOAST
//       notifications.show({
//         title: 'Export Successful',
//         message: `${transactions.length} transactions exported to CSV`,
//         color: 'green',
//         icon: <IconCheck size={18} />,
//         autoClose: 3000,
//       });
//     } catch (error) {
//       console.error("Export failed:", error);
      
//       // ERROR TOAST
//       notifications.show({
//         title: 'Export Failed',
//         message: 'Could not export transactions. Please try again.',
//         color: 'red',
//         icon: <IconX size={18} />,
//         autoClose: 5000,
//       });
//     }
//   };

//   const openCreateModal = () => {
//     setModalMode("create");
//     setEditingTransaction(null);
//     setModalOpen(true);
//   };

//   const openEditModal = (transaction: Schema["Transaction"]["type"]) => {
//     setModalMode("edit");
//     setEditingTransaction(transaction);
//     setModalOpen(true);
//   };

//   // Calculate summary data
//   const now = new Date();
//   const currentMonth = now.getMonth();
//   const currentYear = now.getFullYear();

//   // const monthlyTransactions = transactions.filter(trans => {
//   //   const transDate = new Date(trans.date!);
//   //   return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
//   // });
//   const monthlyTransactions = transactions.filter(trans => {
//     if (!trans.date) return false;
//     const transDate = new Date(trans.date);
//     return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
//   });

//   const monthlyIncome = monthlyTransactions
//     .filter(trans => trans.type === "income")
//     .reduce((sum, trans) => sum + (trans.amount || 0), 0);

//   const monthlyExpenses = monthlyTransactions
//     .filter(trans => trans.type === "expense")
//     .reduce((sum, trans) => sum + (trans.amount || 0), 0);

//   const totalBalance = monthlyIncome - monthlyExpenses;
//   const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

//   // Navigation items
//   const navItems = [
//     { icon: IconHome, label: 'Dashboard', section: 'dashboard' as NavigationSection },
//     { icon: IconExchange, label: 'Transactions', section: 'transactions' as NavigationSection },
//     { icon: IconChartLine, label: 'Reports', section: 'reports' as NavigationSection },
//   ];

//   const renderDashboard = () => {
//     if (isLoadingTransactions) {
//       return (
//         <Stack>
//           <Grid>
//             {[1, 2, 3, 4].map((i) => (
//               <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
//                 <Paper p="md" radius="md" withBorder>
//                   <Skeleton height={20} width="60%" mb="sm" />
//                   <Skeleton height={32} width="80%" mb="xs" />
//                   <Skeleton height={16} width="50%" />
//                 </Paper>
//               </Grid.Col>
//             ))}
//           </Grid>
  
//           <Grid>
//             <Grid.Col span={{ base: 12 }}>
//               <Paper p="md" radius="md" withBorder>
//                 <Skeleton height={20} width={200} mb="md" />
//                 <Skeleton height={300} />
//               </Paper>
//             </Grid.Col>
//           </Grid>
  
//           <Paper p="md" radius="md" withBorder>
//             <Skeleton height={20} width={200} mb="md" />
//             <Stack gap="sm">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <Skeleton key={i} height={40} />
//               ))}
//             </Stack>
//           </Paper>
//         </Stack>
//       );
//     }
//     return (
//     <Stack>
//       <Grid>
//         <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Group justify="apart">
//               <div>
//                 <Text c="dimmed" size="sm" fw={500}>Total Balance</Text>
//                 <Text fw={700} size="xl" c={totalBalance >= 0 ? 'green' : 'red'}>
//                   ${totalBalance.toFixed(2)}
//                 </Text>
//                 <Text c="dimmed" size="xs">
//                   {totalBalance >= 0 ? '↗' : '↘'} {Math.abs(totalBalance / 100).toFixed(1)}% from last month
//                 </Text>
//               </div>
//             </Group>
//           </Paper>
//         </Grid.Col>

//         <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Group justify="apart">
//               <div>
//                 <Text c="dimmed" size="sm" fw={500}>Monthly Income</Text>
//                 <Text fw={700} size="xl" c="blue">
//                   ${monthlyIncome.toFixed(2)}
//                 </Text>
//                 <Text c="dimmed" size="xs">📅 This month</Text>
//               </div>
//             </Group>
//           </Paper>
//         </Grid.Col>

//         <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Group justify="apart">
//               <div>
//                 <Text c="dimmed" size="sm" fw={500}>Monthly Expenses</Text>
//                 <Text fw={700} size="xl" c="red">
//                   ${monthlyExpenses.toFixed(2)}
//                 </Text>
//                 <Text c="dimmed" size="xs">📅 This month</Text>
//               </div>
//             </Group>
//           </Paper>
//         </Grid.Col>

//         <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Group justify="apart">
//               <div>
//                 <Text c="dimmed" size="sm" fw={500}>Savings Rate</Text>
//                 <Text fw={700} size="xl">{savingsRate}%</Text>
//                 <Text c="dimmed" size="xs">% of income</Text>
//               </div>
//             </Group>
//           </Paper>
//         </Grid.Col>
//       </Grid>

//       {/* <Grid>
//         <Grid.Col span={{ base: 12, md: 6 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Charts transactions={transactions} />
//           </Paper>
//         </Grid.Col>
//       </Grid> */}

//       <Grid>
//         <Grid.Col span={{ base: 12 }}>
//           <Paper p="md" radius="md" withBorder>
//             <Title order={4} mb="md">Monthly Overview</Title>
//             {/* Just show the bar chart as a preview */}
//             <BarChart
//               h={300}
//               data={(() => {
//                 const monthlyData = transactions.reduce((acc, transaction) => {
//                   if (transaction.date) {
//                     const month = new Date(transaction.date).toISOString().slice(0, 7);
//                     const type = transaction.type === "income" ? "Income" : "Expense";
                    
//                     if (!acc[month]) {
//                       acc[month] = { month, Income: 0, Expense: 0 };
//                     }
                    
//                     acc[month][type] += transaction.amount || 0;
//                   }
//                   return acc;
//                 }, {} as Record<string, { month: string; Income: number; Expense: number }>);
                
//                 return Object.values(monthlyData)
//                   .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
//                   .slice(-6); // Show last 6 months only
//               })()}
//               dataKey="month"
//               series={[
//                 { name: 'Income', color: 'green' },
//                 { name: 'Expense', color: 'red' },
//               ]}
//               tickLine="xy"
//               gridAxis="y"
//             />
//             <Text size="sm" c="dimmed" ta="center" mt="md">
//               View detailed analytics in the Reports section
//             </Text>
//           </Paper>
//         </Grid.Col>
//       </Grid>

//       <Paper p="md" radius="md" withBorder>
//         <Title order={4} mb="md">Recent Transactions</Title>
//         <Table>
//           <Table.Thead>
//             <Table.Tr>
//               <Table.Th>Description</Table.Th>
//               <Table.Th>Amount</Table.Th>
//               <Table.Th>Date</Table.Th>
//             </Table.Tr>
//           </Table.Thead>
//           <Table.Tbody>
//             {transactions.slice(0, 5).map((transaction) => (
//               <Table.Tr key={transaction.id}>
//                 <Table.Td>{transaction.description}</Table.Td>
//                 <Table.Td>
//                   <Text c={transaction.type === 'income' ? 'green' : 'red'} fw={500}>
//                     {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
//                   </Text>
//                 </Table.Td>
//                 <Table.Td>{transaction.date || "No date"}</Table.Td>
//               </Table.Tr>
//             ))}
//           </Table.Tbody>
//         </Table>
//       </Paper>
//     </Stack>
//   );
// }

//   const renderTransactions = () => {
//     // Add state for sorting and filtering at the top of your App component
//     const handleViewAttachment = async (path: string) => {
//       if (!navigator.onLine) {
//         notifications.show({
//           title: 'No Internet Connection',
//           message: 'Cannot open attachment while offline.',
//           color: 'red',
//           icon: <IconX size={18} />,
//           autoClose: 5000,
//         });
//         return;
//       }
//       try {
//         const urlResult = await getUrl({ 
//           path: path,
//           options: {
//             expiresIn: 3600
//           }
//         });
//         window.open(urlResult.url.toString(), '_blank');
//       } catch (error) {
//         console.error("Error generating URL:", error);
//         notifications.show({
//           title: 'Cannot Open Attachment',
//           message: 'Failed to load attachment. Please try again.',
//           color: 'red',
//           icon: <IconX size={18} />,
//           autoClose: 5000,
//         });
//         // alert("Error loading attachment. Please try again.");
//       }
//     };

//     const getFilenameFromPath = (path: string): string => {
//       const parts = path.split('/');
//       const filenameWithTimestamp = parts[parts.length - 1];
//       const underscoreIndex = filenameWithTimestamp.indexOf('_');
//       if (underscoreIndex > 0) {
//         return filenameWithTimestamp.substring(underscoreIndex + 1);
//       }
//       return filenameWithTimestamp;
//     };

//     const truncateFilename = (filename: string, maxLength: number = 20): string => {
//       if (filename.length <= maxLength) return filename;
//       const extension = filename.split('.').pop();
//       const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
//       const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
//       return `${truncatedName}...${extension}`;
//     };

//     if (isLoadingTransactions) {
//       return (
//         <Stack>
//           <Group justify="space-between">
//             <Skeleton height={32} width={200} />
//             <Skeleton height={36} width={160} />
//           </Group>
  
//           <Paper p="md" radius="md" withBorder>
//             <Grid>
//               {[1, 2, 3, 4].map((i) => (
//                 <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
//                   <Skeleton height={60} />
//                 </Grid.Col>
//               ))}
//             </Grid>
//           </Paper>
  
//           <Paper p="md" radius="md" withBorder>
//             <Stack gap="sm">
//               <Skeleton height={40} />
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <Skeleton key={i} height={60} />
//               ))}
//             </Stack>
//           </Paper>
//         </Stack>
//       );
//     }
  
//     return (
//       <Stack>
//         <Group justify="space-between">
//           <Title order={2}>Transactions</Title>
//           <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
//             Add Transaction
//           </Button>
//         </Group>

//         {/* Filters and Sort Controls */}
//         <Paper p="md" radius="md" withBorder>
//           <Grid>
//             <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//               <Select
//                 label="Filter by Type"
//                 value={filterType}
//                 onChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}
//                 data={[
//                   { value: 'all', label: 'All Transactions' },
//                   { value: 'income', label: 'Income Only' },
//                   { value: 'expense', label: 'Expense Only' },
//                 ]}
//               />
//             </Grid.Col>

//             <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//               <Select
//                 label="Sort by"
//                 value={sortBy}
//                 onChange={(value) => setSortBy(value as 'date' | 'amount' | 'description')}
//                 data={[
//                   { value: 'date', label: 'Date' },
//                   { value: 'amount', label: 'Amount' },
//                   { value: 'description', label: 'Description' },
//                 ]}
//               />
//             </Grid.Col>

//             <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//               <Select
//                 label="Order"
//                 value={sortOrder}
//                 onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
//                 data={[
//                   { value: 'desc', label: 'Descending' },
//                   { value: 'asc', label: 'Ascending' },
//                 ]}
//               />
//             </Grid.Col>

//             <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//               <Input.Wrapper label="Search">
//                 <Input
//                   placeholder="Search descriptions..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.currentTarget.value)}
//                   rightSection={
//                     searchQuery && (
//                       <ActionIcon
//                         variant="subtle"
//                         onClick={() => setSearchQuery('')}
//                         size="sm"
//                       >
//                         <IconX size={14} />
//                       </ActionIcon>
//                     )
//                   }
//                 />
//               </Input.Wrapper>
//             </Grid.Col>
//           </Grid>

//           <Text size="sm" c="dimmed" mt="sm">
//             Showing {processedTransactions.length} of {transactions.length} transactions
//           </Text>
//         </Paper>

//         {/* Transactions Table */}
//         <Paper p="md" radius="md" withBorder>
//           {processedTransactions.length > 0 ? (
//             <Table>
//               <Table.Thead>
//                 <Table.Tr>
//                   <Table.Th>Date</Table.Th>
//                   <Table.Th>Description</Table.Th>
//                   <Table.Th>Type</Table.Th>
//                   <Table.Th>Amount</Table.Th>
//                   <Table.Th>Attachment</Table.Th>
//                   <Table.Th>Actions</Table.Th>
//                 </Table.Tr>
//               </Table.Thead>
//               <Table.Tbody>
//                 {processedTransactions.map((transaction) => {
//                   const filename = transaction.attachmentPath 
//                     ? getFilenameFromPath(transaction.attachmentPath)
//                     : null;
//                   const displayName = filename ? truncateFilename(filename) : null;

//                   return (
//                     <Table.Tr key={transaction.id}>
//                       <Table.Td>{transaction.date || "No date"}</Table.Td>
//                       <Table.Td>{transaction.description}</Table.Td>
//                       <Table.Td>
//                         <Badge color={transaction.type === 'income' ? 'green' : 'red'}>
//                           {transaction.type === 'income' ? 'Income' : 'Expense'}
//                         </Badge>
//                       </Table.Td>
//                       <Table.Td>
//                         <Text c={transaction.type === 'income' ? 'green' : 'red'} fw={500}>
//                           {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
//                         </Text>
//                       </Table.Td>
//                       <Table.Td>
//                         {transaction.attachmentPath ? (
//                           <Group 
//                             gap="xs" 
//                             style={{ cursor: 'pointer' }}
//                             onClick={() => handleViewAttachment(transaction.attachmentPath!)}
//                           >
//                             <IconPaperclip size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
//                             <Text 
//                               size="sm" 
//                               c="blue" 
//                               style={{ textDecoration: 'underline' }}
//                               title={filename || undefined}
//                             >
//                               {displayName}
//                             </Text>
//                           </Group>
//                         ) : (
//                           <Text c="dimmed" size="sm">—</Text>
//                         )}
//                       </Table.Td>
//                       <Table.Td>
//                         <Menu shadow="md" width={200}>
//                           <Menu.Target>
//                             <ActionIcon variant="subtle">
//                               <IconDots size={16} />
//                             </ActionIcon>
//                           </Menu.Target>
//                           <Menu.Dropdown>
//                             <Menu.Item 
//                               leftSection={<IconEdit size={14} />}
//                               onClick={() => openEditModal(transaction)}
//                             >
//                               Edit
//                             </Menu.Item>
//                             <Menu.Item 
//                               leftSection={<IconTrash size={14} />}
//                               color="red"
//                               onClick={() => openDeleteConfirmation(transaction)}  
//                             >
//                               Delete
//                             </Menu.Item>
//                           </Menu.Dropdown>
//                         </Menu>
//                       </Table.Td>
//                     </Table.Tr>
//                   );
//                 })}
//               </Table.Tbody>
//             </Table>
//           ) : (
//             <Stack align="center" py={60}>
//               <IconExchange size={48} color="var(--mantine-color-gray-5)" />
//               <Text size="lg" fw={500} c="dimmed">
//                 {transactions.length === 0 
//                   ? "No transactions yet" 
//                   : "No transactions match your filters"}
//               </Text>
//               <Text size="sm" c="dimmed">
//                 {transactions.length === 0 
//                   ? "Create your first transaction to get started!" 
//                   : "Try adjusting your filters or search"}
//               </Text>
//               {transactions.length === 0 && (
//                 <Button 
//                   leftSection={<IconPlus size={16} />} 
//                   onClick={openCreateModal}
//                   mt="md"
//                 >
//                   Add Your First Transaction
//                 </Button>
//               )}
//             </Stack>
//           )}
//         </Paper>
//       </Stack>
//     );
//   };

// const renderReports = () => (
//   <Reports transactions={transactions} />
// );

//   const renderPlaceholder = (title: string) => (
//     <Stack>
//       <Title order={2}>{title}</Title>
//       <Paper p="xl" radius="md" withBorder>
//         <Text c="dimmed" ta="center" size="lg">
//           {title} functionality coming soon...
//         </Text>
//       </Paper>
//     </Stack>
//   );

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'dashboard':
//         return renderDashboard();
//       case 'transactions':
//         return renderTransactions();
//       case 'reports':
//         return renderReports();
//       default:
//         return renderDashboard();
//     }
//   };

//   return (
//     <Authenticator>
//       {({ signOut, user }) => (
//         <AppShell
//           navbar={{ width: 250, breakpoint: 'sm' }}
//           header={{ height: 70 }}
//           padding="md"
//         >
//           <AppShell.Header>
//             <Group h="100%" px="md" justify="space-between">
//               <Group>
//                 <IconWallet size={32} color="var(--mantine-primary-color-6)" />
//                 <div>
//                   <Title order={3}>Income and Expense Tracker</Title>
//                   <Text size="sm" c="dimmed">Take control of your finances</Text>
//                 </div>
//               </Group>
//               <Group>
//                 <ActionIcon
//                   variant="subtle"
//                   onClick={() => toggleColorScheme()}
//                   size="lg"
//                 >
//                   {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
//                 </ActionIcon>
//                 <Button variant="subtle" onClick={signOut}>
//                   Sign out
//                 </Button>
//               </Group>
//             </Group>
//           </AppShell.Header>

//           <AppShell.Navbar p="md">
//             <Stack justify="space-between" h="100%">
//               <Stack>
//                 <Group>
//                   <Avatar color="blue" radius="xl">
//                     <IconWallet size={18} />
//                   </Avatar>
//                   <div>
//                     <Text fw={500}>Welcome!</Text>
//                     <Text size="sm" c="dimmed">
//                       {user?.signInDetails?.loginId?.split('@')[0] || 'User'}
//                     </Text>
//                   </div>
//                 </Group>

//                 <Stack gap={4} mt="xl">
//                   {navItems.map((item) => (
//                     <NavLink
//                       key={item.section}
//                       active={activeSection === item.section}
//                       label={item.label}
//                       leftSection={<item.icon size={18} />}
//                       onClick={() => setActiveSection(item.section)}
//                     />
//                   ))}
//                 </Stack>
//               </Stack>
//               <Button variant="light" fullWidth onClick={exportToCSV}>
//                 Export Data
//               </Button>
//             </Stack>
//           </AppShell.Navbar>

//           <AppShell.Main>
//             {renderContent()}
//           </AppShell.Main>

//           <Modal
//             opened={modalOpen}
//             onClose={() => !isSaving && setModalOpen(false)} // Prevent closing while saving
//             title={modalMode === "create" ? "Add Transaction" : "Edit Transaction"}
//             centered
//             closeOnClickOutside={false} // Prevent closing while saving
//             closeOnEscape={!isSaving} // Prevent closing while saving
//           >
//             {isSaving ? (
//               <Center py={60}>
//                 <Stack align="center" gap="md">
//                   <Loader size="lg" />
//                   <Text c="dimmed">
//                     {modalMode === "create" ? "Creating transaction..." : "Updating transaction..."}
//                   </Text>
//                 </Stack>
//               </Center>
//             ) : (
//               <TransactionModal
//                 mode={modalMode}
//                 transaction={editingTransaction ?? undefined}
//                 onSave={handleSave}
//                 close={() => setModalOpen(false)}
//               />
//             )}
//           </Modal>
//           <Modal
//             opened={deleteConfirmOpen}
//             onClose={handleCancelDelete}
//             title="Delete Transaction"
//             centered
//             size="sm"
//             closeOnClickOutside={false}
//             closeOnEscape={true}
//           >
//             <Stack gap="md">
//               <Text>
//                 Are you sure you want to delete this transaction?
//               </Text>
              
//               {transactionToDelete && (
//                 <Paper p="sm" withBorder 
//                 style={{ 
//                   backgroundColor: colorScheme === 'dark' ? '#3d1f1f' : 'var(--mantine-color-red-0)',
//                   borderColor: colorScheme === 'dark' ? '#8b1a1a' : 'var(--mantine-color-red-3)'
//                 }}
//                 >
//                   <Stack gap="xs">
//                     <Group justify="space-between">
//                       <Text size="sm" fw={500}>Description:</Text>
//                       <Text size="sm">{transactionToDelete.description}</Text>
//                     </Group>
//                     <Group justify="space-between">
//                       <Text size="sm" fw={500}>Amount:</Text>
//                       <Text size="sm" c="red" fw={600}>
//                         ${transactionToDelete.amount?.toFixed(2)}
//                       </Text>
//                     </Group>
//                     <Group justify="space-between">
//                       <Text size="sm" fw={500}>Date:</Text>
//                       <Text size="sm">{transactionToDelete.date}</Text>
//                     </Group>
//                     {transactionToDelete.attachmentPath && (
//                       <Group justify="space-between">
//                         <Text size="sm" fw={500}>Attachment:</Text>
//                         <Group gap={4}>
//                           <IconPaperclip size={14} />
//                           <Text size="sm">File will be deleted</Text>
//                         </Group>
//                       </Group>
//                     )}
//                   </Stack>
//                 </Paper>
//               )}

//               <Text size="sm" c="dimmed">
//                 This action cannot be undone.
//               </Text>

//               <Group justify="flex-end" mt="md">
//                 <Button 
//                   variant="subtle" 
//                   onClick={handleCancelDelete}
//                   disabled={isDeleting !== null}
//                 >
//                   Cancel
//                 </Button>
//                 <Button 
//                   color="red" 
//                   onClick={handleConfirmDelete}
//                   loading={isDeleting === transactionToDelete?.id}
//                   leftSection={!isDeleting ? <IconTrash size={16} /> : undefined}
//                 >
//                   {isDeleting === transactionToDelete?.id ? 'Deleting...' : 'Delete Transaction'}
//                 </Button>
//               </Group>
//             </Stack>
//           </Modal>
//         </AppShell>
//       )}
//     </Authenticator>
//   );
// }

// export default App;


// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

import { useState } from 'react';
import { Modal, Center, Stack, Loader, Text } from '@mantine/core';
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

  const renderContent = () => {
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
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <AppLayout
            user={user}
            signOut={signOut || (() => {})}
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onExport={exportToCSV}
          >
            {renderContent()}
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