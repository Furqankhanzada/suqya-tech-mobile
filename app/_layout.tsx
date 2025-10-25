import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Slot, usePathname } from 'expo-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Fab, FabIcon } from '@/components/ui/fab';
import { MoonIcon, SunIcon } from '@/components/ui/icon';
import { useTheme } from '@/store/useTheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [styleLoaded, setStyleLoaded] = useState(false);
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode={theme}>
        <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
          {pathname === '/login' && (
            <Fab
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="m-6"
              size="lg"
            >
              <FabIcon as={theme === 'dark' ? MoonIcon : SunIcon} />
            </Fab>
          )}
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
