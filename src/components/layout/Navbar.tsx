// src/components/layout/Navbar.tsx
import { Stack, Group, Avatar, Text, NavLink, Button } from '@mantine/core';
import { 
  IconHome, 
  IconExchange, 
  IconChartLine, 
  IconWallet 
} from '@tabler/icons-react';
import type { NavigationSection } from '../../utils/types';

interface NavbarProps {
  activeSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  userName?: string;
  onExportData: () => void;
}

/**
 * Application sidebar navigation component
 * Contains user info, navigation links, and export button
 */
export const Navbar = ({ 
  activeSection, 
  onNavigate, 
  userName = 'User',
  onExportData 
}: NavbarProps) => {
  // Navigation items configuration
  const navItems = [
    { icon: IconHome, label: 'Dashboard', section: 'dashboard' as NavigationSection },
    { icon: IconExchange, label: 'Transactions', section: 'transactions' as NavigationSection },
    { icon: IconChartLine, label: 'Reports', section: 'reports' as NavigationSection },
  ];

  return (
    <Stack justify="space-between" h="100%">
      {/* Top Section - User Info & Navigation */}
      <Stack>
        {/* User Info */}
        <Group>
          <Avatar color="blue" radius="xl">
            <IconWallet size={18} />
          </Avatar>
          <div>
            <Text fw={500}>Welcome!</Text>
            <Text size="sm" c="dimmed">
              {userName}
            </Text>
          </div>
        </Group>

        {/* Navigation Links */}
        <Stack gap={4} mt="xl">
          {navItems.map((item) => (
            <NavLink
              key={item.section}
              active={activeSection === item.section}
              label={item.label}
              leftSection={<item.icon size={18} />}
              onClick={() => onNavigate(item.section)}
            />
          ))}
        </Stack>
      </Stack>

      {/* Bottom Section - Export Button */}
      <Button variant="light" fullWidth onClick={onExportData}>
        Export Data
      </Button>
    </Stack>
  );
};