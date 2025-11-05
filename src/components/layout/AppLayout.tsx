// src/components/layout/AppLayout.tsx
import { AppShell } from '@mantine/core';
import { Header } from './Header';
import { Navbar } from './Navbar';
import type { NavigationSection } from '../../utils/types';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  user: any; // From Authenticator
  signOut: () => void;
  activeSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  onExport: () => void;
}

/**
 * Main application layout component
 * Wraps the app with AppShell including header, navbar, and main content area
 */
const AppLayout = ({
  children,
  user,
  signOut,
  activeSection,
  onNavigate,
  onExport,
}: AppLayoutProps) => {
  // Extract username from user object
  const userName = user?.signInDetails?.loginId?.split('@')[0] || 'User';

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: 'sm' }}
      header={{ height: 70 }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Header onSignOut={signOut} />
      </AppShell.Header>

      {/* Sidebar Navigation */}
      <AppShell.Navbar p="md">
        <Navbar
          activeSection={activeSection}
          onNavigate={onNavigate}
          userName={userName}
          onExportData={onExport}
        />
      </AppShell.Navbar>

      {/* Main Content Area */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;