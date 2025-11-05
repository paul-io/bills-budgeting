// src/components/layout/Header.tsx
import { Group, Title, Text, ActionIcon, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconWallet, IconSun, IconMoon } from '@tabler/icons-react';

interface HeaderProps {
  onSignOut: () => void;
}

/**
 * Application header component
 * Contains logo, title, theme toggle, and sign out button
 */
export const Header = ({ onSignOut }: HeaderProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between">
      {/* Logo and Title */}
      <Group>
        <IconWallet size={32} color="var(--mantine-primary-color-6)" />
        <div>
          <Title order={3}>Income and Expense Tracker</Title>
          <Text size="sm" c="dimmed">Take control of your finances</Text>
        </div>
      </Group>

      {/* Actions */}
      <Group>
        <ActionIcon
          variant="subtle"
          onClick={() => toggleColorScheme()}
          size="lg"
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
        <Button variant="subtle" onClick={onSignOut}>
          Sign out
        </Button>
      </Group>
    </Group>
  );
};