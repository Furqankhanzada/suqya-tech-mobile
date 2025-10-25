import React from 'react';
import { ArrowLeft, Sun } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { router } from 'expo-router';
import { Button, ButtonIcon } from './ui/button';
import { useTheme } from '@/store/useTheme';
import { Center } from './ui/center';
import { Heading } from './ui/heading';

interface AppHeaderProps {
  showBackButton?: boolean;
}

export default function AppHeader({ showBackButton = false }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Box className="py-4">
      <HStack>
        <Button
          className="border-border p-2.5 rounded-full bg-input/30"
          onPress={() => router.back()}
          variant="outline"
        >
          <ButtonIcon as={ArrowLeft} className="text-foreground" />
        </Button>

        {/* Center Space */}
        <Center className="flex-1">
          <Heading>Header</Heading>
        </Center>

        {/* Theme Toggle Button */}
        <Button
          className="border-border p-2.5 rounded-full bg-input/30"
          onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="outline"
        >
          <ButtonIcon as={Sun} className="text-foreground" />
        </Button>
      </HStack>
    </Box>
  );
}
