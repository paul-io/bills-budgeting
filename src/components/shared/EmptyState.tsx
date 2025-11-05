// src/components/shared/EmptyState.tsx
import { Stack, Text, Button } from '@mantine/core';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  /**
   * Icon to display (Tabler icon component)
   */
  icon: ReactNode;
  
  /**
   * Main title text
   */
  title: string;
  
  /**
   * Descriptive subtitle text
   */
  description: string;
  
  /**
   * Optional action button
   */
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  
  /**
   * Optional icon color (CSS color string)
   */
  iconColor?: string;
}

/**
 * Reusable empty state component
 * Displays icon, title, description, and optional action button
 * Used for empty transactions list, filtered results, etc.
 */
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  iconColor = 'var(--mantine-color-gray-5)'
}: EmptyStateProps) => {
  return (
    <Stack align="center" py={60}>
      <div style={{ color: iconColor }}>
        {icon}
      </div>
      
      <Text size="lg" fw={500} c="dimmed">
        {title}
      </Text>
      
      <Text size="sm" c="dimmed">
        {description}
      </Text>
      
      {action && (
        <Button 
          leftSection={action.icon}
          onClick={action.onClick}
          mt="md"
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
};