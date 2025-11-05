import { Component, ReactNode } from 'react';
import { Paper, Title, Text, Button, Stack, Center } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = '/'; // Reset to home
  };

  render() {
    if (this.state.hasError) {
      return (
        <Center style={{ minHeight: '100vh', padding: '20px' }}>
          <Paper p="xl" radius="md" withBorder style={{ maxWidth: '500px' }}>
            <Stack align="center" gap="md">
              <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />
              <Title order={2}>Something went wrong</Title>
              <Text c="dimmed" ta="center">
                We encountered an unexpected error. Don't worry, your data is safe.
              </Text>
              {this.state.error && (
                <Paper p="sm" withBorder style={{ width: '100%', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {this.state.error.message}
                  </Text>
                </Paper>
              )}
              <Button onClick={this.handleReset} size="md">
                Return to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;